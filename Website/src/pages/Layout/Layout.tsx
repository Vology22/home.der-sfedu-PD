import { ReactNode } from "react";

const Layout = ({children}: {children: Readonly<ReactNode>}) => {
   return ( 
      <>
         <main style={{flexGrow: "1"}}>
            {children}
         </main>
      </>
   );
}
 
export default Layout;