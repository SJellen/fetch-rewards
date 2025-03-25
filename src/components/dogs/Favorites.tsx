import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/api";
import { Dog } from "../../api/types";
import Spinner from "../common/Spinner";

interface FavoritesProps {
  onClose: () => void;
  favorites: Set<string>;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
}

interface Coordinates {
  lat: number;
  lon: number;
}

interface MapState {
  coordinates: Record<string, Coordinates>;
  isLoading: Record<string, boolean>;
}

interface MatchState {
  dog: Dog | null;
  show: boolean;
}

// Separate component for the map functionality
const DogLocationMap: React.FC<{
  zipCode: string;
  coordinates: Coordinates | undefined;
  isLoading: boolean;
}> = ({ zipCode, coordinates, isLoading }) => {
  const getMapUrl = useCallback((coords: Coordinates) => {
    const latOffset = 0.05;
    const lonOffset = 0.05;
    const bbox = [
      coords.lon - lonOffset,
      coords.lat - latOffset,
      coords.lon + lonOffset,
      coords.lat + latOffset,
    ].join(",");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lon}`;
  }, []);

  if (isLoading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <Spinner size="medium" />
      </div>
    );
  }

  if (!coordinates) return null;

  return (
    <iframe
      src={getMapUrl(coordinates)}
      className="w-full h-[200px]"
      title={`Location map for ${zipCode}`}
    />
  );
};

export default function Favorites({
  onClose,
  favorites,
  setFavorites,
}: FavoritesProps) {
  const [favoriteDogs, setFavoriteDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [mapState, setMapState] = useState<MapState>({
    coordinates: {},
    isLoading: {},
  });
  const [matchState, setMatchState] = useState<MatchState>({
    dog: null,
    show: false,
  });

  // Close the component when all favorites are removed
  useEffect(() => {
    if (favorites.size === 0) {
      onClose();
    }
  }, [favorites.size, onClose]);

  // Fetch favorite dogs
  useEffect(() => {
    const fetchFavoriteDogs = async () => {
      if (favorites.size === 0) {
        setFavoriteDogs([]);
        return;
      }

      // Only show loading state for initial load or when adding new items
      if (!isRemoving && favoriteDogs.length === 0) {
        setLoading(true);
      }

      try {
        const dogs = (await api.getDogs(Array.from(favorites))) as Dog[];
        setFavoriteDogs(dogs);
      } catch (error) {
        console.error("Error fetching favorite dogs:", error);
      } finally {
        setLoading(false);
        setIsRemoving(false);
      }
    };

    fetchFavoriteDogs();
  }, [favorites, isRemoving, favoriteDogs.length]);

  // Handle removing a favorite
  const handleFavoriteCardClick = useCallback(
    (cardId: string) => {
      setIsRemoving(true);
      // Optimistically remove the dog from the UI
      setFavoriteDogs((prev) => prev.filter((dog) => dog.id !== cardId));
      setFavorites((prevFavorites) => {
        const newFavorites = new Set(prevFavorites);
        newFavorites.delete(cardId);
        return newFavorites;
      });
    },
    [setFavorites]
  );

  // Handle perfect match
  const handlePerfectMatch = useCallback(async () => {
    try {
      setLoading(true);
      const matchResult = await api.matchDogs(Array.from(favorites));
      const matchedDogs = (await api.getDogs([matchResult.match])) as Dog[];
      setMatchState({ dog: matchedDogs[0], show: true });

      // Fetch coordinates for the matched dog
      const dog = matchedDogs[0];
      if (dog?.zip_code) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${dog.zip_code}&countrycodes=us&format=json&limit=1`
        );
        const data = await response.json();
        if (data?.[0]) {
          setMapState((prev) => ({
            coordinates: {
              ...prev.coordinates,
              [dog.id]: {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
              },
            },
            isLoading: { ...prev.isLoading, [dog.id]: false },
          }));
        }
      }
    } catch (error) {
      console.error("Error finding perfect match:", error);
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  // Fetch coordinates for expanded card
  useEffect(() => {
    const fetchCoordinates = async (dogId: string, zipCode: string) => {
      if (!expandedCard || !zipCode) return;

      setMapState((prev) => ({
        ...prev,
        isLoading: { ...prev.isLoading, [dogId]: true },
      }));

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&countrycodes=us&format=json&limit=1`
        );
        const data = await response.json();
        if (data?.[0]) {
          setMapState((prev) => ({
            coordinates: {
              ...prev.coordinates,
              [dogId]: {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
              },
            },
            isLoading: { ...prev.isLoading, [dogId]: false },
          }));
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
        setMapState((prev) => ({
          ...prev,
          isLoading: { ...prev.isLoading, [dogId]: false },
        }));
      }
    };

    if (expandedCard) {
      const dog = favoriteDogs.find((d) => d.id === expandedCard);
      if (dog?.zip_code) {
        fetchCoordinates(dog.id, dog.zip_code);
      }
    }
  }, [expandedCard, favoriteDogs]);

  if (loading && !isRemoving) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
        <div className="flex items-center justify-center w-full h-full">
          <Spinner size="large" color="#ffdf02" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
      <div className="rounded-lg p-6 w-full mx-auto h-screen overflow-y-auto relative py-20">
        {matchState.dog !== null ? (
          <button
            onClick={() => setMatchState({ dog: null, show: false })}
            className="absolute top-4 right-4 text-white hover:text-gray-700"
          >
            Close Match
          </button>
        ) : (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-700"
          >
            x
          </button>
        )}

        <h2 className="text-2xl font-bold mb-4 text-white py-10 ">
          {matchState.show ? "Your Perfect Match!" : "Your Favorite Dogs"}
        </h2>

        {matchState.show && matchState.dog ? (
          <div className="max-w-5xl mx-auto">
            <div className=" p-8 bg-[#510359]/75 text-white shadow-xl border border-[#ffdf02]/25 rounded-xl">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/2">
                  <img
                    src={matchState.dog.img}
                    alt={matchState.dog.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                </div>
                <div className="lg:w-1/2 space-y-6">
                  <h3 className="text-3xl font-bold">{matchState.dog.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-lg">
                      <span className="block text-sm font-medium text-[#ffdf02] mb-1">
                        Breed
                      </span>
                      <p className="text-xl font-medium">
                        {matchState.dog.breed}
                      </p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <span className="block text-sm font-medium text-[#ffdf02] mb-1">
                        Age
                      </span>
                      <p className="text-xl font-medium">
                        {matchState.dog.age} years
                      </p>
                    </div>
                    <div className="col-span-2 bg-white/10 p-4 rounded-lg">
                      <span className="block text-sm font-medium text-[#ffdf02] mb-1">
                        Location
                      </span>
                      <p className="text-xl font-medium">
                        {matchState.dog.zip_code}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 rounded-lg overflow-hidden border border-white/20">
                    <DogLocationMap
                      zipCode={matchState.dog.zip_code}
                      coordinates={mapState.coordinates[matchState.dog.id]}
                      isLoading={mapState.isLoading[matchState.dog.id]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 auto-rows-min gap-4">
              {favoriteDogs.map((dog) => (
                <div
                  key={dog.id}
                  className={`border border-gray-200 p-4 bg-white text-[#510359] shadow-md hover:shadow-xl rounded-xl relative transition-all duration-300 cursor-pointer ${
                    expandedCard === dog.id ? "col-span-2 row-span-2" : ""
                  }`}
                  onClick={() =>
                    setExpandedCard(expandedCard === dog.id ? null : dog.id)
                  }
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
                    <img
                      src={dog.img}
                      alt={dog.name}
                      className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
                        expandedCard === dog.id ? "aspect-video" : ""
                      }`}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-[#510359]">
                      {dog.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="block text-xs font-medium text-gray-500 mb-1">
                          Breed
                        </span>
                        <p className="text-[#510359] font-medium">
                          {dog.breed}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="block text-xs font-medium text-gray-500 mb-1">
                          Age
                        </span>
                        <p className="text-[#510359] font-medium">
                          {dog.age} years
                        </p>
                      </div>
                      <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                        <span className="block text-xs font-medium text-gray-500 mb-1">
                          Location
                        </span>
                        <p className="text-[#510359] font-medium">
                          {dog.zip_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {expandedCard === dog.id && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                      <DogLocationMap
                        zipCode={dog.zip_code}
                        coordinates={mapState.coordinates[dog.id]}
                        isLoading={mapState.isLoading[dog.id]}
                      />
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteCardClick(dog.id);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 text-red-500"
                  >
                    ❤️
                  </button>
                </div>
              ))}
              {favoriteDogs.length === 0 && (
                <div className="col-span-full text-center text-gray-500">
                  No favorite dogs yet
                </div>
              )}
            </div>
            {favoriteDogs.length > 0 && (
              <div className="bg-black p-4 flex justify-end fixed bottom-0 w-full left-1/2 transform -translate-x-1/2 ">
                <button
                  onClick={handlePerfectMatch}
                  className="bg-[#510359] text-white px-8 py-3 rounded-lg hover:bg-[#510359]/90 transition-colors"
                >
                  Find Your Perfect Match
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
