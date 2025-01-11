import { Server } from "socket.io";

const websocketConnect = (server) => {
  const io = new Server(server);
  const names = {};

  io.on("connection", (socket) => {
    console.log("Websocket connected. ID: ", socket.id);

    // assign socket id to a user
    socket.on("new_user", (name) => {
      names[socket.id] = name;
      console.log(names);
    });

    // join room
    socket.on("join_room", ({ user, room }) => {
      socket.join(room);
      socket.to(room).emit("user_connect", user);
    });

    // send/receive messages
    socket.on("client_outgoing", (data) => {
      const { room, message } = data;
      // socket.broadcast.emit("client_incoming", incomingMessage); // emit to everyone in the channel
      socket.to(room).emit("client_incoming", { user: names[socket.id], message }); // emit to the specific room only
    });

    socket.on("disconnect", () => {
      const user = names[socket.id];
      socket.to("26").emit("user_disconnect", user); // TODO pass in dynamic room name
    });
  });
};

export default websocketConnect;
