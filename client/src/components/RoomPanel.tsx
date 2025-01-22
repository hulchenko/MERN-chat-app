import { useCallback, useEffect, useState } from "react";
import { useSelectedChannel } from "../context/SelectedChannelProvider";
import { RoomPanelProps } from "../interface/Props";
import { Room } from "../interface/Room";
import { removeSpaces } from "../utils/format";
import { Loader } from "./Loader";

export const RoomPanel = ({ userRooms, setUserRooms, socket }: RoomPanelProps) => {
  const [roomList, setRoomList] = useState<Room[] | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const { selectedRoom, setSelectedRoom } = useSelectedChannel();

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

  const createRoom = useCallback(async (name: string): Promise<void> => {
    try {
      const roomName = {
        name: removeSpaces(name),
      };
      const response = await fetch("/api/room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomName),
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      const { data } = await response.json();
      setRoomList((prev) => [...(prev || []), data]);
    } catch (error: Response | any) {
      console.error(error.message);
      return error;
    }
  }, []);

  useEffect(() => {
    const getRooms = async (): Promise<void> => {
      try {
        const response = await fetch("/api/room");
        if (!response.ok) {
          const error = await response.json();
          throw error;
        }
        const { data } = await response.json();
        setRoomList(data);
      } catch (error: Response | any) {
        console.error(error.message);
        return error;
      }
    };

    getRooms();
  }, []);

  return (
    <div>
      <h1>Group Chats</h1>
      <div className="p-4 bg-slate-200 rounded overflow-auto h-96">
        {!roomList && <Loader />}
        {roomList?.length === 0 && <p className="italic text-gray-400">Nothing here yet</p>}
        {roomList?.map((room, idx) => (
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
      <input type="text" placeholder="Room name..." onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomName(e.target.value)} />
      <button className="border border-slate-400 p-2" onClick={() => createRoom(roomName)}>
        Create
      </button>
    </div>
  );
};
