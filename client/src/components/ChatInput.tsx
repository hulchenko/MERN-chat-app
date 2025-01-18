import { useState } from "react";
import { useConversation } from "../context/ConversationProvider";
import { useSelectedChannel } from "../context/SelectedChannelProvider";
import socket from "../socket";

export const ChatInput = ({ username }: { username: string }) => {
  const [message, setMessage] = useState<string>("");

  const { selectedUser, selectedRoom } = useSelectedChannel();
  const { addMessage } = useConversation();

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    const newMessage = message.trim();
    const timestamp = Date.now();
    if (selectedUser && newMessage) {
      socket.emit("private_message", { content: newMessage, recipient: selectedUser, timestamp });
      const pm = true;
      addMessage(username, selectedUser.username, newMessage, timestamp, pm); // fires only for sending socket
      setMessage("");
    }

    if (selectedRoom && newMessage) {
      socket.emit("room_message", { content: newMessage, from: username, roomName: selectedRoom.name, timestamp });
      const pm = false;
      addMessage(username, selectedRoom.name, newMessage, timestamp, pm); // fires only for sending socket
      setMessage("");
    }
  };

  return (
    <form onSubmit={sendMessage} className="mb-6 w-full flex justify-center gap-4">
      <input
        disabled={!selectedUser && !selectedRoom}
        className="w-1/2 p-2 rounded"
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
      />
      <button type="submit" disabled={!selectedUser && !selectedRoom} className="p-2 border border-slate-500 rounded w-40">
        Send
      </button>
    </form>
  );
};
