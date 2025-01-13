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
    const connections = io.of("/").sockets;
    const users = [];
    console.log("Users online: ", connections.size);

    for (const [socketId, socketObj] of connections) {
      users.push({ id: socketId, username: socketObj.username });
    }

    socket.emit("initial_users", users);

    socket.broadcast.emit("new_user", { id: socket.id, username: socket.username }); // announce to all connections

    socket.onAny((event, ...args) => {
      // listen to all events
      console.log("SOCKET: ", event, args);
    });
  });
};

export default websocketConnect;
