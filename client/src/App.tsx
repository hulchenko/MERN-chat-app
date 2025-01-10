import { useEffect, useState } from "react";
import "./App.css";
import { io, Socket } from "socket.io-client";

const isDev = true;
const WS_URL = isDev ? import.meta.env.VITE_WS_URL_DEV : import.meta.env.VITE_WS_URL;
const socket: Socket = io(WS_URL, { transports: ["websocket"] });

function App() {
  const [room, setRoom] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;
    socket.on("client_incoming", (incomingMessage) => {
      console.log("Client incoming: ", incomingMessage);
      setReceivedMessages((prev) => [...prev, incomingMessage]);
    });

    return () => {
      socket.off("client_incoming"); // clean up listeners
    };
  }, [socket]);

  const sendMessage = () => {
    if (!socket) return;
    socket.emit("client_outgoing", { message, room });

    return () => {
      socket.off("client_outgoing");
    };
  };

  const joinRoom = () => {
    if (room) {
      socket.emit("join_room", room);
    }
  };

  return (
    <div>
      <input type="text" placeholder="Room" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoom(e.target.value)} />
      <button onClick={joinRoom}>Join</button>
      <hr />
      <input type="text" placeholder="Message" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
      <h3>Messages:</h3>
      <>
        {receivedMessages.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </>
    </div>
  );
}

export default App;
