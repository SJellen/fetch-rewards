
import useLocalStorage from './useLocalStorage';

const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage('favorites', new Set());

  console.log(favorites);

  return { favorites, setFavorites };
};

export default useFavorites;