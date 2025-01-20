import { useSelectedChannel } from "../context/SelectedChannelProvider";
import { generateConversationKey, useConversation } from "../context/ConversationProvider";

export const ChatContainer = ({ username }: { username: string }) => {
  const { selectedUser, selectedRoom } = useSelectedChannel();
  const { conversation } = useConversation();

  const conversationKey = selectedUser ? generateConversationKey(username, selectedUser?.username || "") : selectedRoom?.name || "";
  const messages = conversation[conversationKey];

  return (
    <div className="border border-blue-500 flex-grow flex flex-col overflow-hidden">
      {(selectedUser || selectedRoom) && messages && (
        <>
          <h5 className="py-4 bg-slate-600 text-white text-lg font-bold flex w-full justify-center capitalize">
            {selectedUser?.username || selectedRoom?.name}
          </h5>
          <div id="chat-block" className="flex-grow overflow-y-auto px-12">
            {messages?.map((msg, idx) =>
              msg.notification ? (
                <div key={idx} className="text-center italic text-slate-500 py-2">
                  {msg.content}
                </div>
              ) : (
                <div
                  key={idx}
                  className={`border border-slate-500 bg-slate-400 my-4 rounded-3xl p-4 max-w-96 break-words ${
                    msg.from === username ? "ml-auto rounded-br-none bg-blue-400" : "rounded-bl-none"
                  }`}
                >
                  <h5>{msg.from === username ? "You" : msg.from}</h5>
                  <p>{msg.content}</p>
                  <p>{msg.timestamp ? new Date(msg.timestamp).toISOString() : null}</p>
                </div>
              )
            )}
          </div>
        </>
      )}
      {!selectedUser && !selectedRoom && <p className="w-full flex justify-center mt-96 text-slate-500">Chats will appear here.</p>}
      {(selectedUser || selectedRoom) && !messages && <p className="w-full flex justify-center mt-96 text-slate-500">Be the first to send a message!</p>}
    </div>
  );
};
