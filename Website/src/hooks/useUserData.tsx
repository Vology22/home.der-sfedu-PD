import { useState, useCallback } from 'react';
import { User, UserFormData } from '../pages/Profile/User';
import {UserData } from '../pages/Profile/UserData.static';

export const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных пользователя 
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ждем типо с базы данных
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(UserData);
      
    } catch (err) {
      setError("Ошибка при загрузке данных пользователя");
    } finally {
      setLoading(false);
    }
  },[]);

  const updateUser = useCallback (async (userData: UserFormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await new Promise(resolve => setTimeout(resolve, 500));

      setUser(prev => prev ? { 
        ...prev, 
        avatar: userData.avatar,
        name: userData.name.trim(),
        dateOfBirth: userData.dateOfBirth,
        surname: userData.surname,
        patronymic: userData.patronymic,
        gender: userData.gender,
        badHabits: userData.badHabits,
        pet: userData.pet,
        hasRoommate: userData.hasRoommate,
      } : null);
      
      setError('');
      return true;

    } catch (err) {
      setError('Ошибка при обновлении данных');
      return false;
    } finally {
      setLoading(false);
    }
  },[setUser, setLoading, setError]);

  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser,
  };
};