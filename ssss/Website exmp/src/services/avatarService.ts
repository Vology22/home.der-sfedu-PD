import api from './api';

export interface AvatarUploadResponse {
  success: boolean;
  path: string;
  url: string;
  filename: string;
}

class AvatarService {
  private readonly MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly AVATAR_BASE_URL = 'http://localhost:3001/uploads/avatars/';

  private getCurrentTgId(): string {
    const urlParams = new URLSearchParams(window.location.search);
    const tgIdFromUrl = urlParams.get('tg_id');
    if (tgIdFromUrl) {
      console.log('[AvatarService.getCurrentTgId] tg_id из URL:', tgIdFromUrl);
      return tgIdFromUrl;
    }
    
    const storedTgId = localStorage.getItem('tg_id');
    if (storedTgId) {
      console.log('[AvatarService.getCurrentTgId] tg_id из localStorage:', storedTgId);
      return storedTgId;
    }
    
    console.log('[AvatarService.getCurrentTgId] Используем test_user_123');
    return 'test_user_123';
  }

  // Функция для извлечения URL аватара из bio
  private extractAvatarUrlFromBio(bio: string): string | null {
    if (!bio) return null;
    
    // Ищем URL аватара в формате [AVATAR:url]
    const match = bio.match(/\[AVATAR:(.*?)\]/);
    if (match) {
      return match[1];
    }
    return null;
  }

  private updateBioWithAvatar(oldBio: string, avatarUrl: string | null): string {
    // Удаляем старый URL аватара если есть
    let newBio = oldBio.replace(/\[AVATAR:.*?\]/g, '');
    
    // Удаляем лишние переносы строк в начале
    newBio = newBio.replace(/^\n+/, '');
    
    // Добавляем новый URL аватара
    if (avatarUrl) {
      // Добавляем с переносом строки для разделения
      newBio = `[AVATAR:${avatarUrl}]\n\n${newBio}`;
    }
    
    return newBio;
  }
  
