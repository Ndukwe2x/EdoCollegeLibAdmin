import {authenticateAdmin } from "../auth/authHandler";
import { libraryResourcesBooks } from "../data-utils/dataLoaders";


export const loader = () => {
     authenticateAdmin("/")
     return libraryResourcesBooks
 }

 const LibraryBooks=()=>{

  return (
     <h4>Library Books</h4>
   )

}

export default LibraryBooks;