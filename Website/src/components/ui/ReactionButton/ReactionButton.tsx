import { IconType } from "react-icons";
import AnimatedScroll from "../AnimatedScroll/AnimatedScroll";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import { ReactNode } from "react";

interface IReactionButton{
   direction: {
      opacity: number,
      transform?: string
   },
   icon: IconType,
   functionClick: () => void,
   children: ReactNode,
   delay?: number
}

const ReactionButton = ({direction, icon, functionClick, children, delay = 4}: IReactionButton) => {
   return ( 
      <>
         <AnimatedScroll delay={delay} scrollType={direction}>
            <Button onClickAdditional={functionClick}>
               <Icon Icon={icon} />{children}
            </Button>
         </AnimatedScroll>
      </>
   );
}
   
export default ReactionButton;