import React, { useState } from "react";
import { API_URL } from "../../api/api";
import useLocalStorage from "../../hooks/useLocalStorage"; // Import custom hook

interface LoginProps {
  onLoginSuccess: (username: string) => void;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export default function Login({ onLoginSuccess, setFavorites }: LoginProps) {
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState({ name: "", email: "" });
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage("isLoggedIn", false);
  const [userName, setUserName] = useLocalStorage("userName", "");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      const response: Response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText: string = await response.text();
        throw new Error(errorText);
      }

      // Update state and localStorage
      setIsLoggedIn(true);
      setUserName(credentials.name);
      onLoginSuccess(credentials.name);
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login failed. Please try again.");
    }
  };

  if (isLoggedIn) {
    return (
      <div className="text-center">
        <h2>We are excited to help you find your perfect dog!</h2>
        <p>You are already logged in as {userName || "a user"}.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col text-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 p-20 justify-between shadow-lg rounded-lg bg-slate-800"
      >
        <h1 className="text-4xl font-bold mb-8 text-white">
          fetch<span className="text-[#ffdf02]">Connects</span>
        </h1>
        <p className="text-white">Please Login</p>
        <input
          type="text"
          value={credentials.name}
          onChange={(e) =>
            setCredentials({ ...credentials, name: e.target.value })
          }
          placeholder="Name"
          className="border border-slate-800 rounded p-2 text-white bg-slate-900"
        />
        <input
          type="email"
          value={credentials.email}
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
          placeholder="Email"
          className="border border-slate-800 rounded p-2 mt-2 text-white bg-slate-900"
        />
        {error && (
          <div className="text-red-500 mt-2" style={{ color: "red" }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Login
        </button>
      </form>
    </div>
  );
}
