import { Server } from "socket.io";
import { verifyJWT } from "../auth/auth.js";
import { SessionStore } from "../sessionStore.js";

const websocketConnect = (server) => {
  const io = new Server(server);
  const sessionStore = new SessionStore();

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
      connected: true,
    });
    socket.emit("session", { userID: socket.userID, username: socket.username, sessionID: socket.sessionID }); // send session data to the client
    socket.join(socket.userID); // overwrite default socket.join(socket.id)

    // Get session users
    const users = []; // re-render anew on a fresh connection
    Object.values(sessionStore.findAllSessions()).forEach((session) => {
      users.push({
        userID: session.userID,
        username: session.username,
        connected: session.connected,
      });
    });
    console.log("Online count: ", users.length);
    socket.emit("initial_users", users);

    // Notify all connections with new users
    socket.broadcast.emit("new_user", { userID: socket.userID, username: socket.username, connected: true });

    // Tet-a-tet messaging
    socket.on("private_message", (data) => {
      const { recipient, content } = data;
      console.log("Users: ", users);
      console.log(`Private message: Sending '${content}' from ${socket.userID} to ${recipient}`);
      socket.to(recipient.userID).emit("private_message", {
        content,
        from: socket.username,
        to: recipient.username,
      });
    });

    socket.on("disconnect", async () => {
      // check for any outstanding connections for the socket
      const userActiveSockets = await io.in(socket.userID).fetchSockets();
      const isDisconnected = userActiveSockets.length === 0;
      if (isDisconnected) {
        console.log("User disconnected: ", socket.username);
        socket.broadcast.emit("user_disconnect", socket.userID);

        sessionStore.saveSession(socket.sessionID, {
          userID: socket.userID,
          username: socket.username,
          connected: false, // update store connection status
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
