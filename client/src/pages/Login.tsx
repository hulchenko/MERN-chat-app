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
    socket.auth = { test: "hi" };
    socket.connect();
    navigate("/");
  };

  return (
    <form onSubmit={submitHandler} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input type="text" placeholder="username" autoComplete="on" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} />
      <input type="password" placeholder="password" autoComplete="on" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
      <button type="submit">Submit</button>
      {authError && <p style={{ color: "red", fontSize: "small" }}>{authError}</p>}
    </form>
  );
};
