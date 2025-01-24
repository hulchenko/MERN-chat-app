import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { Room } from "../interface/Room";
import { User } from "../interface/User";

interface SelectedChannelContext {
  selectedUser: User | null;
  selectedRoom: Room | null;
  setSelectedUser: (user: User | null) => void;
  setSelectedRoom: (room: Room | null) => void;
}

const SelectedChannelContext = createContext<SelectedChannelContext>({
  selectedUser: { userID: "", username: "", newMessage: false, messages: [], rooms: [], roomMessages: [], connected: false },
  selectedRoom: { name: "", messages: [] },
  setSelectedUser: () => {},
  setSelectedRoom: () => {},
});

export const SelectedChannelProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUser, setSelectedUserState] = useState<User | null>(null);
  const [selectedRoom, setSelectedRoomState] = useState<Room | null>(null);

  const setSelectedUser = useCallback((user: User | null) => {
    setSelectedUserState(user);
    setSelectedRoomState(null);
  }, []);

  const setSelectedRoom = useCallback((room: Room | null) => {
    setSelectedRoomState(room);
    setSelectedUserState(null);
  }, []);

  return <SelectedChannelContext.Provider value={{ selectedUser, selectedRoom, setSelectedUser, setSelectedRoom }}>{children}</SelectedChannelContext.Provider>;
};

export const useSelectedChannel = () => useContext(SelectedChannelContext);
