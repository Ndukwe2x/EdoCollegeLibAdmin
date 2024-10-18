

import cursorDropLocation from '../../assets/cursorAdd.png'
import {useState, useReducer, useRef, useEffect } from 'react';
import {NavLink} from 'react-router-dom';
import './stylevideouploader.css';
import progresloop from '../../assets/progressloop.gif'
import genericThumbs from '../../assets/generic-videoThumbs.jpg';
import { Tooltip } from 'react-tooltip';
import PromptModal from '../ModalDialogs/PromptModal';
import { AddToVideos, uploadSmallSizeVideoFile, uploadVideoToS3 } from '../../data-utils/server';
import {generateVideoThumbnails} from '@rajesh896/video-thumbnails-generator';
import { libraryResourcesVideos } from '../../data-utils/dataLoaders';



const VideoUploader=({mode="add", libraryCatalogue, videoId=null, formModeReset })=>{
    const [submitStatus, setSubmitStatus] = useState("idle");
    const [startSubmit, setStartSubmit] = useState(false);
    const [onDragEnter,setDragEnter]=useState(false);
    const [uploadInProgress,setUploadInProgress]=useState(false);
    const [uploadFile,setUploadFile]=useState(null);
    const [startUpload,setStartUpload]=useState(false);
    const [showModal,setShowModal]=useState(false);
    const [promptHeader,setPromptHeader]=useState("");
    const [promptMessage,setPromptMessage]=useState("");
    const [promptMode,setPromptMode]=useState("");
    const [progressLevel,setProgressLevel]=useState(0);
    const [thumbsImage,setThumbsImage]=useState("");
    const [startThumbsGen,setStartThumbsGen]=useState(false);
    const [generatingThumbnail,setGeneratingThumbNail]=useState(false);
    const [thumbsGen,setThumbsGen]=useState(false);
    const [defaultVideoDetails,setDefaultVideoDetails]=useState({});
    const [formData, setFormData] = useState({
      catalogueRef: "", title: "", creators_origin: "",
      thumbNailName: "", fileName: "", format: "", downloadable: false,
      videoDescription: ""
  });
  const [formError, setFormError] = useState({
      catalogueRef: false, title: false, creators_origin: false,
      thumbNailName: false, videoFile: false, format: false, downloadable: false,
      videoDescription: false
  });

    const tooltipStyle = { backgroundColor: '#20134488' };
    const cursorDragStyle={cursor:`url("${cursorDropLocation}") ,auto`,
    boxShadow:"rgba(8, 104, 75, 0.877) 0 0 18px 2px"};
    const progressStyle={width:`${progressLevel}%`};    
   

    const videoFileInputRef= useRef();


   useEffect(()=>{
     if(startSubmit){
      const sendSubmit= async()=>{
        let status=null;
        try {
          if(mode=="add")
            { 
              const submitVideoResponse= await AddToVideos(formData);
              status=submitVideoResponse?.data?.status;
                            
            }
            else if(mode=="edit")
            {
              //const bookDetailsResponse= await editBook(formData);
              //status= bookDetailsResponse?.data?.status;
            }

            if (status =="success") {            
               resetFormToAddMode();            
            }

        } catch (err) {
          
          setPromptHeader("Error on Submit");
          setPromptMessage(" Failed to complete upload, error while submitting. Please try again later.");
          setPromptMode("error");
          setShowModal(true);
           console.log(err);
        }
        finally{
           setSubmitStatus("idle");
           setStartSubmit(false);

        }

      }
      sendSubmit();
     
     }//end if    

   },[startSubmit]) 
   
  useEffect(()=>{
  async function loadVideoEditValues(){
    try {

      const libraryVideos= await libraryResourcesVideos();
      if(libraryVideos){ //setup books for edit
        const { data: { data: { videos: videoCollection } } }  =libraryVideos; 
        const selectedVideo=videoCollection.filter(videoRecord=>videoRecord._id==videoId)[0];

        if(selectedVideo==null||!selectedVideo){
          setPromptHeader('Not Found!');
          setPromptMessage(` Video entry not found in the library, book may have been deleted`);
          setPromptMode("error");
          setShowModal(true);
          resetFormToAddMode();
        }else{
          setFormData({...selectedVideo,_id:selectedVideo._id,fileName:selectedVideo.fileName,
            });

          setDefaultVideoDetails({...selectedVideo,_id:selectedVideo._id,fileName:selectedVideo.fileName
          });
        }
      }
    } catch (err) {
      
    }
  }
  if(mode=="edit" && videoId)
    loadVideoEditValues();
  },[]); 
  useEffect(()=>{
      if(startUpload){
        
        function handleProgressBarUpdate(uploadPrgress){          
          setProgressLevel(prevLevel=>{
                if(prevLevel>=95) return 100;
                return prevLevel+uploadPrgress;});
        }         
       const pushUpVideoToCloud= async ()=>{
        
                       
          setUploadInProgress(true);  

           if(uploadFile.size < (1024 * 1024 * 20)) //less than 20MB
           {
            const timer= setInterval(()=>{
              setProgressLevel((prevLevel)=>{ 
                if(prevLevel>=100) return 100; 
                 return  prevLevel + 2;})
            },2000);  
          
           uploadSmallSizeVideoFile(uploadFile).then(
             response=>{
               const {data:{fileKey:uploadedFile}} =response;            
              setFormData(prevData=>({...prevData,fileName:uploadedFile}));
              setProgressLevel(100);   
              setStartThumbsGen(true); 
                                  
             }
            ).catch(err=>console.log(err))
            .finally(()=>{
              clearInterval(timer);
              setUploadInProgress(false);
              setProgressLevel(0);
            });
                
           }
           else
           {
             try
             {
              const upldResponse = await uploadVideoToS3(uploadFile, handleProgressBarUpdate);
              console.log("upload response", upldResponse);
              if (upldResponse.status == 201) 
              {
                const videoFormat= uploadFile.type;
                setFormData(prevData => ({ ...prevData,format:videoFormat,fileName:upldResponse.filename }));
                setStartThumbsGen(true);
              }
             }catch(error){
              setPromptHeader("Upload Error!");
              setPromptMode("error");
              setPromptMessage(" Error while uploading video");
              setShowModal(true);
              console.log(error);
             }finally{
                setUploadInProgress(false);
                setProgressLevel(0)//reset progrss bar
             }
           }               
         
       }  
       
       pushUpVideoToCloud();
       setStartUpload(false);
      }

    },[startUpload]);
  
    useEffect(()=>{
     if(startThumbsGen){
      const generateUploadVideoThumbnail=async()=>{
         setGeneratingThumbNail(true);
         setThumbsGen(false);
         setThumbsImage("");                       
 
         const uploadDelayTimer= setTimeout(()=>{
             if(!thumbsGen && thumbsImage==""){
               setGeneratingThumbNail(false);
               setThumbsImage(genericThumbs);
               setThumbsGen(true);               
             }
           },40000);
         
          generateVideoThumbnails(uploadFile,1).then((thumbsArry)=>{
              
              setThumbsImage(thumbsArry[0]);
              setFormData(prevData=>({...prevData,thumbNailName:thumbsArry[0]}));//set generated thumbs
              setThumbsGen(true);                          
             }).catch(err=>console.log(err))
             .finally( ()=>{
                 setGeneratingThumbNail(false);  
                 clearTimeout(uploadDelayTimer) ;             
             });
 
        }
     generateUploadVideoThumbnail();
     setStartThumbsGen(false);
     }
   },[startThumbsGen])

    const formStepTracker=(state,action)=>{
        if(action.type=="next")
          return {step: state.step < 3 ? state.step + 1:3};
        if(action.type=="previous")
            return {step: state.step > 1 ? state.step -1:1};
       return state;
      }
     const initialFormStep={step:1}
     const [formStep,dispatchStep]= useReducer(formStepTracker,initialFormStep);

    const submitVideo=(event)=>{
      event.preventDefault();
      setSubmitStatus("submitting");
      setStartSubmit(true);
    }
    const resetFormToAddMode=()=>{
      clearForm();
      formModeReset();
    }
    const handleChange=(event)=>{
        const { name, type, value } = event.target;
        setFormData(prevData => {
          return { ...prevData, [name]: type === "checked" ? checked : value }
        });
    }
    const validateForm=()=>{
        let validationPass = true;
        switch(formStep.step)
        {
         case 1:
            if (formData.title == ""){
               setError("title")
               validationPass=false;
            }
           break;
         case 2:
           if(formData.fileName==""){
            setError("videoFile");
            validationPass=false;
           }
           
          break;
        }
       return validationPass;
    }
  const validateVideoFile=(uploadFile)=>{
   
    const {size,type}=uploadFile;  
    let validated=false;
    switch (type) {
        case "video/mp4":
        case "video/avi":
        case "video/mov":
        case "video/wmv":
        case "video/mkv":
        case "video/flv":
          validated = true;
            break;
        default:
          validated = false;
    }

    if (!validated) 
      {  
        setFormError(prevErros=>({ ...prevErros, format:true  }));
        setPromptHeader("Bad Video File!");
        setPromptMessage(` Invalid video file!, video file not recognised. 
          supported file types includes, .mp4, .mov, .avi, .mkv, .wmv, .flv`);
        setPromptMode("error");
        setShowModal(true);
      }       
     else 
      { 
        validated=true;
        setFormError(prevErros=>({ ...prevErros, format:false  }));
      }        
      return validated;
  }
   const clearForm=()=>{
    
    setSubmitStatus("idle");
    setStartUpload(false);
    setStartThumbsGen(false); 
    setUploadFile(null);

    setThumbsGen(false);
    setThumbsImage("");
    setFormData({
      catalogueRef: "", title: "", creators_origin: "",
      thumbNailName: "", fileName: "", format: "", downloadable: false,
      videoDescription: ""
      });

    setFormError({ catalogueRef: false, title: false, creators_origin: false,
      thumbNailName: false, videoFile: false, format: false, downloadable: false,
      videoDescription: false});
     dispatchStep({type:"previous"});
     dispatchStep({type:"previous"});

   }
 
  const clearError=(event)=>{
    const { name } = event.target;
    setFormError(prevError => {
        return { ...prevError, [name]: false }
    })
  } 
  const cancelEdit=()=>{

   }
   
   const handleClearFormClick=(event)=>{
     event.preventDefault();
     clearForm();
     setUploadInProgress(false);
     setGeneratingThumbNail(false);
   }
   const handleResetEdit=()=>{

   }
   const handleDragEnter=(event)=>{
     event.preventDefault();
     if(uploadInProgress || generatingThumbnail)
      return;
     clearVideoUploadError();
     setDragEnter(true);
      
   }

   const handleDragOver=(event)=>{
    event.preventDefault();
    if(uploadInProgress || generatingThumbnail)
      return;
    setDragEnter(true);   

   } 
   const handleVideoDrop=(event)=>{
     event.preventDefault();
     if(uploadInProgress || generatingThumbnail)
        return;
     setDragEnter(false);
     setThumbsGen(false);
     setThumbsImage("");
     const droppedFile= event.dataTransfer.files[0];     
     if(validateVideoFile(droppedFile)){
       setUploadFile(droppedFile);
       setStartUpload(true);       
     }
   }
   const handleDragExit=(event)=>{
    event.preventDefault();
    setDragEnter(false);
   }
  const handleDragLeave=(event)=>{
    handleDragExit(event)
  }
  const handleUploadEditDelete=()=>{    
    setThumbsGen(false);  
    setThumbsImage("");         
    if(mode=="add"){
       setFormData(prevData=>({...prevData,fileName:"",format:""}));    
    }

  }
  const clearVideoUploadError=()=>{
    setFormError(prevError => {
      return { ...prevError, videoFile:false,format:false}
     })
  }
  const getCatalogueText=()=>{
    const catalougeId=formData?.catalogueRef;
    const catalougeText= catalougeId && catalougeId!=""? libraryCatalogue.filter((catlogData)=>catlogData._id==catalougeId)[0].title:"";
    
    return catalougeText;
    
  }
  const handleFileChange=(event)=>{         
     const fileForUpload=event.target.files[0]; 
     if(validateVideoFile(fileForUpload))
      { setUploadFile(fileForUpload)
        setStartUpload(true);
      }         
  }
  function setError(name) {
    setFormError(prevError => {
        return { ...prevError, [name]: true }
    })
  }
  const handleInputFileClick=(event)=>{
    event.preventDefault();
    videoFileInputRef.current.click();   
  }
  const handleMoveNext=()=>{
    if(validateForm())
        dispatchStep({type:"next"});
  }
  const handleNoDrop=(event)=>{
   event.preventDefault();
  }
   function displayForm(uploadStage){
    switch(uploadStage){
      case 2:
        return(<>
           <h3 className='stepname'>Video Upload</h3>
           <div>
               <h4 className='upld-hdr'>video file</h4> 
               <div className='videofile-paneupload pane-upload' onDragEnter={handleDragEnter} 
               onDragOver={handleDragOver} onDrop={handleVideoDrop} onDragExit={handleDragExit} 
                onDragLeave={handleDragLeave}  style={onDragEnter?(cursorDragStyle):({cursor:"default"})} >

                  {thumbsGen && <span className='deleteVideoUploaded'>
                    <button className='uploadDelete' title='remove' type='button' onClick={handleUploadEditDelete}> 
                      { mode==="add"? <i  className="bi bi-x-circle-fill deleteIcon"></i>
                       :(<i  className="bi bi-pencil-square editIcon"></i>)}
                    </button>
                  </span>}
                 
                  {
                   uploadInProgress ?                  
                  ( <div className='prgrssbar'>                     
                   <div className="progress" role="progressbar"  aria-label={"Basic example"}
                     aria-valuenow={progressLevel} aria-valuemin={"0"}  aria-valuemax={"100"}>
                      <div className="progress-bar" style={progressStyle}>{`${progressLevel}%`}</div>
                    </div>
                   <p>Uploading...</p>
                 </div>)
                   : 
                   !thumbsGen && !generatingThumbnail?                 
                  (<>
                   <p className='upld-tag'>Browse or drag-drop to upload</p>
                   <div className='upload-icon-box' >
                        <button  type='submit' data-tooltip-id='tooltipvideofile'
                        onBlur={clearVideoUploadError}  onClick={handleInputFileClick}>
                          <i  className="bi bi-cloud-arrow-up-fill upload-icon"></i>
                      </button>
                  </div> 
                  </>):null
                   }
                  {
                   generatingThumbnail && !uploadInProgress?
                   <>
                   <div className='videouploadspin-cntr'>
                       <img alt='generation video thumbs' src={progresloop} />                        
                   </div>
                   <p>Generating video thumbsnail...</p>
                  </>:
                   thumbsGen ?
                   <div className='coveruploadprgrss'>
                   <div className='thumbscontainer'>
                     <div className='playicon' disabled >
                      <i className="bi bi-play-fill playtriangle"></i>
                     </div>
                    <img alt='uploaded video' src={thumbsImage} className='thumbimage' />
                   </div>
                  </div>:
                  null
                  }
                 <input type="file" id="videoFile"  name="videofile"
                       onChange={handleFileChange} ref={videoFileInputRef} hidden accept="video/*"   />
                
               </div>
               {formError.format ? (<p className='errTxt'>{`*invalid video file type, file not a recognized video format `}</p>) : null}
               {formError.videoFile ? (<p className='errTxt'>{`*video, file is required.`}</p>) : null}
           </div>
        </>)       
      case 3:
        return(<>
          <h3 className='stepname'>Summary</h3>
           <div className='bookdetailstotal'>
                <div className='entry'>
                  <span className='dtlcaption'>Catalogue :</span>
                  <span className='dtlinfo'>{getCatalogueText()}</span>
               </div>
               <div className='entry'>
                 <span className='dtlcaption'>Video Title:</span>
                 <span className='dtlinfo'>{formData.title}</span>
               </div>
               <div className='entry'>
                 <span className='dtlcaption'>Creator(s)/Source:</span>
                 <span className='dtlinfo'>{formData.creators_origin}</span>
              </div>              
              <div className='entry'>
               <span className='dtlcaption'>Description:</span>
               <span className='dtlinfo description'>{formData.videoDescription==""?"N/A":formData.videoDescription}</span>
             </div>
                         
           </div>
       </>)
       
     }
     return(
        <>
         <h3 className='stepname'>Video Details</h3>
         <label id="catalogue">Catalogue</label>
         <select name="catalogueRef" className="form-control form-select"           
            value={formData.catalogueRef} onChange={handleChange}>
            <option value="">--- Select option ---</option>
            {libraryCatalogue && libraryCatalogue.map(catlog => {
                return <option key={catlog._id} value={catlog._id}>{catlog.title}</option>
            })
            }
        </select>
        <label htmlFor="title">Video Title</label>
        <input name="title" type="text" id="title" className="form-control" maxLength={100}
            placeholder="Enter video title" disabled={submitStatus == "submitting"}
            onChange={handleChange} value={formData.title} onFocus={clearError} onBlur={validateForm} />
        {formError.title ? (<p className='errTxt'>*required</p>) : null}

        <label htmlFor="creator">Creator(source)</label>
        <input name="creators_origin" type="text" id="creator" className="form-control"
            disabled={submitStatus == "submitting"} placeholder="video creator(s)/source"
            data-tooltip-id="tooltipvideoauthors" onChange={handleChange} value={formData.creators_origin} />

        <label htmlFor="description">Description</label>
        <textarea name="videoDescription" onChange={handleChange} disabled={submitStatus == "submitting"}
            className="form-control textarea center" id="description" value={formData.videoDescription} />
       
        {/*  <input type="checkbox" id="downloadble"  onChange={handleChange} />
        <label htmlFor="downloadble " style={{ marginLeft: '4px' }}>Downloadable</label> */}
       </>
     )
   }
    return(<div className='' onDrop={handleNoDrop} >
          <form onSubmit={submitVideo}  encType="multipart/form-data">
             <div className='formstep-marker'><span>{"Step  "}
               <i className={`bi bi-${formStep.step}-circle-fill step-icon`}></i>{`  of  3`} </span>
             </div>
             {displayForm(formStep.step)}
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
         
          <Tooltip id="tooltipvideoauthors" style={tooltipStyle} place="bottom"
                content="enter video author here, you can seperate by commas if more than one" />
          <Tooltip id="tooltipvideofile" style={tooltipStyle} place="bottom"
                content="select the video file to upload" />
          <Tooltip id="tooltipnextbutton" style={tooltipStyle} place="bottom"
            content="move to next step" />
            <Tooltip id="tooltipbackbutton" style={tooltipStyle} place="bottom"
            content="move previous step" />
          <PromptModal show={showModal} bodyText={promptMessage}
            onHide={() =>setShowModal(false)} headerText={promptHeader} mode={promptMode} />

        </div>);
}

export default VideoUploader;