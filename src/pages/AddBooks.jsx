import { authenticateAdmin } from "../auth/authHandler";
import { catalogueDataLoader } from '../data-utils/dataLoaders';
import { useNavigate, useLoaderData, useSearchParams, defer, Await } from "react-router-dom";
import React, { Suspense } from "react";
import { Tooltip } from 'react-tooltip';
import { useEffect, useState } from "react";
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

   
    const [searchParams, setSearchParams] = useSearchParams();
    const [formmode, setFormMode] = useState(searchParams.get("mode") || "add");
    const loadedCataloguePromise = useLoaderData();
   
    const navigate = useNavigate();

    const tooltipStyle = { backgroundColor: '#20134488' };

    useEffect(() => {
        if (formmode == "edit") {
            console.log("Editing...");
        }
    }, [formmode]);   

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
                        return <BookUploader bookId={"66d8ea881adee872e2f7ef2c"} libraryCatalogue={catalogueList} />
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