import { useEffect, useState } from "react";
import { ChatContainer } from "../components/ChatContainer";
import { ChatInput } from "../components/ChatInput";
import { NavigationPanel } from "../components/NavigationPanel";
import { SelectedChannelProvider } from "../context/SelectedChannelProvider";
import { ConversationProvider } from "../context/ConversationProvider";
import { useSession } from "../context/SessionProvider";
import socket from "../socket";
import { Loader } from "../components/Loader";
import toast from "react-hot-toast";

export const Home = () => {
  const { session } = useSession();
  const [isOnline, setOnline] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    if (session) {
      const { username, sessionID: token } = session; // after token is decoded it becomes sessionID on the server side

      // reconnect socket after page reload
      socket.auth = { token };
      socket.connect();

      setUsername(username);
    }
  }, [session]);

  useEffect(() => {
    socket.on("connect", () => {
      toast.success("Connected.");
      setOnline(true);
    });
    socket.on("disconnect", () => {
      toast.error("Disconnected.");
      setOnline(false);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket, session]);

  if (!session) return <Loader />;

  return (
    <div className="flex w-full h-screen">
      <SelectedChannelProvider>
        <ConversationProvider>
          <NavigationPanel username={username} isOnline={isOnline} />
          <div className="flex flex-col flex-grow overflow-hidden">
            <ChatContainer username={username} />
            <ChatInput username={username} />
          </div>
        </ConversationProvider>
      </SelectedChannelProvider>
    </div>
  );
};
