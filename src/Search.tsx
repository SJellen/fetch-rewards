import { useState, useEffect, useCallback } from "react";
import api from "./api/api";
import SearchForm from "./SearchForm";
import SearchResults from "./SearchResults";
import { Dog, SearchResult, SearchParams } from "./api/types";

interface SearchProps {
  isLoggedIn: boolean;
  favorites: Set<string>;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSearchResults: React.Dispatch<React.SetStateAction<SearchResult | null>>;
  searchResults: SearchResult | null;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setSortOrder: React.Dispatch<React.SetStateAction<string>>;
  sortOrder: string;
  setBreedFilter: React.Dispatch<React.SetStateAction<string | null>>;
  breeds: string[];
  setBreeds: React.Dispatch<React.SetStateAction<string[]>>;
  breedFilter: string | null;
  minAge?: number;
  maxAge?: number;
  setMinAge: React.Dispatch<React.SetStateAction<number | undefined>>;
  setMaxAge: React.Dispatch<React.SetStateAction<number | undefined>>;
  showFavorites: boolean;
  setShowFavorites: React.Dispatch<React.SetStateAction<boolean>>;
}

const Search = ({
  isLoggedIn,
  favorites,
  setFavorites,
  setSearchResults,
  searchResults,
  currentPage,
  setCurrentPage,
  sortOrder,
  setSortOrder,
  breeds,
  setBreeds,
  breedFilter,
  setBreedFilter,
  minAge,
  maxAge,
  setMinAge,
  setMaxAge,
  showFavorites,
  setShowFavorites,
}: SearchProps) => {
  const [cards, setCards] = useState<Dog[]>([]);
  const [selectedZipCodes, setSelectedZipCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);

  const fetchCardData = useCallback(async (ids: string[]) => {
    try {
      return await api.getDogs(ids);
    } catch (error) {
      console.error("Failed to fetch card data:", error);
      return [];
    }
  }, []);

  const fetchSearchResults = useCallback(
    async (page: number, ageMin?: number, ageMax?: number, breed?: string | null) => {
      if (loading) return;
      setLoading(true);
  
      try {
        const params: SearchParams = {
          size: 25,
          from: (page - 1) * 25,
          sort: `name:${sortOrder}`,
          ...(breed ? { breeds: [breed] } : {}),
          ...(ageMin !== undefined ? { ageMin } : {}),
          ...(ageMax !== undefined ? { ageMax } : {}),
        };
  
        console.log("Fetching search results with params:", params);
  
        const newResults = await api.searchDogs(params) as SearchResult;
        if (newResults?.resultIds?.length) {
          setSearchResults(newResults);
  
          const cardsData = await fetchCardData(newResults.resultIds) as Dog[];
          setCards(cardsData);
        } else {
          setCards([]);
        }
      } catch (error) {
        console.error("🚨 Error fetching search results:", error);
      } finally {
        setLoading(false);
        setShouldFetch(false);
      }
    },
    [sortOrder, fetchCardData, setSearchResults, loading] 
  );

  // Handle search submission
  const handleSearch = (breed?: string | null, minAge?: number, maxAge?: number) => {
    setCurrentPage(1);
    setShouldFetch(true);
  };

  // Fetch new results when dependencies change
  useEffect(() => {
    if (shouldFetch) {
      fetchSearchResults(currentPage, minAge, maxAge, breedFilter);
    }
  }, [currentPage, sortOrder, selectedZipCodes, breedFilter, minAge, maxAge, fetchSearchResults, shouldFetch]);

  // Fetch initial data when the user logs in
  useEffect(() => {
    if (!isLoggedIn || initialFetchDone) return;

    const fetchInitialData = async () => {
      try {
        setBreeds(await api.getBreeds());
      } catch (error) {
        console.error("Error fetching breeds:", error);
      }
      setInitialFetchDone(true);
    };

    fetchInitialData();
  }, [isLoggedIn, setBreeds, initialFetchDone]);

  // Update favorite status when favorites change
  useEffect(() => {
    setCards((prevCards) =>
      prevCards.map((card) => ({
        ...card,
        isFavorite: favorites.has(card.id),
      }))
    );
  }, [favorites]);

  // Toggle sorting order
  const handleSortToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setCurrentPage(1);
    setShouldFetch(true);
  };

  return (
    <div className="p-8 h-screen pb-24 w-full max-w-9xl mx-auto px-10">
      <SearchForm
        breeds={breeds}
        breedFilter={breedFilter}
        setBreedFilter={setBreedFilter}
        handleSearch={() => handleSearch(breedFilter, minAge, maxAge)}
        selectedLocations={selectedZipCodes}
        setSelectedLocations={setSelectedZipCodes}
        cards={cards}
        setFilteredCards={() => {}}
        minAge={minAge ?? 0}
        maxAge={maxAge ?? undefined}
        setMinAge={setMinAge}
        setMaxAge={setMaxAge}
      />

      <div className="h-screen flex flex-col">
        <SearchResults
          cards={cards}
          favorites={favorites}
          setFavorites={setFavorites}
          searchResults={searchResults}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sortOrder={sortOrder}
          handleSortToggle={handleSortToggle}
          showFavorites={showFavorites}
          setShowFavorites={setShowFavorites}
          setShouldFetch={setShouldFetch}
        />
      </div>
    </div>
  );
};

export default Search;



