import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelectedUser } from "../context/SelectedUserProvider";
import { User } from "../interface/User";
import socket from "../socket";

const sampleRooms = ["room1", "room2", "room3", "room4"]; // TODO replace

export const NavigationPanel = ({ username }: { username: string }) => {
  const [room, setRoom] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);

  const { selectedUser, setSelectedUser } = useSelectedUser();

  const navigate = useNavigate();

  const joinRoom = (): void => {
    if (room && username) {
      navigate(`/${room}`);
    }
  };

  const createRoom = (): void => {
    // TODO Mongo POST
  };

  useEffect(() => {
    socket.on("initial_users", (users: User[]) => {
      // initial users
      console.log(`initial users: `, users);
      const usersExcludeSelf = users.filter((user) => user.id !== socket.id);
      setUsers(usersExcludeSelf);
    });

    socket.on("new_user", (user: User) => {
      // any user connected after host is connected
      console.log(`new user: `, user);
      const existingUsers = [...users];
      const isUserExist = existingUsers.some((u) => u.id === user.id);
      if (!isUserExist) {
        setUsers((prev) => [...prev, user]);
      }
    });

    return () => {
      socket.off("initial_users");
      socket.off("new_user");
    };
  }, []);

  return (
    <div className="border border-green-600 flex flex-col w-1/6 p-4 h-screen">
      <h3 className="my-10 text-3xl capitalize">Hi, {username}</h3>
      <div className="flex flex-col h-full justify-between">
        <div>
          <h1>Online users</h1>
          <div className="p-4 bg-slate-200 rounded">
            {users.length === 0 && <p className="italic text-gray-400">No users online</p>}
            {users.map((user) => (
              <p
                onClick={() => setSelectedUser(user)}
                key={user.id}
                className={`p-2 my-2 border border-slate-700 rounded cursor-pointer hover:bg-slate-300 ${
                  selectedUser?.username === user.username ? "bg-slate-700 text-white" : ""
                }`}
              >
                {user.username}
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
      <button onClick={createRoom}>Create</button>
    </div>
  );
};
