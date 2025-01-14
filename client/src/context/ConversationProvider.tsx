import { createContext, ReactNode, useContext, useState } from "react";

interface Message {
  from: string;
  to: string;
  content: string;
}

interface ConversationContext {
  conversation: Message[];
  setConversation: (conversation: Message[]) => void;
}

const ConversationContext = createContext<ConversationContext>({
  conversation: [],
  setConversation: () => {},
});

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [conversation, setConversation] = useState<Message[]>([]);

  return <ConversationContext.Provider value={{ conversation, setConversation }}>{children}</ConversationContext.Provider>;
};

export const useConversation = () => useContext(ConversationContext);
