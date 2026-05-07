import { useState, useCallback, useEffect } from 'react';
import { User } from '../pages/Profile/User';
import { userService, UserData } from '../services/userService';
import { getTgId } from '../utils/tg.utils';

const mapBackendToFrontendUser = (
  userData: UserData, 
): User => {
  console.log('[mapBackendToFrontendUser] Начало маппинга:', { userData });
  
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
    avatar: userData.avatar || undefined,
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
      
      console.log('[fetchUser] Шаг 4: Получение URL аватарки из поля avatar...');
      const avatarUrl = userData.avatar || null;
      console.log('[fetchUser] Шаг 4: avatar из БД:', avatarUrl);
      
      console.log('[fetchUser] Шаг 5: Маппинг бэкенд-данных во фронтенд-формат...');
      const mappedUser = mapBackendToFrontendUser(userData);
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
  };
};