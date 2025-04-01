import { useState, useEffect } from "react";
import Login from "./components/auth/Login";
import "./App.css";
import Search from "./components/search/Search";
import Header from "./components/common/Header";
import useFavorites from "./hooks/useFavorites";
import { SearchResult } from "./api/types";
import logo from "../src/assets/fetch.png";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const { favorites, setFavorites } = useFavorites();

  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc");
  const [breeds, setBreeds] = useState<string[]>([]);
  const [breedFilter, setBreedFilter] = useState<string | null>(null);
  const [minAge, setMinAge] = useState<number | undefined>(undefined);
  const [maxAge, setMaxAge] = useState<number | undefined>(undefined);

  useEffect(() => {
    const storedLoginState = localStorage.getItem("isLoggedIn") === "true";
    const storedUserName = localStorage.getItem("userName") || "";

    setIsLoggedIn(storedLoginState);
    setUserName(() => storedUserName);
  }, [setUserName]);

  const handleLoginSuccess = (username: string) => {
    setIsLoggedIn(true);
    setUserName(username);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");

    if (searchResults !== null) {
      setSearchResults(null);
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 18) return "Good afternoon!";
    return "Good evening!";
  };

  const handleFavoritesClick = () => {
    setShowFavorites(!showFavorites);
  };

  return (
    <div
      className={`flex flex-col justify-center items-center w-screen max-w-9xl overflow-y-auto ${
        isLoggedIn ? "bg-slate-900" : "bg-slate-950"
      } `}
    >
      <Header
        isLoggedIn={isLoggedIn}
        favorites={favorites}
        setSearchResults={setSearchResults}
        handleFavoritesClick={handleFavoritesClick}
        userName={userName}
        handleLogout={handleLogout}
      />

      <div className="h-[calc(100vh-3rem)]">
        {isLoggedIn ? (
          <Search
            isLoggedIn={isLoggedIn}
            favorites={favorites}
            setFavorites={setFavorites}
            setSearchResults={setSearchResults}
            searchResults={searchResults}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setSortOrder={setSortOrder}
            sortOrder={sortOrder}
            breeds={breeds}
            setBreeds={setBreeds}
            breedFilter={breedFilter}
            setBreedFilter={setBreedFilter}
            minAge={minAge ?? 1}
            maxAge={maxAge ?? 99}
            setMinAge={setMinAge}
            setMaxAge={setMaxAge}
            showFavorites={showFavorites}
            setShowFavorites={setShowFavorites}
          />
        ) : (
          <div className="mx-auto p-8 text-center h-full flex flex-col items-center justify-start pt-20">
            <div className="flex flex-col items-center p-6">
              <img src={logo} alt="logo" className="w-10 h-10" />
              <h1 className="text-2xl font-bold">{getGreeting()}</h1>
              <p className="text-lg mt-2 leading-relaxed">
                We are excited to help you find your perfect dog!
              </p>
            </div>
            <Login
              onLoginSuccess={handleLoginSuccess}
              setFavorites={setFavorites}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
