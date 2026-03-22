export interface User {
  id: string;
  avatar?: string; 
  name: string;
  surname: string;
  patronymic?: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  
  badHabits?: string[];
  pet?: string[];

  hasRoommate: boolean;  
  roommateName?: string;
  
}

export interface UserFormData {
  avatar?: string; 
  name: string;
  surname: string;
  patronymic?: string;
  dateOfBirth: string;
  gender: User['gender'];
  
  badHabits?: string[];
  pet?: string[];

  hasRoommate: boolean;  
  roommateName?: string;
}
