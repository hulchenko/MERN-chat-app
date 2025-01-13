import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionProvider";

export const Home = () => {
  const [username, setUsername] = useState<string>("");
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

  return (
    <div>
      <button onClick={() => navigate("/login")}>Login</button>
      <div>
        <h3>Hi, {username}</h3>
        <input type="text" placeholder="Room" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoom(e.target.value)} />
        <button onClick={joinRoom}>Join</button>
      </div>
    </div>
  );
};
