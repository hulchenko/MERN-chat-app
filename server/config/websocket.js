import Redis from "ioredis";
import { Server } from "socket.io";
import { verifyJWT } from "../auth/auth.js";
import MessageStore from "../messageStore.js";
import RoomStore from "../roomStore.js";
import SessionStore from "../sessionStore.js";
import { getAllDBUsers } from "./../controllers/userController.js";

const REDIS_URI = process.env.REDIS_URI;

const websocketConnect = (server) => {
  const io = new Server(server);
  const redis = new Redis(REDIS_URI);
  const sessionStore = new SessionStore(redis);
  const messageStore = new MessageStore(redis);
  const roomStore = new RoomStore(redis);

  io.use(async (socket, next) => {
    try {
      const sessionID = socket.handshake.auth.sessionID;
      if (sessionID) {
        // check cached session
        const session = await sessionStore.findSession(sessionID);
        if (session) {
          const { username, userID } = session;

          socket.username = username;
          socket.sessionID = sessionID;
          socket.userID = userID;

          next();
        } else {
          // clean up stale sessions
          await sessionStore.removeSession(sessionID);
        }
      }
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication token is missing."));
      }
      const payload = verifyJWT(token); // {username, id}
      const { id, username } = payload;
      if (!id || !username) {
        return next(new Error("User is not authenticated.")); // this is caught by "connect_error" in client-side
      }
      socket.username = username;
      socket.userID = id;
      socket.sessionID = token;

      next();
    } catch (error) {
      return next(new Error(error?.message || "Authentication error."));
    }
  });

  io.on("connection", async (socket) => {
    console.log("Websocket connected. ID: ", socket.username);

    try {
      await sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: true,
      });
      socket.emit("session", { userID: socket.userID, username: socket.username, sessionID: socket.sessionID }); // send session data to the client
      socket.join(socket.userID); // overwrite default socket.join(socket.id)
    } catch (error) {
      console.error("Failed to initialize session: ", error);
      socket.emit("auth_error", { message: "Failed to establish session." });
    }

    socket.on("client_ready", async () => {
      try {
        // Get session users
        const dbUsers = await getAllDBUsers();
        const data = await Promise.all(
          dbUsers.map(async (user) => {
            const isConnected = await sessionStore.isConnected(user.username);
            const userMessages = await messageStore.getPrivateMessages(user.username);
            const userRooms = await roomStore.getUserRooms(user.username);
            const roomMessages = (
              await Promise.all(
                userRooms.map((roomName) => {
                  socket.join(roomName); // reconnect on reload
                  return messageStore.getRoomMessages(roomName);
                })
              )
            ).flat();
            return {
              userID: user.id,
              username: user.username,
              messages: userMessages,
              rooms: userRooms,
              roomMessages,
              connected: isConnected,
            };
          })
        );

        console.log("User count: ", dbUsers.length);
        socket.emit("initial_data", data);
      } catch (error) {
        console.error("Error fetching users", error);
        socket.emit("initial_data", []);
      }
    });

    // Notify all connections with new users
    socket.broadcast.emit("new_connection", {
      userID: socket.userID,
      username: socket.username,
      messages: [],
      rooms: [],
      roomMessages: [],
      connected: true,
    });

    // Tet-a-tet messaging
    socket.on("private_message", async (data) => {
      const { recipient, content, timestamp } = data;
      console.log(`Private message: Sending '${content}' from ${socket.userID} to ${recipient}`);
      const message = { content, from: socket.username, to: recipient.username, timestamp };
      socket.to(recipient.userID).emit("private_message", message);
      await messageStore.savePrivateMessage(message);
    });

    // Group messaging
    socket.on("join_room", async (roomName) => {
      socket.join(roomName);
      console.log(`USER ${socket.username} joined room: ${roomName}`);
      socket.to(roomName).emit("user_joined", { username: socket.username, roomName });
      await roomStore.saveRoom(socket.username, roomName);
    });

    socket.on("room_message", async (data) => {
      const { content, from, roomName, timestamp } = data;
      const message = { content, from, to: roomName, timestamp };
      socket.to(roomName).emit("room_message", message);
      await messageStore.saveRoomMessage(roomName, message);
    });

    socket.on("leave_room", async (roomName) => {
      socket.leave(roomName);
      console.log(`USER ${socket.username} left room: ${roomName}`);
      socket.to(roomName).emit("user_left", { username: socket.username, roomName });
      await roomStore.removeRoom(socket.username, roomName);
    });

    socket.on("sign_out", async () => {
      // remove user in the session store
      socket.disconnect();
      console.log("User signed out: ", socket.username);
      socket.broadcast.emit("user_disconnect", socket.userID);
      await sessionStore.removeSession(socket.sessionID);
    });

    socket.on("disconnect", async () => {
      // preserve user in the session store
      const userActiveSockets = await io.in(socket.userID).fetchSockets(); // same user, different browsers/devices/tabs
      const isDisconnected = userActiveSockets.length === 0;
      if (isDisconnected) {
        console.log("User disconnected: ", socket.username);
        socket.disconnect();
        socket.broadcast.emit("user_disconnect", socket.userID);
        await sessionStore.removeSession(socket.sessionID);
      }
    });

    socket.onAny((event, ...args) => {
      // listen to all events
      console.log("Socket event: ", event, args);
      try {
        const token = socket?.sessionID;
        verifyJWT(token);
      } catch (error) {
        socket.emit("auth_error", { message: error.message || "Authentication failed." });
      }
    });
  });
};

export default websocketConnect;
