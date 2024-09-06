import {redirect} from  'react-router-dom';
import api, { uploadApi } from "../api/axiosConfig"

export const authenticateAdmin= async (loginPath)=>{
   
    const loggedInCred= JSON.parse(localStorage.getItem("credentials"));  
  
    let loginStatus=undefined;

    try{
      
        loginStatus= await uploadApi.get("loginAuth",
          {headers:{"Content-Type": "application/json","Authorization":`Bearer ${loggedInCred.token}`}
       })
       const {data:authResponse}=loginStatus; 
            
       if(loginStatus.statusText!=="OK")       
          throw redirect(loginPath);

       return authResponse;

    }catch(error){
      throw redirect(loginPath);
    }
    
   
     
}
export const loginAdmin= async(userEmail,adminPass)=>{

    try {
    
     return await uploadApi.post("/login/admin",{email:userEmail,password:adminPass});      

    } catch (error) {
        throw error;
    }
}