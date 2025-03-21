import useLocalStorage from './useLocalStorage';
import { useEffect } from 'react';

const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage<Set<string>>('favorites', new Set<string>());

  useEffect(() => {
    console.log('useFavorites mounted');
    console.log('Favorites in useFavorites:', favorites);
    console.log('Favorites size:', favorites.size);
    console.log('Favorites entries:', Array.from(favorites));
  }, [favorites]);

  return { favorites, setFavorites };
};

export default useFavorites;