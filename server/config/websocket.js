import { Server } from "socket.io";

const websocketConnect = (server) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("Websocket connected. ID: ", socket.id);

    // join room
    socket.on("join_room", (room) => {
      socket.join(room);
    });

    socket.on("client_outgoing", (data) => {
      // listen on incoming messages via "client_outgoing" channel
      console.log("Incoming data: ", data);
      console.log("From: ", socket.id);
      const { room, message } = data;
      // socket.broadcast.emit("client_incoming", incomingMessage); // emit to everyone in the channel
      socket.to(room).emit("client_incoming", message); // emit to the specific room only
    });
  });
};

export default websocketConnect;
