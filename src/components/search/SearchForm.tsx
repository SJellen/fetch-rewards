import React, {
  ChangeEvent,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Dog, SearchParams, LocationSearchParams } from "../../api/types";

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
  const [zipError, setZipError] = useState("");
  const [radiusError, setRadiusError] = useState("");

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

  const validateZipCode = (zip: string) => {
    if (!zip) return true;
    return /^\d{5}$/.test(zip);
  };

  const validateRadius = (rad: string) => {
    const num = parseInt(rad);
    return !isNaN(num) && num >= 1 && num <= 1000;
  };

  const handleZipChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
    setZipCode(value);
    if (value && !validateZipCode(value)) {
      setZipError("Please enter a valid 5-digit ZIP code");
    } else {
      setZipError("");
    }
  };

  const handleRadiusChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRadius(value);
    if (value && !validateRadius(value)) {
      setRadiusError("Please enter a radius between 1 and 1000 miles");
    } else {
      setRadiusError("");
    }
  };

  const calculateBoundingBox = (
    zipCode: string,
    radiusMiles: number
  ): LocationSearchParams => {
    // Convert miles to degrees (approximate)
    // 1 degree is approximately 69 miles at the equator
    const degreesPerMile = 1 / 69;
    const radiusDegrees = radiusMiles * degreesPerMile;

    // For now, we'll use a default center point since we don't have the actual coordinates
    // In a real app, you would look up the coordinates for the ZIP code
    const centerLat = 40.7128; // Example: New York City latitude
    const centerLon = -74.006; // Example: New York City longitude

    // Calculate the bounding box coordinates
    const top = {
      lat: centerLat + radiusDegrees,
      lon: centerLon + radiusDegrees,
    };
    const left = {
      lat: centerLat - radiusDegrees,
      lon: centerLon - radiusDegrees,
    };
    const bottom = {
      lat: centerLat - radiusDegrees,
      lon: centerLon + radiusDegrees,
    };
    const right = {
      lat: centerLat + radiusDegrees,
      lon: centerLon - radiusDegrees,
    };

    // Return the location search parameters with the bounding box
    return {
      geoBoundingBox: {
        top,
        left,
        bottom,
        right,
      },
      size: 10000, // Get maximum results to ensure we get all locations
    };
  };

  const handleBreedChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedBreed = e.target.value || null;
    setBreedFilter(selectedBreed);
    const searchParams: SearchParams = {
      breeds: selectedBreed ? [selectedBreed] : undefined,
      ageMin: localMinAge,
      ageMax: localMaxAge,
    };

    if (zipCode && validateZipCode(zipCode) && validateRadius(radius)) {
      const locationParams = calculateBoundingBox(zipCode, parseInt(radius));
      Object.assign(searchParams, locationParams);
    }

    handleSearch(searchParams);
  };

  const applyFilters = () => {
    if (!validateZipCode(zipCode) || !validateRadius(radius)) {
      return;
    }
    setMinAge(localMinAge);
    setMaxAge(localMaxAge);

    const searchParams: SearchParams = {
      breeds: breedFilter ? [breedFilter] : undefined,
      ageMin: localMinAge,
      ageMax: localMaxAge,
    };

    if (zipCode) {
      const locationParams = calculateBoundingBox(zipCode, parseInt(radius));
      Object.assign(searchParams, locationParams);
    }

    handleSearch(searchParams);
    setShowFilters(false);
  };

  const handleSearchClick = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateZipCode(zipCode) || !validateRadius(radius)) {
        return;
      }

      const searchParams: SearchParams = {
        breeds: breedFilter ? [breedFilter] : undefined,
        ageMin: minAge,
        ageMax: maxAge,
      };

      if (zipCode) {
        const locationParams = calculateBoundingBox(zipCode, parseInt(radius));
        Object.assign(searchParams, locationParams);
      }

      handleSearch(searchParams);
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
      setZipError("");
      setRadiusError("");
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
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter ZIP code"
                      value={zipCode}
                      onChange={handleZipChange}
                      maxLength={5}
                      className={`p-2 rounded border w-full bg-gray-800 text-white ${
                        zipError ? "border-red-500" : ""
                      }`}
                    />
                    {zipError && (
                      <p className="text-red-500 text-sm mt-1">{zipError}</p>
                    )}
                  </div>
                  <div className="relative mt-2">
                    <input
                      type="number"
                      placeholder="Radius (miles)"
                      value={radius}
                      onChange={handleRadiusChange}
                      min="1"
                      max="1000"
                      className={`p-2 rounded border w-full bg-gray-800 text-white ${
                        radiusError ? "border-red-500" : ""
                      }`}
                    />
                    {radiusError && (
                      <p className="text-red-500 text-sm mt-1">{radiusError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={applyFilters}
                  type="submit"
                  className="flex-1 bg-[#510359] text-white py-2 px-4 rounded-md hover:bg-[#3a023f]"
                  disabled={!!zipError || !!radiusError}
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
