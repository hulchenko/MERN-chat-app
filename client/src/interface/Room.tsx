import { Message } from "./Message";

export interface Room {
  name: string;
  messages: Message[];
}
