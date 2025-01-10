import { useEffect, useState } from "react";
import "./App.css";
import { io, Socket } from "socket.io-client";

const isDev = true;
const WS_URL = isDev ? import.meta.env.VITE_WS_URL_DEV : import.meta.env.VITE_WS_URL;

function App() {
  // const socket = io(WS_URL, { transports: ["websocket"] });
  const [socket, setSocket] = useState<Socket>();
  const [message, setMessage] = useState<string>("");
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) {
      // maintain only 1 websocket per client session
      setSocket(io(WS_URL, { transports: ["websocket"] }));
    }
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on("client_incoming", (incomingMessage) => {
      console.log("Client incoming: ", incomingMessage);
      setReceivedMessages((prev) => [...prev, incomingMessage]);
    });

    return () => {
      socket.off("client_incoming");
    };
  }, [socket]);

  const sendMessage = () => {
    if (!socket) return;
    socket.emit("client_outgoing", message);

    return () => {
      socket.off("client_outgoing");
    };
  };

  return (
    <div>
      <input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} />
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
