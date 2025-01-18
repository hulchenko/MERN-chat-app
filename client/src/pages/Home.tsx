import { useEffect, useState } from "react";
import { ChatContainer } from "../components/ChatContainer";
import { ChatInput } from "../components/ChatInput";
import { NavigationPanel } from "../components/NavigationPanel";
import { SelectedChannelProvider } from "../context/SelectedChannelProvider";
import { ConversationProvider } from "../context/ConversationProvider";
import { useSession } from "../context/SessionProvider";
import socket from "../socket";

export const Home = () => {
  const { session } = useSession();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    if (session) {
      console.log("SESSION FIRED", session);
      const { username, sessionID: token } = session; // after token is decoded it becomes sessionID on the server side

      // reconnect socket after page reload
      socket.auth = { token };
      socket.connect();

      setUsername(username);
    }
  }, [session]);

  return (
    <div className="flex w-full h-screen">
      <SelectedChannelProvider>
        <ConversationProvider>
          <NavigationPanel username={username} />
          <div className="flex flex-col flex-grow overflow-hidden">
            <ChatContainer username={username} />
            <ChatInput username={username} />
          </div>
        </ConversationProvider>
      </SelectedChannelProvider>
    </div>
  );
};
