import { TbCoins } from "react-icons/tb";
import { LuMapPinHouse } from "react-icons/lu";
import { CgRuler } from "react-icons/cg";
import { useNavigate, useParams } from "react-router-dom";
import { list } from "../../components/widgets/ListCards/ListCards.static";
import utils from "../../scss/utils.module.scss";
import { AnimatedScroll, Button, Icon, ReactionButton } from "../../components/ui";
import { IoReturnUpBack } from "react-icons/io5";
import { left, none, right, top } from "../../components/ui/AnimatedScroll/AnimatedScroll";
import { RxCross2 } from "react-icons/rx";
import { IoMdHeartEmpty } from "react-icons/io";
import stylesListCard from "../../components/widgets/ListCards/listCards.module.scss"
import styles from "./extendedCard.module.scss";
import { AuthContext } from "../../providers/AuthContext";
import { useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, wrap } from "framer-motion";

const ExtendedCard = () => {
   const {id} = useParams();
   if (!id) return;
   const card = list.find(item => item.id == parseInt(id));
   // https://yandex.ru/map-widget/v1/?um=constructor%3A1234567890abcdef&text=${encodeURIComponent(String(card?.location))}&z=15
   const address = `https://www.google.com/maps?q=${encodeURIComponent(String(card?.location))}&output=embed&z=17`;

   const { setCurrentCard } = useContext(AuthContext);
   const navigate = useNavigate();
   const goBack = () => {
      setCurrentCard(prev => ({...prev, id: parseInt(id)}));
      navigate(-1);
   }

   const like = () => {
      setCurrentCard(prev => ({...prev, id: wrap(0, list.length, parseInt(id) + 1)}));
      navigate(-1);
   }
   const skip = () => {
      setCurrentCard(prev => ({...prev, id: wrap(0, list.length, parseInt(id) - 1)}));
      navigate(-1);
   }

   const [currentImage, setCurrentImage] = useState(card?.image[0]);
   const [imageActive, setImageActive] = useState<number>(0);
   
   const imageBodyRef = useRef<HTMLDivElement>(null);
   const imageRef = useRef<HTMLImageElement>(null);
   const animationRef = useRef<number | null>(null);
   const chooseImage = (item: string, index: number) => {
      if (!imageBodyRef.current || !imageRef.current) return;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setCurrentImage(item); 
      setImageActive(index);
      const targetPosition = index * imageRef.current.offsetWidth / 1.5;
      const startPosition = imageBodyRef.current.scrollLeft;
      const distance = targetPosition - startPosition;
      
      const startTime = performance.now();
      const animateScroll = () => {
         const progress = Math.min((performance.now() - startTime) / 300, 1);
         
         const currentPosition = startPosition + distance * progress;
         imageBodyRef.current?.scrollTo({left: currentPosition});
         if (progress < 1) {
            animationRef.current = requestAnimationFrame(animateScroll);
         }
      }
      animationRef.current = requestAnimationFrame(animateScroll);
   }
   useEffect(() => {
      return () => {
         if (animationRef.current) cancelAnimationFrame(animationRef.current);
      }
   }, [])

   return ( 
      <>
         <section>
            <div className={utils.container}>
               <div className={styles.wrapper}>
                  <div className={styles.panel}>
                     <AnimatedScroll scrollType={top} delay={3}>
                        <Button onClickAdditional={goBack} className={styles.panel_back}><Icon Icon={IoReturnUpBack} /></Button>
                     </AnimatedScroll>
                     <div className={`${stylesListCard.buttons} ${styles.panel_buttons}`}>
                        <ReactionButton direction={top} icon={RxCross2} functionClick={skip} delay={4}>Не понравилось</ReactionButton>
                        <ReactionButton direction={top} icon={IoMdHeartEmpty} functionClick={like} delay={5}>Понравилось</ReactionButton>
                     </div>
                  </div>
                  <AnimatedScroll scrollType={none} className={styles.content}>
                     <div className={styles.information}>
                        <AnimatedScroll scrollType={left} className={styles.information_visual}>
                           <div className={styles.information_mainImage}>
                           <AnimatePresence initial={false} mode="popLayout">
                              <motion.img key={currentImage} initial={{opacity: 0}} exit={{opacity: 0}} 
                              animate={{opacity: 1}} transition={{ duration: .2 }} src={currentImage} alt="flat" />
                              <div style={{backgroundImage: `url(${currentImage})`}} />
                           </AnimatePresence>
                           </div>
                           <div className={styles.information_imageWrapper}>
                              <div ref={imageBodyRef} className={styles.information_visualOther}>
                                 {card?.image.map((item: string, index) => {return(
                                    <img ref={imageRef} className={imageActive == index ? styles.imageActive : ''} 
                                    onClick={() => chooseImage(item, index)} key={index} src={item} alt="flat" />
                                 )})}
                              </div>
                           </div>
                        </AnimatedScroll>
                        <div className={styles.information_text}>
                           <AnimatedScroll scrollType={right} delay={3} className={styles.information_item}>
                              <span className={styles.information_title}><TbCoins />Стоимость</span>
                              <span className={styles.information_cost}>{card?.cost}</span>
                           </AnimatedScroll>
                           <AnimatedScroll scrollType={right} delay={4} className={styles.information_item}>
                              <span className={`${styles.information_title} ${styles.information_square}`}><CgRuler />Площадь</span>
                              {card?.square}
                           </AnimatedScroll>
                           <AnimatedScroll scrollType={right} delay={5} className={styles.information_item}>
                              <span className={styles.information_title}><LuMapPinHouse />Местоположение</span>
                              {card?.location}
                           </AnimatedScroll>
                        </div>
                     </div>
                     <AnimatedScroll className={styles.description}>{card?.extendedDescription}</AnimatedScroll>
                  </AnimatedScroll>
                  <AnimatedScroll className={styles.mapContainer}>
                     <iframe title={`Карта: ${address}`} src={address} />
                  </AnimatedScroll>
               </div>
            </div>
         </section>
      </>
   );
}
 
export default ExtendedCard;