import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useConversation } from "../context/ConversationProvider";
import { useSession } from "../context/SessionProvider";
import { User } from "../interface/User";
import socket from "../socket";
import { RoomPanel } from "./RoomPanel";
import { UserPanel } from "./UserPanel";
import { RoomPanelProps, UserPanelProps } from "../interface/Props";

export const NavigationPanel = ({ username }: { username: string }) => {
  const [isOnline, setOnline] = useState<boolean>(false);
  const [users, setUsers] = useState<User[] | null>(null);
  const [userRooms, setUserRooms] = useState<string[]>([]);

  const { session, clearSession } = useSession();
  const { addMessage } = useConversation();
  const navigate = useNavigate();

  const userPanelProps: UserPanelProps = {
    users,
    setUsers,
    session,
    socket,
  };

  const roomPanelProps: RoomPanelProps = {
    userRooms,
    setUserRooms,
    socket,
  };

  const restorePrivateConversation = useCallback(
    (users: User[]) => {
      const pm = true;
      if (!users || users.length === 0) return;
      users.forEach((user) => {
        user.messages.forEach(({ from, to, content, timestamp }) => {
          addMessage(from, to, content, timestamp, pm);
        });
      });
    },
    [users]
  );

  const restoreGroupConversation = useCallback(
    (user: User) => {
      const pm = false;
      user.roomMessages.forEach(({ from, to, content, timestamp }) => {
        addMessage(from, to, content, timestamp, pm);
      });
    },
    [users]
  );

  const initialDataHandler = useCallback(
    (users: User[]) => {
      if (!session?.userID) return;
      // initial users
      console.log(`initial users: `, users);

      restorePrivateConversation(users);

      const currUser = users.find((user) => user.userID === session.userID);
      if (currUser) {
        setUserRooms(currUser.rooms);
        restoreGroupConversation(currUser);
      }

      const usersExcludeSelf = users.filter((user) => user.userID !== session?.userID).sort((user) => (user.connected ? -1 : 1));
      setUsers(usersExcludeSelf);
    },
    [session]
  );

  const signOut = () => {
    clearSession();
    navigate("/login");
  };

  useEffect(() => {
    socket.on("connect", () => {
      toast.success("Connected.");
      setOnline(true);
    });
    socket.on("initial_data", (users: User[]) => initialDataHandler(users));
    socket.on("disconnect", () => {
      toast.error("Disconnected.");
      setOnline(false);
    });

    return () => {
      socket.off("connect");
      socket.off("initial_data");
      socket.off("disconnect");
    };
  }, [initialDataHandler]);

  return (
    <div className="border border-green-600 flex flex-col w-1/6 p-4 h-screen gap-2">
      <h3 className="my-10 text-3xl">Hi, {username}</h3>
      <p>Status: {isOnline ? <span className="text-green-600">Online</span> : <span className="text-red-400">Offline</span>}</p>
      <hr />
      <div className="flex flex-col h-full justify-between">
        <UserPanel {...userPanelProps} />
        <RoomPanel {...roomPanelProps} />
      </div>
      <hr />
      <button className="border border-red-400 p-2" onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
};
