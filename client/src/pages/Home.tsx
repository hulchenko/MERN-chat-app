import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionProvider";
import socket from "../socket";

interface User {
  id: string;
  username: string;
}

export const Home = () => {
  const [username, setUsername] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [room, setRoom] = useState<string>("");
  const { session } = useSession();

  const navigate = useNavigate();

  const joinRoom = () => {
    if (room && username) {
      navigate(`/${room}`);
    }
  };

  useEffect(() => {
    if (session) {
      setUsername(session.username);
    }
  }, [session]);

  useEffect(() => {
    socket.on("initial_users", (users: User[]) => {
      // initial users
      console.log(`initial users: `, users);
      // const excludeSelf = users.filter(user => user.username !== session.username) // TODO
      setUsers(users);
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
  }, [socket, users, session]);

  return (
    <div>
      <button onClick={() => navigate("/login")}>Login</button>
      <div>
        <h3>Hi, {username}</h3>
        {/* <input type="text" placeholder="Room" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoom(e.target.value)} />
        <button onClick={joinRoom}>Join</button> */}
        <h5>Online users:</h5>
        <ul>
          {users.map((user) => (
            <p key={user.id}>{user.username}</p>
          ))}
        </ul>
      </div>
    </div>
  );
};
