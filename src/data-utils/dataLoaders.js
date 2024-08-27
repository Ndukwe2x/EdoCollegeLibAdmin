import api from '../api/axiosConfig';

export const catalogueDataLoader=async()=>{
  
  const loggedInCred= JSON.parse(localStorage.getItem("credentials"));
  const  authHeader={headers:{"Content-Type": "application/json",
          "Authorization":`Bearer ${loggedInCred.token}`}};
      try{
          const response= await api.get("admin/catalogue",authHeader);
         return response;          
       }
       catch(err){
         throw err;
       }
     
}
export const accessTokensLoader= async()=>{
  const loggedInCred= JSON.parse(localStorage.getItem("credentials"));
  const  authHeader={headers:{"Content-Type": "application/json",
          "Authorization":`Bearer ${loggedInCred.token}`}};
      try{
          let response= await api.get("admin/token",authHeader);
          const accounts= await adminAccountsLoader();
          if(!response)
             return;
          if(accounts)
          {  
            const { data: { data: { accounts: adminList } } } =accounts;
            const { data: { data: { tokens: tokenList } } }=response;
            const tokenData=[];
         
           tokenList.forEach(tokenRecord=>{
               const tokenRecordObject={};
               const adminAccount= adminList.find(acct=>acct.id==tokenRecord.createdBy);
              if(adminAccount)
               {
                 tokenRecordObject._id=tokenRecord._id;
                 tokenRecordObject.maskedToken=tokenRecord.maskedToken;
                 tokenRecordObject.createdAt=tokenRecord.createdAt;                 
                 tokenRecordObject.createdBy=`${adminAccount.firstname} ${adminAccount.lastname}`
                 tokenRecordObject.expiresAt=tokenRecord.expiresAt               
               }
               tokenData.push(tokenRecordObject);
            })
            response=tokenData;
          }   
        if(response)
          return response;          
       }
       catch(err){
        console.log(err);
         throw err;

       }

}
export const adminAccountsLoader=async()=>{

  const loggedInCred= JSON.parse(localStorage.getItem("credentials"));
  const  authHeader={headers:{"Content-Type": "application/json",
          "Authorization":`Bearer ${loggedInCred.token}`}};

   try {
     const response= await api.get("admin/accounts",authHeader);
     if(response)
        return response;
   } catch (err) {
    throw err;
   }

}
export const libraryResources =()=>{
  return null;
}
export const libraryResourcesBooks=async()=>{
  return null
}
export const libraryResourcesVideos=async()=>{
  return null;
}