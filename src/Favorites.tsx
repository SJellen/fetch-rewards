import useFavorites from './hooks/useFavorites';
import { useEffect, useState } from 'react';
import api from './api/api';
import { Dog } from './api/types';

interface FavoritesProps {
  onClose: () => void;
}

const Favorites: React.FC<FavoritesProps> = ({ onClose }) => {
  const { favorites, setFavorites } = useFavorites();
  const [favoriteDogs, setFavoriteDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);

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

      setLoading(true);
      try {
        const dogs = await api.getDogs(Array.from(favorites)) as Dog[];
        setFavoriteDogs(dogs);
      } catch (error) {
        console.error('Error fetching favorite dogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteDogs();
  }, [favorites]);

  const handleFavoriteCardClick = (cardId: string) => {
    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(cardId)) {
        newFavorites.delete(cardId);
      } else {
        newFavorites.add(cardId);
      }
      return newFavorites;
    });
  };

  if (loading) {
    return <div>Loading favorites...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Your Favorite Dogs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteDogs.map((dog) => (
            <div key={dog.id} className="border rounded-lg p-4 shadow-sm">
              <img src={dog.img} alt={dog.name} className="w-full h-48 object-cover rounded-md mb-2" />
              <h3 className="text-lg font-semibold">{dog.name}</h3>
              <p>Breed: {dog.breed}</p>
              <p>Age: {dog.age}</p>
              <p>Location: {dog.location}</p>
              <button 
                onClick={() => handleFavoriteCardClick(dog.id)}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove from Favorites
              </button>
            </div>
          ))}
          {favoriteDogs.length === 0 && (
            <div className="col-span-full text-center text-gray-500">
              No favorite dogs yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;