import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useUserData } from '../../hooks/useUserData';
import styles from './Profile.module.scss';
import { Button } from "../../components/ui";
import { UserFormData } from './User';

const Profile = () => {
  const { user, loading, error, fetchUser, updateUser } = useUserData();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty, isValid }
  } = useForm<UserFormData>({
    mode: 'onChange', 
    defaultValues: {
      name: '',
      dateOfBirth: ''
    }
  });

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user && !isEditing) {
      setValue('name', user.name, { shouldDirty: false });
      setValue('dateOfBirth', user.dateOfBirth, { shouldDirty: false });
    }
  }, [user, setValue, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (user) {
      reset({
        name: user.name,
        dateOfBirth: user.dateOfBirth
      });
    }
    setIsEditing(false);
  };

  const onSubmit = async (data: UserFormData) => {
    const success = await updateUser(data);
    if (success) {
      setIsEditing(false);
    }
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

  return (
    <div className={styles.wrapper}>
      <div className={styles.profile}>
        {/* Первый прямоугольник - фото профиля */}
        <div className={styles.photo_card}>
            <div className={styles.photo_card_verified}> ✓ Профиль подтвержден
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
                          value: /^[A-Za-zА-Яа-яЁё\s]+$/,
                          message: 'Имя может содержать только буквы и пробелы'
                        }
                      })}
                    /> {errors.name && (<span className={styles.error_text}>{errors.name.message}</span>)}
                  </div>
                ) : (<span className={styles.info_card_value}>{user.name}</span>)}
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
                          validDate: (value: string) => {
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