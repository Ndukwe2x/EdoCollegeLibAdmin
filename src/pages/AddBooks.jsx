import { authenticateAdmin } from "../auth/authHandler";
import { catalogueDataLoader } from '../data-utils/dataLoaders';
import { NavLink, useNavigate, useLoaderData, useSearchParams } from "react-router-dom";
import React, { useRef } from "react";
import { Tooltip } from 'react-tooltip';
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faUpload } from '@fortawesome/free-solid-svg-icons';
import { uploadBookToS3, AddToBooks, uploadCoverImageToS3, uploadBookSmallFileSize } from "../data-utils/server";


export const loader = async () => {
    authenticateAdmin("/");
    
    try {
        return await catalogueDataLoader();
    } catch (error) {
      return null;  
    }
}

const AddBooks = () => {

    const [submitStatus, setSubmitStatus] = useState("idle");
    const loadedCatalogue = useLoaderData();
    const [searchParams, setSearchParams] = useSearchParams();
    const [formmode, setFormMode] = useState(searchParams.get("mode") || "add");
    const [startSubmit, setStartSubmit] = useState(false)
    const [fileValues, setFileValues] = useState();
    const [showSuccessMsg,setShowSuccessMsg]=useState(false);
    const [formData, setFormData] = useState({
        catalogueRef: "", title: "", author: "", isbn: "",
        docType: "",
        edition: "",
        bookCover: "",
        bookFile: "",
        coverImageType:"",
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
        coverImageType:false,
        yearOfPublication: false,
        downloadable: false,
        bookDescription: false
    });

    const bookFileInputRef = useRef(null);
    const coverBookFileInputRef = useRef(null);
    const navigate = useNavigate();

    const tooltipStyle = { backgroundColor: '#20134488' };
    const { data: { data: { catalogue: catalogueList } } } = loadedCatalogue


    useEffect(() => {
        if (formmode == "edit") {
            console.log("Editing...");
        }
    }, [formmode]);


    useEffect(() => {
        if (startSubmit) {
           
             const pushUpload = async () => {
                let uploadResponse = null;
                try {
                    

                    if (formData.bookFile.size < (1024 * 1024 * 10)) //less than 10MB.            
                       { 
                       const compactUploadResponse = await uploadBookSmallFileSize(formData, null);
                        uploadResponse= compactUploadResponse.status==201? "success":null;

                     }
                    else {
                        const bookFileUploadResponse = await uploadBookToS3(formData.bookFile, null); //upload book file 
                        
                        const bookCoverResponse = await uploadCoverImageToS3(formData.bookCover, null);
                        
                        const coverImageFile = bookCoverResponse.status == 201 ? bookCoverResponse.data.bookCover : null;
                        

                        if (bookFileUploadResponse.status == 201) {
                            formData.bookFile = bookFileUploadResponse.filename;
                            
                            formData.bookCover = coverImageFile !== null ? coverImageFile : "";


                            const bookDetailsResponse = await AddToBooks(formData);
                         
                            if (bookDetailsResponse.status == 201)                             
                                uploadResponse="success";                         

                        }

                    }
                  

                } catch (error) {
                    console.log(error)
                }
                finally { 
                  if(uploadResponse=="success"){
                     setShowSuccessMsg(true);
                     clearForm();
                     }
                    setStartSubmit(false);
                    setSubmitStatus("idle")
                }
            }
            pushUpload();
        }
    }, [startSubmit]);

    const goBackToPreviousPage = () => {
        navigate(-1);

    }
    const moveToBookListPage = () => {
        navigate("../books");

    }
    const uploadBook = (event) => {
        event.preventDefault();
        if (generalValidation()) {
            setSubmitStatus("submitting");
            setStartSubmit(true);
        }
    }

    function handleChange(event) {
        const { name, type, value } = event.target;
        
        if (type != "file") {
            setFormData(prevData => {
                return { ...prevData, [name]: type === "checked" ? checked : value }
            })
        }
        else if (type == "file") {
            const fileType = event.target.files[0].type;     
           
          if(name=="bookFile")
            setFormData(prevData => ({ ...prevData, docType:fileType, [name]: event.target.files[0] }));
           
          
           
           if (name=="bookCover"  && validateCoverImage(event.target.files[0]))              
               setFormData(prevData => ({ ...prevData, coverImageType:fileType, [name]: event.target.files[0] }));
            
        }

    }//end handle form change

    function clearError(event) {
        const { name } = event.target;
        setFormError(prevError => {
            return { ...prevError, [name]: false }
        })
    }
    function setError(name) {
        setFormError(prevError => {
            return { ...prevError, [name]: true }
        })
    }
    function validateCoverImage(coverFile) {
        const { type, size } = coverFile;
       
        
        if (type == "image/jpeg" || type == "image/gif" || type == "image/png" || type == "image/jpg") {
            if (size < 3670016) {
               
                setFormError(prevError => {
                    return { ...prevError, bookCover: false, coverImageType:false }
                })

                return true;
            }
        }
        setError("bookCover");
        return false
    }
     function cancelEdit(){
      setFormMode(preMode=>{
        const sp= new URLSearchParams();
        sp.delete("mode")
        return "add";
      })

     }
    function clearForm() {
        setStartSubmit(false);
        setSubmitStatus("idle");
        coverBookFileInputRef.current.value = '';
        bookFileInputRef.current.value = "";

        setFormData({
            catalogueRef: "", title: "", author: "", isbn: "",
            docType: "",
            edition: "",
            coverImageType:"",
            yearOfPublication: "",
            downloadable: "",
            bookDescription: "",
        });


        setFormError({
            catalogueRef: false, title: false, author: false, isbn: false,
            docType: false,
            edition: false,
            bookCover: false,
            bookFile: false,
            coverImageType:false,
            yearOfPublication: false,
            downloadable: false,
            bookDescription: false
        })
    }

    function generalValidation() {
        let validationPass = true;

        if (formData.author == "")
            setError("author")

        if (formData.title == "")
            setError("title")
        if (formData.bookFile == "")
            setError("bookFile")
        if (formData.bookCover && formData.bookCover!="")
             validationPass = validateCoverImage(formData.bookCover);
        for (let errorItem in formError)
            if (errorItem == true)
                validationPass = false;

        return validationPass;

    }
    function validateForm(event) {
        const { name, value } = event.target;
        if (value == "" || !value)
            setError(name);
    }
    function validatePublicationYear(event) {
        const { name, value } = event.target;

        if (value && value != "") {
            const currentYear = new Date().getFullYear();
            if (isNaN(value) || value > currentYear)
                setFormError(prevError => {
                    return { ...prevError, [name]: true }
                });

        }
    }

    return <div className="add-book-pg">
        <div className="topNav">
            <button className="btn " onClick={goBackToPreviousPage}> <i className="bi bi-chevron-left"></i> Back</button>
            <button className="btn " onClick={moveToBookListPage}>Book List</button>
        </div>

        <div className="addbookHdr">
            <span className="iconSize">
                <FontAwesomeIcon icon={faUpload} /> <FontAwesomeIcon icon={faBook} />
            </span>
            <h4 >Upload Book to Library</h4>
        </div>
        <div className="add-book-frm">

            <form onSubmit={uploadBook} encType="multipart/form-data" >
                <label id="catalogueLabel" htmlFor="catalogue">Catalogue</label>
                <select name="catalogueRef" id="catalogue" className="form-control form-select" onChange={handleChange}
                    value={formData.catalogueRef}
                    disabled={submitStatus == "submitting"} >
                    <option value="">--- Select option ---</option>
                    {catalogueList.map(catlog => {
                        return <option key={catlog._id} value={catlog._id}>{catlog.title}</option>
                    })
                    }
                </select>
                <span></span>
                <label htmlFor="title">Book Title</label>
                <input name="title" type="text" id="title" className="form-control" maxLength={100}
                    placeholder="Enter book title" disabled={submitStatus == "submitting"}
                    onChange={handleChange} onFocus={clearError} onBlur={validateForm} value={formData.title} />
                {formError.title ? (<p className='errTxt'>*required</p>) : null}

                <label htmlFor="author">Author(s)</label>
                <input name="author" type="text" id="author" className="form-control"
                    disabled={submitStatus == "submitting"} placeholder=" author(s)"
                    data-tooltip-id="tooltipbookauthors" onFocus={clearError}
                    onChange={handleChange} onBlur={validateForm} value={formData.author} />
                {formError.author ? (<p className='errTxt'>*required</p>) : null}

                <label htmlFor="coverImg">Cover Image</label>
                <input type="file" id="coverImg" className="form-control" name="bookCover"
                    onChange={handleChange} ref={coverBookFileInputRef}
                    disabled={submitStatus == "submitting"} data-tooltip-id="tooltipcoverImage"
                />
                {formError.bookCover ? (<p className='errTxt'>{`*invalid file type or file size exceed (max:6MB)`}</p>) : null}

                <label htmlFor="bookfile">Book File</label>
                <input id="bookfile" name="bookFile" type="file" className="form-control"
                    onChange={handleChange}
                    data-tooltip-id="tooltipbookfile" disabled={submitStatus == "submitting"}
                    placeholder="browse and select book file" required
                    ref={bookFileInputRef} />


                <label htmlFor="edition">Edition</label>
                <input name="edition" type="text" id="edition" className="form-control"
                    disabled={submitStatus == "submitting"} placeholder="edition"
                    onChange={handleChange}
                    value={formData.edition}
                />

                <label htmlFor="yearPublished">Publication Year</label>
                <input type="text" id="yearPublished" className="form-control"
                    placeholder="year of publication" name="yearOfPublication"
                    disabled={submitStatus == "submitting"} onFocus={clearError}
                    onChange={handleChange} onBlur={validatePublicationYear}
                    value={formData.yearOfPublication} maxLength={4} />

                {formError.yearOfPublication ? (<p className='errTxt'>*invalid publication value</p>) : null}

                <label htmlFor="isbn">Isbn</label>
                <input type="text" id="isbn" className="form-control"
                    name="isbn" disabled={submitStatus == "submitting"}
                    placeholder="Isbn"
                    onChange={handleChange}
                    value={formData.isbn} maxLength={35} />


                <label htmlFor="bookDescptn">Description</label>
                <textarea id="bookDescptn" name="bookDescription" className="form-control textarea center"
                    onChange={handleChange} disabled={submitStatus == "submitting"}
                    value={formData.bookDescription} />
                      <div>
                     { showSuccessMsg &&<p className="bookupload-success">Book has been upload successfully!</p>}
                    </div>
                <span className="spanarea">
                    <input type="checkbox" id="downloadble" value={formData.downloadable}
                        onChange={handleChange} />
                    <label htmlFor="downloadble " >Downloadable</label>
                    <span className="clearForm">
                        <NavLink onClick={clearForm}>Clear Form</NavLink>
                    </span>
                    { formmode=="edit" &&<span className="cancel-edit">
                        <NavLink onClick={cancelEdit}> Cancel Edit</NavLink>
                    </span>}
                </span>
                <div className="btn-sctn-addBk">
                    <button type='submit' className='btn btn-primary btnSubmit clearfix'
                        disabled={submitStatus == "submitting"}
                        data-tooltip-id="tooltipsubmit">
                        Submit
                        {submitStatus == "submitting" && (
                            <div className="spinner-border text-light float-end " role="status">
                            </div>
                        )}

                    </button>
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
        </div>
        <div className="bottomNav">
            <button className="btn " onClick={moveToBookListPage}>Book List</button>
        </div>
    </div>
}
export default AddBooks;