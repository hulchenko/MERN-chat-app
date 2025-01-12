import { io, Socket } from "socket.io-client";

const isDev = true;
const WS_URL = isDev ? import.meta.env.VITE_WS_URL_DEV : import.meta.env.VITE_WS_URL;
export const socket: Socket = io(WS_URL, {
  transports: ["websocket"],
  //   autoConnect: false, // TODO disable this until user is authenticated
});
