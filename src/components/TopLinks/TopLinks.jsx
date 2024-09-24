import './style-toplinks.css'
import { Tooltip } from 'react-tooltip';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faBook, faFilm, faUpload } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import {useNavigate} from 'react-router-dom';
const TopLinks=()=>{
  
   const [toolTipValue,setToolTipdata ]= useState({})
   const  navigate= useNavigate();


   const setUpToolTip=(event)=>{
     
     const buttonName=event.target.name;       
      switch(buttonName)
      {
       case 'uploadbook':
        setToolTipdata({id:"tooltipUpload",content:"upload book to library"});
        break;
        case 'uploadvideo':
            setToolTipdata({id:"tooltipvideo",content:"upload video to library"});
        break;
        case 'tokenKey':
          setToolTipdata({id:"tooltiptoken",content:"generate token"});
        break;
        default:
            setToolTipdata({});
     }
     
  }
  const handleBookClick=()=>{
    navigate("addbooks");
  }
  const handleVideoClick=()=>{
   navigate("addvideos");
  }
  const handleTokenClick=()=>{
   navigate("token-generator");
  }
  const tooltipStyle = { backgroundColor: '#381c50' };
   return(
   <div className='toplink-bar d-flex justify-content-center justify-content-center 
      justify-content-sm-start'>
        <button  name="uploadbook"   data-tooltip-id="tooltipUpload" onClick={handleBookClick}
         className='btn btn-secondary btn-sm btn-style ms-sm-1 ms-lg-5  ' type='button'>
            <FontAwesomeIcon icon={faUpload}/> <FontAwesomeIcon icon={faBook}/>
            <span className='ms-1 d-none d-sm-inline'> Upload Book</span>
        </button>
        <button name="uploadvideo"  className='btn btn-sm btn-secondary btn-style ms-3 '
         data-tooltip-id="tooltipvideo" type='button' onClick={handleVideoClick}>
            <FontAwesomeIcon icon={faUpload}/> <FontAwesomeIcon icon={faFilm}/>
            <span className='ms-1 d-none d-sm-inline'> Upload Video</span>
        </button>
        <button name="tokenKey" className='btn btn-sm btn-secondary btn-style ms-3'
         data-tooltip-id="tooltiptoken" type='button' onClick={handleTokenClick}>
            <i className='bi bi-key'></i>
            <span className='ms-2 d-none d-sm-inline'> Create Login Token</span>
        </button>
        <Tooltip  id="tooltipUpload" style={tooltipStyle} place="bottom" content="upload book to library" />
        <Tooltip  id="tooltipvideo" style={tooltipStyle} place="bottom" content="upload video to library" />
        <Tooltip  id="tooltiptoken" style={tooltipStyle} place="bottom" content="generate token" />
        
   </div> 
   );
}
export  default TopLinks;