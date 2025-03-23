import React, {
  ChangeEvent,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Dog, LocationSearchParams } from "./api/types";
import LocationFilter from "./components/LocationFilter";

interface SearchFormProps {
  breeds: string[];
  breedFilter: string | null;
  setBreedFilter: (breed: string | null) => void;
  handleSearch: (minAge?: number, maxAge?: number, breeds?: string) => void;
  cards: Dog[];
  setFilteredCards: React.Dispatch<React.SetStateAction<Dog[]>>;
  minAge?: number;
  maxAge?: number;
  setMinAge: React.Dispatch<React.SetStateAction<number | undefined>>;
  setMaxAge: React.Dispatch<React.SetStateAction<number | undefined>>;
  onLocationFilter: (params: LocationSearchParams) => void;
}

export default function SearchForm({
  breeds,
  breedFilter,
  setBreedFilter,
  handleSearch,
  cards,
  minAge,
  maxAge,
  setMinAge,
  setMaxAge,
  onLocationFilter,
}: SearchFormProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localMinAge, setLocalMinAge] = useState<number | undefined>(minAge);
  const [localMaxAge, setLocalMaxAge] = useState<number | undefined>(maxAge);

  const initialFiltersRef = useRef<{ minAge?: number; maxAge?: number } | null>(
    null
  );

  useEffect(() => {
    if (cards.length > 0) {
      const ages = cards.map((dog) => dog.age);
      const minAgeVal = Math.min(...ages);
      const maxAgeVal = Math.max(...ages);

      if (!initialFiltersRef.current) {
        initialFiltersRef.current = { minAge: minAgeVal, maxAge: maxAgeVal };
      }

      setMinAge((prev) => (prev !== undefined ? prev : minAgeVal));
      setMaxAge((prev) => (prev !== undefined ? prev : maxAgeVal));
    }
  }, [cards, setMinAge, setMaxAge]);

  const handleBreedChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedBreed = e.target.value || null;
    setBreedFilter(selectedBreed);
    handleSearch(undefined, undefined, selectedBreed ?? undefined);
  };

  const applyFilters = () => {
    setMinAge(localMinAge);
    setMaxAge(localMaxAge);
    handleSearch(localMinAge, localMaxAge, breedFilter ?? undefined);
    setShowFilters(false);
  };

  const handleSearchClick = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSearch(minAge ?? 1, maxAge ?? 20, breedFilter ?? undefined);
    },
    [handleSearch, minAge, maxAge, breedFilter]
  );

  const resetFilters = () => {
    if (initialFiltersRef.current) {
      setMinAge(initialFiltersRef.current.minAge);
      setMaxAge(initialFiltersRef.current.maxAge);
      setLocalMinAge(initialFiltersRef.current.minAge);
      setLocalMaxAge(initialFiltersRef.current.maxAge);
      handleSearch(
        initialFiltersRef.current.minAge,
        initialFiltersRef.current.maxAge,
        breedFilter ?? undefined
      );
    }
  };

  return (
    <form
      onSubmit={handleSearchClick}
      className="fixed top-12 flex justify-between items-center bg-black z-4 w-full p-2 max-w-9xl mx-auto left-1/2 transform -translate-x-1/2 px-8"
    >
      <div className="flex items-center">
        <select
          value={breedFilter ?? ""}
          onChange={handleBreedChange}
          className="p-2 rounded border"
        >
          <option value="">All Breeds</option>
          {breeds.map((breed) => (
            <option key={breed} value={breed}>
              {breed}
            </option>
          ))}
        </select>

        <div className="relative">
          <button
            type="button"
            className="p-2 border rounded ml-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </button>
          {showFilters && (
            <div className="absolute bg-black rounded mt-2 p-4 z-10 text-white w-96">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-bold">Age</p>
                  <input
                    type="number"
                    name="ageMin"
                    placeholder={localMinAge?.toString() || ""}
                    value={localMinAge}
                    onChange={(e) =>
                      setLocalMinAge(
                        Math.max(
                          1,
                          Math.min(
                            parseInt(e.target.value) || 1,
                            localMaxAge as number
                          )
                        )
                      )
                    }
                    className="p-2 rounded border w-full bg-gray-800 text-white"
                  />
                  <input
                    type="number"
                    name="ageMax"
                    placeholder={localMaxAge?.toString() || ""}
                    value={localMaxAge}
                    onChange={(e) =>
                      setLocalMaxAge(
                        Math.max(
                          localMinAge as number,
                          Math.min(
                            parseInt(e.target.value) || (localMaxAge as number),
                            localMaxAge as number
                          )
                        )
                      )
                    }
                    className="p-2 rounded border w-full bg-gray-800 text-white mt-2"
                  />
                </div>

                <LocationFilter onLocationFilter={onLocationFilter} />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={applyFilters}
                  type="submit"
                  className="flex-1 bg-[#510359] text-white py-2 px-4 rounded-md hover:bg-[#3a023f]"
                >
                  Search
                </button>
                <button
                  onClick={resetFilters}
                  type="button"
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
