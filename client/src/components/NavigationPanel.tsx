import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useConversation } from "../context/ConversationProvider";
import { useSelectedChannel } from "../context/SelectedChannelProvider";
import { useSession } from "../context/SessionProvider";
import { User } from "../interface/User";
import socket from "../socket";
import { Room } from "../interface/Room";

const sampleRooms = [
  { name: "room1", messages: [] },
  { name: "room2", messages: [] },
  { name: "room3", messages: [] },
  { name: "room4", messages: [] },
]; // TODO replace

export const NavigationPanel = ({ username }: { username: string }) => {
  const [isOnline, setOnline] = useState<boolean>(false);
  const [room, setRoom] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [userRooms, setUserRooms] = useState<string[]>([]);

  const { session, clearSession } = useSession();
  const { selectedUser, selectedRoom, setSelectedUser, setSelectedRoom } = useSelectedChannel();
  const { addMessage, lastMessage } = useConversation();

  const navigate = useNavigate();

  const joinRoom = (room: Room): void => {
    socket.emit("join_room", room.name);
    if (!userRooms.includes(room.name)) {
      setUserRooms((prev) => [...prev, room.name]);
    }
    setSelectedRoom(room);
  };

  const leaveRoom = (room: Room): void => {
    socket.emit("leave_room", room.name);
    const roomIdx = userRooms.findIndex((roomName) => roomName === room.name);
    if (roomIdx !== -1) {
      setUserRooms((prev) => {
        const originalArr = [...prev];
        originalArr.splice(roomIdx, 1);
        return originalArr;
      });
    }
    setSelectedRoom(null);
  };

  const clickRoom = (room: Room): void => {
    if (userRooms.includes(room.name)) {
      setSelectedRoom(room);
    }
  };

  const createRoom = (): void => {
    // TODO Mongo POST
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
    (users: User[]) => {
      const pm = false;
      if (!users || users.length === 0) return;
      users.forEach((user) => {
        user.roomMessages.forEach(({ from, to, content, timestamp }) => {
          addMessage(from, to, content, timestamp, pm);
        });
      });
    },
    [users]
  );

  const initialUsersHandler = useCallback(
    (users: User[]) => {
      if (!session?.userID) return;
      // initial users
      console.log(`initial users: `, users);

      restorePrivateConversation(users);
      restoreGroupConversation(users);

      const currUser = users.find((user) => user.userID === session.userID);
      if (currUser) {
        setUserRooms(currUser.rooms);
      }

      const usersExcludeSelf = users.filter((user) => user.userID !== session?.userID);
      setUsers(usersExcludeSelf);
    },
    [session]
  );

  const newUserHandler = useCallback(
    (user: User) => {
      // any user connected after host is connected
      if (!session?.username) return;
      console.log(`new user: `, user);
      const existingUsers = [...users];
      const isUserExist = existingUsers.some((u) => u.username === user.username);
      const self = user.username === session?.username; // support multiple active tabs for the same user
      if (!isUserExist && !self) {
        setUsers((prev) => [...prev, user]);
      }
    },
    [session, users]
  );

  const userDisconnectHandler = useCallback((userID: string) => {
    setUsers((prev) => {
      const usersArr = [...prev];
      const userIdx = usersArr.findIndex((user) => user.userID === userID);
      if (userIdx !== -1) {
        usersArr.splice(userIdx, 1);
      }
      return usersArr;
    });
  }, []);

  const displayNotification = useCallback((sender: string): void => {
    setUsers((prev) => {
      const usersArr = [...prev];
      const userIdx = usersArr.findIndex((user) => user.username === sender);
      if (userIdx !== -1) {
        usersArr[userIdx].newMessage = true;
      }
      return usersArr;
    });
  }, []);

  const removeNotification = useCallback((targetUser: User): void => {
    setUsers((prev) => {
      const usersArr = [...prev];
      const userIdx = usersArr.findIndex((user) => user.username === targetUser.username);
      if (userIdx !== -1) {
        usersArr[userIdx].newMessage = false;
      }
      return usersArr;
    });
  }, []);

  const signOut = () => {
    clearSession();
    navigate("/login");
  };

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("client_ready");
      toast.success("Connected.");
      setOnline(true);
    });
    socket.on("initial_users", (users: User[]) => initialUsersHandler(users));
    socket.on("new_user", (user: User) => newUserHandler(user));
    socket.on("user_disconnect", (userID: string) => userDisconnectHandler(userID));
    socket.on("disconnect", () => toast.error("Disconnected."));

    return () => {
      socket.off("connect");
      socket.off("initial_users");
      socket.off("new_user");
      socket.off("user_disconnect");
      socket.off("disconnect");
    };
  }, [socket, initialUsersHandler, newUserHandler, userDisconnectHandler]);

  useEffect(() => {
    // display notification icon for new messages
    const sender = lastMessage.from;
    const targetUser = selectedUser?.username;
    const isForHost = lastMessage.to === session?.username;
    if (sender !== targetUser && isForHost) {
      displayNotification(sender);
    }
  }, [lastMessage, session]);

  return (
    <div className="border border-green-600 flex flex-col w-1/6 p-4 h-screen gap-2">
      <h3 className="my-10 text-3xl capitalize">Hi, {username}</h3>
      <p>Status: {isOnline ? <span className="text-green-600">Online</span> : <span className="text-red-400">Offline</span>}</p>
      <hr />
      <div className="flex flex-col h-full justify-between">
        <div>
          <h1>Online users</h1>
          <div className="p-4 bg-slate-200 rounded">
            {users.length === 0 && <p className="italic text-gray-400">No users online</p>}
            {users.map((user) => (
              <p
                key={user.userID}
                onClick={() => {
                  setSelectedUser(user);
                  removeNotification(user);
                }}
                className={`p-2 my-2 border border-slate-700 rounded cursor-pointer hover:bg-slate-300 ${
                  selectedUser?.username === user.username ? "bg-slate-700 text-white" : ""
                }`}
              >
                {user.username}
                {user.newMessage && <span className="text-red-500 font-bold border border-red-300 ml-4">new</span>}
              </p>
            ))}
          </div>
        </div>
        <div>
          <h1>Group Chats</h1>
          <div className="p-4 bg-slate-200 rounded">
            {sampleRooms.map((room, idx) => (
              <div key={idx} className="flex w-full justify-between">
                <p
                  className={`p-2 my-2 border border-slate-700 rounded ${selectedRoom?.name === room.name ? "text-white bg-slate-700" : ""} ${
                    userRooms.includes(room.name) ? " cursor-pointer bg-slate-400" : ""
                  }`}
                  onClick={() => clickRoom(room)}
                >
                  {room.name}
                </p>
                {!userRooms.includes(room.name) ? (
                  <button className="border border-slate-700 rounded m-2 p-2" onClick={() => joinRoom(room)}>
                    Join
                  </button>
                ) : (
                  <button className="border border-slate-700 rounded m-2 p-2" onClick={() => leaveRoom(room)}>
                    Leave
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <input type="text" placeholder="Room name..." onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoom(e.target.value)} />
      <button className="border border-slate-400 p-2" onClick={createRoom}>
        Create
      </button>
      <hr />
      <button className="border border-red-400 p-2" onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
};
