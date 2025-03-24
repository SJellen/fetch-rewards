import React from "react";
import { Dog } from "../../api/types";
import DogCard from "./DogCard";

interface CardsProps {
  cards: Dog[];
  favorites: Set<string>;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export default function Cards({ cards, favorites, setFavorites }: CardsProps) {
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7  gap-4 mt-12  auto-rows-min">
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
}
