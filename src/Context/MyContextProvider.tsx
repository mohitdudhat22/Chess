"use client";
import { FC, ReactNode, createContext, useContext, useState } from 'react';



const MyContext = createContext<MyContextType | undefined>(undefined);

export const useMyContext = () => {
    const context = useContext(MyContext);
    if (!context) {
        throw new Error('useMyContext must be used within a MyContextProvider');
    }
    return context;
};
interface MyContextType {
    value: any;
    setValue: React.Dispatch<React.SetStateAction<any>>;
    chessState: any;
    setChessState: React.Dispatch<React.SetStateAction<any>>;

}
export const MyContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [value,setValue] = useState(null);
    const [chessState,setChessState] = useState(null);
    return (
        <MyContext.Provider value={{ value, setValue,chessState,setChessState}}>
            {children}
        </MyContext.Provider>
    );
};  