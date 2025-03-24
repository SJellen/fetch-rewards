import { useEffect, useState } from "react";
import api from "./api/api";
import { Dog } from "./api/types";

interface FavoritesProps {
  onClose: () => void;
  favorites: Set<string>;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
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

  if (loading && !isRemoving) {
    return <div>Loading favorites...</div>;
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
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${dog.zip_code}&layer=mapnik`}
                        className="w-full h-[200px]"
                        title="Location map"
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
