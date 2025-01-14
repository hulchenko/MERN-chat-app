import { useState } from "react";
import { useSession } from "../context/SessionProvider";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

interface Response {
  error: boolean;
  username?: string;
  message?: string;
}

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const { setSession } = useSession();
  const navigate = useNavigate();

  const authenticate = async (): Promise<Response> => {
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      const data = await response.json();
      return data;
    } catch (error: Response | any) {
      console.error(error.message);
      return error;
    }
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error, message = "", username = "" } = await authenticate();
    if (error) {
      return setAuthError(message);
    }
    setSession({ username });
    socket.auth = { username };
    socket.connect();
    navigate("/");
  };

  return (
    <div className="w-56 flex flex-col rounded gap-2 m-auto h-3/4 justify-center ">
      <div className="border border-slate-700 p-4 flex flex-col items-center rounded">
        <h3 className="text-xl mb-4">Join Chat</h3>
        <form onSubmit={submitHandler} className="flex flex-col w-full gap-2">
          <input
            className="p-1 rounded"
            type="text"
            placeholder="username"
            autoComplete="on"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          />
          <input
            className="p-1 rounded"
            type="password"
            placeholder="password"
            autoComplete="on"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          <button type="submit" className="border w-20 rounded m-auto">
            Enter
          </button>
          {authError && <p style={{ color: "red", fontSize: "small" }}>{authError}</p>}
        </form>
      </div>
    </div>
  );
};
