import styles from "./comingSoon.module.scss";
import utils from "../../../scss/utils.module.scss";
import { LiaDoorOpenSolid } from "react-icons/lia";
import { AnimatedScroll, Icon } from "../../ui";
import { left } from "../../ui/AnimatedScroll/AnimatedScroll";

const ComingSoon = () => {
   return ( 
      <>
         <div className={`${utils.container} ${styles.wrapper}`}>
            <div className={styles.comingSoon}>
               <AnimatedScroll className={styles.comingSoon_wrapperDoor} scrollType={left}>
                  <Icon className={styles.comingSoon_door} Icon={LiaDoorOpenSolid} />
               </AnimatedScroll>
               <div className={styles.text}>
                  <span>coming</span>
                  <span>soon</span>
               </div>
            </div>
         </div>
      </>
   );
}
 
export default ComingSoon;