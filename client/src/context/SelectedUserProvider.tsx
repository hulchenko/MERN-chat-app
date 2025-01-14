import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User } from "../interface/User";

interface SelectedUserContext {
  selectedUser: User;
  setSelectedUser: (user: User) => void;
}

const SelectedUser = createContext<SelectedUserContext>({
  selectedUser: { id: "", username: "" },
  setSelectedUser: () => {},
});

export const SelectedUserProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>({ id: "", username: "" });

  useEffect(() => console.log("SELECTED USER: ", selectedUser), [selectedUser]);

  return <SelectedUser.Provider value={{ selectedUser, setSelectedUser }}>{children}</SelectedUser.Provider>;
};

export const useSelectedUser = () => useContext(SelectedUser);
