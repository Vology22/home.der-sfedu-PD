import { useState, useCallback, useEffect } from 'react';
import { Property } from '../components/widgets//ListCards/Property';
import { favoriteService, FavoriteWithProperty } from '../services/favoriteService';
import { userService } from '../services/userService';
import { getTgId } from '../utils/tg.utils';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Маппинг избранного в формат Property
  const mapFavoriteToProperty = (favorite: FavoriteWithProperty): Property => {

    console.log('[mapFavoriteToProperty] Входящий favorite:', favorite);
    // Парсим квадратуру из description
    let square = '';
    if (favorite.description) {
      const squareMatch = favorite.description.match(/(\d+)\s*кв\.?м/i);
      if (squareMatch) square = `${squareMatch[1]} м²`;
    }

    const mapped = {
      prop_id: favorite.prop_id,
      owner_id: 0,
      image: favorite.image_url,
      price: favorite.price || 0,
      title: favorite.title,
      description: favorite.description,
      square: square,
      city: favorite.city,
      created_at: favorite.created_at,
    };
    
    console.log('[mapFavoriteToProperty] Результат маппинга:', mapped);
    return mapped;
  };

  // Загрузить избранное
  const fetchFavorites = useCallback(async () => {
    console.log('[useFavorites] === НАЧАЛО ЗАГРУЗКИ ИЗБРАННОГО ===');
    try {
      setLoading(true);
      setError(null);

      const tgId = getTgId();
      console.log('[useFavorites] tg_id:', tgId);

      const user = await userService.getUserByTgId(tgId);
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      console.log('[useFavorites] user_id:', user.user_id);

      const favoritesData = await favoriteService.getUserFavorites(user.user_id);
      console.log('[useFavorites] Получено избранных объявлений:', favoritesData.length);

      const mappedFavorites = favoritesData.map(mapFavoriteToProperty);
      console.log('[useFavorites] После маппинга:', mappedFavorites.length);

      setFavorites(mappedFavorites);
      setLoading(false);
    } catch (err) {
      console.error('[useFavorites] Ошибка:', err);
      setError('Не удалось загрузить избранное');
    }
  }, []);

  // Добавить в избранное
  const addToFavorite = useCallback(async (property: Property): Promise<boolean> => {
    try {
      const tgId = getTgId();
      const user = await userService.getUserByTgId(tgId);
      
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      await favoriteService.addToFavorite(user.user_id, property.prop_id);
      console.log('[useFavorites] Добавлено в избранное:', property.prop_id);
      
      // Обновляем список избранного
      setFavorites(prev => [...prev, property]);
      return true;
    } catch (err) {
      console.error('[useFavorites] Ошибка при добавлении:', err);
      return false;
    }
  }, [fetchFavorites]);

// Удалить из избранного
  const removeFromFavorite = useCallback(async (propId: number): Promise<boolean> => {
    try {
      // DELETE

      // Пока просто обновляем локально
      setFavorites(prev => prev.filter(f => f.prop_id !== propId));
      return true;
    } catch (err) {
      console.error('[useFavorites] Ошибка при удалении:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const syncFavorites = useCallback(async () => {
      console.log('[useFavorites] Принудительная синхронизация');
      const tgId = getTgId();
      const user = await userService.getUserByTgId(tgId);
      if (!user) {
        throw new Error('Пользователь не найден');
      }
      const favoritesData = await favoriteService.getUserFavorites(user.user_id);
      const mappedFavorites = favoritesData.map(mapFavoriteToProperty);
      setFavorites(mappedFavorites);
      return mappedFavorites;
    }, []);

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    addToFavorite,
    removeFromFavorite,
    favoritesLoading: loading,
    syncFavorites
  };
};