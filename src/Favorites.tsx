import useFavorites from './hooks/useFavorites.ts';

const Favorites = () => {
  const { favorites, setFavorites } = useFavorites();



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

  return (
    <div>
      {Array.from(favorites).map((favoriteId) => (
        <div key={favoriteId}>
          <button onClick={() => handleFavoriteCardClick(favoriteId)}>
            {favorites.has(favoriteId) ? "❤️" : "🦴"}
            
          </button>
        </div>
      ))}
    </div>
  );
};

export default Favorites;