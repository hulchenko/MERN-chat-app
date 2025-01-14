import { Server } from "socket.io";

const websocketConnect = (server) => {
  const io = new Server(server);

  io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("Username is missing.")); // this is caught by "connect_error" in client-side
    }
    socket.username = username;
    next();
  });

  io.on("connection", (socket) => {
    console.log("Websocket connected. ID: ", socket.id);

    // Get all online users initially
    const connections = io.of("/").sockets;
    const users = [];
    console.log("Users online: ", connections.size);
    for (const [socketId, socketObj] of connections) {
      users.push({ id: socketId, username: socketObj.username });
    }
    socket.emit("initial_users", users);

    // Notify all connections with new users
    socket.broadcast.emit("new_user", { id: socket.id, username: socket.username });

    // Tet-a-tet messaging
    socket.on("private_message", (data) => {
      const { recipient, content } = data;
      console.log("CURRENT USERS: ", users);
      console.log(`Private message: Sending '${content}' from ${socket.id} to ${recipient}`);
      io.to(recipient.id).emit("private_message", {
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
