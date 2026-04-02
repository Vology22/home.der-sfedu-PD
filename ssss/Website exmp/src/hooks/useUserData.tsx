import { useState, useCallback, useEffect } from 'react';
import { User, UserFormData } from '../pages/Profile/User';
import { userService, UserData } from '../services/userService';
import { avatarService } from '../services/avatarService';

const getTgId = (): string => {
  console.log('[getTgId] Начало получения tg_id');
  const urlParams = new URLSearchParams(window.location.search);
  const tgId = urlParams.get('tg_id');
  if (tgId) {
    console.log('[getTgId] tg_id из URL:', tgId);
    return tgId;
  }
  
  const storedTgId = localStorage.getItem('tg_id');
  if (storedTgId) {
    console.log('[getTgId] tg_id из localStorage:', storedTgId);
    return storedTgId;
  }
  
  console.log('[getTgId] Используем test_user_123');
  return 'test_user_123';
};

const mapBackendToFrontendUser = (
  userData: UserData, 
  avatarUrl: string | null
): User => {
  console.log('[mapBackendToFrontendUser] Начало маппинга:', { userData, avatarUrl });
  
  if (!userData) {
    return {
      id: '',
      avatar: undefined,
      name: '',
      surname: '',
      patronymic: '',
      dateOfBirth: '',
      gender: 'male',
      badHabits: 'no',
      pet: 'no',
      hasRoommate: 'no',
    };
  }
  
  const nameParts = userData.full_name?.split(' ') || [];
  console.log('[mapBackendToFrontendUser] Разбитое имя:', nameParts);
  
  return {
    id: String(userData.user_id || ''),
    avatar: avatarUrl || undefined,
    name: nameParts[1] || '',
    surname: nameParts[0] || '',
    patronymic: nameParts[2] || '',
    dateOfBirth: '',
    gender: 'male',
    badHabits: 'no',
    pet: 'no',
    hasRoommate: 'no',
  };
};

const mapFrontendToBackendData = (userData: UserFormData, avatarFilename?: string | null): { 
  full_name: string; 
  bio: string;
  avatar?: string | null;
} => {
  console.log('[mapFrontendToBackendData] Начало маппинга данных формы:', { userData, avatarFilename });
  
  const fullNameParts = [userData.surname, userData.name];
  if (userData.patronymic) {
    fullNameParts.push(userData.patronymic);
  }
  const fullName = fullNameParts.join(' ');
  console.log('[mapFrontendToBackendData] Полное имя:', fullName);
  
  const bioParts = [];
  
  if (userData.dateOfBirth) {
    bioParts.push(`Дата рождения: ${userData.dateOfBirth}`);
  }
  
  bioParts.push(`Пол: ${userData.gender === 'male' ? 'Мужской' : 'Женский'}`);
  bioParts.push(`Вредные привычки: ${userData.badHabits === 'yes' ? 'Есть' : 'Нет'}`);
  bioParts.push(`Домашние животные: ${userData.pet === 'yes' ? 'Есть' : 'Нет'}`);
  bioParts.push(`Готов(а) к соседству: ${userData.hasRoommate === 'yes' ? 'Да' : 'Нет'}`);
  
  const bio = bioParts.join('; ');
  console.log('[mapFrontendToBackendData] Сформированное bio:', bio);
  
  const result = { 
    full_name: fullName, 
    bio,
    avatar: avatarFilename
  };
  
  console.log('[mapFrontendToBackendData] Результат маппинга:', result);
  return result;
};

