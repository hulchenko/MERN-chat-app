import { Server } from "socket.io";

const websocketConnect = (server) => {
  const io = new Server(server);

  const users = {};

  // TODO fetch user here and assign user props to socket
  // TODO add unauthorized/disconnect handler

  io.on("connection", (socket) => {
    console.log("Websocket connected. ID: ", socket.id);

    socket.on("login", (user) => {
      const { name, email } = user;
      users[socket.id] = { name, email }; // TODO add persistent socket session
    });

    // join room
    socket.on("join_room", ({ user, room }) => {
      const { name, email } = user;
      console.log(name + " joined " + room);
      if (!users[socket.id]) {
        users[socket.id] = { name, email }; // TODO remove after persistent socket session
      }
      socket.join(room);
      socket.to(room).emit("user_connect", name);
    });

    socket.on("leave_room", ({ user, room }) => {
      if (!users[socket.id]) return;
      const { name, email } = user;
      socket.leave(room);
      socket.to(room).emit("user_disconnect", name);
    });

    // send/receive messages
    socket.on("client_outgoing", (data) => {
      if (!users[socket.id]) return;
      const { room, message } = data;
      const { name } = users[socket.id];
      if (!name || !room || !message) return;

      // socket.broadcast.emit("client_incoming", incomingMessage); // emit to everyone in the channel
      socket.to(room).emit("client_incoming", { user: name, message }); // emit to the specific room only
    });

    socket.on("private_message", (data) => {
      if (!users[socket.id]) return;
      // TODO users will automatically join their rooms (user id unique) on connection. This allows private messaging between 2 users: (targetSocketId + message)
    });

    socket.on("disconnecting", () => {
      if (!users[socket.id]) return; // TODO error handling

      const { name } = users[socket.id];
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          // socket.id = default "room" assigned to upon socket creation
          socket.to(room).emit("user_disconnect", name);
          console.log(name + " disconnected.");
          // TODO handle individual rooms disconnect
        }
      }
    });

    socket.on("disconnect", () => {
      // socket no longer exists, final clean up if any
      delete users[socket.id];
    });
  });
};

export default websocketConnect;
