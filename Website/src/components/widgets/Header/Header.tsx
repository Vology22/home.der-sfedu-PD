import styles from "./header.module.scss"
import utils from "../../../scss/utils.module.scss"
import { FaRegUser } from "react-icons/fa";
import { AnimatedScroll, Button, Icon, NavLink } from "../../ui";
import { Sidebar } from "..";
import { none, top } from "../../ui/AnimatedScroll/AnimatedScroll";
import { Link } from "react-router-dom";

const Header = () => {
   return ( 
      <>
         <header className={styles.header}>
            <div className={utils.container}>
               <AnimatedScroll scrollType={none} className={styles.header_body}>
                  <AnimatedScroll delay={3} scrollType={top} className={styles.icon}>
                     <Link to="/"><img src="\src\assets\png\icon.png" alt="icon" /></Link>
                  </AnimatedScroll>
                  <AnimatedScroll delay={5} scrollType={top} className={styles.navigation}>
                     <NavLink className={styles.navigation_link} isPurple path="/profile">
                        <Button className={styles.navigation_button}>
                           <Icon Icon={FaRegUser}/>
                        </Button>
                     </NavLink>
                  </AnimatedScroll>
               </AnimatedScroll>
               <Sidebar />
            </div>
         </header>
      </>
   );
}
 
export default Header;