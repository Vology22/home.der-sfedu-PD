import { list } from "./ListCards.static";
import { AnimatedScroll, Button, Icon } from "../../ui";
import { motion, useAnimation } from "framer-motion";
import { RxCross2 } from "react-icons/rx";
import { IoMdHeartEmpty } from "react-icons/io";
import { TbCoins } from "react-icons/tb";
import { LuMapPinHouse } from "react-icons/lu";
import { CgRuler } from "react-icons/cg";
import styles from "./listCards.module.scss";
import { useState } from "react";
import { left, right, top } from "../../ui/AnimatedScroll/AnimatedScroll";

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
      });

      const currentIndex = arrId.indexOf(currentItem.id);
      let nextIndex = currentIndex + newDirection;
      if (nextIndex >= arrId.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = arrId.length - 1;
      const nextId = arrId[nextIndex];

      setCurrentItem({ id: nextId, direction: newDirection });

      controls.set({
         y: -50,
         opacity: 0,
         x: 0,
      });
      controls.start({
         y: 0,
         opacity: 1,
      });
   };

   const card = list[currentItem.id];

   return ( 
      <>
         {card && (
            <AnimatedScroll scrollType={top}>
               <motion.div
                  animate={controls}
                  className={styles.card}>
                  <img className={styles.card_image} src={card.image} alt="lodging" />
                  <p className={styles.card_cost}><TbCoins /> {card.cost}</p>
                  <p className={styles.card_square}><CgRuler /> {card.square}</p>
                  <p><LuMapPinHouse /> {card.location}</p>
                  <p className={styles.card_description}>{card.description}</p>
               </motion.div>
            </AnimatedScroll>
         )}
         <div className={styles.buttons}>
            <AnimatedScroll delay={4} scrollType={left}>
               <Button onClickAdditional={() => setSlide(-1)}>
                  <Icon Icon={RxCross2} />Не понравилось
               </Button>
            </AnimatedScroll>
            <AnimatedScroll delay={4} scrollType={right}>
               <Button onClickAdditional={() => setSlide(1)}>
                  <Icon Icon={IoMdHeartEmpty} />Понравилось
               </Button>
            </AnimatedScroll>
         </div>
      </>
   );
};
 
export default ListCards;