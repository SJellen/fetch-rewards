import { useState, useEffect } from "react";
import { Dog } from "../../api/types";

interface DogCardProps {
  dog: Dog;
  isFavorite: boolean;
  onFavoriteToggle: (id: string) => void;
}

interface Coordinates {
  lat: number;
  lon: number;
}

export default function DogCard({
  dog,
  isFavorite,
  onFavoriteToggle,
}: DogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${dog.zip_code}&countrycodes=us&format=json&limit=1`
        );
        const data = await response.json();
        if (data && data[0]) {
          setCoordinates({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          });
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      }
    };

    if (isExpanded && dog.zip_code) {
      fetchCoordinates();
    }
  }, [isExpanded, dog.zip_code]);

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const getMapUrl = () => {
    if (!coordinates) return "";
    // Create a bounding box that's roughly 5km around the point
    const latOffset = 0.05;
    const lonOffset = 0.05;
    const bbox = [
      coordinates.lon - lonOffset,
      coordinates.lat - latOffset,
      coordinates.lon + lonOffset,
      coordinates.lat + latOffset,
    ].join(",");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coordinates.lat},${coordinates.lon}`;
  };

  return (
    <div
      className={`border border-gray-200 p-4 bg-white text-[#510359] shadow-md hover:shadow-xl rounded-xl relative transition-all duration-300 cursor-pointer ${
        isExpanded ? "col-span-2 row-span-2" : ""
      }`}
      onClick={handleCardClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
        <img
          src={dog.img}
          alt={dog.name}
          className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
            isExpanded ? "aspect-video" : ""
          }`}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-bold text-[#510359]">{dog.name}</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="block text-xs font-medium text-gray-500 mb-1">
              Breed
            </span>
            <p className="text-[#510359] font-medium">{dog.breed}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="block text-xs font-medium text-gray-500 mb-1">
              Age
            </span>
            <p className="text-[#510359] font-medium">{dog.age} years</p>
          </div>
          <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
            <span className="block text-xs font-medium text-gray-500 mb-1">
              Location
            </span>
            <p className="text-[#510359] font-medium">{dog.zip_code}</p>
          </div>
        </div>
      </div>

      {isExpanded && coordinates && (
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
          <iframe
            src={getMapUrl()}
            className="w-full h-[200px]"
            title="Location map"
          />
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle(dog.id);
        }}
        className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 ${
          isFavorite ? "text-red-500" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        {isFavorite ? "❤️" : "🦴"}
      </button>
    </div>
  );
}
