import { useState } from "react";
import { API_URL } from "./api/api";
import useLocalStorage from "./hooks/useLocalStorage"; // Import custom hook

interface LoginProps {
  onLoginSuccess: (username: string) => void;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
  // favorites: Set<string>; // Receive favorites as props
}

export default function Login({ onLoginSuccess, setFavorites, 
  // favorites
 }: LoginProps) {
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
  
      // Retrieve stored favorites after login
      const storedFavorites = localStorage.getItem("favorites");
      const initialFavorites = storedFavorites
        ? new Set<string>(JSON.parse(storedFavorites))
        : new Set<string>();
  
      // Update state and localStorage
      setFavorites(initialFavorites);
      setIsLoggedIn(true);
      setUserName(credentials.name);
      // console.log("Login successful:", credentials.name);
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
        className="flex flex-col gap-8 p-20 justify-between shadow-lg rounded-lg bg-[#510359]/25"
      >
        <h1 className="text-4xl font-bold mb-8 text-white">
          fetch<span className="text-[#ffdf02]">Connects</span>
        </h1>
        <p>Please Login</p>
        <input
          type="text"
          value={credentials.name}
          onChange={(e) =>
            setCredentials({ ...credentials, name: e.target.value })
          }
          placeholder="Name"
          className="border border-[#510359]/25 rounded p-2 text-[#510359]/50 bg-white"
        />
        <input
          type="email"
          value={credentials.email}
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
          placeholder="Email"
          className="border border-[#510359]/25 rounded p-2 mt-2 text-[#510359]/50 bg-white"
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



