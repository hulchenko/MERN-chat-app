import { Server } from "socket.io";
import { verifyJWT } from "../auth/auth.js";
import SessionStore from "../sessionStore.js";
import MessageStore from "../messageStore.js";

const websocketConnect = (server) => {
  const io = new Server(server);
  const sessionStore = new SessionStore();
  const messageStore = new MessageStore();

  io.use((socket, next) => {
    try {
      const sessionID = socket.handshake.auth.sessionID;
      if (sessionID) {
        // check cached session
        const session = sessionStore.findSession(sessionID);
        if (session) {
          console.log("SESSION EXIST: ", session);
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

    sessionStore.saveSession(socket.sessionID, {
      userID: socket.userID,
      username: socket.username,
    });
    socket.emit("session", { userID: socket.userID, username: socket.username, sessionID: socket.sessionID }); // send session data to the client
    socket.join(socket.userID); // overwrite default socket.join(socket.id)

    // Get session users
    const users = []; // re-render anew on a fresh connection
    Object.values(sessionStore.getAllSessions()).forEach((session) => {
      const userMessages = messageStore.getMessages(session.username);
      users.push({
        userID: session.userID,
        username: session.username,
        messages: userMessages,
      });
    });
    console.log("Online count: ", users.length);
    socket.emit("initial_users", users);

    // Notify all connections with new users
    socket.broadcast.emit("new_user", {
      userID: socket.userID,
      username: socket.username,
      messages: [],
    });

    // Tet-a-tet messaging
    socket.on("private_message", (data) => {
      const { recipient, content, timestamp } = data;
      console.log(`Private message: Sending '${content}' from ${socket.userID} to ${recipient}`);
      const message = { content, from: socket.username, to: recipient.username, timestamp };
      socket.to(recipient.userID).emit("private_message", message);
      messageStore.saveMessage(message);
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
      }
    });

    socket.onAny((event, ...args) => {
      // listen to all events
      console.log("SOCKET: ", event, args);
    });
  });
};

export default websocketConnect;
