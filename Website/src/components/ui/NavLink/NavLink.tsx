import { ReactNode } from 'react';
import classObject from "clsx";
import { Link, useMatch } from 'react-router-dom';
import styles from './navLink.module.scss';

interface INavLink{
   path: string,
   children: Readonly<ReactNode>
   className?: string,
   isPurple?: boolean
}

const NavLink = ({path, children, className, isPurple = false}: INavLink) => {
   const match = useMatch(path);

   return ( 
      <>
         <Link to={path} className={classObject(styles.navlink, className, {
            [styles.active]: match,
            [styles.activePurple]: isPurple && match
         })}>{children}</Link>
      </>
   );
}

export default NavLink;