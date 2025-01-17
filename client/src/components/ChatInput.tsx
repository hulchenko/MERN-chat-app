import { useState } from "react";
import { useConversation } from "../context/ConversationProvider";
import { useSelectedUser } from "../context/SelectedUserProvider";
import socket from "../socket";

export const ChatInput = ({ username }: { username: string }) => {
  const [message, setMessage] = useState<string>("");

  const { selectedUser } = useSelectedUser();
  const { addMessage } = useConversation();

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    const newMessage = message.trim();
    const timestamp = Date.now();
    if (selectedUser && newMessage) {
      socket.emit("private_message", { content: newMessage, recipient: selectedUser, timestamp });
      addMessage(username, selectedUser.username, newMessage, timestamp); // fires only for sending socket
      setMessage("");
    }
  };

  return (
    <form onSubmit={sendMessage} className="mb-6 w-full flex justify-center gap-4">
      <input
        disabled={!selectedUser}
        className="w-1/2 p-2 rounded"
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
      />
      <button type="submit" disabled={!selectedUser} className="p-2 border border-slate-500 rounded w-40">
        Send
      </button>
    </form>
  );
};
