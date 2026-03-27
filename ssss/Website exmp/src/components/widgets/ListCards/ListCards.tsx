import { list } from "./ListCards.static";
import { Button, Icon, Skeleton } from "../../ui";
import { motion, useAnimation } from "framer-motion";
import { RxCross2 } from "react-icons/rx";
import { IoMdHeartEmpty } from "react-icons/io";
import styles from "./listCards.module.scss";
import { useEffect, useState } from "react";

const ListCards = () => {
   const arrId = list.map(item => item.id);
   const [currentItem, setCurrentItem] = useState({
      id: arrId[0],
      direction: -1 | 1
   });

   const controls = useAnimation();
   const setSlide = async (newDirection: -1 | 1) => {
      await controls.start({
         x: 100 * newDirection, 
         opacity: 0,
         transition: { duration: 0.15 }
      });

      const currentIndex = arrId.indexOf(currentItem.id);
      let nextIndex = currentIndex + newDirection;
      if (nextIndex >= arrId.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = arrId.length - 1;
      const nextId = arrId[nextIndex];

      setCurrentItem({ id: nextId, direction: newDirection });

      controls.set({
         y: -100,
         opacity: 0,
         x: 0
      });
      controls.start({
         y: 0,
         opacity: 1,
         transition: { duration: 0.15 }
      });
   };

   useEffect(() => {
      controls.start({
         y: 0,
         opacity: 1,
         transition: { duration: 0.15 }
      });
   }, [controls]);
   const card = list[currentItem.id];

   return ( 
      <>
         {card ? (
            <motion.div
               animate={controls}
               initial={{ y: -100, opacity: 0 }}
               className={styles.card}>
               <img className={styles.card_image} src={card.image} alt="lodging" />
               <p className={styles.card_cost}>{card.cost}</p>
               <p>{card.square}</p>
               <p>{card.location}</p>
               <p className={styles.card_description}>{card.description}</p>
            </motion.div>
         ) : (
            <>
               <Skeleton height={300} />
               <Skeleton count={3} />
               <Skeleton height={50} />
            </>
         )}
         <div className={styles.buttons}>
            <Button onClickAdditional={() => setSlide(-1)}>
               <Icon Icon={RxCross2} />Не понравилось
            </Button>
            <Button onClickAdditional={() => setSlide(1)}>
               <Icon Icon={IoMdHeartEmpty} />Понравилось
            </Button>
         </div>
      </>
   );
};
 
export default ListCards;