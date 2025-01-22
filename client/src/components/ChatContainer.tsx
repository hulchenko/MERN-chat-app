import { useSelectedChannel } from "../context/SelectedChannelProvider";
import { generateConversationKey, useConversation } from "../context/ConversationProvider";
import { useEffect, useRef } from "react";
import { dateFormat } from "../utils/format";

export const ChatContainer = ({ username }: { username: string }) => {
  const { selectedUser, selectedRoom } = useSelectedChannel();
  const { conversation } = useConversation();

  const conversationKey = selectedUser ? generateConversationKey(username, selectedUser?.username || "") : selectedRoom?.name || "";
  const messages = conversation[conversationKey];
  const messageRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView();
    }
  }, [selectedUser, conversation]);

  return (
    <div className="flex-grow flex flex-col overflow-hidden">
      {(selectedUser || selectedRoom) && (
        <>
          <h5 className="py-4 bg-sky-500 text-white text-lg font-bold text-center">{selectedUser?.username || selectedRoom?.name}</h5>
          <div className="flex-grow overflow-y-auto px-12 bg-stone-100">
            {messages?.map((msg, idx) =>
              msg.notification ? (
                <div key={idx} className="text-center italic text-stone-400 py-2">
                  {msg.content}
                </div>
              ) : (
                <div
                  ref={messageRef}
                  key={idx}
                  className={`my-2 pl-6 pt-2 pb-4 pr-3 max-w-96 break-words animate-pop text-stone-50 text-lg ${
                    msg.from === username ? "ml-auto  bg-sky-400 rounded-t-3xl rounded-bl-3xl" : " bg-gray-400 rounded-b-3xl rounded-tr-3xl"
                  }`}
                >
                  <div className="flex justify-end text-xs italic w-full gap-1">
                    <h5>{msg.from === username ? "you" : msg.from}</h5>@<p>{dateFormat(msg.timestamp)}</p>
                  </div>
                  <p>{msg.content}</p>
                </div>
              )
            )}
            {!messages && <p className="text-center text-stone-400 mt-96">Be the first to send a message</p>}
          </div>
        </>
      )}
      {!selectedUser && !selectedRoom && <p className="text-center mt-96 text-stone-400">Chats will appear here</p>}
    </div>
  );
};
