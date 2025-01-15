import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Session } from "../interface/Session";

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
    if (session && session.username && session.token && session.id) {
      const id = localStorage.getItem("id");
      const username = localStorage.getItem("username");
      const token = localStorage.getItem("token");
      if (!id || !username || !token) {
        localStorage.setItem("id", session.id);
        localStorage.setItem("username", session.username);
        localStorage.setItem("token", session.token);
      }
    }
  };

  useEffect(() => {
    if (!session) {
      const id = localStorage.getItem("id");
      const username = localStorage.getItem("username");
      const token = localStorage.getItem("token");
      if (id && username && token) {
        return setSession({ id, username, token });
      }
    }
    storeLocally();
    // console.log("SESSION: ", session);
  }, [session]);

  return <SessionContext.Provider value={{ session, setSession }}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);
