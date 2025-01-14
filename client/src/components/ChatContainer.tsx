import { useEffect, useState } from "react";
import { useConversation, generateConversationKey } from "../context/ConversationProvider";
import { useSelectedUser } from "../context/SelectedUserProvider";
import socket from "../socket";
import { Message } from "../interface/Message";

export const ChatContainer = ({ username }: { username: string }) => {
  const { selectedUser } = useSelectedUser();
  const { conversation, addMessage } = useConversation();

  useEffect(() => {
    socket.on("private_message", (data: Message) => {
      const { from, to, content } = data;
      console.log(`Incoming PM: from: ${from}, to: ${to}, content: ${content}`);
      addMessage(from, to, content); // fires only for receiving socket
    });
    return () => {
      socket.off("private_message");
    };
  }, []);

  const conversationKey = generateConversationKey(username, selectedUser?.username || "");
  const messages = conversation[conversationKey];

  return (
    <div className="h-full w-full border border-blue-500">
      {selectedUser && (
        <>
          <h5 className="py-4 bg-slate-600 text-white text-lg font-bold flex w-full justify-center capitalize">{selectedUser?.username}</h5>
          <hr />
          {messages?.map((msg, idx) => (
            <div key={idx}>
              <h5>From: {msg.from}</h5>
              {/* <h5>To: {msg.to}</h5> */}
              <p>Message: {msg.content}</p>
            </div>
          ))}
        </>
      )}
      {!selectedUser && <p className="w-full flex justify-center mt-96 text-slate-500">Select any active user to start messaging!</p>}
    </div>
  );
};
