import { Socket } from "socket.io-client";
import { Session } from "./Session";
import { User } from "./User";

interface UserPanelProps {
  users: User[] | null;
  setUsers: (users: React.SetStateAction<User[] | null>) => void;
  session: Session | null | undefined;
  socket: Socket;
}

interface RoomPanelProps {
  userRooms: string[];
  setUserRooms: (room: React.SetStateAction<string[]>) => void;
  socket: Socket;
}

export type { UserPanelProps, RoomPanelProps };
