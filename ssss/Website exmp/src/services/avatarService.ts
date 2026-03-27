import api from './api';

export interface AvatarUploadResponse {
  success: boolean;
  path: string;
  url: string;
  filename: string;
}

class AvatarService {
  private readonly MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly AVATAR_BASE_URL = 'http://localhost:8000/uploads/avatars/'; // URL для доступа к файлам

  /**
   * Загрузка аватарки на сервер и сохранение пути в БД
   */
  async uploadAvatar(userId: string, file: File): Promise<AvatarUploadResponse> {
    // Валидация размера
    if (file.size > this.MAX_AVATAR_SIZE) {
      throw new Error('Размер файла не должен превышать 5MB');
    }

    // Валидация типа файла
    if (!file.type.startsWith('image/')) {
      throw new Error('Можно загружать только изображения');
    }

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('user_id', userId);

    try {
      // 🔴 ШАГ 1: Загружаем файл на сервер
      const uploadResponse = await fetch('http://localhost:8000/api/upload-avatar', {
        method: 'POST',
        headers: {
          'X-API-Key': import.meta.env.VITE_API_KEY || 'homeder-service-key',
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Ошибка загрузки: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      
      // 🔴 ШАГ 2: Обновляем путь к аватарке в базе данных через API пользователя
      // Сначала получаем текущего пользователя
      const tgId = this.getCurrentTgId();
      const userResponse = await api.get(`/users/by-tg/${tgId}`);
      const currentUser = userResponse.data;
      
      // Обновляем пользователя с новым avatar
      await api.post('/users', {
        full_name: currentUser.full_name,
        bio: currentUser.bio,
        tg_id: tgId,
        avatar: uploadData.filename // Сохраняем только имя файла
      });
      
      return {
        success: true,
        path: uploadData.path,
        url: uploadData.url,
        filename: uploadData.filename
      };
      
    } catch (error) {
      console.error('Ошибка при загрузке аватарки:', error);
      throw error;
    }
  }

  /**
   * Удаление аватарки пользователя
   */
  async deleteUserAvatar(_userId: string): Promise<boolean> {
    try {
      // 🔴 ШАГ 1: Получаем текущего пользователя, чтобы узнать имя файла
      const tgId = this.getCurrentTgId();
      const userResponse = await api.get(`/users/by-tg/${tgId}`);
      const currentUser = userResponse.data;
      
      // Если есть аватарка, удаляем файл
      if (currentUser.avatar) {
        await fetch(`http://localhost:8000/api/delete-avatar/${currentUser.avatar}`, {
          method: 'DELETE',
          headers: {
            'X-API-Key': import.meta.env.VITE_API_KEY || 'homeder-service-key',
          },
        });
      }
      
      // 🔴 ШАГ 2: Обновляем пользователя, убирая avatar
      await api.post('/users', {
        full_name: currentUser.full_name,
        bio: currentUser.bio,
        tg_id: tgId,
        avatar: null // Удаляем путь к аватарке
      });
      
      return true;
      
    } catch (error) {
      console.error('Ошибка при удалении аватарки:', error);
      return false;
    }
  }

  /**
   * Получение URL аватарки пользователя
   */
  async getUserAvatarUrl(_userId: string): Promise<string | null> {
    try {
      const tgId = this.getCurrentTgId();
      const userResponse = await api.get(`/users/by-tg/${tgId}`);
      const user = userResponse.data;
      
      if (user.avatar) {
        return `${this.AVATAR_BASE_URL}${user.avatar}`;
      }
      return null;
      
    } catch (error) {
      console.error('Ошибка при получении аватарки:', error);
      return null;
    }
  }

  /**
   * Получение текущего tg_id (нужно определить откуда он берется)
   */
  private getCurrentTgId(): string {
    const urlParams = new URLSearchParams(window.location.search);
    const tgId = urlParams.get('tg_id');
    if (tgId) return tgId;
    
    const storedTgId = localStorage.getItem('tg_id');
    if (storedTgId) return storedTgId;
    
    return 'demo_user_123';
  }
}

export const avatarService = new AvatarService();