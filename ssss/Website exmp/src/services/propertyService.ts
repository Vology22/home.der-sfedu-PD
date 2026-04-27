import api from './api';

export interface PropertyData {
  prop_id: number;
  owner_id: number;
  price?: number;
  title?: string;
  description?: string;
  city?: string;
  created_at?: string;
}

export interface CreatePropertyData {
  owner_id: number;
  price: number;
  title: string;
  description: string;
  city: string;
}

class PropertyService {
  async getProperties(limit: number = 50, offset: number = 0): Promise<PropertyData[]> {
    try {
      console.log('[PropertyService] Запрос объявлений:', { limit, offset });
      const response = await api.get('/properties', { params: { limit, offset } });
      console.log('[PropertyService] Получено объявлений:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('[PropertyService] Ошибка при получении объявлений:', error);
      throw error;
    }
  }

  async getPropertyById(propId: number): Promise<PropertyData> {
    try {
      console.log('[PropertyService] Запрос объявления:', propId);
      const response = await api.get(`/properties/${propId}`);
      return response.data;
    } catch (error) {
      console.error('[PropertyService] Ошибка при получении объявления:', error);
      throw error;
    }
  }

  async createProperty(propertyData: CreatePropertyData): Promise<PropertyData> {
    console.log('[PropertyService] Создание объявления:', propertyData);
    const response = await api.post('/properties', propertyData);
    return response.data;
  }
}

export const propertyService = new PropertyService();