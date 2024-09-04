import {authenticateAdmin } from "../auth/authHandler";
import { libraryResourcesVideos } from "../data-utils/dataLoaders";
import { useEffect, useState, useTransition } from "react";
import CardContainer from "../components/CardContainer/CardContainer";
import TableActionButton from "../components/TableActionButton/TableActionButton";
import DataTableViewer from "../components/DataTableViewer/DataTableViewer";
import { useLoaderData } from "react-router-dom";
import DeleteModal from "../components/ModalDialogs/DeleteModal";
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { deleteVideo } from "../data-utils/server";


export const loader = () => {
     authenticateAdmin("/")
     try{
         return libraryResourcesVideos();
     }
     catch(error){
        return null;
     }
 }



 const LibraryVideos=()=>{
   const loadedlibraryVideos= useLoaderData()
   const { data: { data: { videos: videoList } } }=loadedlibraryVideos
   const  [libraryVideos, setlibraryVideos]=useState(videoList);
   const tableRecordStyle={font:'normal 0.92em Calibri',margin:'0'};
   const [modalShow, setModalShow] = useState(false);
   const [headerText, setHeaderText]=useState("");
   const [modalBody, setModalBody]=useState("");
   const [recordId,setRecordId]=useState()
   const [startDelete,setStartDelete]=useState(false);
   const [searchTerm,setSearchTerm]=useState("");
   const [filtered,setFiltered]=useState([]);
   const [isPending, startTransition]= useTransition();

   function handleEdit(videoId){
        

   }
   function handleDelete(videoId){
    setHeaderText("Delete Book");
    setModalBody("  Are you sure, you want to delete this resource from library?");
    setRecordId(videoId);
     setModalShow(true);
     
   }

   useEffect(()=>{
    if(startDelete){
       deleteVideo(recordId);  
       setStartDelete(false);
       
    }

   },[startDelete]);

  const goBackToPreviousPage=()=>{

  }
   const deleteLibVideo=()=>{
     setModalShow(false);
     setStartDelete(true);
   }

  const handleSearch=(event)=>{
       const {value}=event.target;
        setSearchTerm(value);
       startTransition(()=>{
           setlibraryVideos( videoList.filter(video=>video.title.toLocaleLowerCase().includes(value.toLocaleLowerCase()))) ;
       })
       
  } 

 
   const videoListColumns = [
      {
          header: 'Video Title',
          accessorKey: 'title',
          cell: ({ getValue }) => <p style={tableRecordStyle}>{getValue()}</p>
      },
      {
          header: 'Creators/Source',
          accessorKey: 'creators_origin',
          cell: ({ getValue }) => <p style={tableRecordStyle}>{getValue()}</p>
      },
      {
          header: 'Vidoe Format',
          accessorKey: 'format',
          cell: ({ getValue }) => <p style={tableRecordStyle}>{getValue()}</p>
      },
      {
          header: 'About Video',
          accessorKey: 'videoDescription',
          cell: ({ getValue }) => <p style={tableRecordStyle}>{getValue() }</p>
      },
      {  
          header:'Action(s)',
          accessorKey:'_id',
          cell:({getValue})=><TableActionButton showDelete={true} showEdit={true} 
           handleDelete={()=>handleDelete(getValue())}  handleEdit={()=>handleEdit(getValue())} />
        }
  ]
   return (
     <div>
        <div className="topSearch">
          <p className="matchcount">{videoList.length !== libraryVideos.length ? `${libraryVideos.length} macthes`:null}</p>
          <div className="searchNav"> 
           <button className="btn " onClick={goBackToPreviousPage}> <i className="bi bi-chevron-left"></i> Back</button>
            <div className="input-group control-search"> 
             <input type="text" className="form-control searchBox" placeholder="Search"
            onChange={handleSearch} value={searchTerm} name="txtSearch" />
            <button className="btn  search-btn" onClick={handleSearch} 
            type="button"><FontAwesomeIcon icon={faMagnifyingGlass} size="lg" /></button>
         </div>
         </div>
           <h2 className="page-caption listpg-caption ">Video List</h2>
        </div>
        {

        }
      <CardContainer cardType={"video"}  cardData={libraryVideos} pageLimit={20} handleDelete={handleDelete} 
       handleEdit={handleEdit} loading={isPending} />

       <div className="table-sectn">
          <DataTableViewer columns={videoListColumns} data={libraryVideos}
           enableFilter={true} pageLimit={25} />
       </div>
       < DeleteModal  show={modalShow}
           bodyText={modalBody}
           onHide={() => setModalShow(false)} headerText={headerText}
           submitHandler={()=>deleteLibVideo()}/>
     </div>
   )
   
}

export default LibraryVideos;

