import axios from 'axios';

const serverBaseUrl= 'https://edocollegelibraryapp-b13a4881c9f9.herokuapp.com/api/v1';
const baseUrl='http://localhost:3000/api/v1';

export default axios.create({
    baseURL:serverBaseUrl, 
    timeout:20000,
    timeoutErrorMessage:"process timed out, try again later"
   });

export const uploadApi= axios.create({
    baseURL:serverBaseUrl, 
    timeout:7200000, //2hrs
    timeoutErrorMessage:"process timed out, try again later"
})
  