import { useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import SearchForm from "./SearchForm";
import SearchResults from "./SearchResults";
import LocationFilter from "./LocationFilter";
import {
  Dog,
  SearchResult,
  SearchParams,
  LocationSearchParams,
} from "../../api/types";

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

export default function Search({
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
}: SearchProps) {
  const [cards, setCards] = useState<Dog[]>([]);
  const [selectedZipCodes, setSelectedZipCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  // const [locationParams, setLocationParams] = useState<LocationSearchParams | null>(null);

  const fetchCardData = useCallback(async (ids: string[]) => {
    try {
      return await api.getDogs(ids);
    } catch (error) {
      console.error("Failed to fetch card data:", error);
      return [];
    }
  }, []);

  const fetchSearchResults = useCallback(
    async (
      page: number,
      ageMin?: number,
      ageMax?: number,
      breed?: string | null
    ) => {
      if (loading) return;
      setLoading(true);

      try {
        const params: SearchParams = {
          size: 25,
          from: (page - 1) * 25,
          sort: sortOrder,
          ...(breed ? { breeds: [breed] } : {}),
          ...(ageMin !== undefined ? { ageMin } : {}),
          ...(ageMax !== undefined ? { ageMax } : {}),
          ...(selectedZipCodes.length > 0
            ? { zipCodes: selectedZipCodes }
            : {}),
        };

        const newResults = (await api.searchDogs(params)) as SearchResult;
        if (newResults?.resultIds?.length) {
          setSearchResults(newResults);

          const cardsData = (await fetchCardData(
            newResults.resultIds
          )) as Dog[];
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
    [sortOrder, fetchCardData, setSearchResults, loading, selectedZipCodes]
  );

  const handleLocationFilter = async (params: LocationSearchParams) => {
    try {
      const locationResults = await api.searchLocations(params);
      const zipCodes = locationResults.results.map((loc) => loc.zip_code);
      setSelectedZipCodes(zipCodes);
      setCurrentPage(1);
      setShouldFetch(true);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  // Handle search submission
  const handleSearch = () =>
    // breed?: string | null, minAge?: number, maxAge?: number
    {
      window.scrollTo(0, 0);
      setCurrentPage(1);
      setShouldFetch(true);
    };

  // Fetch new results when dependencies change
  useEffect(() => {
    if (shouldFetch) {
      fetchSearchResults(currentPage, minAge, maxAge, breedFilter);
    }
  }, [
    currentPage,
    sortOrder,
    selectedZipCodes,
    breedFilter,
    minAge,
    maxAge,
    fetchSearchResults,
    shouldFetch,
  ]);

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
    <div className="px-4 h-screen  w-screen mx-auto ">
      <SearchForm
        breeds={breeds}
        breedFilter={breedFilter}
        setBreedFilter={setBreedFilter}
        handleSearch={
          () => handleSearch()
          // breedFilter, minAge, maxAge
        }
        cards={cards}
        minAge={minAge ?? 0}
        maxAge={maxAge ?? undefined}
        setMinAge={setMinAge}
        setMaxAge={setMaxAge}
        onLocationFilter={handleLocationFilter}
      />

      <div className="h-screen flex flex-col ">
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
}
