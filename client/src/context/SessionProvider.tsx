import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { Session } from "../interface/Session";
import socket from "../socket";

interface SessionContext {
  session: Session | null | undefined;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContext>({
  session: undefined,
  clearSession: () => {},
});

enum LocalStorage {
  userID = "userID",
  username = "username",
  sessionID = "sessionID",
}

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSessionState] = useState<Session | undefined | null>(undefined);

  const setSession = useCallback((session: Session) => {
    setSessionState(session);
    localStorage.setItem(LocalStorage.userID, session.userID);
    localStorage.setItem(LocalStorage.username, session.username);
    localStorage.setItem(LocalStorage.sessionID, session.sessionID);
  }, []);

  const clearSession = useCallback(() => {
    socket.emit("sign_out");
    socket.disconnect();
    localStorage.clear();
    setSessionState(null);
  }, []);

  useEffect(() => {
    const userID = localStorage.getItem(LocalStorage.userID);
    const username = localStorage.getItem(LocalStorage.username);
    const sessionID = localStorage.getItem(LocalStorage.sessionID);
    if (userID && username && sessionID) {
      setSession({ userID, username, sessionID });
    } else {
      setSessionState(null); // UI had no token from backend
    }
  }, []);

  useEffect(() => {
    socket.on("session", (socketSession: Session) => {
      const { userID, username, sessionID } = socketSession;
      if (userID && username && sessionID) {
        setSession({ userID, username, sessionID });
        socket.emit("client_ready");
      }
    });

    return () => {
      socket.off("session");
    };
  }, []);

  return <SessionContext.Provider value={{ session, clearSession }}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);
