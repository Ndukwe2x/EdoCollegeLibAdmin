import api from '../api/axiosConfig';


export const addToCatalogue = async ({ title, parentTitle, description }) => {
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };

    const formSubmitData = {};
    formSubmitData.title = title;   
    if (parentTitle != "--Select--")
        formSubmitData.parentTitle = parentTitle;
   
    try {
        const response = await api.post("admin/catalogue",
            formSubmitData, authHeader);
        return response;
    }
    catch (err) {
        throw err;
    }
}
export const deleteCatalogueItem=async(catalogueId)=>{

    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };
    try 
    {
       const deleteResponse= await api.delete(`admin/catalogue/${catalogueId}`,
        authHeader) ;
        return deleteResponse;
    } 
    catch (err) {
        throw err;
    }

}
export const createToken= async(token,expiryDate)=>{
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };
    const tokenSubmitData={token:token,expiresAt:expiryDate}
   
    try {
        console.log("posting to api...")
        const response = await api.post("admin/token",
            tokenSubmitData, authHeader);
         console.log("response after api:",response)   
        return response;
    }
    catch (err) {
        throw err;
    }
}
export const deleteToken= async(token_Id)=>{
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };       
    try {
        
        const response = await api.delete(`admin/token/${token_Id}`,authHeader);
        return response;
    }
    catch (err) {
        throw err;
    }
}

export const editCatalogueEntry= async(catalogueId,{title,parentTitle})=>{
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };
    const formSubmitData = {};
    formSubmitData.title = title; 
    if (parentTitle != "--Select--")
        formSubmitData.parentTitle = parentTitle;
    try 
     {
       const deleteResponse= await api.patch(`admin/catalogue/${catalogueId}`,
                                         formSubmitData, authHeader);
        return deleteResponse;
     } 
    catch (err) {
        throw err;
    }

}