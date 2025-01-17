import { generateConversationKey, useConversation } from "../context/ConversationProvider";
import { useSelectedUser } from "../context/SelectedUserProvider";

export const ChatContainer = ({ username }: { username: string }) => {
  const { selectedUser } = useSelectedUser();
  const { conversation } = useConversation();

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
