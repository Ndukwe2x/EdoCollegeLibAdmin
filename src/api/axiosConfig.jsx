import axios from 'axios';

const serverBaseUrl= 'https://edocollegelibraryapp-133b08aec735.herokuapp.com/api/v1'; 
const baseUrl='http://localhost:3000/api/v1';

export default axios.create({
    baseURL:serverBaseUrl, //change before upload
    timeout:20000,//timeout:20000,
    timeoutErrorMessage:"process timed out, try again later"
   });

export const uploadApi= axios.create({
    baseURL:serverBaseUrl, 
    timeout:7200000,//2hrs
    timeoutErrorMessage:"process timed out, try again later"
});