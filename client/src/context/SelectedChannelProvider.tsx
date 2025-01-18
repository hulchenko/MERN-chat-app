import { createContext, ReactNode, useContext, useState } from "react";
import { User } from "../interface/User";
import { Room } from "../interface/Room";

interface SelectedChannelContext {
  selectedUser: User | null;
  selectedRoom: Room | null;
  setSelectedUser: (user: User) => void;
  setSelectedRoom: (room: Room) => void;
}

const SelectedChannelContext = createContext<SelectedChannelContext>({
  selectedUser: { userID: "", username: "", newMessage: false, messages: [] },
  selectedRoom: { name: "", newMessage: false, messages: [] },
  setSelectedUser: () => {},
  setSelectedRoom: () => {},
});

export const SelectedChannelProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // useEffect(() => console.log("SELECTED USER: ", selectedUser), [selectedUser]);

  return <SelectedChannelContext.Provider value={{ selectedUser, selectedRoom, setSelectedUser, setSelectedRoom }}>{children}</SelectedChannelContext.Provider>;
};

export const useSelectedChannel = () => useContext(SelectedChannelContext);
