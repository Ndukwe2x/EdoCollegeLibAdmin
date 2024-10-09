import { authenticateAdmin } from "../auth/authHandler";
import { catalogueDataLoader } from '../data-utils/dataLoaders';
import { NavLink, useNavigate, useLoaderData,  defer, Await,useLocation } from "react-router-dom";

import { Tooltip } from 'react-tooltip';
import { useState, useEffect, Suspense } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faUpload } from '@fortawesome/free-solid-svg-icons';
import SectionLoader from "../components/SectionLoader/SectionLoader";
import VideoUploader from "../components/VideoUploader/VideoUploader";

export const loader = async () => {
    authenticateAdmin("/");
    try {

        return  defer({catalogueData: catalogueDataLoader() })
    } catch (error) {
        return null;
    }

}

const AddVideos = () => {
    const formNavigationState=useLocation();
    const loadedCataloguePromise = useLoaderData();

    const [formmode, setFormMode] = useState(formNavigationState?.state?.mode || "add");
    const navigate = useNavigate();
   

    const tooltipStyle = { backgroundColor: '#20134488' };
    const videoToEdit=formmode=="edit" ? formNavigationState?.state?.resourceId : null;

    
    const handleFormReset=()=>{
        formNavigationState.state=null; 
        setFormMode("add");
    } 
   const goBackToPreviousPage = () => {
        navigate(-1);
    }
    const moveToVideoListPage = () => {
        navigate("../videos");

    }
    const handleDrop=(event)=>{
        event.preventDefault();
    }
    function cancelEdit() {
        setFormMode(preMode => {
            const sp = new URLSearchParams();
            sp.delete("mode")
            return "add";
        })

    }
    
  return <div className="add-book-pg">
        <div className="topNav">
            <button className="btn " data-tooltip-id="tooltipBackButton"
            onClick={goBackToPreviousPage}> <i className="bi bi-chevron-left"></i> Back</button>
            <button className="btn " onClick={moveToVideoListPage}>video List</button>
        </div>

        <div className="addbookHdr" onDrop={handleDrop} >
            <span className="iconSize">
                <FontAwesomeIcon icon={faUpload} /> <FontAwesomeIcon icon={faFilm} />
            </span>
            <h4 >Upload Video to Library</h4>
        </div>
        <div className="add-book-frm" onDrop={handleDrop}>
            <Suspense fallback={<SectionLoader sectionName={"Video upload form"} />} >
                <Await resolve={loadedCataloguePromise.catalogueData}>
                  {
                      (catalogueListing)=>{
                        const { data: { data: { catalogue: catalogueList } } } = catalogueListing;
                     return <VideoUploader mode={formmode} libraryCatalogue={catalogueList}
                      videoId={videoToEdit} formModeReset={handleFormReset}  />
                      }
                  }
                </Await>
            </Suspense>                                               
           
           <Tooltip id="tooltipBackButton" style={tooltipStyle} place="bottom"
            content="back to previous page" />
        </div>
        <div className="bottomNav">
            <button className="btn " onClick={moveToVideoListPage}>Video List</button>
        </div>
        
    </div>


}

export default AddVideos;