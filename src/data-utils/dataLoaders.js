import api, { uploadApi } from '../api/axiosConfig';
import { UTCDateToDateTimeString } from '../code-utility/utilityFunctions';


export const catalogueDataLoader=async()=>{
  
  const loggedInCred= JSON.parse(localStorage.getItem("credentials"));
  const  authHeader={headers:{"Content-Type": "application/json",
          "Authorization":`Bearer ${loggedInCred.token}`}};
      try{
          const response= await uploadApi.get("admin/catalogue",authHeader);
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
          let response= await uploadApi.get("admin/token",authHeader);
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
     const response= await uploadApi.get("admin/accounts",authHeader);
     if(response)
        return response;
   } catch (err) {
    throw err;
   }

}
export const libraryResources =async()=>{
  
   const  resources={};
   try {
    
    const libraryBooks= await libraryResourcesBooks();
     if(libraryBooks)
     { const {data:{data:{books:books}}}=libraryBooks;
       resources.books=books;  
     }

    const libraryVideos= await libraryResourcesVideos();
    if(libraryVideos)
     { 
      const {data:{data:{videos:videos}}}=libraryVideos;
      resources.videos=videos;
     }
    
    const studentList= await libraryStudentAccounts();
     if(studentList)
    {  const {data:{data:{nbHits:studentCount}}}=studentList;
       resources.studentsCount= studentCount;
    }
     return resources;

   } catch (err) {
     const{response}=err;
     console.log(err);
     throw response;
   }

  
}
export const libraryResourcesBooks=async()=>{
  const loggedInCred= JSON.parse(localStorage.getItem("credentials"));
  const  authHeader={headers:{"Content-Type": "application/json",
          "Authorization":`Bearer ${loggedInCred.token}`}};
      try{
          const response= await uploadApi.get("admin/books",authHeader);
          
        return response;          
       }
       catch(err){
         throw err;
       }
}
export const libraryResourcesVideos=async()=>{
  const loggedInCred= JSON.parse(localStorage.getItem("credentials"));
  const  authHeader={headers:{"Content-Type": "application/json",
          "Authorization":`Bearer ${loggedInCred.token}`}};
      try{
          const response= await uploadApi.get("admin/videos",authHeader);
          return response;          
       }
       catch(err){
         throw err;
       }
}

export const libraryStudentAccounts=async()=>{
  const loggedInCred= JSON.parse(localStorage.getItem("credentials"));
  const  authHeader={headers:{"Content-Type": "application/json",
          "Authorization":`Bearer ${loggedInCred.token}`}};
      try{
          const response= await uploadApi.get("admin/student",authHeader);
          
          return response;          
       }
       catch(err){
         throw err;
       }
}