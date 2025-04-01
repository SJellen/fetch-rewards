import React, { useState } from "react";
import { API_URL } from "../../api/api";
import useLocalStorage from "../../hooks/useLocalStorage"; // Import custom hook
import Spinner from "../common/Spinner";

interface LoginProps {
  onLoginSuccess: (username: string) => void;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState({ name: "", email: "" });
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage("isLoggedIn", false);
  const [userName, setUserName] = useLocalStorage("userName", "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="text-center text-white max-w-9xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-4">
          We are excited to help you find your perfect dog!
        </h2>
        <p className="text-lg">
          You are already logged in as{" "}
          <span className="font-bold">{userName || "a user"}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 p-8 w-full max-w-md bg-[#510359]/75 shadow-xl border border-[#ffdf02]/25 rounded-xl"
      >
        <h1 className="text-4xl font-bold text-white text-center">
          fetch<span className="text-[#ffdf02]">Connects</span>
        </h1>
        <p className="text-white text-center text-lg">Please Login</p>
        <input
          type="text"
          value={credentials.name}
          onChange={(e) =>
            setCredentials({ ...credentials, name: e.target.value })
          }
          placeholder="Enter your name"
          className="border border-white/20 rounded-lg p-3 text-white bg-white/10 placeholder-white/50 focus:outline-none focus:border-[#ffdf02]"
        />
        <input
          type="email"
          value={credentials.email}
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
          placeholder="Enter your email"
          className="border border-white/20 rounded-lg p-3 text-white bg-white/10 placeholder-white/50 focus:outline-none focus:border-[#ffdf02]"
        />
        {error && <div className="text-red-500 text-center">{error}</div>}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#510359] text-white px-6 py-3 rounded-lg hover:bg-[#510359]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Spinner size="small" color="#ffffff" />
              <span>Logging in...</span>
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}
