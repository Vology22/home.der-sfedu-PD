import api from './api';

export interface FavoriteData {
  favorite_id: number;
  user_id: number;
  prop_id: number;
  created_at: string;
}

export interface FavoriteWithProperty extends FavoriteData {
  title?: string;
  price?: number;
  description?: string;
  city?: string;
  image_url?: string;
}

class FavoriteService {
  // Добавить в избранное
  async addToFavorite(userId: number, propId: number): Promise<{ status: string }> {
    try {
      console.log('[FavoriteService] Добавление в избранное:', { userId, propId });
      const response = await api.post('/favorites', { user_id: userId, prop_id: propId });
      console.log('[FavoriteService] Результат:', response.data);
      return response.data;
    } catch (error) {
      console.error('[FavoriteService] Ошибка при добавлении в избранное:', error);
      throw error;
    }
  }

  // Получить все избранные объявления пользователя
  async getUserFavorites(userId: number): Promise<FavoriteWithProperty[]> {
    try {
      console.log('[FavoriteService] Запрос избранного для пользователя:', userId);
      const response = await api.get(`/favorites/user/${userId}`);
      console.log('[FavoriteService] Получено избранных:', response.data.count);
      return response.data.favorites || [];
    } catch (error) {
      console.error('[FavoriteService] Ошибка при получении избранного:', error);
      throw error;
    }
  }

  // Удалить из избранного (если добавите эндпоинт на бэкенде)
  async removeFromFavorite(favoriteId: number): Promise<void> {
    try {
      console.log('[FavoriteService] Удаление из избранного:', favoriteId);
      await api.delete(`/favorites/${favoriteId}`);
    } catch (error) {
      console.error('[FavoriteService] Ошибка при удалении из избранного:', error);
      throw error;
    }
  }
}

export const favoriteService = new FavoriteService();