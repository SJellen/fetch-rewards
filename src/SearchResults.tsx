// SearchResults.tsx
import React from "react";
import Cards from "./Cards";
import Favorites from "./Favorites";
interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  breed: string;
  zip_code: string;
  location: string;
  isFavorite?: boolean;
}

interface SearchResultsProps {
  cards: Dog[];
  favorites: Set<string>;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
  searchResults: { total: number } | null;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  sortOrder: string;
  handleSortToggle: () => void;
  showFavorites: boolean;
  setShowFavorites: React.Dispatch<React.SetStateAction<boolean>>;
  setShouldFetch: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  cards,
  favorites,
  setFavorites,
  searchResults,
  currentPage,
  setCurrentPage,
  sortOrder,
  handleSortToggle,
  showFavorites,
  setShowFavorites,
  setShouldFetch,
}) => {
  return (
    <div className="h-screen flex flex-col mt-12">
      {!showFavorites && (
        <>
          {cards.length === 0 && (
            <p className="text-black mt-24">
              {searchResults === null 
                ? "Welcome! Please select a breed to start your search."
                : "No dogs found. Try adjusting your search criteria."
              }
            </p>
          )}
          <Cards cards={cards} favorites={favorites} setFavorites={setFavorites} />
        </>
      )}
      {showFavorites && (
        <Favorites 
          onClose={() => setShowFavorites(false)} 
          favorites={favorites}
          setFavorites={setFavorites}
        />
      )}
      {searchResults && !showFavorites && (
        <div className="bg-black p-4 flex justify-between fixed bottom-0 w-full left-1/2 transform -translate-x-1/2">
          <div>
            <button
              onClick={() => {
                setCurrentPage((page) => Math.max(1, page - 1));
                setShouldFetch(true);
              }}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() => {
                setCurrentPage((page) =>
                  searchResults && page * 25 < searchResults.total
                    ? page + 1
                    : page
                );
                setShouldFetch(true);
              }}
            >
              Next
            </button>
          </div>

          <button onClick={handleSortToggle}>
            {sortOrder === "asc" ? "Descending" : "Ascending"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
