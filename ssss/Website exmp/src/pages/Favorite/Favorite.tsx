import { useFavorites } from '../../hooks/useFavorites';
import { Button, Skeleton } from '../../components/ui';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import styles from './Favorites.module.scss';
import { useState } from 'react';

const Favorites = () => {
  const { favorites, loading, error, removeFromFavorite } = useFavorites();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleRemoveFromFavorites = async (propId: number) => {
    await removeFromFavorite(propId);
  };

  const handleImageError = (propId: number) => {
    setImageErrors(prev => ({ ...prev, [propId]: true }));
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.favorites}>
          <div className={styles.list}>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.card}>
                <Skeleton height={200} width={250} />
                <div style={{ flex: 1 }}>
                  <Skeleton count={3} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.favorites}>
          <div className={styles.error}>
            <p>Ошибка: {error}</p>
            <Button onClickAdditional={() => window.location.reload()}>
              Попробовать снова
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.favorites}>
          <div className={styles.empty}>
            <IoMdHeartEmpty />
            <p>У вас пока нет понравившихся объявлений</p>
            <p className={styles.emptyHint}>
              Листайте карточки и нажимайте ❤️, чтобы добавить сюда
            </p>
          </div>
        </div>
      </div>
    );
  }

   return (
    <div className={styles.favorites}>
    <div className={styles.list}>
        {favorites.map(property => (
        <div key={property.prop_id} className={styles.card}>
            <div className={styles.imageContainer}>
            <img
                src={imageErrors[property.prop_id] ? '/placeholder-image.jpg' : property.image}
                alt={property.title || 'Недвижимость'}
                className={styles.card_image}
                onError={() => handleImageError(property.prop_id)}
            />
            <button
                className={styles.favoriteButton}
                onClick={() => handleRemoveFromFavorites(property.prop_id)}
                title="Удалить из избранного"
            >
                <IoMdHeart className={styles.filledHeart} />
            </button>
            </div>
        <p className={styles.card_cost}>{property.price.toLocaleString('ru-RU')} ₽</p>
        <p>{property.square}</p>
        <p>{property.city || 'Город не указан'}</p>
            <div className={styles.card_description}>
            <p>{property.title || 'Объявление'}</p>
                {property.description?.slice(0, 100)}
                {property.description && property.description.length > 100 ? '...' : ''}
            </div>
        </div>
        ))}
    </div>
    </div>
  );
};

export default Favorites;