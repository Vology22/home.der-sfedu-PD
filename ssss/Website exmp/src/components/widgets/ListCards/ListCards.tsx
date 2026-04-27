import { Button, Icon, Skeleton } from "../../ui";
import { motion, useAnimation } from "framer-motion";
import { RxCross2 } from "react-icons/rx";
import { IoMdHeartEmpty } from "react-icons/io";
import { FaRedoAlt } from "react-icons/fa"; 
import styles from "./listCards.module.scss";
import { useEffect, useState, useRef } from "react";
import { useProperties } from "../../../hooks/useProperties";
import { useFavorites } from "../../../hooks/useFavorites"; 

const ListCards = () => {
   const { 
      currentProperty, 
      loading, 
      error, 
      nextProperty, 
      totalCount,
      allViewed,
      restartViewing,
      addCurrentToDisliked, 
      fetchProperties,
      removePropertyById,
      setFavoritesRef 
   } = useProperties();
   
   const { addToFavorite, fetchFavorites, favorites } = useFavorites();
   const controls = useAnimation();
   const [imageError, setImageError] = useState(false);
   const isInitialized = useRef(false);

   useEffect(() => {
      if (favorites) {
         console.log('[ListCards] Синхронизация favorites:', favorites.map(f => f.prop_id));
         setFavoritesRef(favorites);
      }
   }, [favorites, setFavoritesRef]);

   useEffect(() => {
      if (!isInitialized.current && favorites.length > 0) {
         console.log('[ListCards] Начальная синхронизация');
         setFavoritesRef(favorites);
         isInitialized.current = true;
      }
   }, [favorites, setFavoritesRef]);

   useEffect(() => {
      if (!allViewed && currentProperty) {
         controls.start({
            y: 0,
            opacity: 1,
            transition: { duration: 0.15 }
         });
      }
   }, [currentProperty, controls, allViewed]);

   const handleDislike = async () => {
      if (allViewed) return; // Если все просмотрены, не обрабатываем действия
      
      await controls.start({
         x: -100,
         opacity: 0,
         transition: { duration: 0.15 }
      });
      
      addCurrentToDisliked();
      nextProperty();
      setImageError(false);
      
      controls.set({ x: 100, opacity: 0 });
      controls.start({
         x: 0,
         opacity: 1,
         transition: { duration: 0.15 }
      });
   };

   const handleLike = async () => {
      if (allViewed) return; // Если все просмотрены, не обрабатываем действия

      await controls.start({
         x: 100,
         opacity: 0,
         transition: { duration: 0.15 }
      });
            
      await addToFavorite(currentProperty);

      console.log('Удаляю из локального массива...');
      removePropertyById(currentProperty.prop_id);

      nextProperty();
      setImageError(false);

      controls.set({ x: -100, opacity: 0 });
      controls.start({
         x: 0,
         opacity: 1,
         transition: { duration: 0.15 }
      });

   };

   const handleRestart = async () => {
      console.log('[ListCards] Перезапуск просмотра');
      setImageError(false);
      
      await fetchFavorites();
      
      setTimeout(() => {
        restartViewing();
        fetchProperties();
      }, 100);
   };

   if (loading) {
      return (
         <>
         <Skeleton height={300} />
         <Skeleton count={3} />
         <Skeleton height={50} />
         <div className={styles.buttons}>
            <Button disabled>Загрузка...</Button>
            <Button disabled>Загрузка...</Button>
         </div>
         </>
      );
   }

   if (error) {
      return (
         <div className={styles.error}>
         <p>Ошибка: {error}</p>
         <Button onClickAdditional={() => window.location.reload()}>
            Попробовать снова
         </Button>
         </div>
      );
   }

   if (!currentProperty && totalCount === 0 && !allViewed) {
      return (
         <div className={styles.empty}>
         <p>Нет доступных объявлений</p>
         </div>
      );
   }

   console.log('[ListCards] allViewed:', allViewed);

   return ( 
      <>    
      {allViewed ? (
         <motion.div 
            className={styles.completedView}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
         >
            <div className={styles.completedContent}>
               <p>Вы просмотрели все доступные объявления</p>
               <div className={styles.stats}>
                  <span>Просмотрено: {totalCount} из {totalCount}</span>
               </div>
               <Button onClickAdditional={handleRestart}> <Icon Icon={FaRedoAlt} /> Начать просмотр заново </Button>
            </div>
         </motion.div>
      ) : (
         <>
            {currentProperty && (
               <motion.div
                  animate={controls}
                  initial={{ y: -100, opacity: 0 }}
                  className={styles.card}
               >
                  <img 
                     className={styles.card_image} 
                     src={imageError ? '/placeholder-image.jpg' : currentProperty.image} 
                     alt={currentProperty.title || 'Недвижимость'} 
                     onError={() => setImageError(true)}
                  />
                  <p className={styles.card_cost}>
                     {currentProperty.price.toLocaleString('ru-RU')} ₽
                  </p>
                  <p>{currentProperty.square || 'Площадь не указана'}</p>
                  <p>{currentProperty.city || 'Город не указан'}</p>
                  <div className={styles.card_description}>
                     <p>{currentProperty.title || 'Недвижимость'} </p>
                     {currentProperty.description || 'Описание отсутствует'}
                  </div>
                  <div className={styles.progress}>
                  </div>
               </motion.div>
            )}
            <div className={styles.buttons}>
               <Button onClickAdditional={handleDislike}>
                  <Icon Icon={RxCross2} />Не понравилось
               </Button>
               <Button onClickAdditional={handleLike}>
                  <Icon Icon={IoMdHeartEmpty} />Понравилось
               </Button>
            </div>
         </>
      )}
      </>
   );
};
 
export default ListCards;