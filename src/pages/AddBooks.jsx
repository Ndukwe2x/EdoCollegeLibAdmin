import { authenticateAdmin } from "../auth/authHandler";
import { catalogueDataLoader } from '../data-utils/dataLoaders';
import { useNavigate, useLoaderData,  defer, Await, useLocation } from "react-router-dom";
import React, { Suspense } from "react";
import { Tooltip } from 'react-tooltip';
import {  useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faUpload } from '@fortawesome/free-solid-svg-icons';

import SectionLoader from "../components/SectionLoader/SectionLoader";
import BookUploader from "../components/BookUploader/BookUploader";

export const loader = async () => {
    authenticateAdmin("/");

    try {
        return defer({ catalogueData: catalogueDataLoader() })
    } catch (error) {
        return null;
    }
}

const AddBooks = () => {

    const formNavigationState=useLocation();
    const loadedCataloguePromise = useLoaderData();
    const [formmode, setFormMode] = useState(formNavigationState?.state?.mode || "add");
    const navigate = useNavigate();
   
    const tooltipStyle = { backgroundColor: '#20134488' };
   
    
  
    const bookToEdit=formmode=="edit" ? formNavigationState?.state?.resourceId : null;
    
    const handleFormReset=()=>{
     formNavigationState.state=null; 
     setFormMode("add");
    }

    const goBackToPreviousPage = () => {
        navigate(-1);
    }
    const moveToBookListPage = () => {
        navigate("../books");
    }  

    return <div className="add-book-pg">
        <div className="topNav">
            <button className="btn " onClick={goBackToPreviousPage} data-tooltip-id="tooltipBackButton">
                 <i className="bi bi-chevron-left"></i> Back
            </button>
            <button className="btn " onClick={moveToBookListPage}>Book List</button>
        </div>

        <div className="addbookHdr">
            <span className="iconSize">
                <FontAwesomeIcon icon={faUpload} /> <FontAwesomeIcon icon={faBook} />
            </span>
            <h4 >Upload Book to Library</h4>
        </div>
        <div className="add-book-frm">
         <Suspense fallback={<SectionLoader sectionName={"Book upload form"} />}>
               <Await  resolve={loadedCataloguePromise.catalogueData}>
                   { (catalogueCollection)=>{
                       const { data: { data: { catalogue: catalogueList } } } = catalogueCollection;
                        return <BookUploader mode={formmode}  bookId={bookToEdit} formModeReset={handleFormReset}
                        libraryCatalogue={catalogueList} />
                      }
                   }
               </Await>
          </Suspense>
                    
          <Tooltip id="tooltipBackButton" style={tooltipStyle} place="bottom" 
             content="back to previous page" />
        </div>
        <div className="bottomNav">
            <button className="btn " onClick={moveToBookListPage}>Book List</button>
        </div>
    </div>
}
export default AddBooks;