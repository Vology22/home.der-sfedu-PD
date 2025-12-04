import { list } from "./ListCards.static";
import { AnimatedScroll, Button, ReactionButton } from "../../ui";
import { motion, useAnimation } from "framer-motion";
import { RxCross2 } from "react-icons/rx";
import { IoMdHeartEmpty } from "react-icons/io";
import { TbCoins } from "react-icons/tb";
import { LuMapPinHouse } from "react-icons/lu";
import { CgRuler } from "react-icons/cg";
import styles from "./listCards.module.scss";
import { useContext, useEffect } from "react";
import { left, right, top } from "../../ui/AnimatedScroll/AnimatedScroll";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../providers/AuthContext";
import { wrap } from "framer-motion";

const ListCards = () => {
   const arrId = list.map(item => item.id);
   const { currentCard, setCurrentCard } = useContext(AuthContext);

   const controls = useAnimation();
   const setSlide = async (newDirection: -1 | 1) => {
      await controls.start({
         x: 100 * newDirection, 
         opacity: 0,
      });

      const currentIndex = arrId.indexOf(currentCard.id);
      const nextId = arrId[wrap(0, arrId.length, currentIndex + newDirection)];

      setCurrentCard({ id: nextId, direction: newDirection });

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

   useEffect(() => {
      return () => {
         controls.stop();
      };
   }, [controls]);
   const card = list[currentCard.id];

   const navigate = useNavigate();
   const handleDetails = () => {
      navigate(`/card/${currentCard.id}`);
   }

   return ( 
      <>
         {card && (<>
            <AnimatedScroll scrollType={top}>
               <motion.div animate={controls} className={styles.card}>
                  <img className={styles.card_image} src={card.image[0]} alt="lodging" />
                  <div className={styles.card_content}>
                     <p className={styles.card_cost}><TbCoins /> {card.cost}</p>
                     <p className={styles.card_square}><CgRuler /> {card.square}</p>
                     <p><LuMapPinHouse /> {card.location}</p>
                     <Button className={styles.card_detailed} onClickAdditional={handleDetails}>Подробнее</Button>
                  </div>
                  <p className={styles.card_description}>{card.description}</p>
               </motion.div>
            </AnimatedScroll>
            <div className={styles.buttons}>
               <ReactionButton direction={left} icon={RxCross2} functionClick={() => setSlide(-1)}>Не понравилось</ReactionButton>
               <ReactionButton direction={right} icon={IoMdHeartEmpty} functionClick={() => setSlide(1)}>Понравилось</ReactionButton>
            </div>
         </>)}
      </>
   );
};
 
export default ListCards;