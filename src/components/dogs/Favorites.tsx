import React, { useEffect, useState } from "react";
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

export default function Favorites({
  onClose,
  favorites,
  setFavorites,
}: FavoritesProps) {
  const [favoriteDogs, setFavoriteDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Record<string, Coordinates>>(
    {}
  );
  const [isLoadingMap, setIsLoadingMap] = useState<Record<string, boolean>>({});

  // Close the component when all favorites are removed
  useEffect(() => {
    if (favorites.size === 0) {
      onClose();
    }
  }, [favorites.size, onClose]);

  useEffect(() => {
    const fetchFavoriteDogs = async () => {
      if (favorites.size === 0) {
        setFavoriteDogs([]);
        return;
      }

      // Don't show loading state if we're just removing an item
      if (!isRemoving) {
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
  }, [favorites, isRemoving]);

  const handleFavoriteCardClick = (cardId: string) => {
    setIsRemoving(true);
    // Optimistically remove the dog from the UI
    setFavoriteDogs((prev) => prev.filter((dog) => dog.id !== cardId));

    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      newFavorites.delete(cardId);
      return newFavorites;
    });
  };

  const handlePerfectMatch = async () => {
    try {
      setLoading(true);
      const matchResult = await api.matchDogs(Array.from(favorites));
      const matchedDogs = (await api.getDogs([matchResult.match])) as Dog[];
      setMatchedDog(matchedDogs[0]);
      setShowMatch(true);
    } catch (error) {
      console.error("Error finding perfect match:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCoordinates = async (dogId: string, zipCode: string) => {
      if (!expandedCard || !zipCode) return;

      setIsLoadingMap((prev) => ({ ...prev, [dogId]: true }));
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&countrycodes=us&format=json&limit=1`
        );
        const data = await response.json();
        if (data && data[0]) {
          setCoordinates((prev) => ({
            ...prev,
            [dogId]: {
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
            },
          }));
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      } finally {
        setIsLoadingMap((prev) => ({ ...prev, [dogId]: false }));
      }
    };

    if (expandedCard) {
      const dog = favoriteDogs.find((d) => d.id === expandedCard);
      if (dog?.zip_code) {
        fetchCoordinates(dog.id, dog.zip_code);
      }
    }
  }, [expandedCard, favoriteDogs]);

  const getMapUrl = (dogId: string) => {
    const coords = coordinates[dogId];
    if (!coords) return "";
    // Create a bounding box that's roughly 5km around the point
    const latOffset = 0.05;
    const lonOffset = 0.05;
    const bbox = [
      coords.lon - lonOffset,
      coords.lat - latOffset,
      coords.lon + lonOffset,
      coords.lat + latOffset,
    ].join(",");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lon}`;
  };

  if (loading && !isRemoving) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
        <div className="rounded-lg p-6 w-full mx-auto h-screen overflow-y-auto relative py-20">
          <Spinner size="large" color="#ffdf02" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
      <div className="rounded-lg p-6 w-full mx-auto h-screen overflow-y-auto relative py-20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-700"
        >
          x
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white">
          Your Favorite Dogs
        </h2>

        {showMatch && matchedDog ? (
          <div className="mb-8 p-4 bg-[#510359] text-white rounded-lg">
            <h3 className="text-xl font-bold mb-2">Your Perfect Match!</h3>
            <div className="flex items-center gap-4">
              <img
                src={matchedDog.img}
                alt={matchedDog.name}
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div>
                <p className="font-bold">{matchedDog.name}</p>
                <p>Breed: {matchedDog.breed}</p>
                <p>Age: {matchedDog.age}</p>
                <p>Location: {matchedDog.zip_code}</p>
              </div>
            </div>
            <button
              onClick={() => setShowMatch(false)}
              className="mt-4 bg-white text-[#510359] px-4 py-2 rounded hover:bg-gray-100"
            >
              Close Match
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                      {isLoadingMap[dog.id] ? (
                        <div className="h-[200px] flex items-center justify-center">
                          <Spinner size="medium" />
                        </div>
                      ) : coordinates[dog.id] ? (
                        <iframe
                          src={getMapUrl(dog.id)}
                          className="w-full h-[200px]"
                          title="Location map"
                        />
                      ) : null}
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
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handlePerfectMatch}
                  className="bg-[#510359] text-white px-8 py-3 rounded-lg hover:bg-[#510359]/90 transition-colors"
                >
                  Find Perfect Match
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
