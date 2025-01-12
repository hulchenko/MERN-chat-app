import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

export const Home = () => {
  const [user, setUser] = useState<string>("");
  const [room, setRoom] = useState<string>("");
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

  return (
    <div>
      <div>
        <input type="text" placeholder="Name" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser(e.target.value)} />
        <input type="text" placeholder="Room" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoom(e.target.value)} />
        <button onClick={joinRoom}>Join</button>
      </div>
    </div>
  );
};
