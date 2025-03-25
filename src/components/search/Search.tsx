import { useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import SearchForm from "./SearchForm";
import SearchResults from "./SearchResults";
import Spinner from "../common/Spinner";
import { Dog, SearchParams, SearchResult } from "../../api/types";

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
  const [loading, setLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [currentZipCodes, setCurrentZipCodes] = useState<string[]>([]);

  const fetchCardData = useCallback(async (ids: string[]) => {
    try {
      return await api.getDogs(ids);
    } catch (error) {
      console.error("Failed to fetch card data:", error);
      return [];
    }
  }, []);

  const fetchSearchResults = useCallback(
    async (searchParams: {
      currentPage: number;
      ageMin?: number;
      ageMax?: number;
      breeds?: string[];
      zipCodes?: string[];
    }) => {
      if (loading) return;
      setLoading(true);

      try {
        const params: SearchParams = {
          size: 25,
          from: (searchParams.currentPage - 1) * 25,
          sort: sortOrder,
          ...(searchParams.breeds?.length
            ? { breeds: searchParams.breeds }
            : {}),
          ...(searchParams.ageMin !== undefined
            ? { ageMin: searchParams.ageMin }
            : {}),
          ...(searchParams.ageMax !== undefined
            ? { ageMax: searchParams.ageMax }
            : {}),
          ...(searchParams.zipCodes?.length
            ? { zipCodes: searchParams.zipCodes }
            : {}),
        };

        console.log("Searching with params:", params);
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
    [sortOrder, fetchCardData, setSearchResults, loading]
  );

  // Fetch new results when dependencies change
  useEffect(() => {
    if (shouldFetch) {
      fetchSearchResults({
        currentPage,
        ageMin: minAge,
        ageMax: maxAge,
        breeds: breedFilter ? [breedFilter] : undefined,
        zipCodes: currentZipCodes.length > 0 ? currentZipCodes : undefined,
      });
    }
  }, [
    currentPage,
    sortOrder,
    breedFilter,
    minAge,
    maxAge,
    fetchSearchResults,
    shouldFetch,
    currentZipCodes,
  ]);

  const handleSearch = useCallback(
    async (params: SearchParams) => {
      window.scrollTo(0, 0);
      setCurrentPage(1);
      setLoading(true);

      try {
        const searchParams: SearchParams = {
          ...params,
          size: 25,
          from: 0,
          sort: sortOrder,
        };

        // Update current ZIP codes if they're provided in the search
        if (params.zipCodes?.length) {
          setCurrentZipCodes(params.zipCodes);
          console.log(
            "Updated ZIP codes for future searches:",
            params.zipCodes
          );
        }

        const newResults = (await api.searchDogs(searchParams)) as SearchResult;

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
        console.error("Error searching:", error);
      } finally {
        setLoading(false);
      }
    },
    [fetchCardData, setSearchResults, sortOrder, setCurrentPage]
  );

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
    <div className="px-4 h-screen w-screen mx-auto">
      <SearchForm
        breeds={breeds}
        breedFilter={breedFilter}
        setBreedFilter={setBreedFilter}
        handleSearch={handleSearch}
        cards={cards}
        minAge={minAge ?? 0}
        maxAge={maxAge ?? undefined}
        setMinAge={setMinAge}
        setMaxAge={setMaxAge}
      />

      <div className="h-screen flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="large" />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
