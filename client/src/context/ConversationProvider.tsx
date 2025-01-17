import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { Message } from "../interface/Message";
import socket from "../socket";

interface ConversationContext {
  conversation: ConversationMessage;
  lastMessage: Message;
  addMessage: (from: string, to: string, content: string, timestamp: number) => void;
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

  const addMessage = useCallback((from: string, to: string, content: string, timestamp: number): void => {
    const key = generateConversationKey(from, to);
    const message: Message = { from, content, to, timestamp };
    setConversation((prev) => {
      const conversationArr = { ...prev };
      if (conversationArr[key]) {
        conversationArr[key] = [...conversationArr[key], message];
      } else {
        conversationArr[key] = [message];
      }

      conversationArr[key].sort((curr, next) => curr.timestamp - next.timestamp); // sort by asc timestamp to preserve proper timing on session reload
      return conversationArr;
    });
    setLastMessage({ from, to, content, timestamp });
  }, []);

  useEffect(() => console.log("Conversation: ", conversation), [conversation]);

  useEffect(() => {
    socket.on("private_message", (data: Message) => {
      const { from, to, content, timestamp } = data;
      console.log(`Incoming PM: from: ${from}, to: ${to}, content: ${content}`);
      addMessage(from, to, content, timestamp); // fires only for receiving socket
    });
    return () => {
      socket.off("private_message");
    };
  }, []);

  return <ConversationContext.Provider value={{ conversation, lastMessage, addMessage }}>{children}</ConversationContext.Provider>;
};

export const useConversation = () => useContext(ConversationContext);
