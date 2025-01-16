export interface User {
  userID: string;
  username: string;
  connected: boolean; // TODO review, maybe not needed
  newMessage?: boolean;
}
