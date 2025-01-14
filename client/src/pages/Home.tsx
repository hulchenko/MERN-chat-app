import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionProvider";
import socket from "../socket";
import { User } from "../interface/User";
import { NavigationPanel } from "../components/NavigationPanel";

export const Home = () => {
  const { session } = useSession();
  const [username, setUsername] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);

  const navigate = useNavigate();

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
      <button className="absolute top-10 right-10 border border-red-400 p-6" onClick={() => navigate("/login")}>
        Login
      </button>
      <NavigationPanel users={users} username={username} />
    </div>
  );
};
