import { useState } from "react";
import { useConversation } from "../context/ConversationProvider";
import { useSelectedChannel } from "../context/SelectedChannelProvider";
import socket from "../socket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

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
    <form onSubmit={sendMessage} className="2xl:px-96 px-4 py-4" hidden={!selectedUser && !selectedRoom}>
      <div className="w-full flex gap-4">
        <input
          disabled={!selectedUser && !selectedRoom}
          className="w-full p-2 rounded focus-visible:outline-sky-400"
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
        />
        <button type="submit" disabled={!selectedUser && !selectedRoom} className="p-2 border border-sky-500 rounded w-40 bg-stone-50 hover:bg-sky-200">
          <FontAwesomeIcon className="text-sky-500 " icon={faPaperPlane} />
        </button>
      </div>
    </form>
  );
};
