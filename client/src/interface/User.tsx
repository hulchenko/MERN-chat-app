import { Message } from "./Message";

export interface User {
  userID: string;
  username: string;
  messages: Message[];
  rooms: string[];
  roomMessages: Message[];
  connected: boolean;
  newMessage?: boolean;
}
