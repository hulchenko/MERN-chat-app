import { useEffect, useState } from "react";
import "./App.css";
import { io, Socket } from "socket.io-client";

const isDev = true;
const WS_URL = isDev ? import.meta.env.VITE_WS_URL_DEV : import.meta.env.VITE_WS_URL;
const socket: Socket = io(WS_URL, { transports: ["websocket"] });

interface Message {
  user: string;
  message: string;
}

function App() {
  const [room, setRoom] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [saveData, setSaveData] = useState({
    room: false,
    user: false,
  });

  useEffect(() => {
    if (!socket) return;
    socket.on("client_incoming", (incomingMessage: Message) => {
      console.log("Client incoming: ", incomingMessage);
      setConversation((prev) => [...prev, incomingMessage]);
    });

    socket.on("user_connect", (user) => {
      setConversation((prev) => [...prev, { user: "", message: `${user} connected.` }]);
    });

    socket.on("user_disconnect", (user) => {
      setConversation((prev) => [...prev, { user: "", message: `${user} disconnected.` }]);
    });

    return () => {
      socket.off("client_incoming"); // clean up listeners
    };
  }, [socket]);

  const sendMessage = () => {
    if (!socket) return;
    socket.emit("client_outgoing", { message, room });
    const localMessage: Message = { user: "You", message };
    setConversation((prev) => [...prev, localMessage]); // local

    return () => {
      socket.off("client_outgoing");
    };
  };

  const joinRoom = () => {
    if (room !== "" && user) {
      socket.emit("join_room", { user, room });
      setSaveData((prev) => ({ ...prev, room: true }));
      setConversation((prev) => [...prev, { user: "", message: "Connected." }]); // local
      // reroute to a separate window
      // display connected
    }
  };

  const saveUser = () => {
    if (user) {
      socket.emit("new_user", user);
      setSaveData((prev) => ({ ...prev, user: true }));
    }
  };

  return (
    <div>
      <input disabled={saveData.user} type="text" placeholder="Name" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser(e.target.value)} />
      <button onClick={saveUser} disabled={saveData.user}>
        {saveData.user ? "Saved" : "Save"}
      </button>
      <hr />
      <input disabled={saveData.room} type="text" placeholder="Room" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoom(e.target.value)} />
      <button onClick={joinRoom} disabled={saveData.room}>
        {saveData.room ? "Joined" : "Join"}
      </button>
      <hr />
      <input type="text" placeholder="Message" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
      <h3>Messages:</h3>
      <>
        {conversation.map((msg, idx) => (
          <p key={idx}>
            {msg.user}:{msg.message}
          </p>
        ))}
      </>
    </div>
  );
}

export default App;
