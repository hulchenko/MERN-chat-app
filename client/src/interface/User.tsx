import { Message } from "./Message";

export interface User {
  userID: string;
  username: string;
  messages: Message[];
  newMessage?: boolean;
  rooms: string[];
  roomMessages: Message[];
}
