import { useForm } from 'react-hook-form';
import { useEffect, useState, useRef } from 'react';
import { useUserData } from '../../hooks/useUserData';
import styles from './Profile.module.scss';
import { Button } from "../../components/ui";
import { UserFormData } from './User';
import { avatarService } from '../../services/avatarService';

const Profile = () => {
  const { user, loading, error, fetchUser, updateUser } = useUserData();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarDeleted, setIsAvatarDeleted] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty, isValid }
  } = useForm<UserFormData>({
    mode: 'onChange', 
    defaultValues: {
      avatar: undefined,
      name: '',
      surname: '',
      patronymic: '',
      dateOfBirth: '',
      gender: 'male',
      badHabits: 'no',
      pet: 'no',
      hasRoommate: 'no',  
    }
  });

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user && !isEditing) {
      setValue('name', user.name, { shouldDirty: false });
      setValue('surname', user.surname, { shouldDirty: false });
      setValue('patronymic', user.patronymic, { shouldDirty: false });
      setValue('dateOfBirth', user.dateOfBirth, { shouldDirty: false });
      setValue('gender', user.gender, { shouldDirty: false });
      setValue('badHabits', user.badHabits, { shouldDirty: false });
      setValue('pet', user.pet, { shouldDirty: false });
      setValue('hasRoommate', user.hasRoommate, { shouldDirty: false });

      setAvatarPreview(null);
      setIsAvatarDeleted(false); 
    }
  }, [user, setValue, isEditing]);

  //Получаем инициалы, если аватара нет
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  //Изменение аватара
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Простая валидация
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл не должен превышать 5 МБ');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Можно загружать только изображения');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setAvatarPreview(base64);                       
      setValue('avatar', base64, { shouldDirty: true }); 
      setIsAvatarDeleted(false); 
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatar = () => {
    if (!user) return;
    if (!user.avatar && !avatarPreview) return;
    
    // Только локально помечаем, что аватар нужно удалить
    setAvatarPreview(null);
    setValue('avatar', undefined, { shouldDirty: true });
    setIsAvatarDeleted(true);
    
    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    if (user) {
      reset({
        avatar: user.avatar,
        name: user.name,
        surname: user.surname,
        patronymic: user.patronymic,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,      
        badHabits: user.badHabits,
        pet: user.pet,
        hasRoommate: user.hasRoommate,
      });
      setAvatarPreview(null); 
      setIsAvatarDeleted(false);
    }
    setIsEditing(false);
  };

  const onSubmit = async (data: UserFormData) => {
    // Если пользователь удалил аватарку (avatarPreview === null и data.avatar === undefined)
    if (isAvatarDeleted && user?.avatar) {
      try {
        // Удаляем аватарку на сервере
        await avatarService.deleteUserAvatar(user.id);
        data.avatar = undefined;
      } catch (error) {
        console.error('Ошибка при удалении аватарки:', error);
        alert('Не удалось удалить аватарку');
        return;
      }
    }
  
    const success = await updateUser(data);
    if (success) {
      setIsEditing(false);
      setAvatarPreview(null);
      setIsAvatarDeleted(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getAvatarToShow = () => {
    // В режиме редактирования
    if (isEditing) {
      // Если есть preview (новое выбранное фото) - показываем его
      if (avatarPreview) {
        return avatarPreview;
      }
      // Если фото удалено - показываем инициалы
      if (isAvatarDeleted) {
        return null;
      }
      // Если фото не удалено и нет preview - показываем текущее фото пользователя
      if (user?.avatar) {
        return user.avatar;
      }
      return null;
    }
    

     return user?.avatar || null;
  };

  if (loading && !user) {
    return (
    <div className={styles.wrapper}>
      <div className={styles.profile}>
         <div className={styles.content}>
          <div className={styles.loading}>
            <div className={styles.loading_spinner}></div>
            <div className={styles.loading_text}>Загрузка профиля...</div>
          </div>
        </div>
      </div>
    </div>
   );
  }

  if (error && !user) {
    return (
    <div className={styles.wrapper}>
      <div className={styles.profile}>
        <div className={styles.content}>
          <div className={styles.error}> 
            <div className={styles.error_message}>Ошибка: {error}</div>
            <Button 
              className={styles.error_button}
              onClickAdditional={() => fetchUser()}> Попробовать снова
            </Button>
          </div>
        </div>
      </div>
    </div>
   );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="error-message">Пользователь не найден</div>
      </div>
    );
  }

  const avatarToShow = getAvatarToShow();

  return (
    <div className={styles.wrapper}>
      <div className={styles.profile}>
        {/* Первый прямоугольник - фото профиля */}
        <div className={styles.photo_card}>
          {avatarToShow ? (
            <img src={avatarToShow} alt="Предпросмотр" className={styles.photo_card_image} />
          ) : user.avatar ? (
            <img src={user.avatar} alt={`Аватар ${user.name}`} className={styles.photo_card_image} />
          ) : (
            <div className={styles.photo_card_placeholder}>
              {getInitials(user.name)}
            </div>
          )}
          <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          <Button className={styles.photo_card_c} onClickAdditional={() => fileInputRef.current?.click()} disabled={!isEditing} >
            Нажмите, чтобы изменить фото
          </Button>
          {isEditing && (user.avatar || avatarPreview) && (
          <Button className={styles.photo_card_d} onClickAdditional={handleDeleteAvatar}>
            Удалить фото
          </Button> )}
          <div className={styles.photo_card_verified}>
            ✓ Профиль подтвержден
          </div>
        </div>

        {/* Второй прямоугольник - личная информация */}
        <div className={styles.info_card}>
          <div className={styles.info_card_header}>
            <h2 className={styles.info_card_title}>Личная информация</h2>
            {!isEditing && (
              <Button className={styles.info_card_edit_button} onClickAdditional={handleEdit}>Обновить данные</Button>
            )}
          </div>
          
          {/* Форма с react-hook-form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.info_card_grid}>
              {/* Поле имени */}
              <div className={styles.info_card_item}>
                <span className={styles.info_card_label}>Имя</span>
                {isEditing ? (
                  <div className={styles.input_container}>
                    <input type="text" className={`${styles.info_card_input} ${ errors.name ? styles.input_error : '' }`}
                      placeholder="Введите ваше имя"
                      {...register('name', {
                        required: 'Имя обязательно для заполнения',
                        minLength: {
                          value: 2,
                          message: 'Имя должно содержать минимум 2 символа'
                        },
                        maxLength: {
                          value: 50,
                          message: 'Имя слишком длинное'
                        },
                        pattern: {
                          value: /^[A-Za-zА-Яа-яЁё]+$/,
                          message: 'Имя может содержать только буквы'
                        }
                      })}
                    /> {errors.name && (<span className={styles.error_text}>{errors.name.message}</span>)}
                  </div>
                ) : (<span className={styles.info_card_value}>{user.name}</span>)}
              </div>
              {/* Поле фамилии */}
              <div className={styles.info_card_item}>
                <span className={styles.info_card_label}>Фамилия</span>
                {isEditing ? (
                  <div className={styles.input_container}>
                    <input type="text" className={`${styles.info_card_input} ${ errors.surname ? styles.input_error : '' }`}
                      placeholder="Введите вашу фамилию"
                      {...register('surname', {
                        required: 'Фамилия обязательна для заполнения',
                        minLength: {
                          value: 2,
                          message: 'Фамилия должна содержать минимум 2 символа'
                        },
                        maxLength: {
                          value: 50,
                          message: 'Фамилия слишком длинная'
                        },
                        pattern: {
                          value: /^[A-Za-zА-Яа-яЁё]+$/,
                          message: 'Фамилия может содержать только буквы'
                        }
                      })}
                    /> {errors.surname && (<span className={styles.error_text}>{errors.surname.message}</span>)}
                  </div>
                ) : (<span className={styles.info_card_value}>{user.surname}</span>)}
              </div>
              {/* Поле отчества*/}
              <div className={styles.info_card_item}>
                <span className={styles.info_card_label}>Отчество</span>
                {isEditing ? (
                  <div className={styles.input_container}>
                    <input type="text" className={`${styles.info_card_input} ${ errors.patronymic ? styles.input_error : '' }`}
                      placeholder="Введите ваше отчество"
                      {...register('patronymic', {
                        validate: (value) => {
                          if (!value || value.trim() === '') return true; 
                          if (value.trim().length < 2) return 'Отчество должно содержать минимум 2 символа';
                          if (value.trim().length > 50) return 'Отчество слишком длинное (максимум 50 символов)';
                          if (!/^[A-Za-zА-Яа-яЁё\s]+$/.test(value.trim())) return 'Отчество может содержать только буквы и пробелы';
                          return true;
                        }
                      })}
                    /> {errors.patronymic && (<span className={styles.error_text}>{errors.patronymic.message}</span>)}
                  </div>
                ) : (<span className={styles.info_card_value}>{user.patronymic || '-'}</span>)}
              </div>
              {/* Поле даты рождения */}
              <div className={styles.info_card_item}>
                <span className={styles.info_card_label}>Дата рождения</span>
                {isEditing ? (
                  <div className={styles.input_container}>
                    <input type="text" className={`${styles.info_card_input} ${ errors.dateOfBirth ? styles.input_error : '' }`}
                      placeholder="дд.мм.гггг"
                      {...register('dateOfBirth', {
                        required: 'Дата рождения обязательна для заполнения',
                        pattern: {
                          value: /^\d{2}\.\d{2}\.\d{4}$/,
                          message: 'Дата должна быть в формате дд.мм.гггг'
                        },
                        validate: {
                          validDate: (value) => {
                            const [day, month, year] = value.split('.').map(Number);
                            const date = new Date(year, month - 1, day);
                            const today = new Date();
                        
                            if (date.getDate() !== day || 
                                date.getMonth() !== month - 1 || 
                                date.getFullYear() !== year || date > today) {
                              return 'Введена некорректная дата';
                            }

                            return true;
                          }
                        }
                      })}
                    />
                    {errors.dateOfBirth && (<span className={styles.error_text}>{errors.dateOfBirth.message}</span>)}
                  </div>
                ) : ( <span className={styles.info_card_value}>{user.dateOfBirth}</span>)}
              </div>
              {/* Поле пола */}
              <div className={styles.info_card_item}>
                <span className={styles.info_card_label}>Пол</span>
                {isEditing ? (
                  <div className={styles.input_container}>
                    <div className={styles.radio_group}>
                      <label className={styles.radio_option}>
                        <input type="radio" value="male"
                          {...register('gender', { required: 'Пол обязателен' })}/>
                        <span>Мужской</span>
                      </label>
                      <label className={styles.radio_option}>
                        <input type="radio" value="female"
                          {...register('gender')} />
                        <span>Женский</span>
                      </label>
                    </div>
                    {errors.gender && (<span className={styles.error_text}>{errors.gender.message}</span>)}
                  </div>
                ) : (
                  <span className={styles.info_card_value}>{user.gender === 'male' ? 'Мужской' : 'Женский'}</span>)}
              </div>
              {/* Поле плохих привычек*/}
              <div className={styles.info_card_item}>
                <span className={styles.info_card_label}>Плохие привычки</span>
                {isEditing ? (
                  <div className={styles.input_container}>
                    <div className={styles.radio_group}>
                      <label className={styles.radio_option}>
                        <input type="radio" value="no"
                          {...register('badHabits', { required: 'Поле обязателено для заполнения' })}/>
                        <span>Нет</span>
                      </label>
                      <label className={styles.radio_option}>
                        <input type="radio" value="yes"
                          {...register('badHabits')} />
                        <span>Есть</span>
                      </label>
                    </div>
                    {errors.badHabits && (<span className={styles.error_text}>{errors.badHabits.message}</span>)}
                  </div>
                ) : (<span className={styles.info_card_value}>{user.badHabits === 'yes' ? 'Есть' : 'Нет'}</span>)}
              </div>
              {/* Поле питомцев*/}
              <div className={styles.info_card_item}>
                <span className={styles.info_card_label}>Питомцы</span>
                {isEditing ? (
                  <div className={styles.input_container}>
                    <div className={styles.radio_group}>
                      <label className={styles.radio_option}>
                        <input type="radio" value="no"
                          {...register('pet', { required: 'Поле обязателено для заполнения' })}/>
                        <span>Нет</span>
                      </label>
                      <label className={styles.radio_option}>
                        <input type="radio" value="yes"
                          {...register('pet')} />
                        <span>Есть</span>
                      </label>
                    </div>
                    {errors.pet && (<span className={styles.error_text}>{errors.pet.message}</span>)}
                  </div>
                ) : (<span className={styles.info_card_value}>{user.pet === 'yes' ? 'Есть' : 'Нет'}</span>)}
              </div>
              {/* Поле соседа */}
              <div className={styles.info_card_item}>
                <span className={styles.info_card_label}>Сожитель</span>
                {isEditing ? (
                  <div className={styles.input_container}>
                    <div className={styles.radio_group}>
                      <label className={styles.radio_option}>
                        <input type="radio" value="no"
                          {...register('hasRoommate', { required: 'Поле обязателено для заполнения' })}/>
                        <span>Нет</span>
                      </label>
                      <label className={styles.radio_option}>
                        <input type="radio" value="yes"
                          {...register('hasRoommate')} />
                        <span>Есть</span>
                      </label>
                    </div>
                    {errors.hasRoommate && (<span className={styles.error_text}>{errors.hasRoommate.message}</span>)}
                  </div>
                ) : (<span className={styles.info_card_value}>{user.hasRoommate === 'yes' ? 'Есть' : 'Нет'}</span>)}
              </div>

            </div>
            {/* Кнопки редактирования */}
            {isEditing && (
              <div className={styles.edit_controls}>
                <Button type="button" className={styles.cancel_button} onClickAdditional={handleCancel}>Отменить</Button>
                <Button type="submit" className={styles.save_button} disabled={!isDirty || !isValid || loading}>Сохранить изменения</Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
export default Profile;