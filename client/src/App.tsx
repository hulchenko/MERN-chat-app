import { Outlet } from "react-router-dom";
import socket from "./socket";
import toast, { Toaster } from "react-hot-toast";

export const App = () => {
  socket.on("connect_error", (err) => {
    console.error(err);
    toast.error(err.message); // TODO add throttle to display toast once every 30 seconds
    //TODO call signout method and kick user out
  });

  return (
    <div className="bg-slate-300 h-screen">
      <Toaster />
      <Outlet />
    </div>
  );
};
