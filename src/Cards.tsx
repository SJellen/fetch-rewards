import React from "react";
import { Dog } from "./api/types";

interface CardsProps {
  cards: Dog[];
  favorites: Set<string>;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const Cards: React.FC<CardsProps> = ({ cards, favorites, setFavorites }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12 max-w-9xl">
      {cards.map((card) => (
        <div
          key={card.id}
          className="border p-4 bg-white text-[#510359] shadow-lg rounded-lg relative"
        >
          <img
            src={card.img}
            alt={card.name}
            className="w-full h-48 object-cover mb-2"
          />
          <h3 className="text-xl">{card.name}</h3>
          <p>Breed: {card.breed}</p>
          <p>Age: {card.age}</p>
          <p>Location: {card.zip_code}</p>
          <a
            onClick={() => {
              setFavorites((prev) => {
                const newFavorites = new Set(prev);
                if (newFavorites.has(card.id)) {
                  newFavorites.delete(card.id);
                } else {
                  newFavorites.add(card.id);
                }
                return newFavorites;
              });
            }}
            className={`absolute top-2 right-2 text-2xl bg-[#510359] p-2 rounded-lg hover:cursor-pointer ${
              favorites.has(card.id) ? "text-red-500" : "text-gray-500"
            }`}
          >
            {favorites.has(card.id) ? "❤️" : "🦴"}
          </a>
        </div>
      ))}
    </div>
  );
};

export default Cards;
