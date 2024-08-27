import {authenticateAdmin } from "../auth/authHandler";
import { libraryResourcesVideos } from "../data-utils/dataLoaders";

export const loader = () => {
     authenticateAdmin("/")
     return libraryResourcesVideos();
 }


const LibraryVideos=()=>{

    return (
         <h4>Library Videos</h4>
    )
    
    }
    
export default LibraryVideos;