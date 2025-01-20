import toast, { Toaster } from "react-hot-toast";
import { Outlet, useNavigate } from "react-router-dom";
import { useSession } from "./context/SessionProvider";
import socket from "./socket";
import throttle from "./utils/throttle";
import { useEffect } from "react";

export const App = () => {
  const { session, clearSession } = useSession();
  const navigate = useNavigate();
  const toastError = throttle((message: string) => {
    toast.error(message);
  }, 5000); // 5 sec;

  const signOut = () => {
    clearSession();
    navigate("/login");
  };

  socket.on("connect_error", (err) => {
    signOut();
    console.error(err);
    toastError(err.message);
  });

  useEffect(() => {
    if (session === null) {
      navigate("/login");
    }
  }, [session]);

  return (
    <div className="bg-slate-300 h-screen">
      <Toaster />
      <Outlet />
    </div>
  );
};
