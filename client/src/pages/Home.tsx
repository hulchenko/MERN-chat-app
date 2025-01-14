import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatContainer } from "../components/ChatContainer";
import { ChatInput } from "../components/ChatInput";
import { NavigationPanel } from "../components/NavigationPanel";
import { ConversationProvider } from "../context/ConversationProvider";
import { SelectedUserProvider } from "../context/SelectedUserProvider";
import { useSession } from "../context/SessionProvider";

export const Home = () => {
  const { session } = useSession();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    if (session) {
      setUsername(session.username);
    }
  }, [session]);

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
