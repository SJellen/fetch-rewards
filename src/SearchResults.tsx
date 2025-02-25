// SearchResults.tsx
import React from "react";
import Cards from "./Cards";

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
}) => {
  console.log(currentPage);
  return (
    <div className="h-screen flex flex-col mt-12">
      {/*Add a No results message */}
      {cards.length === 0 && (
        <p className="text-black mt-24">
          No dogs found. Try adjusting your search criteria.
        </p>
      )}
      <Cards cards={cards} favorites={favorites} setFavorites={setFavorites} />
      {searchResults && (
        <div className="bg-black p-4 flex justify-between fixed bottom-0 w-full left-1/2 transform -translate-x-1/2">
          <div>
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() =>
                setCurrentPage((page) =>
                  searchResults && page * 25 < searchResults.total
                    ? page + 1
                    : page
                )
              }
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
