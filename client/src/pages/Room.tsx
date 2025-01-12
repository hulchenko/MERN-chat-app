import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { socket } from "../socket";

interface Message {
  user: string;
  message: string;
}

export const Room = () => {
  const [searchParams] = useSearchParams();
  const { room } = useParams();
  const user = searchParams.get("user") || "Guest";

  const [message, setMessage] = useState<string>("");
  const [conversation, setConversation] = useState<Message[]>([]);

  const sendMessage = () => {
    if (!socket) return;
    socket.emit("client_outgoing", { message, room });
    const localMessage: Message = { user: "You", message };
    setConversation((prev) => [...prev, localMessage]); // local
    return () => {
      socket.off("client_outgoing");
    };
  };

  useEffect(() => {
    // join room on page render
    socket.emit("join_room", { user, room });
    setConversation((prev) => [...prev, { user: "You", message: "connected." }]); // local
    return () => {
      socket.off("join_room");
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("client_incoming", (incomingMessage: Message) => {
      console.log("Client incoming: ", incomingMessage);
      setConversation((prev) => [...prev, incomingMessage]);
    });

    socket.on("user_connect", (user) => {
      setConversation((prev) => [...prev, { user, message: "connected." }]);
    });

    socket.on("user_disconnect", (user) => {
      setConversation((prev) => [...prev, { user, message: "disconnected." }]);
    });

    return () => {
      // clean up listeners
      socket.off("client_incoming");
      socket.off("user_connect");
      socket.off("user_disconnect");
    };
  }, [socket]);

  return (
    <>
      <input type="text" placeholder="Message" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
      <h3>Messages:</h3>
      <ul>
        {conversation.map((msg, idx) => (
          <p key={idx}>
            {msg.user}: {msg.message}
          </p>
        ))}
      </ul>
    </>
  );
};