  async uploadAvatar(userId: string, file: File): Promise<AvatarUploadResponse> {
    console.log('[AvatarService.uploadAvatar] Начало загрузки:', { userId, fileName: file.name, fileSize: file.size });
    
    if (file.size > this.MAX_AVATAR_SIZE) {
      throw new Error('Размер файла не должен превышать 5MB');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Можно загружать только изображения');
    }

    const tgId = this.getCurrentTgId();
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', tgId);
    console.log('[AvatarService.uploadAvatar] Отправляем tgId для имени файла:', tgId);

    try {
      // Получаем пользователя по tg_id
      console.log('[AvatarService.uploadAvatar] Получаем пользователя по tg_id:', tgId);
      const userResponse = await api.get(`/users/by-tg/${tgId}`);
      const currentUser = userResponse.data;
      
      // Извлекаем старый URL аватара из bio
      const oldAvatarUrl = this.extractAvatarUrlFromBio(currentUser.bio);
      
      console.log('[AvatarService.uploadAvatar] Текущий пользователь ДО загрузки:', { 
        user_id: currentUser.user_id, 
        tg_id: currentUser.tg_id,
        bio: currentUser.bio,
        oldAvatarUrl: oldAvatarUrl
      });
      
      // Загружаем новую аватарку
      console.log('[AvatarService.uploadAvatar] Отправляем запрос на upload-avatar...');
      const uploadResponse = await fetch('http://localhost:3001/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        console.error('[AvatarService.uploadAvatar] Ошибка загрузки:', errorData);
        throw new Error(errorData.error || `Ошибка загрузки: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      console.log('[AvatarService.uploadAvatar] Файл загружен:', uploadData);
      
      // Удаляем старую аватарку, если она была
      if (oldAvatarUrl && oldAvatarUrl.includes('/uploads/avatars/')) {
        const oldFilename = oldAvatarUrl.split('/').pop();
        if (oldFilename && !oldFilename.includes('undefined')) {
          try {
            console.log('[AvatarService.uploadAvatar] Удаляем старую аватарку:', oldFilename);
            await fetch(`http://localhost:3001/api/delete-avatar/${oldFilename}`, {
              method: 'DELETE',
            });
            console.log('[AvatarService.uploadAvatar] Старая аватарка удалена');
          } catch (error) {
            console.error('[AvatarService.uploadAvatar] Ошибка при удалении старой аватарки:', error);
          }
        }
      }
      
      // Обновляем bio, добавляя новый URL аватара
      const newBio = this.updateBioWithAvatar(currentUser.bio || '', uploadData.url);
      
      console.log('[AvatarService.uploadAvatar] Обновляем пользователя в БД с новым bio:', newBio);
      const updateData = {
        full_name: currentUser.full_name,
        bio: newBio,  // В bio добавляем URL аватара
        tg_id: currentUser.tg_id
      };
      console.log('[AvatarService.uploadAvatar] Отправляем данные на бэкенд:', updateData);
      
      const updateResponse = await api.post('/users', updateData);
      console.log('[AvatarService.uploadAvatar] Ответ бэкенда после обновления:', updateResponse.data);
      
      const checkUserResponse = await api.get(`/users/by-tg/${tgId}`);
      console.log('[AvatarService.uploadAvatar] Проверка: пользователь ПОСЛЕ обновления:', checkUserResponse.data);
      
      console.log('[AvatarService.uploadAvatar] Загрузка успешно завершена');
      return {
        success: true,
        path: uploadData.path,
        url: uploadData.url,
        filename: uploadData.filename
      };
      
    } catch (error) {
      console.error('[AvatarService.uploadAvatar] Ошибка:', error);
      throw error;
    }
  }

  async deleteUserAvatar(userId: string): Promise<boolean> {
  console.log('[AvatarService.deleteUserAvatar] Начало удаления аватарки для userId:', userId);
  
  try {
    const tgId = this.getCurrentTgId();
    console.log('[AvatarService.deleteUserAvatar] Текущий tgId:', tgId);
    
    const userResponse = await api.get(`/users/by-tg/${tgId}`);
    const currentUser = userResponse.data;
    
    // Извлекаем URL аватара из bio
    const avatarUrl = this.extractAvatarUrlFromBio(currentUser.bio);
    
    console.log('[AvatarService.deleteUserAvatar] Текущий пользователь ДО удаления:', { 
      user_id: currentUser.user_id, 
      tg_id: currentUser.tg_id,
      bio: currentUser.bio,
      avatarUrl: avatarUrl
    });
    
    let fileDeleted = false;
    
    // Если есть аватарка, удаляем файл
    if (avatarUrl) {
      const filename = avatarUrl.split('/').pop();
      console.log('[AvatarService.deleteUserAvatar] Извлеченное имя файла:', filename);
      console.log('[AvatarService.deleteUserAvatar] Полный URL для DELETE:', `http://localhost:3001/api/delete-avatar/${filename}`);
      
      if (filename && !filename.includes('undefined')) {
        try {
          const deleteResponse = await fetch(`http://localhost:3001/api/delete-avatar/${filename}`, {
            method: 'DELETE',
          });
          
          console.log('[AvatarService.deleteUserAvatar] Статус ответа от сервера аватарок:', deleteResponse.status);
          
          if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            console.error('[AvatarService.deleteUserAvatar] Ошибка удаления файла:', errorText);
            console.error('[AvatarService.deleteUserAvatar] Статус ошибки:', deleteResponse.status);
          } else {
            const result = await deleteResponse.json();
            console.log('[AvatarService.deleteUserAvatar] Файл успешно удален, ответ сервера:', result);
            fileDeleted = true;
          }
        } catch (fetchError) {
          console.error('[AvatarService.deleteUserAvatar] Ошибка при запросе к серверу аватарок:', fetchError);
          // Не прерываем выполнение, продолжаем удаление из БД
        }
      } else {
        console.warn('[AvatarService.deleteUserAvatar] Имя файла некорректно или содержит undefined:', filename);
      }
    } else {
      console.log('[AvatarService.deleteUserAvatar] У пользователя нет аватарки');
    }
    
    // Обновляем bio, удаляя URL аватара
    const newBio = this.updateBioWithAvatar(currentUser.bio || '', null);
    
    console.log('[AvatarService.deleteUserAvatar] Обновляем пользователя в БД');
    console.log('[AvatarService.deleteUserAvatar] Старый bio:', currentUser.bio);
    console.log('[AvatarService.deleteUserAvatar] Новый bio:', newBio);
    
    const updateData = {
      full_name: currentUser.full_name,
      bio: newBio,
      tg_id: currentUser.tg_id
    };
    console.log('[AvatarService.deleteUserAvatar] Отправляем данные на бэкенд:', updateData);
    
    const updateResponse = await api.post('/users', updateData);
    console.log('[AvatarService.deleteUserAvatar] Ответ бэкенда после обновления:', updateResponse.data);
    
    const checkUserResponse = await api.get(`/users/by-tg/${tgId}`);
    console.log('[AvatarService.deleteUserAvatar] Проверка: пользователь ПОСЛЕ обновления:', checkUserResponse.data);
    
    // Проверяем, что метка аватара действительно удалена
    const checkAvatarUrl = this.extractAvatarUrlFromBio(checkUserResponse.data.bio);
    if (checkAvatarUrl) {
      console.warn('[AvatarService.deleteUserAvatar] ВНИМАНИЕ: Метка аватара все еще присутствует в bio!');
    } else {
      console.log('[AvatarService.deleteUserAvatar] Метка аватара успешно удалена из bio');
    }
    
    console.log('[AvatarService.deleteUserAvatar] Удаление успешно завершено');
    return true;
    
  } catch (error) {
    console.error('[AvatarService.deleteUserAvatar] Ошибка:', error);
    return false;
  }
}

  async getUserAvatarUrl(userId: string): Promise<string | null> {
    try {
      console.log('[AvatarService.getUserAvatarUrl] Получение аватарки для userId:', userId);
      const tgId = this.getCurrentTgId();
      const userResponse = await api.get(`/users/by-tg/${tgId}`);
      const user = userResponse.data;
      
      console.log('[AvatarService.getUserAvatarUrl] Получен пользователь:', user);
      
      // Извлекаем URL аватара из bio
      const avatarUrl = this.extractAvatarUrlFromBio(user.bio);
      
      if (avatarUrl) {
        console.log('[AvatarService.getUserAvatarUrl] Найдена аватарка:', avatarUrl);
        if (avatarUrl.startsWith('http')) {
          return avatarUrl;
        }
        return `${this.AVATAR_BASE_URL}${avatarUrl}`;
      }
      console.log('[AvatarService.getUserAvatarUrl] Аватарка не найдена');
      return null;
      
    } catch (error) {
      console.error('[AvatarService.getUserAvatarUrl] Ошибка:', error);
      return null;
    }
  }
}

export const avatarService = new AvatarService();