export const useUserData = () => {
  console.log('[useUserData] Хук инициализирован');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    console.log('[fetchUser] === НАЧАЛО ЗАГРУЗКИ ПОЛЬЗОВАТЕЛЯ ===');
    try {
      setLoading(true);
      setError(null);
      
      const tgId = getTgId();
      console.log('[fetchUser] Шаг 1: Получен tg_id:', tgId);
      
      console.log('[fetchUser] Шаг 2: Запрос пользователя из БД...');
      let userData: UserData | null = await userService.getUserByTgId(tgId);
      console.log('[fetchUser] Шаг 2: Ответ от userService.getUserByTgId:', userData);
      
      if (!userData) {
        console.log('[fetchUser] Шаг 3: Пользователь не найден, создаем нового...');
        userData = await userService.createOrUpdateUser({
          full_name: 'Новый пользователь',
          tg_id: tgId,
          bio: '',
          avatar: null
        });
        console.log('[fetchUser] Шаг 3: Создан новый пользователь:', userData);
      } else {
        console.log('[fetchUser] Шаг 3: Пользователь найден:', userData);
      }
      
      console.log('[fetchUser] Шаг 4: Получение URL аватарки...');
      let avatarUrl: string | null = null;
      if (userData.avatar) {
        avatarUrl = `http://localhost:3001/uploads/avatars/${userData.avatar}`;
        console.log('[fetchUser] Шаг 4: Аватарка найдена в userData, URL:', avatarUrl);
      } else {
        console.log('[fetchUser] Шаг 4: Аватарка не в userData, запрашиваем через avatarService...');
        avatarUrl = await avatarService.getUserAvatarUrl(String(userData.user_id));
        console.log('[fetchUser] Шаг 4: avatarService вернул:', avatarUrl);
      }
      
      console.log('[fetchUser] Шаг 5: Маппинг бэкенд-данных во фронтенд-формат...');
      const mappedUser = mapBackendToFrontendUser(userData, avatarUrl);
      console.log('[fetchUser] Шаг 5: После маппинга:', mappedUser);
      
      // Парсим bio если есть
      if (userData.bio && userData.bio.includes(';')) {
        console.log('[fetchUser] Шаг 6: Парсим bio:', userData.bio);
        const bioParts = userData.bio.split(';').reduce((acc, part) => {
          const [key, value] = part.split(':').map(s => s.trim());
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        console.log('[fetchUser] Шаг 6: Разобранные части bio:', bioParts);
        
        if (bioParts['Дата рождения']) {
          mappedUser.dateOfBirth = bioParts['Дата рождения'];
          console.log('[fetchUser] Шаг 6: Установлена дата рождения:', mappedUser.dateOfBirth);
        }
        if (bioParts['Пол']) {
          mappedUser.gender = bioParts['Пол'] === 'Мужской' ? 'male' : 'female';
          console.log('[fetchUser] Шаг 6: Установлен пол:', mappedUser.gender);
        }
        if (bioParts['Вредные привычки']) {
          mappedUser.badHabits = bioParts['Вредные привычки'] === 'Есть' ? 'yes' : 'no';
          console.log('[fetchUser] Шаг 6: Установлены вредные привычки:', mappedUser.badHabits);
        }
        if (bioParts['Домашние животные']) {
          mappedUser.pet = bioParts['Домашние животные'] === 'Есть' ? 'yes' : 'no';
          console.log('[fetchUser] Шаг 6: Установлены животные:', mappedUser.pet);
        }
        if (bioParts['Готов(а) к соседству']) {
          mappedUser.hasRoommate = bioParts['Готов(а) к соседству'] === 'Да' ? 'yes' : 'no';
          console.log('[fetchUser] Шаг 6: Установлена готовность к соседству:', mappedUser.hasRoommate);
        }
      } else {
        console.log('[fetchUser] Шаг 6: bio не содержит ";" или пуст, пропускаем парсинг');
      }
      
      console.log('[fetchUser] Шаг 7: Финальный пользователь перед сохранением в state:', mappedUser);
      setUser(mappedUser);
      console.log('[fetchUser] === ЗАГРУЗКА УСПЕШНО ЗАВЕРШЕНА ===');
      
    } catch (err) {
      console.error('[fetchUser] === ОШИБКА ПРИ ЗАГРУЗКЕ ПОЛЬЗОВАТЕЛЯ ===');
      console.error('[fetchUser] Детали ошибки:', err);
      if (err instanceof Error) {
        console.error('[fetchUser] Сообщение ошибки:', err.message);
        console.error('[fetchUser] Стек ошибки:', err.stack);
      }
      setError("Ошибка при загрузке данных пользователя");
    } finally {
      setLoading(false);
      console.log('[fetchUser] loading установлен в false');
    }
  }, []);

  const updateUser = useCallback(async (userData: UserFormData): Promise<boolean> => {
    console.log('[updateUser] === НАЧАЛО ОБНОВЛЕНИЯ ПОЛЬЗОВАТЕЛЯ ===');
    console.log('[updateUser] Данные формы для обновления:', userData);
    
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        console.error('[updateUser] Ошибка: пользователь не найден в state');
        throw new Error('Пользователь не найден');
      }
      
      console.log('[updateUser] Текущий пользователь из state:', user);

      let avatarFilename: string | null = null;
      let newAvatarUrl: string | undefined = userData.avatar;
      
      console.log('[updateUser] Шаг 1: Обработка аватарки...');
      console.log('[updateUser] userData.avatar:', userData.avatar);
      
      // Обработка аватарки
      if (userData.avatar !== undefined) {
        // Если загружена новая аватарка (base64)
        if (userData.avatar && userData.avatar.startsWith('data:image')) {
          console.log('[updateUser] Обнаружена новая аватарка в base64, загружаем...');

          if (!user.id || user.id === 'undefined') {
            console.error('[updateUser] Ошибка: user.id невалиден!');
            throw new Error('ID пользователя невалиден');
          }

          const blob = await fetch(userData.avatar).then(res => res.blob());
          const file = new File([blob], 'avatar.jpg', { type: blob.type });
          console.log('[updateUser] Создан файл для загрузки:', { name: file.name, size: file.size, type: file.type });
          console.log('[updateUser] user.id для загрузки аватарки:', user.id);
          
          const uploadResult = await avatarService.uploadAvatar(String(user.id), file);
          
          console.log('[updateUser] Вызываем uploadAvatar с userId:', user.id, 'и file:', file.name);
          console.log('[updateUser] Результат загрузки аватарки:', uploadResult);
          avatarFilename = uploadResult.filename;
          newAvatarUrl = uploadResult.url;
        } 
        // Если аватарка удалена
        else if (userData.avatar === undefined) {
          console.log('[updateUser] Аватарка удалена, удаляем файл...');
          await avatarService.deleteUserAvatar(String(user.id));
          avatarFilename = null;
          newAvatarUrl = undefined;
          console.log('[updateUser] Аватарка удалена');
        }
        // Если аватарка не менялась, берем существующую
        else if (user.avatar) {
          console.log('[updateUser] Аватарка не менялась, используем существующую:', user.avatar);
          const match = user.avatar.match(/avatars\/(.+)$/);
          avatarFilename = match ? match[1] : null;
          console.log('[updateUser] Извлеченное имя файла:', avatarFilename);
        }
      } else {
        console.log('[updateUser] userData.avatar === undefined, пропускаем обработку аватарки');
      }

      console.log('[updateUser] Шаг 2: Маппинг данных в бэкенд-формат...');
      const backendData = mapFrontendToBackendData(userData, avatarFilename);
      const tgId = getTgId();
      console.log('[updateUser] Данные для отправки на бэкенд:', { backendData, tgId });

      console.log('[updateUser] Шаг 3: Отправка запроса на обновление пользователя...');
      const updatedUser = await userService.createOrUpdateUser({
        full_name: backendData.full_name,
        bio: backendData.bio,
        tg_id: tgId,
        avatar: backendData.avatar
      });
      console.log('[updateUser] Ответ от сервера:', updatedUser);

      console.log('[updateUser] Шаг 4: Обновление локального state...');
      setUser(prev => {
        if (!prev) return null;
        const newUser = { 
          ...prev,
          avatar: newAvatarUrl !== undefined ? newAvatarUrl : prev.avatar,
          name: userData.name.trim(),
          surname: userData.surname.trim(),
          patronymic: userData.patronymic?.trim() || '',
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          badHabits: userData.badHabits,
          pet: userData.pet,
          hasRoommate: userData.hasRoommate,
        };
        console.log('[updateUser] Обновленный пользователь в state:', newUser);
        return newUser;
      });
      
      console.log('[updateUser] === ОБНОВЛЕНИЕ УСПЕШНО ЗАВЕРШЕНО ===');
      return true;

    } catch (err) {
      console.error('[updateUser] === ОШИБКА ПРИ ОБНОВЛЕНИИ ПОЛЬЗОВАТЕЛЯ ===');
      console.error('[updateUser] Детали ошибки:', err);
      if (err instanceof Error) {
        console.error('[updateUser] Сообщение ошибки:', err.message);
        console.error('[updateUser] Стек ошибки:', err.stack);
      }
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении данных');
      return false;
    } finally {
      setLoading(false);
      console.log('[updateUser] loading установлен в false');
    }
  }, [user]);

  useEffect(() => {
    console.log('[useUserData] useEffect сработал, вызываем fetchUser');
    fetchUser();
  }, [fetchUser]);

  console.log('[useUserData] Хук возвращает:', { user, loading, error });

  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser,
  };
};