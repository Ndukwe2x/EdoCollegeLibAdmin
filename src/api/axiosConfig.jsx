import axios from 'axios';


export default axios.create({
    baseURL:'https://edocollegelibraryapp-b13a4881c9f9.herokuapp.com/api/v1', 
    timeout:20000,
    headers:{"Content-Type": "application/json"}
});