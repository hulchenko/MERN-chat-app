import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export interface Session {
  name: string;
  email: string;
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
    if (session && session.name && session.email) {
      const name = localStorage.getItem("name");
      const email = localStorage.getItem("email");
      if (!name && !email) {
        localStorage.setItem("name", session.name);
        localStorage.setItem("email", session.email);
      }
    }
  };

  useEffect(() => {
    if (!session) {
      const name = localStorage.getItem("name");
      const email = localStorage.getItem("email");
      if (name && email) {
        return setSession({ name, email });
      }
    }
    storeLocally();
    console.log("SESSION: ", session);
  }, [session]);

  return <SessionContext.Provider value={{ session, setSession }}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);
