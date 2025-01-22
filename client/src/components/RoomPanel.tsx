import { useCallback, useEffect, useState } from "react";
import { useSelectedChannel } from "../context/SelectedChannelProvider";
import { RoomPanelProps } from "../interface/Props";
import { Room } from "../interface/Room";
import { removeSpaces } from "../utils/format";
import { Loader } from "./Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";

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
    <div className="border border-sky-300 rounded-xl p-2 bg-sky-100 divide-y divide-sky-300 h-80 flex flex-col">
      <h1 className="text-center text-sky-500">Chat Rooms</h1>
      <div className="p-4 rounded overflow-auto flex-grow">
        {!roomList && <Loader />}
        {roomList?.length === 0 && <p className="italic text-gray-400">Nothing here yet</p>}
        {roomList?.map((room, idx) => (
          <p
            key={idx}
            className={`relative flex py-2 px-4 my-1 items-center border border-sky-300 rounded hover:bg-sky-200  ${
              selectedRoom?.name === room.name ? "bg-sky-300 text-white" : ""
            } ${userRooms.includes(room.name) ? "border border-green-600 cursor-pointer" : "border border-sky-300 cursor-not-allowed"}`}
            onClick={() => clickRoom(room)}
          >
            <span className="w-full text-wrap overflow-ellipsis overflow-hidden">{room.name}</span>
            <span className="absolute right-2 flex">
              {!userRooms.includes(room.name) ? (
                <FontAwesomeIcon title="join" className="cursor-pointer text-green-600 hover:scale-150 p-2" onClick={() => joinRoom(room)} icon={faPlus} />
              ) : (
                <FontAwesomeIcon title="leave" className="cursor-pointer  text-red-400 hover:scale-150 p-2" onClick={() => leaveRoom(room)} icon={faXmark} />
              )}
            </span>
          </p>
        ))}
      </div>
      <div className="w-full flex px-4 py-2">
        <input
          className="w-full border border-sky-400 bg-stone-50 p-2 rounded-md focus-visible:outline-sky-500"
          type="text"
          placeholder="Room name"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomName(e.target.value)}
        />
        <button className="border border-sky-400 rounded-md p-2 mx-1 hover:bg-sky-200" onClick={() => createRoom(roomName)}>
          Create
        </button>
      </div>
    </div>
  );
};
