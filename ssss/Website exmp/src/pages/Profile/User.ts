export interface User {
  id: string;
  avatar?: string; 
  name: string;
  surname: string;
  patronymic?: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  
  badHabits: 'yes' | 'no';
  pet: 'yes' | 'no';

  hasRoommate: 'yes' | 'no';
}

export interface UserFormData {
  avatar?: string; 
  name: string;
  surname: string;
  patronymic?: string;
  dateOfBirth: string;
  gender: User['gender'];
  
  badHabits: User['badHabits'];  
  pet: User['pet'];  

  hasRoommate: User['hasRoommate'];  
}
