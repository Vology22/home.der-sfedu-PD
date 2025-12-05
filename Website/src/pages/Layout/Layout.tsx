import { ReactNode } from "react";
import { Header } from "../../components/widgets";
import "./layout.module.scss"

const Layout = ({children}: {children: Readonly<ReactNode>}) => {
   return ( 
      <>
         <Header />
         <main>
            {children}
         </main>
      </>
   );
}
 
export default Layout;