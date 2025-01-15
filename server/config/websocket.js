import { Server } from "socket.io";
import { verifyJWT } from "../auth/auth.js";

const websocketConnect = (server) => {
  const io = new Server(server);

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decodedAuthData = verifyJWT(token);
      const { id, username } = decodedAuthData;
      if (!id || !username) {
        return next(new Error("User is not authenticated.")); // this is caught by "connect_error" in client-side
      }
      socket.username = username;
      socket.sessionID = token;
      socket.userID = id;

      socket.emit("authenticated", { id, username, token });

      next();
    } catch (error) {
      return next(new Error("Authentication error."));
    }
  });

  io.on("connection", (socket) => {
    console.log("Websocket connected. ID: ", socket.id);

    // Get all online users initially
    const connections = io.of("/").sockets;
    const users = []; // re-render anew on a fresh connection
    console.log("Online count: ", connections.size);
    for (const [sockedID, socketObj] of connections) {
      users.push({ sockedID, username: socketObj.username });
    }
    socket.emit("initial_users", users);

    // Notify all connections with new users
    socket.broadcast.emit("new_user", { sockedID: socket.id, username: socket.username });

    // Tet-a-tet messaging
    socket.on("private_message", (data) => {
      const { recipient, content } = data;
      console.log("Users: ", users);
      console.log(`Private message: Sending '${content}' from ${socket.id} to ${recipient}`);
      io.to(recipient.sockedID).emit("private_message", {
        // emit message to the private room(user id)
        content,
        from: socket.username,
        to: recipient.username,
      });
    });

    socket.on("disconnecting", () => {
      console.log("user disconnected: ", socket.username);
      socket.broadcast.emit("user_disconnect", socket.id);
    });

    socket.onAny((event, ...args) => {
      // listen to all events
      console.log("SOCKET: ", event, args);
    });
  });
};

export default websocketConnect;
