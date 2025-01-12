import { useState } from "react";
import { useSession } from "../context/session";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setSession } = useSession();
  const navigate = useNavigate();

  const userLogin = async (): Promise<void> => {
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw error.message;
      }
      const { data } = await response.json();
      setSession(data);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    userLogin();
  };

  return (
    <form onSubmit={submitHandler} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input type="email" placeholder="email" autoComplete="on" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
      <input type="password" placeholder="password" autoComplete="on" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
};
