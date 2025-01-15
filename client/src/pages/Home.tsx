import { useEffect, useState } from "react";
import { ChatContainer } from "../components/ChatContainer";
import { ChatInput } from "../components/ChatInput";
import { NavigationPanel } from "../components/NavigationPanel";
import { ConversationProvider } from "../context/ConversationProvider";
import { SelectedUserProvider } from "../context/SelectedUserProvider";
import { useSession } from "../context/SessionProvider";
import { User } from "../interface/User";
import socket from "../socket";

interface AuthSocket extends Partial<User> {
  token: string;
}

export const Home = () => {
  const { session, setSession } = useSession();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    if (session) {
      setUsername(session.username);
    }
  }, [session]);

  useEffect(() => {
    socket.on("authenticated", (authSocketData: AuthSocket) => {
      const { id, username, token } = authSocketData;
      if (id && username && token) {
        setSession({ id, username, token });
      }
    });

    return () => {
      socket.off("authenticated");
    };
  }, []);

  return (
    <div className="flex w-full">
      <SelectedUserProvider>
        <ConversationProvider>
          <NavigationPanel username={username} />
          <div className="flex flex-col h-screen w-full">
            <ChatContainer username={username} />
            <ChatInput username={username} />
          </div>
        </ConversationProvider>
      </SelectedUserProvider>
    </div>
  );
};
