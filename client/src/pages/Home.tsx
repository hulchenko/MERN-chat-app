import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/session";

export const Home = () => {
  const [user, setUser] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const { session } = useSession();

  const navigate = useNavigate();

  const joinRoom = () => {
    if (room && user) {
      navigate({
        pathname: `/${room}`,
        search: `?user=${user}`,
      });
      setUser("");
      setRoom("");
    }
  };

  useEffect(() => {
    if (session) {
      setUser(session.name);
    }
  }, [session]);

  return (
    <div>
      <div>
        <h3>Hi, {user}</h3>
        <input type="text" placeholder="Room" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoom(e.target.value)} />
        <button onClick={joinRoom}>Join</button>
      </div>
    </div>
  );
};
