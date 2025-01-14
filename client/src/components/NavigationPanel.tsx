import { useState } from "react";
import { User } from "../interface/User";
import { useNavigate } from "react-router-dom";

const sampleRooms = ["room1", "room2", "room3", "room4"];

export const NavigationPanel = ({ users, username }: { users: User[]; username: string }) => {
  const [room, setRoom] = useState<string>("");

  const navigate = useNavigate();

  const joinRoom = () => {
    if (room && username) {
      navigate(`/${room}`);
    }
  };

  const createRoom = () => {
    // TODO Mongo POST
  };

  return (
    <div className="border border-green-600 flex flex-col w-1/6 p-4 h-screen">
      <h3 className="my-10 text-3xl capitalize">Hi, {username}</h3>
      <div className="flex flex-col h-full justify-between">
        <div>
          <h1>Online users</h1>
          <div className="p-4 bg-slate-200 rounded">
            {users.map((user) => (
              <p className="p-2 my-2 border border-slate-700 rounded">{user.username}</p>
            ))}
          </div>
        </div>
        <div>
          <h1>Rooms</h1>
          <div className="p-4 bg-slate-200 rounded">
            {sampleRooms.map((room) => (
              <p className="p-2 my-2 border border-slate-700 rounded">{room}</p>
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
