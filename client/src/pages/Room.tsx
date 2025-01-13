import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "../context/SessionProvider";
import socket from "../socket";

interface Message {
  username: string;
  message: string;
}

export const Room = () => {
  const { room } = useParams();
  const { session } = useSession();
  const navigate = useNavigate();

  const [message, setMessage] = useState<string>("");
  const [conversation, setConversation] = useState<Message[]>([]);

  const sendMessage = () => {
    if (!socket) return;
    socket.emit("client_outgoing", { message, room });
    const localMessage: Message = { username: "You", message };
    setConversation((prev) => [...prev, localMessage]); // local
    return () => {
      socket.off("client_outgoing");
    };
  };

  const leaveRoom = () => {
    // socket.disconnect();
    if (session) {
      const { username } = session;
      socket.emit("leave_room", { username, room });
      navigate("/");
    }
  };

  useEffect(() => {
    // join room on page render
    if (session) {
      const { username } = session;
      socket.emit("join_room", { username, room });
      setConversation((prev) => [...prev, { username: "You", message: "connected." }]); // local
      return () => {
        socket.off("join_room");
      };
    }
  }, [session, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on("client_incoming", (incomingMessage: Message) => {
      console.log("Client incoming: ", incomingMessage);
      setConversation((prev) => [...prev, incomingMessage]);
    });

    socket.on("user_connect", (username) => {
      setConversation((prev) => [...prev, { username, message: "connected." }]);
    });

    socket.on("user_disconnect", (username) => {
      setConversation((prev) => [...prev, { username, message: "disconnected." }]);
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
            {msg.username}: {msg.message}
          </p>
        ))}
      </ul>
      <button onClick={leaveRoom}>Leave room</button>
    </>
  );
};
