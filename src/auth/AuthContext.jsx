import {useContext, useState , createContext} from 'react';


const  AuthContext= createContext();

export function AuthProvider({children}){
    const [ authenticatedUser, setAuthenticatedUser]= useState(null); 
       
        return (<AuthContext.Provider value={{authenticatedUser,setAuthenticatedUser}}>
            {children}
        </AuthContext.Provider>);
           
}
export const useAuth=()=>useContext(AuthContext);
    
