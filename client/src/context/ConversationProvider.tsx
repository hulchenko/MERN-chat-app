import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { Message } from "../interface/Message";
import socket from "../socket";

interface ConversationContext {
  conversation: ConversationMessage;
  lastMessage: Message;
  addMessage: (from: string, to: string, content: string, timestamp: number, pm: boolean) => void;
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

  const addMessage = useCallback((from: string, to: string, content: string, timestamp: number, pm: boolean): void => {
    const key = pm ? generateConversationKey(from, to) : to; // use room (to) key for group chats
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

  const addNotification = useCallback((roomName: string, content: string, timestamp: number) => {
    const notification = { from: "", to: roomName, content, timestamp, notification: true };
    console.log("FIRED: ", notification);
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
    socket.on("private_message", (data: Message) => {
      const { from, to, content, timestamp } = data;
      console.log(`Incoming PM: from: ${from}, to: ${to}, content: ${content}`);
      const pm = true;
      addMessage(from, to, content, timestamp, pm); // fires only for receiving socket
    });
    socket.on("room_message", (data: Message) => {
      const { from, to, content, timestamp } = data;
      console.log(`Incoming GM: from: ${from}, room: ${to}, content: ${content}`);
      const pm = false;
      addMessage(from, to, content, timestamp, pm);
    });

    socket.on("user_joined", ({ username, roomName }) => {
      console.log("USER JOINED CLIENT");
      const content = username + " joined";
      addNotification(roomName, content, Date.now());
    });

    socket.on("user_left", ({ username, roomName }) => {
      console.log("USER LEFT CLIENT");
      const content = username + " left";
      addNotification(roomName, content, Date.now());
    });

    return () => {
      socket.off("private_message");
      socket.off("room_message");
      socket.off("user_joined");
      socket.off("user_left");
    };
  }, []);

  return <ConversationContext.Provider value={{ conversation, lastMessage, addMessage }}>{children}</ConversationContext.Provider>;
};

export const useConversation = () => useContext(ConversationContext);
