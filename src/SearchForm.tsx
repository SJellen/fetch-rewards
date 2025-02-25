import React, { ChangeEvent, useState, useEffect, useCallback, useRef } from "react";
import { Dog } from "./api/types";

interface SearchFormProps {
  breeds: string[];
  breedFilter: string | null;
  setBreedFilter: (breed: string | null) => void;
  handleSearch: (minAge?: number, maxAge?: number, breeds?: string) => void;
  selectedLocations: string[];
  setSelectedLocations: React.Dispatch<React.SetStateAction<string[]>>;
  cards: Dog[];
  setFilteredCards: React.Dispatch<React.SetStateAction<Dog[]>>;
  minAge?: number;
  maxAge?: number;
  setMinAge: React.Dispatch<React.SetStateAction<number | undefined>>;
  setMaxAge: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const SearchForm: React.FC<SearchFormProps> = ({
  breeds,
  breedFilter,
  setBreedFilter,
  handleSearch,
  selectedLocations,
  setSelectedLocations,
  cards,
  setFilteredCards,
  minAge,
  maxAge,
  setMinAge,
  setMaxAge
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [zipCodes, setZipCodes] = useState<string[]>([]);

  const initialFiltersRef = useRef<{ zipCodes: string[]; minAge?: number; maxAge?: number } | null>(null);

  useEffect(() => {
    if (cards.length > 0) {
      const uniqueZips = Array.from(new Set(cards.map((dog) => dog.zip_code)));
      const ages = cards.map((dog) => dog.age);
      const minAgeVal = Math.min(...ages);
      const maxAgeVal = Math.max(...ages);

      if (!initialFiltersRef.current) {
        initialFiltersRef.current = { zipCodes: uniqueZips, minAge: minAgeVal, maxAge: maxAgeVal };
      }

      setZipCodes(uniqueZips);
      setSelectedLocations((prev) => (prev.length > 0 ? prev : uniqueZips));
      setMinAge((prev) => (prev !== undefined ? prev : minAgeVal));
      setMaxAge((prev) => (prev !== undefined ? prev : maxAgeVal));
    }
  }, [cards, setSelectedLocations, setMinAge, setMaxAge]);

  const handleBreedChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedBreed = e.target.value || null;
    setMinAge(undefined);
    setMaxAge(undefined);
    setSelectedLocations([]);
    setBreedFilter(selectedBreed);
  };

  useEffect(() => {
    if (breedFilter !== null) {
      handleSearch(undefined, undefined, breedFilter);
    }
  }, [breedFilter, handleSearch]);

  const handleZipCodeChange = (e: ChangeEvent<HTMLInputElement>, zipCode: string) => {
    setSelectedLocations((prev) =>
      e.target.checked ? [...prev, zipCode] : prev.filter((loc) => loc !== zipCode)
    );
  };

  const applyFilters = () => {
    const filtered = cards.filter(
      (dog) =>
        (!minAge || dog.age >= minAge) &&
        (!maxAge || dog.age <= maxAge) &&
        (selectedLocations.length === 0 || selectedLocations.includes(dog.zip_code))
    );

    setFilteredCards(filtered);
    setShowFilters(false);
  };

  const handleSearchClick = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSearch(minAge ?? 1, maxAge ?? 20, breedFilter ?? "");
    },
    [handleSearch, minAge, maxAge, breedFilter]
  );

  const resetFilters = () => {
    if (initialFiltersRef.current) {
      setSelectedLocations(initialFiltersRef.current.zipCodes);
      setMinAge(initialFiltersRef.current.minAge);
      setMaxAge(initialFiltersRef.current.maxAge);
    }
  };

  return (
    <form onSubmit={handleSearchClick} className="fixed top-12 flex justify-between items-center bg-black z-4 w-full p-2 max-w-9xl mx-auto left-1/2 transform -translate-x-1/2 px-8">
      <div className="flex items-center">
        <select value={breedFilter ?? ""} onChange={handleBreedChange} className="p-2 rounded border">
          <option value="">All Breeds</option>
          {breeds.map((breed) => (
            <option key={breed} value={breed}>
              {breed}
            </option>
          ))}
        </select>

        <div className="relative">
          <button type="button" className="p-2 border rounded ml-2" onClick={() => setShowFilters(!showFilters)}>
            Filters
          </button>
          {showFilters && (
            <div className="absolute bg-black rounded mt-2 p-4 z-10 text-white w-48">
              <p className="font-bold">Zip Codes</p>
              {zipCodes.map((zipCode) => (
                <label key={zipCode} className="block">
                  <input
                    type="checkbox"
                    value={zipCode}
                    checked={selectedLocations.includes(zipCode)}
                    onChange={(e) => handleZipCodeChange(e, zipCode)}
                    className="mr-2"
                  />
                  {zipCode}
                </label>
              ))}

              <p className="font-bold mt-2">Age</p>
              <input
                type="number"
                name="ageMin"
                placeholder={minAge?.toString() || ""}
                value={minAge}
                onChange={(e) => setMinAge(Math.max(1, Math.min(parseInt(e.target.value) || 1, maxAge as number)))}
                className="p-2 rounded border w-full bg-gray-800 text-white"
              />
              <input
                type="number"
                name="ageMax"
                placeholder={maxAge?.toString() || ""}
                value={maxAge}
                onChange={(e) => setMaxAge(Math.max(minAge as number, Math.min(parseInt(e.target.value) || (maxAge as number), maxAge as number)))}
                className="p-2 rounded border w-full bg-gray-800 text-white mt-2"
              />

              <button onClick={applyFilters} type="button" className="p-2 bg-[#510359] rounded mt-4 w-full">
                Apply Filters
              </button>
              <button onClick={resetFilters} className="p-2 bg-gray-600 rounded mt-4 w-full">
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <button type="submit" className="text-white p-2 mb-4 bg-[#510359] rounded">
        Search
      </button>
    </form>
  );
};

export default SearchForm;


