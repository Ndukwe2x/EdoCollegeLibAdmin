import { useEffect, useState, useTransition } from "react";
import {authenticateAdmin } from "../auth/authHandler";
import CardContainer from "../components/CardContainer/CardContainer";
import { libraryResourcesBooks } from "../data-utils/dataLoaders";
import TableActionButton from "../components/TableActionButton/TableActionButton";
import DataTableViewer from "../components/DataTableViewer/DataTableViewer";
import { useLoaderData } from "react-router-dom";
import DeleteModal from "../components/ModalDialogs/DeleteModal";
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { deleteBook } from "../data-utils/server";



export const loader = () => {
     authenticateAdmin("/")
     try{
      return libraryResourcesBooks()    
     }
     catch(error){
        return null;
     }
    
 }

 const LibraryBooks=()=>{
   const loadedlibraryBooks = useLoaderData()
   const { data: { data: { books: bookList } } }=loadedlibraryBooks
   const  [libraryBooks, setLibraryBooks]=useState(bookList);
   const tableRecordStyle={font:'normal 0.92em Calibri',margin:'0'};
   const [submitting,setSumbitting]=useState(false);
   const [modalShow, setModalShow] = useState(false);
   const [headerText, setHeaderText]=useState("");
   const [modalBody, setModalBody]=useState("");
   const [recordId,setRecordId]=useState(null);
   const [startDelete,setStartDelete]=useState(false);
   const [searchTerm,setSearchTerm]=useState("");
   const [isPending, startTransition]= useTransition();

   function handleEdit(bookId){
        

   }
   function handleDelete(bookId){
     setHeaderText("Delete Book");
     setModalBody("  Are you sure, you want to delete this resource from library?");
     setRecordId(bookId);
     setModalShow(true);
     
   }

   useEffect(()=>{
    if(startDelete){
       setSumbitting(true);
        
        const performDelete=async()=>{
            try {

              console.log("About to delete...")
              const deleteResponse= await deleteBook(recordId);
              console.log("top level delete", deleteResponse);

            } catch (error) {
              console.log(error)
            }finally{
              setSumbitting(false);
            }
        }
        performDelete();
        setStartDelete(false);
    }

   },[startDelete]);

  const goBackToPreviousPage=()=>{

  }
   const deleteSelectedBook=()=>{
     setModalShow(false);
     setStartDelete(true);
   }

  const handleSearch=(event)=>{
       const {value}=event.target;
        setSearchTerm(value);
       startTransition(()=>{
           setLibraryBooks( bookList.filter(book=>book.title.toLocaleLowerCase().includes(value.toLocaleLowerCase()))) ;
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
          <p className="matchcount">{bookList.length !== libraryBooks.length ? `${libraryBooks.length} macthes`:null}</p>
          <div className="searchNav"> 
           <button className="btn " onClick={goBackToPreviousPage}> <i className="bi bi-chevron-left"></i> Back</button>
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
      <CardContainer cardType={"books"}  cardData={libraryBooks} pageLimit={20} handleDelete={handleDelete} 
       handleEdit={handleEdit} loading={isPending} />
      </div>
       <div className="table-sectn" disabled={submitting}>
          <DataTableViewer columns={bookListColumns} data={libraryBooks}
           enableFilter={true} pageLimit={25} />
       </div>
       < DeleteModal  show={modalShow}
           bodyText={modalBody}
           onHide={() => setModalShow(false)} headerText={headerText}
           submitHandler={()=>deleteSelectedBook()}/>
     </div>
   )
   
}

export default LibraryBooks;