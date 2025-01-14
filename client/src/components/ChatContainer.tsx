import { useEffect, useState } from "react";
import { useConversation } from "../context/ConversationProvider";
import { useSelectedUser } from "../context/SelectedUserProvider";
import socket from "../socket";

export const ChatContainer = () => {
  const { selectedUser } = useSelectedUser();
  const { conversation } = useConversation();
  const [messages, setMessages] = useState([{ content: "", from: "" }]);

  useEffect(() => {
    socket.on("private_message", (data) => {
      console.log("PRIVATE MESSAGE INCOMING: ", data);
      const { content, from } = data;
      setMessages((prev) => [...prev, { content, from }]);
    });
    return () => {
      socket.off("private_message");
    };
  }, []);

  return (
    <div className="h-full w-full border border-blue-500">
      <h5>{selectedUser.username}</h5>
      <hr />
      {messages?.map((msg, idx) => (
        <div key={idx}>
          <h5>From: {msg.from}</h5>
          {/* <h5>To: {msg.to}</h5> */}
          <p>Message: {msg.content}</p>
        </div>
      ))}
    </div>
  );
};
