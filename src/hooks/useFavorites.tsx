import useLocalStorage from './useLocalStorage';

const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage<Set<string>>('favorites', new Set<string>());
  return { favorites, setFavorites };
};

export default useFavorites;