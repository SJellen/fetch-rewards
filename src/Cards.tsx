import React from "react";
import { Dog } from "./api/types";
import DogCard from "./components/DogCard";

interface CardsProps {
  cards: Dog[];
  favorites: Set<string>;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const Cards: React.FC<CardsProps> = ({ cards, favorites, setFavorites }) => {
  const handleFavoriteToggle = (id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12 max-w-9xl auto-rows-min">
      {cards.map((card) => (
        <DogCard
          key={card.id}
          dog={card}
          isFavorite={favorites.has(card.id)}
          onFavoriteToggle={handleFavoriteToggle}
        />
      ))}
    </div>
  );
};

export default Cards;
