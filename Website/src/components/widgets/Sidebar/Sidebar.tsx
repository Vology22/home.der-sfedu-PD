import { AnimatedScroll, Button, Icon, NavLink } from "../../ui";
import styles from "./sidebar.module.scss";
import { navigations } from "./Sidebar.static";

const Sidebar = () => {
   return ( 
      <>
         <AnimatedScroll className={styles.sidebar}>
            {navigations.map(item => {return(
               <AnimatedScroll key={item.id} delay={item.id + 3}>
                  <NavLink className={styles.sidebar_link} path={item.path}>
                     <Button className={styles.sidebar_button}>
                        <Icon Icon={item.image} />
                        <p>{item.text}</p>
                     </Button>
                  </NavLink>
               </AnimatedScroll>
            )})}
         </AnimatedScroll>
      </>
   );
}
 
export default Sidebar;