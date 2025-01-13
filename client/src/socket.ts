import { io, Socket } from "socket.io-client";

const isDev = true;
const WS_URL = isDev ? import.meta.env.VITE_WS_URL_DEV : import.meta.env.VITE_WS_URL;
const socket: Socket = io(WS_URL, {
  transports: ["websocket"],
  autoConnect: false, // manually connect on successful login
});

export default socket;
