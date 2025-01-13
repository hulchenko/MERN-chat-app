import "./App.css";
import { Outlet } from "react-router-dom";
import socket from "./socket";
import toast, { Toaster } from "react-hot-toast";

export const App = () => {
  socket.on("connect_error", (err) => {
    console.error(err);
    toast.error("Websocket disconnected."); // TODO add throttle to display toast once every 30 seconds
  });

  return (
    <>
      <Toaster />
      <Outlet />
    </>
  );
};
