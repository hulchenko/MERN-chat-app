import { useState } from "react";
import { useConversation } from "../context/ConversationProvider";
import { useSelectedUser } from "../context/SelectedUserProvider";
import socket from "../socket";

export const ChatInput = () => {
  const [message, setMessage] = useState<string>("");

  const { selectedUser } = useSelectedUser();
  const { setConversation } = useConversation();

  const sendMessage = () => {
    if (selectedUser && message) {
      socket.emit("private_message", { content: message, recipient: selectedUser });
      // const localMessage: Message = { username: "You", message };
      // setConversation((prev) => [...prev, localMessage]); // local
      return () => {
        socket.off("private_message");
      };
    }
  };

  return (
    <div className="mb-6 w-full flex justify-center gap-4">
      <input
        disabled={!selectedUser}
        className="w-1/2 p-2 rounded"
        type="text"
        placeholder="Type message..."
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
      />
      <button disabled={!selectedUser} onClick={sendMessage} className="p-2 border border-slate-500 rounded w-40">
        Send
      </button>
    </div>
  );
};
