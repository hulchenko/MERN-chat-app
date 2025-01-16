import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Session } from "../interface/Session";
import socket from "../socket";

interface SessionContext {
  session: Session | null;
  setSession: (session: Session) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContext>({
  session: null,
  setSession: () => {},
  clearSession: () => {},
});

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);

  const clearSession = () => {
    localStorage.clear();
    socket.disconnect();
    setSession(null);
  };

  const storeLocally = () => {
    if (session && session.username && session.sessionID && session.userID) {
      const userID = localStorage.getItem("userID");
      const username = localStorage.getItem("username");
      const sessionID = localStorage.getItem("sessionID");
      if (!userID || !username || !sessionID) {
        localStorage.setItem("userID", session.userID);
        localStorage.setItem("username", session.username);
        localStorage.setItem("sessionID", session.sessionID);
      }
    }
  };

  useEffect(() => {
    if (!session) {
      const userID = localStorage.getItem("userID");
      const username = localStorage.getItem("username");
      const sessionID = localStorage.getItem("sessionID");
      if (userID && username && sessionID) {
        return setSession({ userID, username, sessionID });
      }
    }
    storeLocally();
    // console.log("SESSION: ", session);
  }, [session]);

  useEffect(() => {
    socket.on("session", (socketSession: Session) => {
      const { userID, username, sessionID } = socketSession;
      if (userID && username && sessionID) {
        setSession({ userID, username, sessionID });
      }
    });

    return () => {
      socket.off("session");
    };
  }, []);

  return <SessionContext.Provider value={{ session, setSession, clearSession }}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);
