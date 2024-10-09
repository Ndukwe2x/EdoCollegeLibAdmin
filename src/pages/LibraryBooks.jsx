import { Suspense, useEffect, useState, useTransition } from "react";
import {authenticateAdmin } from "../auth/authHandler";
import CardContainer from "../components/CardContainer/CardContainer";
import { libraryResourcesBooks } from "../data-utils/dataLoaders";
import TableActionButton from "../components/TableActionButton/TableActionButton";
import DataTableViewer from "../components/DataTableViewer/DataTableViewer";
import { Await, defer, useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import DeleteModal from "../components/ModalDialogs/DeleteModal";
import PromptModal from "../components/ModalDialogs/PromptModal";
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { deleteBook } from "../data-utils/server";
import SectionLoader from "../components/SectionLoader/SectionLoader";
import { Tooltip } from "react-tooltip";


export const loader = () => {
     authenticateAdmin("/")
     try{
      return defer({bookList:libraryResourcesBooks() })   
     }
     catch(error){
        return null;
     }
    
 }

 const LibraryBooks=()=>{
   const loadedlibraryBooksPromise = useLoaderData()
   const [libraryBooks, setLibraryBooks]=useState([]);
   const [searchResult, setSearchResult]=useState([]);
   const [submitting,setSumbitting]=useState(false);
   const [modalShow, setModalShow] = useState(false);
   const [headerText, setHeaderText]=useState("");
   const [modalBody, setModalBody]=useState("");
   const [showPromptModal,setShowPromptModal]=useState(false);
   const [promptMode,setPromptMode]=useState("");
   const [recordId,setRecordId]=useState(null);
   const [startDelete,setStartDelete]=useState(false);
   const [searchTerm,setSearchTerm]=useState("");
   const [isPending, startTransition]= useTransition();
   const [firstInstanceRender,setFirstInstanceRender]=useState(true);
   const navigate= useNavigate();

   const [searchParams,setSearchParams]=useSearchParams();

  const tableRecordStyle={font:'normal 0.92em Calibri',margin:'0'};
  const tooltipStyle = {backgroundColor: '#605286' };
  //setSearchParams({mode:"edit",resourceId:293002002});
   
  function handleEdit(bookId){
    
     const navigationPath= '../addbooks';
     const navigationState={mode:"edit",resourceId:bookId};
        
     navigate(navigationPath,{state:navigationState});
     
   }
   function handleDelete(bookId){
     setHeaderText("Delete Book");
     setModalBody("  Are you sure, you want to delete this resource from library?");
     setRecordId(bookId);
     setModalShow(true);
     
   }
   
   useEffect(()=>{
  
    if(firstInstanceRender){
      libraryResourcesBooks()
      .then(response=>{
      const { data: { data: { books: bookList } } }=response;
      setLibraryBooks(bookList);  
      setSearchResult(bookList);
      })
    .catch(error=>console.log(error))
    .finally(()=>setFirstInstanceRender(false))   
    }  

  },[]);

   useEffect(()=>{
    if(startDelete){
       setSumbitting(true);
        
        const performDelete=async()=>{
            try {
             
              const deleteResponse= await deleteBook(recordId); 
            
             if(deleteResponse.status==200){
                await  refreshLibraryBooks();
              }          

            } catch (error) {
              await handleError(error);
              console.log(error);
            }finally{
              setSumbitting(false);
              setStartDelete(false);
            }
        }
         const handleError=async(err)=>{
            const {status}=err?.response;
            const {statusText}=err?.response;
                  
           if (status==404 && statusText === "Not Found" )
           {  
              setHeaderText("Book Not Found");
              setModalBody("Book seems be already removed from database");
              setPromptMode("info");
              setShowPromptModal(true)
              await refreshLibraryBooks();
           }
        }
        const refreshLibraryBooks=async()=>{
          const currentBookInLibrary= await libraryResourcesBooks();
          const { data: { data: { books: newbookList } } } =currentBookInLibrary;
          setLibraryBooks(newbookList);
          setSearchResult(newbookList);//sync book list display with initial no search
        }
        performDelete();
        setStartDelete(false);
        setSumbitting(false);
    }

   },[startDelete]);
  


  const goBackToPreviousPage=()=>{
   navigate(-1);
  }
   const deleteSelectedBook=()=>{
     setModalShow(false);
     setStartDelete(true);
   }

  const handleSearch=(event)=>{
       const {value}=event.target;
       setSearchTerm(value);
       startTransition(()=>{
           setLibraryBooks(searchResult.filter(book=>book.title.toLocaleLowerCase().includes(value.toLocaleLowerCase()))) ;
       })
       
  } 
   const bookListColumns = [
      {
          header: 'Book Title',
          accessorKey: 'title',
          cell: ({ getValue }) => <p style={tableRecordStyle}>{getValue()}</p>
      },
      {
          header: 'Author(s)',
          accessorKey: 'author',
          cell: ({ getValue }) => <p style={tableRecordStyle}>{getValue()}</p>
      },
      {
          header: 'Doc Type',
          accessorKey: 'docType',
          cell: ({ getValue }) => <p style={tableRecordStyle}>{getValue()}</p>
      },
      {
          header: 'ISBN',
          accessorKey: 'isbn',
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
          <p className="matchcount">
            {searchResult.length !== libraryBooks.length ? `${libraryBooks.length} macthes`:null}
          </p>
          <div className="searchNav"> 
           <button className="btn topnav-booklist" data-tooltip-id="tooltipBackButton"
            onClick={goBackToPreviousPage}> <i className="bi bi-chevron-left"></i> Back</button>
            <div className="input-group control-search"> 
             <input type="text" className="form-control searchBox" placeholder="Search"
            onChange={handleSearch} value={searchTerm} name="txtSearch" />
            <button className="btn  search-btn" onClick={handleSearch} 
            type="button"><FontAwesomeIcon icon={faMagnifyingGlass} size="lg" /></button>
         </div>
         </div>
           <h2 className="page-caption listpg-caption ">Book List</h2>
        </div>
       <div   disabled={submitting}>
        <Suspense fallback={<SectionLoader sectionName={"Books card list"} />}>
          {firstInstanceRender?(
           <Await resolve={loadedlibraryBooksPromise.bookList}>
              {
                 (bookResource)=>{
                  const { data: { data: { books: booksCollection } } }=bookResource;
                 return <CardContainer cardType={"books"}  cardData={booksCollection} pageLimit={20} handleDelete={handleDelete} 
                handleEdit={handleEdit} loading={isPending} />
                 }
              }
          </Await>):( <CardContainer cardType={"books"}  cardData={libraryBooks} pageLimit={20} handleDelete={handleDelete} 
       handleEdit={handleEdit} loading={isPending} />)
          }
        </Suspense>
     
      </div>
       <div className="table-sectn" disabled={submitting}>
       <Suspense fallback={<SectionLoader sectionName={"Books list"} />}>
          {firstInstanceRender?(
           <Await resolve={loadedlibraryBooksPromise.bookList}>
              {
                 (bookResource)=>{
                  const { data: { data: { books:booksCollection } } }=bookResource;
                 return <DataTableViewer columns={bookListColumns} data={booksCollection}
                 enableFilter={true} pageLimit={25} />
                 }
              }
          </Await>):( <DataTableViewer columns={bookListColumns} data={libraryBooks}
           enableFilter={true} pageLimit={25} />)
          }
        </Suspense>
       
       </div>
      
       <PromptModal onHide={()=>setShowPromptModal(false)} headerText={headerText}
            show={showPromptModal} bodyText={modalBody} mode={promptMode} />
       <DeleteModal  show={modalShow}
           bodyText={modalBody}
           onHide={() => setModalShow(false)} headerText={headerText}
           submitHandler={()=>deleteSelectedBook()}/>           
           <Tooltip id="tooltipBackButton" style={tooltipStyle} place="bottom" content="back to previous page" />
     </div>
   )
   
}

export default LibraryBooks;