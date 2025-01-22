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
    <div className="border border-blue-500 flex-grow flex flex-col overflow-hidden">
      {(selectedUser || selectedRoom) && (
        <>
          <h5 className="py-4 bg-slate-600 text-white text-lg font-bold flex w-full justify-center">{selectedUser?.username || selectedRoom?.name}</h5>
          <div id="chat-block" className="flex-grow overflow-y-auto px-12 text-lg">
            {messages?.map((msg, idx) =>
              msg.notification ? (
                <div key={idx} className="text-center italic text-slate-600 py-2">
                  {msg.content}
                </div>
              ) : (
                <div
                  ref={messageRef}
                  key={idx}
                  className={`my-4 rounded-3xl p-4 max-w-96 break-words animate-pop ${msg.from === username ? "ml-auto  bg-sky-400" : " bg-slate-400 "}`}
                >
                  <div className="flex justify-end text-xs italic w-full gap-1">
                    <h5>{msg.from === username ? "you" : msg.from}</h5>@<p>{dateFormat(msg.timestamp)}</p>
                  </div>
                  <p>{msg.content}</p>
                </div>
              )
            )}
          </div>
        </>
      )}
      {!selectedUser && !selectedRoom && <p className="w-full flex justify-center mt-96 text-slate-500">Chats will appear here</p>}
      {(selectedUser || selectedRoom) && !messages && <p className="w-full flex justify-center mt-96 text-slate-500">Be the first to send a message!</p>}
    </div>
  );
};
