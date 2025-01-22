import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { Message } from "../interface/Message";
import socket from "../socket";

interface ConversationContext {
  conversation: Conversation;
  lastMessage: Message;
  addMessage: (from: string, to: string, content: string, timestamp: number, pm: boolean) => void;
}

type Conversation = {
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
  const [conversation, setConversation] = useState<Conversation>({});
  const [lastMessage, setLastMessage] = useState<Message>({ from: "", to: "", content: "", timestamp: 0 });

  const addMessage = useCallback((from: string, to: string, content: string, timestamp: number, pm: boolean): void => {
    const key = pm ? generateConversationKey(from, to) : to; // use room (to) key for group chats
    const message: Message = { from, content, to, timestamp };

    setConversation((prev) => {
      const conversationArr = { ...prev };

      // prevent duplicates
      if (conversationArr[key]?.some((msg) => msg.timestamp === timestamp && msg.from === from)) {
        return conversationArr;
      }

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

  const addNotification = useCallback((roomName: string, content: string, timestamp: number) => {
    const notification = { from: "", to: roomName, content, timestamp, notification: true };
    setConversation((prev) => {
      const conversationArr = { ...prev };
      if (conversationArr[roomName]) {
        conversationArr[roomName] = [...conversationArr[roomName], notification];
      } else {
        conversationArr[roomName] = [notification];
      }

      conversationArr[roomName].sort((curr, next) => curr.timestamp - next.timestamp); // sort by asc timestamp to preserve proper timing on session reload
      return conversationArr;
    });
  }, []);

  useEffect(() => console.log("Conversation: ", conversation), [conversation]);

  useEffect(() => {
    socket.on("private_message", (message: Message) => {
      const { from, to, content, timestamp } = message;
      console.log(`Incoming PM: from: ${from}, to: ${to}, content: ${content}`);
      const pm = true;
      addMessage(from, to, content, timestamp, pm); // fires only for receiving socket
    });
    socket.on("room_message", (message: Message) => {
      const { from, to, content, timestamp } = message;
      console.log(`Incoming GM: from: ${from}, room: ${to}, content: ${content}`);
      const pm = false;
      addMessage(from, to, content, timestamp, pm);
    });
    socket.on("joined_room_messages", (messages: Message[]) => {
      messages.forEach((message) => {
        const { from, to, content, timestamp } = message;
        const pm = false;
        addMessage(from, to, content, timestamp, pm);
      });
    });
    socket.on("user_joined", ({ username, roomName }) => {
      const content = username + " joined";
      addNotification(roomName, content, Date.now());
    });
    socket.on("user_left", ({ username, roomName }) => {
      const content = username + " left";
      addNotification(roomName, content, Date.now());
    });

    return () => {
      socket.off("private_message");
      socket.off("room_message");
      socket.off("joined_room_messages");
      socket.off("user_joined");
      socket.off("user_left");
    };
  }, []);

  return <ConversationContext.Provider value={{ conversation, lastMessage, addMessage }}>{children}</ConversationContext.Provider>;
};

export const useConversation = () => useContext(ConversationContext);
