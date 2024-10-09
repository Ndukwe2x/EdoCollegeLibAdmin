import { useEffect, useReducer, useRef, useState } from 'react';
import  './stylebookuploader.css';
import {libraryResourcesBooks,catalogueDataLoader} from '../../data-utils/dataLoaders';
import { NavLink} from 'react-router-dom';
import PromptModal from '../ModalDialogs/PromptModal';
import { Tooltip } from 'react-tooltip';
import cursorDropLocation from '../../assets/cursorAdd.png'
import progressLoop from '../../assets/progressloop.gif';
import bookuploadimg from '../../assets/dtchfile.png';
import {AddToBooks, editBook, uploadBookToS3, uploadCoverImageToS3,
   uploadSmallSizeBookFile } from '../../data-utils/server';


const BookUploader=({mode="add", libraryCatalogue, bookId=null, formModeReset })=>{
    const tooltipStyle = { backgroundColor: '#20134488' };
    const cursorDragStyle={cursor:`url("${cursorDropLocation}") ,auto`,
    boxShadow:"rgba(8, 104, 75, 0.877) 0 0 18px 2px"};
        
      
    const [promptBody,setPromptBody]=useState("");
    const [promptHeader,setPromptHeader]=useState("");
    const [promptMode,setPromptMode]=useState("");
    const [showModal,setShowModal]=useState(false);    
    const [submitStatus, setSubmitStatus] = useState("idle");
    const [startSubmit, setStartSubmit] = useState(false);
    const [bookFileSubmit,setBookFileSubmit]=useState(false)
    const [bookCoverSubmit,setBookCoverSubmit]=useState(false);   
    const [onDragEnter,setDragEnter]=useState(false);
    const [onDragEnterBook,setDragEnterBook]=useState(false);
    const [fileToBeUploaded, setFileToBeUploaded]=useState("");
    const [coverFile,setCoverFile]=useState("");
    const [uploadInProgress,setUploadInProgress]=useState(false);
    const [bookUploadInProgress,setBookUploadInProgress]=useState(false);
    const [progressLevel,setProgressLevel]=useState(0);
    const [defaultBookDetails,setDefaultBookDetails]=useState({});
    
    const bookFileInputRef = useRef(null);
    const coverBookFileInputRef = useRef(null);

    const progressStyle={width:`${progressLevel}%`};       

    const [formData,setFormData]=useState({
      catalogueRef: "", title: "", author: "", isbn: "",
      docType: "",
      edition: "",
      bookCover:undefined,
      bookFile: "",
      coverImageType: "",
      yearOfPublication: "",
      downloadable: "",
      bookDescription: "",
    });
    
     const [formError, setFormError] = useState({
        catalogueRef: false, title: false, author: false, isbn: false,
        docType: false,
        edition: false,
        bookCover: false,
        bookFile: false,
        coverImageType: false,
        yearOfPublication: false,
        downloadable: false,
        bookDescription: false
    });
    
    const formStepTracker=(state,action)=>{
      if(action.type=="next")
        return {step: state.step < 3 ? state.step + 1:3};
      if(action.type=="previous")
          return {step: state.step > 1 ? state.step -1:1};
     return state;
    }
    const initialFormStep={step:1}
    const [formStep,dispatchStep]=useReducer(formStepTracker,initialFormStep);
    
   
    
   useEffect(()=>{

    if(startSubmit){

       const finalizeBookSubmit=async()=>{
         let status=null;
          try {
            if(mode=="add")
            { 
              const bookDetailsResponse = await AddToBooks(formData);
              status=bookDetailsResponse.data.status;
            }
            else if(mode=="edit")
            {
              const bookDetailsResponse= await editBook(formData);
              status= bookDetailsResponse?.data?.status;
            }
            if (status =="success") {
            { 
               resetFormToAddMode();
            }
          }
            } catch (error)
            {
             setPromptHeader("Error on Submit");
             setPromptBody(" Failed to complete upload, error while submitting. Try again later");
             setPromptMode("error");
             setShowModal(true);
              console.log(error);
            }finally{
            
            setStartSubmit(false);
            setSubmitStatus("idle")
          }
       }
       finalizeBookSubmit();
     }
     setStartSubmit(false);

  }, [startSubmit]);


    useEffect(()=>{
          async function  loadBookEditValues(){
            try {
                 const libraryBooks= await libraryResourcesBooks();
                 if(libraryBooks){ //setup books for edit
                    const {data:{data:{books:books}}}=libraryBooks;   
                    const selectedBook=books.filter(bookRecord=>bookRecord._id==bookId)[0];
                    
                    if(selectedBook==null || !selectedBook){
                      setPromptHeader('Not Found!');
                      setPromptBody(` Book entry not found in the library, book may have been deleted`);
                      setPromptMode("error");
                      setShowModal(true);
                      resetFormToAddMode();
                    }else
                    {  setFormData({...selectedBook,_id:selectedBook._id,bookFile:selectedBook.fileName,
                        bookCover:{key:selectedBook.coverImageName,url:selectedBook.coverUrl,
                          filetype:selectedBook.coverImageType} }); 

                        setDefaultBookDetails({...selectedBook,_id:selectedBook._id,bookFile:selectedBook.fileName,
                          bookCover:{key:selectedBook.coverImageName,url:selectedBook.coverUrl,
                            filetype:selectedBook.coverImageType} });
                      }                                                                     
                 }
                
               } catch (err) {
                 console.log(err);
               }
           }          
           if(mode=="edit" && bookId){
                loadBookEditValues();
               
           }
          
    },[]);

    

  useEffect(()=>{
    if(bookCoverSubmit){
      async function uploadBookCover(){
        try {
           const bookCoverUploadResponse= await uploadCoverImageToS3(coverFile);
          
           if(bookCoverUploadResponse.status == 201 ){
            const coverImageFile=bookCoverUploadResponse.data.bookCover;            
           setFormData(prevData => ({ ...prevData, bookCover:coverImageFile,
              coverImageType:coverImageFile.filetype
             }));     
          
           }                      
           
        } catch (err) {
          setPromptHeader("Error on Submit");
          setPromptBody(" Could not complete upload, Error while submitting. Try again later");
          setPromptMode("error");
          setShowModal(true);
         console.log(err);
        }finally{
          setBookCoverSubmit(false);
          setUploadInProgress(false);
        }
      }
       uploadBookCover();        
    }
    
   },[bookCoverSubmit]); 

   //upload book file
   useEffect(()=>{ 
      if(bookFileSubmit){

        function handleProgressBarUpdate(uploadPrgress){          
          setProgressLevel(prevLevel=>{
                if(prevLevel>=95) return 0;
                return prevLevel+uploadPrgress;})

        }
      async  function uploadBookFile(){
            
            setBookUploadInProgress(true);             
            if (fileToBeUploaded.size < (1024 * 1024 * 10)) //less than 10MB.            
               {
                    const timer= setInterval(()=>{
                    setProgressLevel((prevLevel)=>{ 
                      if(prevLevel>=100) return 0; 
                       return  prevLevel + 2;})
                  },2000);
                  uploadSmallSizeBookFile(fileToBeUploaded).then(
                    response=>{
                       setProgressLevel(100); 
                       setFormData(prevData => ({ ...prevData, 
                        bookFile: response.data.fileKey,docType:response.data.filetype }));                                           
                    }
                  ).catch(err=>{ 
                    console.log(err)
                  })
                  .finally(()=>{
                     clearInterval(timer);
                     setBookUploadInProgress(false);
                     setProgressLevel(0);
                    })
                             
               }
               else{
                
                 try {
                    const upldResponse = await  uploadBookToS3(fileToBeUploaded, handleProgressBarUpdate);
                       if (upldResponse.status == 201) 
                       {
                         const documentType= fileToBeUploaded.type;
                         setBookUploadInProgress(false);
                         setFormData(prevData => ({ ...prevData,docType:documentType, bookFile:upldResponse.filename }));
                       
                       }
                    
                 } catch (error) {
                   console.log(error);
                 }finally{
                  setProgressLevel(0);//reset progress bar.
                  setBookUploadInProgress(false);
                 }             

              }
              setBookFileSubmit(false)
             
        }
        uploadBookFile();
      }
   },[bookFileSubmit])
   
        
 const handleResetEdit=()=>{
  console.log("Form reset details", defaultBookDetails);
   setFormData(defaultBookDetails);
 }
 const submitBook=(event)=>{
        event.preventDefault();
        setSubmitStatus("submitting");
        setStartSubmit(true);   
    }

  function clearError(event) {
      const { name } = event.target;
      setFormError(prevError => {
          return { ...prevError, [name]: false }
      })
  }
  
  const resetFormToAddMode=()=>{
    clearAndResetForm();
    formModeReset();
  }
  const handleClearFormClick=(event)=>{
    event.preventDefault();
    clearAndResetForm();
  }
  function clearAndResetForm(){
    clearForm();
    dispatchStep({type:"previous"});
    dispatchStep({type:"previous"});
  }
  function clearForm() {
    setStartSubmit(false);
    setSubmitStatus("idle");
    
    setFormData({
        catalogueRef: "", title: "", author: "", isbn: "",
        docType: "",
        edition: "",
        bookCover:undefined,
        bookFile:"",
        yearOfPublication: "",
        downloadable: "",
        bookDescription: "",
    });

    setDefaultBookDetails({});
    setFormError({
        catalogueRef: false, title: false, author: false, isbn: false,
        docType: false,
        edition: false,
        bookCover: false,
        bookFile: false,
        coverImageType: false,
        yearOfPublication: false,
        downloadable: false,
        bookDescription: false
    })
 }
 
  function setError(name) {
    setFormError(prevError => {
        return { ...prevError, [name]: true }
    })
  }
  const handleChange=(event)=>{
    const { name, type, value } = event.target;
    setFormData(prevData => {
      return { ...prevData, [name]: type === "checked" ? checked : value }
    })
    
  }
 function handleBookUploadEditDelete(event){
   const {id}=event.target;
   if(mode=="add"){
     if(id=="coverDelIcon")
      return setFormData(prevData =>({ ...prevData, bookCover: undefined }));
    else if(id=="bookDelIcon")
      return setFormData(prevData => ({ ...prevData, bookFile: "" }));
   
   }
   if(mode=="edit"){
      if(id=="coverEditIcon")
         coverBookFileInputRef.current.click();
     else if(id=="bookEditIcon")
         bookFileInputRef.current.click();
   }
 }
  const handleDragOver=(event)=>{
    event.preventDefault();
    const {id}=event.target;
    if(id=="bookDropSctn")
     return  setDragEnterBook(true);
    setDragEnter(true);   

  }
  const handleDragEnterBookCover=(event)=>{
    event.preventDefault();
    clearBookCoverError();
    setDragEnter(true)
  }

 const handleDragEnterBookFile=(event)=>{
    event.preventDefault();
    clearBookFileError()
    setDragEnterBook(true);
  }
  const handleDragLeave=(event)=>{
    event.preventDefault();
    const {id}=event.target;
    if(id=="bookDropSctn")
     return  setDragEnterBook(false);
    setDragEnter(false);
   
  }
  const handleCoverDrop=(event)=>{
    event.preventDefault();
    setDragEnter(false);
    const droppedFile= event.dataTransfer.files[0];

    if(validateCoverImage(droppedFile))
    {  
       setCoverFile(droppedFile); 
       setUploadInProgress(true);
       setBookCoverSubmit(true); 
     }   
    
  }
  const handleBookFileDrop=(event)=>{
     event.preventDefault();
     setDragEnterBook(false);
     const droppedFile=event.dataTransfer.files[0];
     setFileToBeUploaded(droppedFile);
     setBookFileSubmit(true);
  }
  const handleDragExit=(event)=>{
   handleDragLeave(event);
  }
  const handleInputFileClick=(event)=>{
    event.preventDefault();
    const {id}=event.target;  
    if(id=="coverImgIcon")
    { 
      coverBookFileInputRef.current.click();
    }
    else if(id=="bookFileIcon") 
      bookFileInputRef.current.click();
  }

  const handleFileChange=(event)=>{    
  
    const { name } = event.target;     
    const uploadFile=event.target.files[0]; 
    if(name=="bookCover"){
      if(validateCoverImage(uploadFile))
      { 
        setCoverFile(uploadFile);
        setUploadInProgress(true); 
        setBookCoverSubmit(true);
      }
      return;
     }
     if(name=="bookFile"){  
        setFileToBeUploaded(uploadFile);
        setBookFileSubmit(true); 
     }
    
  }
  const handleMoveNext=()=>{
   if(validateForm())
     dispatchStep({type:"next"});
 }
  const validateCoverImage=(coverFile)=>{
     const {size,type}=coverFile;
     let validated=true;

     if (!((type == "image/jpeg" || type == "image/gif" || type == "image/png" || type == "image/jpg")
        && size < 3670016)) {
          
          setFormError(prevError => {
              return { ...prevError, bookCover:true, coverImageType: true}
          })
          validated=false;       
      
  }  
  return validated;
 }
 const clearBookCoverError=()=>{
   setFormError(prevError => {
    return { ...prevError, bookCover:false, coverImageType: false}
   })
 }
 const clearBookFileError=()=>{
  setFormError(prevError => ( { ...prevError, bookFile:false}));

 }
   const validateForm=()=>{
      let validationPass = true;
       switch(formStep.step){
        case 1:
         if (formData.author == "")
          {  
             setError("author");
             validationPass=false;             
           }         
         if (formData.title == ""){
              setError("title")
              validationPass=false;
          }
         break;
        case 2:
          if(formData.bookFile=="")
             { 
              setError("bookFile")
              validationPass=false;
             }
          break;
       }
      return validationPass;

  }
  const getCatalogueText=()=>{
    const catalougeId=formData?.catalogueRef;
    const catalougeText= catalougeId && catalougeId!=""? libraryCatalogue.filter((catlogData)=>catlogData._id==catalougeId)[0].title:"";
    
    return catalougeText;
    
  }
   const validatePublicationYear=(event)=>{
    const { name, value } = event.target;
    if (value && value != "") {
        const currentYear = new Date().getFullYear();
        if (isNaN(value) || value > currentYear)
            setFormError(prevError => {
                return { ...prevError, [name]: true }
            });
    }
}

function displayForm(uploadStage){
      
      switch(uploadStage){
        case 2:
          return (<>
          <h3 className='stepname'>File Uploads</h3>
           <div className='cover-image'>
               <h4 className='upld-hdr'>Book Cover Image</h4>
              <div className='cvrimg-paneupload pane-upload' onDragEnter={handleDragEnterBookCover} 
               onDragOver={handleDragOver} onDrop={handleCoverDrop} onDragExit={handleDragExit} 
                onDragLeave={handleDragLeave}  style={onDragEnter?(cursorDragStyle):({cursor:"default"})} >
                  {formData?.bookCover?.url && <span className='deleteUploaded'>
                    <button className='uploadDelete' title='remove' type='button' onClick={handleBookUploadEditDelete}> 
                      { mode==="add"? <i id='coverDelIcon' className="bi bi-x-circle-fill deleteIcon"></i>
                       :(<i id='coverEditIcon' className="bi bi-pencil-square editIcon"></i>)}
                    </button>
                  </span>}
                  {
                   uploadInProgress?
                   <div className='coveruploadprgrss'> <img alt='Uploading...' src={progressLoop}/>
                    <p>Uploading...</p>
                  </div>
                   :
                   formData?.bookCover?.url ?
                   <div className='coveruploadprgrss'>
                    <img alt='uploaded book cover' src={formData?.bookCover?.url} />
                   </div>:
                  (<>
                   <p className='upld-tag'>Browse or drag-drop to upload</p>
                   <div className='upload-icon-box' >
                        <button  type='submit' data-tooltip-id='tooltipcoverImage'
                        onBlur={clearBookCoverError}  onClick={handleInputFileClick}>
                          <i id='coverImgIcon' className="bi bi-cloud-arrow-up-fill upload-icon"></i>
                      </button>
                  </div> 
                  </>) }
                 <input type="file" id="coverImage"  name="bookCover"
                       onChange={handleFileChange} ref={coverBookFileInputRef} hidden accept="image/*"   />
                
               </div>
               {formError.bookCover ? (<p className='errTxt'>{`*invalid file type or file size exceeded (max:6MB)`}</p>) : null}
           </div>
           <div className='book-file'>
              <h3 className='upld-hdr upld-hdrbook'>Book File</h3>
                 <div className='bookFile-paneupload pane-upload' id='bookDropSctn' onDragEnter={handleDragEnterBookFile} 
               onDragOver={handleDragOver} onDrop={handleBookFileDrop} onDragExit={handleDragExit} 
                onDragLeave={handleDragLeave}  style={onDragEnterBook?(cursorDragStyle):({cursor:"default"})}  >
                 { formData.bookFile!=="" && <span className='deleteUploaded bkfileDelete'>
                    <button className='uploadDelete' title='remove/change' type='button' onClick={handleBookUploadEditDelete}>
                      {mode==="add"? <i id='bookDelIcon' className="bi bi-x-circle-fill deleteIcon"></i>
                       :(<i id='bookEditIcon' className="bi bi-pencil-square editIcon"></i>)}
                    </button>
                 </span>}
                  { bookUploadInProgress?
                  (<div className='prgrssbar'>                     
                      <div className="progress" role="progressbar"  aria-label={"Basic example"}
                       aria-valuenow={progressLevel} aria-valuemin={"0"}  aria-valuemax={"100"}>
                        <div className="progress-bar" style={progressStyle}>{`${progressLevel}%`}</div>
                      </div>
                      <p>Uploading...</p>
                  </div>)
                  :
                  formData.bookFile!=="" ? (<div className='successupload'><div className='upldbk-iconsctn'>
                         <img alt="bookupld" src={bookuploadimg}/>
                        </div>
                         <div className='chkmark'>
                         <i className="bi bi-check2 chkIcon"></i>
                           <p>upload successful!</p>
                         </div>
                     </div>)
                    :
                     (<>
                      <p className='upld-tag'>Browse or drag-drop to upload</p>
                      <div className='upload-icon-box'>
                        <button  type='submit' name='btnSubmitBookFile'  data-tooltip-id='tooltipbookfile'
                          onBlur={clearBookFileError}  onClick={handleInputFileClick} >
                              <i id='bookFileIcon'  className="bi bi-cloud-arrow-up-fill upload-icon"></i>
                          </button>
                      </div>
                    </>)
                    }
                  <input id="bookfile" name="bookFile" type="file" className="form-control"
                      onChange={handleFileChange} ref={bookFileInputRef} hidden />
               </div>
               {formError.bookFile ? (<p className='errTxt'>{`*Book File is required`}</p>) : null}
           </div>
           
          </>);
        case 3:
          return(<>
             <h3 className='stepname'>Summary</h3>
              <div className='bookdetailstotal'>
                   <div className='entry'>
                     <span className='dtlcaption'>Catalogue :</span>
                     <span className='dtlinfo'>{getCatalogueText()}</span>
                  </div>
                  <div className='entry'>
                    <span className='dtlcaption'>Book Title:</span>
                    <span className='dtlinfo'>{formData.title}</span>
                  </div>
                  <div className='entry'>
                    <span className='dtlcaption'>Author(s):</span>
                    <span className='dtlinfo'>{formData.author}</span>
                 </div>
                  <div className='entry'>
                    <span className='dtlcaption'>Edition:</span>
                    <span className='dtlinfo'>{formData.edition==""?"N/A":formData.edition}</span>
                 </div>
                  <div className='entry'>
                    <span className='dtlcaption'>Publication Year:</span>
                    <span className='dtlinfo'>{formData.yearOfPublication==""?"N/A":formData.yearOfPublication}</span>
                </div>
                <div className='entry'>
                   <span className='dtlcaption'>Isbn:</span>
                   <span className='dtlinfo'>{formData.isbn==""?"N/A":formData.isbn}</span>
                </div>
                <div className='entry'>
                  <span className='dtlcaption'>Description:</span>
                  <span className='dtlinfo description'>{formData.bookDescription==""?"N/A":formData.bookDescription}</span>
                </div>
                            
              </div>
          </>)
      }


     return(<>
        <h3 className='stepname'>Book Details</h3>
        <label id="catalogueLabel" htmlFor="catalogue">Catalogue</label>
        <select name="catalogueRef" id="catalogue" className="form-control form-select" onChange={handleChange}
          value={formData.catalogueRef} >
          <option value="">--- Select option ---</option>
          {libraryCatalogue && libraryCatalogue.map(catlog => {
              return <option key={catlog._id} value={catlog._id}>{catlog.title}</option>
          })
          }
      </select>
      <label htmlFor="title">Book Title</label>
        <input name="title" type="text" id="title" className="form-control" maxLength={100}
            placeholder="Enter book title" 
            onChange={handleChange} onFocus={clearError} onBlur={validateForm} value={formData.title} />
        {formError.title ? (<p className='errTxt'>*required</p>) : null}

        <label htmlFor="author">Author(s)</label>
        <input name="author" type="text" id="author" className="form-control"  placeholder=" author(s)"
            data-tooltip-id="tooltipbookauthors" onFocus={clearError}
            onChange={handleChange} onBlur={validateForm} value={formData.author} />
        {formError.author ? (<p className='errTxt'>*required</p>) : null}
        
        <label htmlFor="edition">Edition</label>
          <input name="edition" type="text" id="edition" className="form-control"
              placeholder="edition"  onChange={handleChange} value={formData.edition}  />

   <label htmlFor="yearPublished">Publication Year</label>
     <input type="text" id="yearPublished" className="form-control" placeholder="year of publication" 
     name="yearOfPublication"  onFocus={clearError}  onChange={handleChange} onBlur={validatePublicationYear}
      value={formData.yearOfPublication} maxLength={4} />
  {formError.yearOfPublication ? (<p className='errTxt'>*invalid publication value</p>) : null} 

  <label htmlFor="isbn">Isbn</label>
  <input type="text" id="isbn" className="form-control" name="isbn"  placeholder="Isbn" 
  onChange={handleChange} value={formData.isbn} maxLength={35} />

   <label htmlFor="bookDescptn">Description</label>
   <textarea id="bookDescptn" name="bookDescription" className="form-control textarea center"
          onChange={handleChange}  value={formData.bookDescription} />
     
           
  </>);
    }

    return(<div className=''>         
         <form onSubmit={submitBook} encType="multipart/form-data" >
           <div className='formstep-marker'><span>{"Step  "}
             <i className={`bi bi-${formStep.step}-circle-fill step-icon`}></i>{`  of  3`} </span></div>
            {              
             displayForm(formStep.step)
            }
            <div className='btn-sctn-addBk'>
               <div className='navbtns'>
                  {formStep.step >1 && <button data-tooltip-id='tooltipbackbutton'  
                  disabled={submitStatus == "submitting"}  type='button'   onClick={()=>dispatchStep({type:"previous"})}
                    className='btn btn-nav'><i className="bi bi-chevron-left"></i> back
                   </button>}
                   <span className="clearForm">
                        <NavLink  onClick={handleClearFormClick} title='clear Form'>Clear Form</NavLink >
                    </span>
                   {mode=="edit" && <><span className="cancel-edit">
                           <NavLink data-tooltip-id='tooltipcancelEdit' onClick={resetFormToAddMode} > Cancel Edit</NavLink>
                        </span>
                        <span className="cancel-edit">
                           <NavLink data-tooltip-id='tooltipresetEdit'
                           onClick={handleResetEdit} > Reset Edit</NavLink>
                        </span>
                    </>}
                  { formStep.step <3 && <button className='btn btn-nav' type='button' onClick={handleMoveNext} 
                    data-tooltip-id='tooltipnextbutton'  >
                    next <i className="bi bi-chevron-right"></i>
                   </button>}
               </div>
                {formStep.step==3 &&  ( <div className="btn-sctn-addBk">
                    <button type='submit' className='btn btn-primary btnSubmit clearfix'
                        disabled={submitStatus == "submitting"}
                        data-tooltip-id="tooltipsubmit">
                        Submit
                        {submitStatus == "submitting" && (
                            <div className="spinner-border text-light float-end " role="status">
                            </div>
                        )}

                    </button>
                  </div>)}
            </div> 
         </form>        
          
          <Tooltip id="tooltipsubmit" style={tooltipStyle} place="bottom"
                content="upload book" />
            <Tooltip id="tooltipbookauthors" style={tooltipStyle} place="bottom"
                content="enter book author here, you can seperate by commas if more than one" />
            <Tooltip id="tooltipbookfile" style={tooltipStyle} place="bottom"
                content="select the book file to upload" />
            <Tooltip id="tooltipcoverImage" style={tooltipStyle} place="bottom"
                content="select cover image for the book" />
            <Tooltip id="tooltipresetEdit" style={tooltipStyle} place="bottom"
                content="reset form to default edit details" />
            <Tooltip id="tooltipcancelEdit" style={tooltipStyle} place="bottom"
                 content="reset form to add mode" />
            <Tooltip id="tooltipnextbutton" style={tooltipStyle} place="bottom"
            content="move to next step" />
            <Tooltip id="tooltipbackbutton" style={tooltipStyle} place="bottom"
            content="move previous step" />
        <PromptModal onHide={()=>setShowModal(false)} headerText={promptHeader}
            show={showModal} bodyText={promptBody} mode={promptMode} />
      </div>);

}
export default BookUploader;