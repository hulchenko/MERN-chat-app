import { Server } from "socket.io";

const websocketConnect = (server) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("Websocket connected.");

    // //send a message
    // socket.emit("test1", "Hello from backend!");

    socket.on("client_outgoing", (incomingMessage) => {
      // listen on incoming messages via "client_outgoing" channel
      console.log("Server incoming: ", incomingMessage);
      socket.broadcast.emit("client_incoming", incomingMessage); // emit to everyone in the channel
    });

    // socket.on("disconnect", (reason) => {
    //   console.log("Websocket disconnected due to: ", reason);
    // });

    // join room
    // socket.join("test room");
  });
};

export default websocketConnect;
