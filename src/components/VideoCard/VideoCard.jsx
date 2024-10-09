import './style-videocard.css';
import TableActionButton from '../TableActionButton/TableActionButton';
import videoThumbs from '../../assets/generic-videoThumbs.jpg'



const VideoCard=({videoData,videoDelete,videoEdit})=>{

  return(<div className='videocard-wrap'>
           <div className='card-img'>
              {videoData?.thumbnailUrl?<img src={videoData.thumbnailUrl} alt={videoData.title}  />:
              <img alt={videoData.title} src={videoThumbs}/>} 
            </div>
            <div className='cardAction'>
              <p className='videoTitle' title={videoData.title}>{videoData.title}</p>            
            <TableActionButton showDelete={true} showEdit={true} 
             handleDelete={videoDelete} handleEdit={videoEdit} />
            </div>
         </div>);
   }

export default VideoCard;