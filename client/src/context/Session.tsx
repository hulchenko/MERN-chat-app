import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface Session {
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

  useEffect(() => console.log("SESSION: ", session), [session]);

  return <SessionContext.Provider value={{ session, setSession }}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);
