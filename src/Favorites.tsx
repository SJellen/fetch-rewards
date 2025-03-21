import { useEffect, useState } from 'react';
import api from './api/api';
import { Dog } from './api/types';

interface FavoritesProps {
  onClose: () => void;
  favorites: Set<string>;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const Favorites: React.FC<FavoritesProps> = ({ onClose, favorites, setFavorites }) => {
  const [favoriteDogs, setFavoriteDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

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
        const dogs = await api.getDogs(Array.from(favorites)) as Dog[];
        setFavoriteDogs(dogs);
      } catch (error) {
        console.error('Error fetching favorite dogs:', error);
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
    setFavoriteDogs(prev => prev.filter(dog => dog.id !== cardId));
    
    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      newFavorites.delete(cardId);
      return newFavorites;
    });
  };

  const handlePerfectMatch = () => {
    // TODO: Implement perfect match functionality
    console.log('Finding perfect match from favorites:', favoriteDogs);
  };

  if (loading && !isRemoving) {
    return <div>Loading favorites...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-9xl mx-auto max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Your Favorite Dogs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteDogs.map((dog) => (
            <div key={dog.id} className="border p-4 bg-white text-[#510359] shadow-lg rounded-lg relative">
              <img
                src={dog.img}
                alt={dog.name}
                className="w-full h-48 object-cover mb-2"
              />
              <h3 className="text-xl">{dog.name}</h3>
              <p>Breed: {dog.breed}</p>
              <p>Age: {dog.age}</p>
              <p>Location: {dog.zip_code}</p>
              <button 
                onClick={() => handleFavoriteCardClick(dog.id)}
                className="absolute top-2 right-2 text-2xl bg-[#510359] p-2 rounded-lg hover:cursor-pointer text-red-500"
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
      </div>
    </div>
  );
};

export default Favorites;