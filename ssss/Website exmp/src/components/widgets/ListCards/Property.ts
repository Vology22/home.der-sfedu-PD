export interface Property {
  prop_id: number;
  owner_id: number;
  image?: string;
  price: number; // Стоимость
  title?: string;
  description?: string;
  square?: string; // Квадратура (может быть в description или отдельно)
  city?: string;
  created_at?: string;
}

export interface PropertyFormData {
  owner_id: number;
  image: string;
  price: number;
  title: string;
  description: string;
  city: string;
}