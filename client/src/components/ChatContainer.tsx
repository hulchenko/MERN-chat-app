import { useSelectedChannel } from "../context/SelectedChannelProvider";
import { generateConversationKey, useConversation } from "../context/ConversationProvider";

export const ChatContainer = ({ username }: { username: string }) => {
  const { selectedUser, selectedRoom } = useSelectedChannel();
  const { conversation } = useConversation();

  const conversationKey = selectedUser ? generateConversationKey(username, selectedUser?.username || "") : selectedRoom?.name || ""; // TODO unselect user/room on focus switch
  const messages = conversation[conversationKey];

  return (
    <div className="h-full w-full border border-blue-500">
      {(selectedUser || selectedRoom) && (
        <>
          <h5 className="py-4 bg-slate-600 text-white text-lg font-bold flex w-full justify-center capitalize">{selectedUser?.username}</h5>
          <hr />
          {messages?.map((msg, idx) => (
            <div key={idx} className="border border-slate-500 bg-slate-400 m-4 rounded p-2">
              <h5>{msg.from === username ? "You" : msg.from}</h5>
              <p>{msg.content}</p>
              <p>{msg.timestamp ? new Date(msg.timestamp).toISOString() : null}</p>
            </div>
          ))}
        </>
      )}
      {!selectedUser && <p className="w-full flex justify-center mt-96 text-slate-500">Select any active user to start messaging!</p>}
    </div>
  );
};
