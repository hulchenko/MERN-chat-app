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
    <div className="border border-r-sky-400 flex flex-col w-[400px] p-4 h-screen gap-2">
      <h5 className="mt-5 text-sm">hello,</h5>
      <h3 className="text-3xl font-bold text-sky-500">{username}</h3>
      <p className="mt-2 mb-10 relative flex w-20 items-center">
        status:
        {isOnline ? (
          <span className="absolute right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
          </span>
        ) : (
          <span className="absolute right-0 flex h-3 w-3 ">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400"></span>
          </span>
        )}
      </p>
      <div className="flex flex-col h-full justify-between">
        <UserPanel {...userPanelProps} />
        <RoomPanel {...roomPanelProps} />
      </div>
      <button className="border border-red-400 p-2 rounded-md text-red-400 hover:bg-red-200" onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
};
