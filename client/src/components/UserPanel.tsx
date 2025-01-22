import { useCallback, useEffect } from "react";
import { useConversation } from "../context/ConversationProvider";
import { useSelectedChannel } from "../context/SelectedChannelProvider";
import { UserPanelProps } from "../interface/Props";
import { User } from "../interface/User";
import { Loader } from "./Loader";

export const UserPanel = ({ users, setUsers, session, socket }: UserPanelProps) => {
  const { lastMessage } = useConversation();
  const { selectedUser, setSelectedUser } = useSelectedChannel();

  const newUserHandler = useCallback(
    (user: User) => {
      // any user connected after host is connected
      if (!session?.username || !user.userID) return;

      const self = user.username === session?.username; // support multiple active tabs for the same user
      if (self) return;

      setUsers((prev) => {
        const usersArr = [...prev];
        const userIdx = usersArr.findIndex((u) => u.userID === user.userID);
        if (userIdx !== -1) {
          usersArr[userIdx].connected = true;
          return usersArr.sort((user) => (user.connected ? -1 : 1));
        } else {
          return [...usersArr, user].sort((user) => (user.connected ? -1 : 1));
        }
      });
    },
    [session, users]
  );

  const userDisconnectHandler = useCallback((userID: string) => {
    setUsers((prev) => {
      const usersArr = [...prev];
      const userIdx = usersArr.findIndex((user) => user.userID === userID);
      if (userIdx !== -1) {
        usersArr[userIdx].connected = false;
      }
      return usersArr.sort((user) => (user.connected ? -1 : 1));
    });
  }, []);

  const displayNotification = useCallback((sender: string): void => {
    setUsers((prev) => {
      const usersArr = [...prev];
      const userIdx = usersArr.findIndex((user) => user.username === sender);
      if (userIdx !== -1) {
        usersArr[userIdx].newMessage = true;
      }
      return usersArr;
    });
  }, []);

  const removeNotification = useCallback((targetUser: User): void => {
    setUsers((prev) => {
      const usersArr = [...prev];
      const userIdx = usersArr.findIndex((user) => user.username === targetUser.username);
      if (userIdx !== -1) {
        usersArr[userIdx].newMessage = false;
      }
      return usersArr;
    });
  }, []);

  useEffect(() => {
    // display notification icon for new messages
    const sender = lastMessage.from;
    const targetUser = selectedUser?.username;
    const isForHost = lastMessage.to === session?.username;
    if (sender !== targetUser && isForHost) {
      displayNotification(sender);
    }
  }, [lastMessage, session]);

  useEffect(() => {
    socket.on("new_connection", (user: User) => newUserHandler(user));
    socket.on("user_disconnect", (userID: string) => userDisconnectHandler(userID));

    return () => {
      socket.off("new_connection");
      socket.off("user_disconnect");
    };
  }, [newUserHandler, userDisconnectHandler]);

  return (
    <div className="border border-sky-300 rounded-xl p-2 bg-sky-100 divide-y divide-sky-300">
      <h1 className="text-center text-sky-500">Users</h1>
      <div className="p-4 flex-grow flex flex-col overflow-auto h-96">
        {!users && <Loader />}
        {users?.length === 0 && <p className="italic text-gray-400">No users online</p>}
        {users?.map((user) => (
          <p
            key={user.userID}
            onClick={() => {
              setSelectedUser(user);
              removeNotification(user);
            }}
            className={`relative py-2 px-6 my-1 border border-sky-300 rounded cursor-pointer hover:bg-sky-200 flex items-center  ${
              selectedUser?.username === user.username ? "bg-sky-300 text-white" : ""
            }`}
          >
            <span className="w-full text-wrap overflow-ellipsis overflow-hidden">{user.username}</span>
            {user.connected ? <span className="text-green-600">online</span> : <span className="text-red-400">offline</span>}
            {user.newMessage && (
              <span className="absolute right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
            )}
          </p>
        ))}
      </div>
    </div>
  );
};
