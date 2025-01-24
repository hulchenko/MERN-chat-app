import Redis from "ioredis";
import { Server } from "socket.io";
import { verifyJWT } from "./auth/auth.js";
import MessageStore from "./stores/messageStore.js";
import RoomStore from "./stores/roomStore.js";
import SessionStore from "./stores/sessionStore.js";
import { getAllDBUsers } from "./controllers/userController.js";

const REDIS_URI = process.env.REDIS_URI;

const websocketConnect = (server) => {
  const io = new Server(server);
  const redis = new Redis(REDIS_URI);
  const sessionStore = new SessionStore(redis);
  const messageStore = new MessageStore(redis);
  const roomStore = new RoomStore(redis);

  const authenticateUser = async (socket, next) => {
    // client login -> websocket connect -> send token
    try {
      const token = socket.handshake.auth.token;
      if (!token) next(new Error("Authentication token is missing."));

      const { id, username } = verifyJWT(token); // {username, id}
      if (!id || !username) next(new Error("User is not authenticated.")); // this is caught by "connect_error" in client-side

      socket.username = username;
      socket.userID = id;
      socket.sessionID = token;

      next();
    } catch (error) {
      return next(new Error(error?.message || "Authentication error."));
    }
  };
  const disconnectUser = async (socket) => {
    if (socket.isSignedOut) return;
    const userActiveSockets = await io.in(socket.userID).fetchSockets(); // same user, different browsers/devices/tabs
    const isDisconnected = userActiveSockets.length === 0;
    if (isDisconnected) {
      console.log("User disconnected: ", socket.username);
      // preserve user in the session store
      await sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: false,
      });
      socket.broadcast.emit("user_disconnect", socket.userID);
    }
  };

  const fetchUsers = async (socket) => {
    console.log("fetchUsers");
    try {
      const dbUsers = await getAllDBUsers();

      const userData = [];

      for (const user of dbUsers) {
        const data = await aggregateUserData(user, socket);
        if (data) {
          userData.push(data);
        }
      }
      console.log("past fetch users", userData);

      return userData;
    } catch (error) {
      console.error("Error fetching users: ", error.message || error);
      throw new Error("Error fetching users.");
    }
  };

  const aggregateUserData = async (user, socket) => {
    console.log("aggregateUserData");
    try {
      const userRooms = await roomStore.getUserRooms(user.username);
      const roomMessages = [];
      for (const roomName of userRooms) {
        const messages = await fetchRoomMessages(roomName, socket);
        roomMessages.push(...messages);
      }
      const [privateMessages, isConnected] = await Promise.all([
        await messageStore.getPrivateMessages(user.username),
        await sessionStore.isConnected(user.username),
      ]);
      console.log("privateMessages, isConnected");

      return {
        userID: user.id,
        username: user.username,
        messages: privateMessages,
        rooms: userRooms,
        roomMessages,
        connected: isConnected,
      };
    } catch (error) {
      console.error(`Failed compiling data for ${user.username}`, error.message || error);
      return null;
    }
  };

  const fetchRoomMessages = async (roomName, socket) => {
    console.log("fetchRoomMessages");
    try {
      socket.join(roomName); // reconnect on reload
      const messages = await messageStore.getRoomMessages(roomName);
      return messages;
    } catch (error) {
      console.error(`Failed to fetch messages from room:${roomName}.`, error);
    }
  };

  io.use(authenticateUser); // middleware fires before socket connection

  io.on("connection", async (socket) => {
    console.log("Websocket connected: ", socket.username);

    // Init session
    await sessionStore.saveSession(socket.sessionID, {
      userID: socket.userID,
      username: socket.username,
      connected: true,
    });
    socket.emit("session", { userID: socket.userID, username: socket.username, sessionID: socket.sessionID }); // send session data to the client
    socket.join(socket.userID); // overwrite default socket.join(socket.id)

    socket.on("client_ready", async () => {
      try {
        // Get session users
        const data = await fetchUsers(socket);
        socket.emit("initial_data", data);
      } catch (error) {
        console.error("Client ready error", error);
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
      console.log(`User ${socket.username} joined room: ${roomName}`);
      const roomMessages = await messageStore.getRoomMessages(roomName);
      socket.emit("joined_room_messages", roomMessages);
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
      console.log(`User ${socket.username} left room: ${roomName}`);
      socket.to(roomName).emit("user_left", { username: socket.username, roomName });
      await roomStore.removeRoom(socket.username, roomName);
    });

    socket.on("sign_out", async () => {
      // remove user in the session store
      console.log("User signed out: ", socket.username);
      socket.isSignedOut = true;
      await sessionStore.removeUserSessions(socket.username);
      socket.broadcast.emit("user_disconnect", socket.userID);
      socket.disconnect();
      io.to(socket.userID).emit("force_disconnect"); // disconnect multiple client tabs
    });

    socket.on("disconnect", () => disconnectUser(socket));

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
