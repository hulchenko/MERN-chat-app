import { Server } from "socket.io";

const websocketConnect = (server) => {
  const io = new Server(server);

  const users = {};

  io.on("connection", (socket) => {
    console.log("Websocket connected. ID: ", socket.id);

    // join room
    socket.on("join_room", ({ user, room }) => {
      console.log("BEFORE: ", users);
      if (users[socket.id]) {
        const { rooms } = users[socket.id];
        if (!rooms.includes(room)) {
          const newArr = [...rooms, room];
          users[socket.id] = { ...users[socket.id], rooms: newArr };
        }
      } else {
        users[socket.id] = { user, rooms: [room] };
      }
      socket.join(room);
      socket.to(room).emit("user_connect", user);

      console.log("AFTER: ", users);
    });

    // send/receive messages
    socket.on("client_outgoing", (data) => {
      if (!users[socket.id]) return;
      console.log("CLIENT MESSAGE ", data);
      const { room, message } = data;
      const { user } = users[socket.id];
      if (!user || !room || !message) return;

      // socket.broadcast.emit("client_incoming", incomingMessage); // emit to everyone in the channel
      socket.to(room).emit("client_incoming", { user, message }); // emit to the specific room only
    });

    socket.on("private_message", (data) => {
      if (!users[socket.id]) return;
      // TODO users will automatically join their rooms (user id unique) on connection. This allows private messaging between 2 users: (targetSocketId + message)
    });

    socket.on("disconnecting", () => {
      if (!users[socket.id]) return;

      const { user } = users[socket.id];
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          // socket.id = default "room" assigned to upon socket creation
          socket.to(room).emit("user_disconnect", user);
          console.log(user + " disconnected.");
          // TODO handle individual rooms disconnect
        }
      }
      delete users[socket.id];
    });

    socket.on("disconnect", () => {
      // socket no longer exists, final clean up if any
    });
  });
};

export default websocketConnect;
