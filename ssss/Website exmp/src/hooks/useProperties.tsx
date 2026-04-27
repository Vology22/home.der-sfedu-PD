import { useState, useCallback, useEffect, useRef } from 'react';
import { Property } from '../components/widgets/ListCards/Property';
import { propertyService, PropertyData } from '../services/propertyService';
import { getTgId } from '../utils/tg.utils';
import { userService } from '../services/userService';
import { useFilters } from '../contexts/FilterContext';

const mapBackendToFrontendProperty = (propertyData: PropertyData): Property => {
    console.log('[mapBackendToFrontendProperty] Маппинг:', propertyData);

    // Парсим description, если там хранятся дополнительные поля
    let square = '';
    if (propertyData.description) {
        const squareMatch = propertyData.description.match(/квадратура[:\s]+(\d+)/i);
        if (squareMatch) square = `${squareMatch[1]} м²`;
    }
  
    const mapped = {
      prop_id: propertyData.prop_id,
      owner_id: propertyData.owner_id,
      image: `/api/v1/properties/${propertyData.prop_id}/image`, 
      price: propertyData.price || 0,
      title: propertyData.title || `Объявление #${propertyData.prop_id}`,
      description: propertyData.description,
      square: square || 'не указано',
      city: propertyData.city || 'город не указан',
      created_at: propertyData.created_at
    };

    console.log('[mapFavoriteToProperty] Результат маппинга:', mapped);
    return mapped;
};

// Функция для фильтрации (пока по цене, площади и городу)
const applyFiltersToProperties = (
  properties: PropertyData[], 
  filters: { minPrice?: number; maxPrice?: number; minSquare?: number; maxSquare?: number; city?: string }
): PropertyData[] => {
  return properties.filter(prop => {
    // Фильтр по цене
    if (filters.minPrice !== undefined && (prop.price === undefined || prop.price < filters.minPrice)) return false;
    if (filters.maxPrice !== undefined && (prop.price === undefined || prop.price > filters.maxPrice)) return false;
    
    // Фильтр по городу
    if (filters.city && !prop.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
    
    // Фильтр по площади (парсим из description)
    let squareValue: number | null = null;
    if (prop.description) {
      const squareMatch = prop.description.match(/квадратура[:\s]+(\d+)/i);
      if (squareMatch) squareValue = parseInt(squareMatch[1], 10);
    }
    
    if (filters.minSquare !== undefined && (squareValue === null || squareValue < filters.minSquare)) return false;
    if (filters.maxSquare !== undefined && (squareValue === null || squareValue > filters.maxSquare)) return false;
    
    return true;
  });
};

export const useProperties = () => {
  console.log('[useProperties] Хук инициализирован');
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allViewed, setAllViewed] = useState<boolean>(false); // Новый стейт: все ли объявления просмотрены
  const [dislikedId, setDislikedId] = useState<Set<number>>(new Set()); // Отслеживаем просмотренные индексы
  const [excludedIds, setExcludedIds] = useState<number[]>([]);

  const { filters } = useFilters();

  const favoritesRef = useRef<Property[]>([]);

  // Функция для обновления favorites извне
  const setFavoritesRef = useCallback((newFavorites: Property[]) => {
    console.log('[useProperties] Обновление favoritesRef:', newFavorites.map(f => f.prop_id));
    favoritesRef.current = newFavorites;
  }, []);

  const fetchProperties = useCallback(async () => {
    console.log('[fetchProperties] === НАЧАЛО ЗАГРУЗКИ ОБЪЯВЛЕНИЙ ===');
    console.log('[fetchProperties] Применяемые фильтры:', filters);

    try {
      setLoading(true);
      setError(null);
      setAllViewed(false); // Сбрасываем состояние при новой загрузке
      setDislikedId(new Set()); // Сбрасываем просмотренные индексы
      
      const tgId = getTgId();
      console.log('[fetchProperties] tg_id:', tgId);
      
      // Сначала получаем пользователя, чтобы узнать user_id
      const user = await userService.getUserByTgId(tgId);
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      console.log('[fetchProperties] Запрос объявлений...');
      const propertiesData = await propertyService.getProperties(100, 0);
      console.log('[fetchProperties] Получено объявлений ДО фильтрации:', propertiesData.length);
      console.log('[fetchProperties] ID объявлений пользователя:', user.user_id);
      console.log('[fetchProperties] Лайкнутые prop_id:', favoritesRef.current.map(f => f.prop_id));
      
      // Фильтрация объявлений (исключаем свои и лайкнутые)
      let filteredProperties = propertiesData.filter(p => {
        const isLiked = favoritesRef.current.some(fav => fav.prop_id === p.prop_id);
        
        if (p.owner_id === user.user_id) {
          console.log(`[fetchProperties] Исключаем свое объявление: ${p.prop_id}`);
          return false;
        }
        if (isLiked) {
          console.log(`[fetchProperties] Исключаем лайкнутое объявление: ${p.prop_id}`);
          return false;
        }
        if (excludedIds.includes(p.prop_id)) {
          console.log('[fetchProperties] Исключаем (blacklist):', p.prop_id);
          return false;
        }
        
        return true;
      });
      
      // 2. Применяем остальные фильтры (цена, площадь, город)
      filteredProperties = applyFiltersToProperties(filteredProperties, filters);
      console.log('[fetchProperties] После всех фильтров:', filteredProperties.length);
     
      const mappedProperties = filteredProperties.map(mapBackendToFrontendProperty);
      console.log('[fetchProperties] После маппинга:', mappedProperties.length);
      
      setProperties(mappedProperties);
      setCurrentIndex(0);

    } catch (err) {
      console.error('[fetchProperties] Ошибка:', err);
      setError("Ошибка при загрузке объявлений");
    } finally {
      setLoading(false);
    }
  }, [filters, excludedIds]);

  // Функция для перезапуска просмотра
  const restartViewing = useCallback(() => {
    setCurrentIndex(0);
    setDislikedId(new Set()); // Сбрасываем дизлайки при перезапуске
    setAllViewed(false);
  }, []);

  //Добавляем в просмотренные
  const addCurrentToDisliked = useCallback(() => {
    if (!currentProperty) return;
    
    // Добавляем в дизлайкнутые
    setDislikedId(prev => new Set(prev).add(currentProperty.prop_id));
  }, [currentIndex]);

  const removePropertyById = useCallback((propId: number) => {
    console.log('[removePropertyById] Вызвана с propId:', propId);

    setProperties(prev => {
      console.log('[removePropertyById] ДО:', prev.map(p => p.prop_id));
      const updated = prev.filter(p => p.prop_id !== propId);
      console.log('[removePropertyById] ПОСЛЕ:', updated.map(p => p.prop_id));
      return updated;
    });

    setExcludedIds(prev => [...prev, propId]);
  }, []);

  const nextProperty = useCallback(() => {
    if (properties.length === 0) {
      setAllViewed(true);
      return;
    }

    // Переключаем на следующий индекс
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= properties.length) {
      // Дошли до конца массива
      setAllViewed(true);
      return;
    }
    
    setCurrentIndex(nextIndex);
  }, [currentIndex, properties, dislikedId]);

  // Обновляем объявления
  useEffect(() => {
    fetchProperties();
  }, [filters, excludedIds]);

  const currentProperty = properties[currentIndex];

  return {
    properties,
    currentProperty,
    currentIndex,
    totalCount: properties.length,
    loading,
    error,
    fetchProperties,
    nextProperty,
    allViewed, 
    restartViewing,
    addCurrentToDisliked, 
    removePropertyById,
    setFavoritesRef,
    
  };
};