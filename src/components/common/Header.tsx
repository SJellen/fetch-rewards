import { HeaderProps } from "../../api/types";
import fetchLogo from "../../assets/fetch.png";

export default function Header({
  isLoggedIn,
  favorites,
  handleFavoritesClick,
  userName,
  handleLogout,
}: HeaderProps) {
  return (
    <header className="w-screen fixed top-0 bg-gradient-to-r from-[#510359] to-violet-950 h-12 flex items-center px-4 justify-between z-4 ">
      <div>
        <img src={fetchLogo} alt="fetchLogo" className="w-10 h-10 sm:hidden" />
        <h2 className="text-white hidden sm:block">
          fetch<span className="text-[#ffdf02]">Connects</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {isLoggedIn && userName && (
          <span className="text-white">
            Welcome, <span className="font-bold">{userName}</span>
          </span>
        )}
        {isLoggedIn && (
          <span
            role="button"
            className={`text-${
              favorites.size > 0 ? "[#ffdf02] hover:cursor-pointer" : "gray-400"
            } hover:text-gray-300`}
            onClick={favorites.size > 0 ? handleFavoritesClick : undefined}
          >
            Favorites ({favorites.size})
          </span>
        )}
        {isLoggedIn && (
          <span
            role="button"
            className="hover:cursor-pointer hover:text-[#ffdf02]"
            onClick={handleLogout}
          >
            Logout
          </span>
        )}
      </div>
    </header>
  );
}
