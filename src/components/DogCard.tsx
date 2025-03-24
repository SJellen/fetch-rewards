import { useState } from "react";
import { Dog } from "../api/types";

interface DogCardProps {
  dog: Dog;
  isFavorite: boolean;
  onFavoriteToggle: (id: string) => void;
}

export default function DogCard({
  dog,
  isFavorite,
  onFavoriteToggle,
}: DogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
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

      {isExpanded && (
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
