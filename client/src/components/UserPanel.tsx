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
          return usersArr;
        } else {
          return [...usersArr, user];
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
      return usersArr;
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
      <h1>Online users</h1>
      <div className="p-4 bg-slate-200 rounded">
        {users.length === 0 && <p className="italic text-gray-400">No users online</p>}
        {users.map((user) => (
          <p
            key={user.userID}
            onClick={() => {
              setSelectedUser(user);
              removeNotification(user);
            }}
            className={`p-2 my-2 border border-slate-700 rounded cursor-pointer hover:bg-slate-300 ${
              selectedUser?.username === user.username ? "bg-slate-700 text-white" : ""
            }`}
          >
            {user.username}
            {user.connected ? <span className="text-green-600 ml-4">Online</span> : <span className="text-red-400 ml-4">Offline</span>}
            {user.newMessage && <span className="text-red-500 font-bold border border-red-300 ml-4">message</span>}
          </p>
        ))}
      </div>
    </div>
  );
};
