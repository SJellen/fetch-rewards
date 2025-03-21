import { HeaderProps } from "./api/types";

export default function Header({
  isLoggedIn,
  favorites,
  handleFavoritesClick,
  userName,
  handleLogout,
}: HeaderProps) {
  return (
    <header className="w-screen fixed top-0 bg-gradient-to-r from-[#510359] to-violet-950 h-12 flex items-center px-4 justify-between z-4 max-w-9xl">
      <div className="xl:ml-4">
        <h2 className="text-white">
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
            className={`hover:cursor-pointer hover:text-gray-300 ${
              favorites.size > 0 ? "text-[#ffdf02]" : "text-gray-400"
            }`}
            onClick={handleFavoritesClick}
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
