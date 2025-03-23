import  { useState } from 'react';
import { Dog } from '../api/types';

interface DogCardProps {
  dog: Dog;
  isFavorite: boolean;
  onFavoriteToggle: (id: string) => void;
}

export default function DogCard({ dog, isFavorite, onFavoriteToggle }: DogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`border p-4 bg-white text-[#510359] shadow-lg rounded-lg relative transition-all duration-300 ${
        isExpanded ? 'col-span-2 row-span-2' : ''
      }`}
      onClick={handleCardClick}
    >
      <img
        src={dog.img}
        alt={dog.name}
        className={`w-full object-cover mb-2 transition-all duration-300 ${
          isExpanded ? 'h-64' : 'h-48'
        }`}
      />
      <h3 className="text-xl font-bold">{dog.name}</h3>
      <p className="mt-2"><span className="font-semibold">Breed:</span> {dog.breed}</p>
      <p><span className="font-semibold">Age:</span> {dog.age} years</p>
      <p><span className="font-semibold">Location:</span> {dog.zip_code}</p>
      
      {isExpanded && (
        <div className="mt-4">
          <img
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${dog.zip_code}&layer=mapnik`}
            alt="Location map"
            className="w-full h-[200px] rounded border"
          />
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle(dog.id);
        }}
        className={`absolute top-2 right-2 text-2xl bg-[#510359] p-2 rounded-lg hover:cursor-pointer ${
          isFavorite ? 'text-red-500' : 'text-gray-500'
        }`}
      >
        {isFavorite ? '❤️' : '🦴'}
      </button>
    </div>
  );
}

