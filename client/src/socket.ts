import { io, Socket } from "socket.io-client";
import { wsURL } from "./utils/environment";

const socket: Socket = io(wsURL, {
  transports: ["websocket"],
  autoConnect: false, // manually connect on successful login
});

export default socket;
