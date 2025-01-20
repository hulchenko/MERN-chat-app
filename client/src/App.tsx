import toast, { Toaster } from "react-hot-toast";
import { Outlet, useNavigate } from "react-router-dom";
import { useSession } from "./context/SessionProvider";
import socket from "./socket";
import throttle from "./utils/throttle";
import { useCallback, useEffect } from "react";

export const App = () => {
  const { session, clearSession } = useSession();
  const navigate = useNavigate();

  const toastError = useCallback(
    throttle((message: string) => {
      toast.error(message);
    }, 5000), // 5 sec;
    []
  );

  const signOut = useCallback(() => {
    clearSession();
    navigate("/login");
  }, [clearSession]);

  useEffect(() => {
    socket.on("connect_error", (err) => {
      signOut();
      console.error(err);
      toastError(err.message);
    });
    socket.on("auth_error", (err) => {
      signOut();
      console.error(err);
      toastError(err.message);
    });

    return () => {
      socket.off("connect_error");
    };
  }, []);

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
