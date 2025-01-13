import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export interface Session {
  username: string;
  // token: string
}

interface SessionContext {
  session: Session | null;
  setSession: (session: Session) => void;
}

const SessionContext = createContext<SessionContext>({
  session: null,
  setSession: () => {},
});

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);

  const storeLocally = () => {
    if (session && session.username) {
      const username = localStorage.getItem("username");
      if (!username) {
        localStorage.setItem("username", session.username);
      }
    }
  };

  useEffect(() => {
    if (!session) {
      const username = localStorage.getItem("username");
      if (username) {
        return setSession({ username });
      }
    }
    storeLocally();
    console.log("SESSION: ", session);
  }, [session]);

  return <SessionContext.Provider value={{ session, setSession }}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);
