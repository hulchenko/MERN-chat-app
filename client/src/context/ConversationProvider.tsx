import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Message } from "../interface/Message";

interface ConversationContext {
  conversation: ConversationMessage;
  lastMessage: Message;
  addMessage: (from: string, to: string, content: string) => void;
}

type ConversationMessage = {
  [key: string]: Message[];
};

const ConversationContext = createContext<ConversationContext>({
  conversation: {},
  lastMessage: { from: "", to: "", content: "", timestamp: 0 },
  addMessage: () => {},
});

export const generateConversationKey = (user1: string, user2: string): string => {
  return [user1, user2].sort().join("_"); // test, admin -> admin_test
};

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [conversation, setConversation] = useState<ConversationMessage>({});
  const [lastMessage, setLastMessage] = useState<Message>({ from: "", to: "", content: "", timestamp: 0 });

  const addMessage = (from: string, to: string, content: string): void => {
    const key = generateConversationKey(from, to);
    const timestamp = Date.now();
    const message: Message = { from, content, to, timestamp };
    setConversation((prev) => {
      return {
        ...prev, // spread original object
        [key]: [
          ...(prev[key] || []), // spread any existing array within the key or create a new one
          message,
        ],
      };
    });
    setLastMessage({ from, to, content, timestamp });
  };

  useEffect(() => console.log("Conversation: ", conversation), [conversation]);

  return <ConversationContext.Provider value={{ conversation, lastMessage, addMessage }}>{children}</ConversationContext.Provider>;
};

export const useConversation = () => useContext(ConversationContext);
