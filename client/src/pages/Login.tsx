import { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import { AuthResponse } from "../interface/Response";
import { removeSpaces } from "../utils/format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();

  const authenticate = async (): Promise<AuthResponse> => {
    try {
      const credentials = {
        username: removeSpaces(username),
        password,
      };
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
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

  const submitHandler = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const { error, message, token } = await authenticate();
    if (error) {
      return setAuthError(message);
    }

    socket.auth = { token };
    socket.connect();
    navigate("/");
  };

  return (
    <div className="w-56 flex flex-col rounded gap-2 m-auto pt-96 justify-center ">
      <div className="border border-sky-300 p-4 flex flex-col items-center rounded">
        <FontAwesomeIcon icon={faComments} className="text-sky-500 text-3xl m-1" />
        <h3 className="text-xl mb-4 font-bold text-sky-500">Join Chat</h3>
        <form onSubmit={submitHandler} className="flex flex-col w-full gap-2">
          <h3>Username</h3>
          <input
            className="p-1 rounded"
            type="text"
            placeholder="Your username..."
            autoComplete="on"
            minLength={4}
            maxLength={20}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          />
          <h3>Password</h3>
          <input
            className="p-1 rounded"
            type="password"
            placeholder="Your password..."
            autoComplete="on"
            minLength={4}
            maxLength={20}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          <button type="submit" className="border border-sky-300 p-2 mt-2 w-20 rounded m-auto hover:bg-sky-200">
            Enter
          </button>
          {authError && <p style={{ color: "red", fontSize: "small" }}>{authError}</p>}
        </form>
      </div>
    </div>
  );
};
