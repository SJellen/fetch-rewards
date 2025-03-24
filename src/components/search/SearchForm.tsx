import React, {
  ChangeEvent,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Dog, SearchParams } from "../../api/types";

interface SearchFormProps {
  breeds: string[];
  breedFilter: string | null;
  setBreedFilter: (breed: string | null) => void;
  handleSearch: (params: SearchParams) => void;
  cards: Dog[];
  minAge?: number;
  maxAge?: number;
  setMinAge: React.Dispatch<React.SetStateAction<number | undefined>>;
  setMaxAge: React.Dispatch<React.SetStateAction<number | undefined>>;
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
}: SearchFormProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localMinAge, setLocalMinAge] = useState<number | undefined>(minAge);
  const [localMaxAge, setLocalMaxAge] = useState<number | undefined>(maxAge);
  const [zipCode, setZipCode] = useState("");
  const [radius, setRadius] = useState("25");

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
    handleSearch({
      breeds: selectedBreed ? [selectedBreed] : undefined,
      ageMin: localMinAge,
      ageMax: localMaxAge,
      zipCodes: zipCode ? [zipCode] : undefined,
      size: parseInt(radius) || 25,
    });
  };

  const applyFilters = () => {
    setMinAge(localMinAge);
    setMaxAge(localMaxAge);
    handleSearch({
      breeds: breedFilter ? [breedFilter] : undefined,
      ageMin: localMinAge,
      ageMax: localMaxAge,
      zipCodes: zipCode ? [zipCode] : undefined,
      size: parseInt(radius) || 25,
    });
    setShowFilters(false);
  };

  const handleSearchClick = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSearch({
        breeds: breedFilter ? [breedFilter] : undefined,
        ageMin: minAge,
        ageMax: maxAge,
        zipCodes: zipCode ? [zipCode] : undefined,
        size: parseInt(radius) || 25,
      });
    },
    [handleSearch, minAge, maxAge, breedFilter, zipCode, radius]
  );

  const resetFilters = () => {
    if (initialFiltersRef.current) {
      setMinAge(initialFiltersRef.current.minAge);
      setMaxAge(initialFiltersRef.current.maxAge);
      setLocalMinAge(initialFiltersRef.current.minAge);
      setLocalMaxAge(initialFiltersRef.current.maxAge);
      setZipCode("");
      setRadius("25");
      handleSearch({
        breeds: breedFilter ? [breedFilter] : undefined,
        ageMin: initialFiltersRef.current.minAge,
        ageMax: initialFiltersRef.current.maxAge,
      });
    }
  };

  return (
    <form
      onSubmit={handleSearchClick}
      className="fixed top-12 flex justify-between items-center bg-black z-4 w-full p-2 max-w-9xl mx-auto left-1/2 transform -translate-x-1/2 px-4"
    >
      <div className="flex items-center justify-between w-full">
        <select
          value={breedFilter ?? ""}
          onChange={handleBreedChange}
          className="p-2 rounded border bg-gray-800 text-white"
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
            className="p-2 border rounded ml-2 bg-gray-800 text-white"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </button>
          {showFilters && (
            <div className="absolute bg-black rounded mt-2 p-4 z-10 text-white w-96 right-0 border border-[#ffdf02]/25">
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

                <div>
                  <p className="font-bold">Location</p>
                  <input
                    type="text"
                    placeholder="Enter ZIP code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="p-2 rounded border w-full bg-gray-800 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Radius (miles)"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    min="1"
                    max="100"
                    className="p-2 rounded border w-full bg-gray-800 text-white mt-2"
                  />
                </div>
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
