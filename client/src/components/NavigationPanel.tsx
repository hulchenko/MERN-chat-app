import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useConversation } from "../context/ConversationProvider";
import { useSelectedUser } from "../context/SelectedUserProvider";
import { useSession } from "../context/SessionProvider";
import { User } from "../interface/User";
import socket from "../socket";

const sampleRooms = ["room1", "room2", "room3", "room4"]; // TODO replace

export const NavigationPanel = ({ username }: { username: string }) => {
  const [isOnline, setOnline] = useState<boolean>(false);
  const [room, setRoom] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);

  const { session, clearSession } = useSession();
  const { selectedUser, setSelectedUser } = useSelectedUser();
  const { lastMessage } = useConversation();

  const navigate = useNavigate();

  const joinRoom = (): void => {
    if (room && username) {
      navigate(`/${room}`);
    }
  };

  const createRoom = (): void => {
    // TODO Mongo POST
  };

  const initialUsersHandler = useCallback(
    (users: User[]) => {
      if (!session?.userID) return;
      // initial users
      console.log(`initial users: `, users);
      const usersExcludeSelf = users.filter((user) => user.userID !== session?.userID);
      setUsers(usersExcludeSelf);
    },
    [session]
  );

  const newUserHandler = useCallback((user: User) => {
    // any user connected after host is connected
    console.log(`new user: `, user);
    const existingUsers = [...users];
    const isUserExist = existingUsers.some((u) => u.username === user.username);
    const self = user.username === session?.username; // support multiple active tabs for the same user
    if (!isUserExist && !self) {
      setUsers((prev) => [...prev, user]);
    }
  }, []);

  const userDisconnectHandler = useCallback((userID: string) => {
    const usersArr = [...users];
    const userIdx = usersArr.findIndex((user) => user.userID === userID);
    if (userIdx !== -1) {
      usersArr.splice(userIdx, 1);
      setUsers(usersArr);
    }
  }, []);

  const displayNotification = useCallback((sender: string): void => {
    const usersArr = [...users];
    const userIdx = usersArr.findIndex((user) => user.username === sender);
    if (userIdx !== -1) {
      usersArr[userIdx].newMessage = true;
      setUsers(usersArr);
    }
  }, []);

  const removeNotification = (targetUser: User): void => {
    const usersArr = [...users];
    const userIdx = usersArr.findIndex((user) => user.username === targetUser.username);
    if (userIdx !== -1) {
      usersArr[userIdx].newMessage = false;
      setUsers(usersArr);
    }
  };

  const signOut = () => {
    clearSession();
    navigate("/login");
  };

  useEffect(() => {
    socket.on("connect", () => {
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
  }, [initialUsersHandler, newUserHandler, userDisconnectHandler]);

  useEffect(() => {
    // display notification icon for new messages
    const sender = lastMessage.from;
    const targetUser = selectedUser?.username;
    if (sender !== targetUser) {
      displayNotification(sender);
    }
  }, [lastMessage]);

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
                  setSelectedUser(user), removeNotification(user);
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
          <h1>Rooms</h1>
          <div className="p-4 bg-slate-200 rounded">
            {sampleRooms.map((room, idx) => (
              <p key={idx} className="p-2 my-2 border border-slate-700 rounded">
                {room}
              </p>
            ))}
            {/* TODO will come from DB */}
            {/* <button onClick={joinRoom}>Join</button> */}
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
