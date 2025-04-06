import React, {
  ChangeEvent,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Dog, SearchParams } from "../../api/types";
import { API_URL } from "../../api/api";

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

  const calculateBoundingBox = async (
    zipCode: string,
    radiusMiles: number
  ): Promise<string[]> => {
    try {
      // First get the coordinates for the ZIP code
      const locationResponse = await fetch(`${API_URL}/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify([zipCode]),
      });

      if (!locationResponse.ok) {
        console.error(
          `Failed to fetch location for ZIP ${zipCode}: ${locationResponse.status}`
        );
        return [zipCode];
      }

      interface Location {
        zip_code: string;
        latitude: number;
        longitude: number;
        distance?: number;
      }

      const locations = (await locationResponse.json()) as Location[];

      // Validate location data
      if (!Array.isArray(locations) || locations.length === 0) {
        return [zipCode];
      }

      const location = locations[0];

      // Validate location coordinates
      if (
        !location ||
        typeof location.latitude !== "number" ||
        typeof location.longitude !== "number"
      ) {
        return [zipCode];
      }

      // Convert miles to degrees (approximate)
      // 1 degree of latitude = ~69 miles
      // 1 degree of longitude = ~69 * cos(latitude) miles
      const latDegPerMile = 1 / 69;
      const lonDegPerMile =
        1 / (69 * Math.cos((location.latitude * Math.PI) / 180));
      const latRadius = radiusMiles * latDegPerMile;
      const lonRadius = radiusMiles * lonDegPerMile;

      // Search for locations within the bounding box
      const searchResponse = await fetch(`${API_URL}/locations/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          geoBoundingBox: {
            bottom_left: {
              lat: location.latitude - latRadius,
              lon: location.longitude - lonRadius,
            },
            top_right: {
              lat: location.latitude + latRadius,
              lon: location.longitude + lonRadius,
            },
          },
          size: 100,
        }),
      });

      if (!searchResponse.ok) {
        console.error(`Failed to search locations: ${searchResponse.status}`);
        return [zipCode];
      }

      interface LocationSearchResult {
        results: Location[];
        total: number;
      }

      const searchResult =
        (await searchResponse.json()) as LocationSearchResult;

      // Validate search results
      if (!searchResult || !Array.isArray(searchResult.results)) {
        return [zipCode];
      }

      if (searchResult.results.length === 0) {
        return [zipCode];
      }

      // Calculate distances and filter by actual radius
      const nearbyLocations = searchResult.results
        .filter(
          (loc) =>
            loc &&
            typeof loc.latitude === "number" &&
            typeof loc.longitude === "number"
        )
        .map((loc) => {
          const R = 3959; // Earth's radius in miles
          const lat1 = (location.latitude * Math.PI) / 180;
          const lat2 = (loc.latitude * Math.PI) / 180;
          const dLat = ((loc.latitude - location.latitude) * Math.PI) / 180;
          const dLon = ((loc.longitude - location.longitude) * Math.PI) / 180;

          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) *
              Math.cos(lat2) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);

          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          return { ...loc, distance };
        })
        .filter((loc) => loc.distance <= radiusMiles)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));

      // Always include the original ZIP code first
      const nearbyZips = [zipCode];
      nearbyLocations.forEach((loc) => {
        if (loc.zip_code !== zipCode) {
          nearbyZips.push(loc.zip_code);
        }
      });

      return nearbyZips;
    } catch (error) {
      console.error("Error searching locations:", error);
      return [zipCode];
    }
  };

  const handleBreedChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedBreed = e.target.value || null;
    setBreedFilter(selectedBreed);

    const searchParams: SearchParams = {
      breeds: selectedBreed ? [selectedBreed] : undefined,
      ageMin: minAge,
      ageMax: maxAge,
      size: 100,
      from: 0,
      sort: "breed:asc",
    };

    // If we have a valid ZIP code and radius, include them in the search
    if (zipCode && validateZipCode(zipCode) && validateRadius(radius)) {
      try {
        const zipCodes = await calculateBoundingBox(zipCode, parseInt(radius));
        if (zipCodes.length > 0) {
          searchParams.zipCodes = zipCodes;
        }
      } catch (error) {
        console.error("Error getting ZIP codes for breed search:", error);
      }
    }

    handleSearch(searchParams);
  };

  const applyFilters = async () => {
    if (zipCode && (!validateZipCode(zipCode) || !validateRadius(radius))) {
      return;
    }
    setMinAge(localMinAge);
    setMaxAge(localMaxAge);

    const searchParams: SearchParams = {
      breeds: breedFilter ? [breedFilter] : undefined,
      ageMin: localMinAge,
      ageMax: localMaxAge,
      size: 100,
      from: 0,
      sort: "breed:asc",
    };

    if (zipCode && validateZipCode(zipCode)) {
      try {
        const zipCodes = await calculateBoundingBox(zipCode, parseInt(radius));
        if (zipCodes.length > 0) {
          searchParams.zipCodes = zipCodes;
        }
      } catch (error) {
        console.error("Error getting ZIP codes for filter search:", error);
      }
    }

    handleSearch(searchParams);
    setShowFilters(false);
  };

  const handleSearchClick = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (zipCode && (!validateZipCode(zipCode) || !validateRadius(radius))) {
        return;
      }

      const searchParams: SearchParams = {
        breeds: breedFilter ? [breedFilter] : undefined,
        ageMin: minAge,
        ageMax: maxAge,
        size: 100,
        from: 0,
        sort: "breed:asc",
      };

      if (zipCode && validateZipCode(zipCode)) {
        try {
          const zipCodes = await calculateBoundingBox(
            zipCode,
            parseInt(radius)
          );
          if (zipCodes.length > 0) {
            searchParams.zipCodes = zipCodes;
          }
        } catch (error) {
          console.error("Error getting ZIP codes for search:", error);
        }
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
        size: 100,
        from: 0,
        sort: "breed:asc",
        zipCodes: [], // Clear ZIP codes when resetting
      });
    }
  };

  return (
    <form
      onSubmit={handleSearchClick}
      className="fixed top-12 flex justify-between items-center bg-black z-4 w-full p-2 max-w-9xl mx-auto left-1/2 transform -translate-x-1/2 px-4"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
          <label htmlFor="breed-select" className="text-white mb-1">
            Select Breed
          </label>
          <select
            id="breed-select"
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
        </div>

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
                    placeholder="Min Age"
                    value={localMinAge || ""}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value >= 0) {
                        setLocalMinAge(value);
                        if (localMaxAge !== undefined && value > localMaxAge) {
                          setLocalMaxAge(value);
                        }
                      }
                    }}
                    className="p-2 rounded border w-full bg-gray-800 text-white"
                    min="0"
                  />
                  <input
                    type="number"
                    name="ageMax"
                    placeholder="Max Age"
                    value={localMaxAge || ""}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value >= 0) {
                        setLocalMaxAge(value);
                        if (localMinAge !== undefined && value < localMinAge) {
                          setLocalMinAge(value);
                        }
                      }
                    }}
                    className="p-2 rounded border w-full bg-gray-800 text-white mt-2"
                    min="0"
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
