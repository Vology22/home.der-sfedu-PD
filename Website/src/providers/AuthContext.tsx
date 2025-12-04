import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";

type CardT = {
   id: number
   direction: -1 | 1
}
interface AuthContextI{
   currentCard: CardT,
   setCurrentCard: Dispatch<SetStateAction<CardT>>
}

export const AuthContext = createContext<AuthContextI>({
   currentCard: {
      id: 0,
      direction: 1
   },
   setCurrentCard: () => {}
});
export const AuthProvider = ({children}: {children: Readonly<ReactNode>}) => {
   const [currentCard, setCurrentCard] = useState<CardT>({id: 0, direction: 1});

   return (
      <AuthContext.Provider value={{currentCard, setCurrentCard}}>
         {children}
      </AuthContext.Provider>
   )
}