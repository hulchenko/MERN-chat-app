import { Server } from "socket.io";
import { verifyJWT } from "../auth/auth.js";
import SessionStore from "../sessionStore.js";
import MessageStore from "../messageStore.js";
import RoomStore from "../roomStore.js";
import UserStore from "../userStore.js";

const websocketConnect = (server) => {
  const io = new Server(server);
  const sessionStore = new SessionStore();
  const messageStore = new MessageStore();
  const roomStore = new RoomStore();
  const userStore = new UserStore();

  io.use((socket, next) => {
    try {
      const sessionID = socket.handshake.auth.sessionID;
      if (sessionID) {
        // check cached session
        const session = sessionStore.findSession(sessionID);
        if (session) {
          const { username, sessionID, userID } = session;

          socket.username = username;
          socket.sessionID = sessionID;
          socket.userID = userID;

          next();
        }
      }
      const token = socket.handshake.auth.token;
      const decodedToken = verifyJWT(token); // {username, id}
      const { id, username } = decodedToken;
      if (!id || !username) {
        return next(new Error("User is not authenticated.")); // this is caught by "connect_error" in client-side
      }
      socket.username = username;
      socket.userID = id;
      socket.sessionID = token;

      next();
    } catch (error) {
      return next(new Error("Authentication error."));
    }
  });

  io.on("connection", (socket) => {
    console.log("Websocket connected. ID: ", socket.username);

    userStore.addUser({
      userID: socket.userID,
      username: socket.username,
    });

    sessionStore.saveSession(socket.sessionID, {
      userID: socket.userID,
      username: socket.username,
      connected: true,
    });
    socket.emit("session", { userID: socket.userID, username: socket.username, sessionID: socket.sessionID }); // send session data to the client
    socket.join(socket.userID); // overwrite default socket.join(socket.id)

    socket.on("client_ready", () => {
      // Get session users

      const users = userStore.getAllUsers().map((user) => {
        const userMessages = messageStore.getMessages(user.username);
        const userRooms = roomStore.getUserRooms(user.username);
        const roomMessages = [];
        userRooms.forEach((roomName) => {
          const messages = messageStore.getRoomMessages(roomName);
          roomMessages.push(...messages);
        });

        return {
          userID: user.userID,
          username: user.username,
          messages: userMessages,
          rooms: userRooms,
          roomMessages,
          connected: sessionStore.isConnected(user.username),
        };
      });

      console.log("Online count: ", users.length);
      socket.emit("initial_users", users);

      // Notify all connections with new users
      socket.broadcast.emit("new_user", {
        userID: socket.userID,
        username: socket.username,
        messages: [],
        rooms: [],
        roomMessages: [],
        connected: true,
      });
    });

    // Tet-a-tet messaging
    socket.on("private_message", (data) => {
      const { recipient, content, timestamp } = data;
      console.log(`Private message: Sending '${content}' from ${socket.userID} to ${recipient}`);
      const message = { content, from: socket.username, to: recipient.username, timestamp };
      socket.to(recipient.userID).emit("private_message", message);
      messageStore.saveMessage(message);
    });

    // Group messaging
    socket.on("join_room", (roomName) => {
      socket.join(roomName);
      console.log(`USER ${socket.username} joined room: ${roomName}`);
      socket.to(roomName).emit("user_joined", { username: socket.username, roomName });
      roomStore.saveRoom(socket.username, roomName);
    });

    socket.on("room_message", (data) => {
      const { content, from, roomName, timestamp } = data;
      const message = { content, from, to: roomName, timestamp };
      console.log("ROOM MESSAGE: ", message);
      socket.to(roomName).emit("room_message", message);
      messageStore.saveRoomMessage(roomName, message);
    });

    socket.on("leave_room", (roomName) => {
      socket.leave(roomName);
      console.log(`USER ${socket.username} left room: ${roomName}`);
      socket.to(roomName).emit("user_left", { username: socket.username, roomName });
      roomStore.removeRoom(socket.username, roomName);
    });

    socket.on("sign_out", () => {
      // remove user in the session store
      sessionStore.removeSession(socket.sessionID);
      socket.signout = true;
      socket.disconnect();
      socket.broadcast.emit("user_disconnect", socket.userID);
    });

    socket.on("disconnect", async () => {
      const isSignedOut = socket.signout;
      if (isSignedOut) return; // skip storing session

      // preserve user in the session store
      const userActiveSockets = await io.in(socket.userID).fetchSockets(); // same user, different browsers/devices/tabs
      const isDisconnected = userActiveSockets.length === 0;
      if (isDisconnected) {
        console.log("User disconnected: ", socket.username);
        socket.broadcast.emit("user_disconnect", socket.userID);

        sessionStore.saveSession(socket.sessionID, {
          userID: socket.userID,
          username: socket.username,
          connected: false,
        });
      }
    });

    socket.onAny((event, ...args) => {
      // listen to all events
      console.log("SOCKET: ", event, args);
    });
  });
};

export default websocketConnect;
