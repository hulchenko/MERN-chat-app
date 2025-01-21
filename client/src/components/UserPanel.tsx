import { useCallback, useEffect } from "react";
import { useConversation } from "../context/ConversationProvider";
import { useSelectedChannel } from "../context/SelectedChannelProvider";
import { UserPanelProps } from "../interface/Props";
import { User } from "../interface/User";

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
    <div>
      <h1>Private Chats</h1>
      <div className="p-4 bg-slate-200 rounded">
        {users.length === 0 && <p className="italic text-gray-400">No users online</p>}
        {users.map((user) => (
          <p
            key={user.userID}
            onClick={() => {
              setSelectedUser(user);
              removeNotification(user);
            }}
            className={`relative p-2 my-2 border border-slate-700 rounded cursor-pointer hover:bg-slate-300 ${
              selectedUser?.username === user.username ? "bg-slate-700 text-white" : ""
            }`}
          >
            {user.username}
            {user.connected ? <span className="text-green-600 ml-4">Online</span> : <span className="text-red-400 ml-4">Offline</span>}
            {user.newMessage && (
              <span className="absolute top-0 right-0 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500"></span>
              </span>
            )}
          </p>
        ))}
      </div>
    </div>
  );
};
