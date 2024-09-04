import './style-videocard.css';
import TableActionButton from '../TableActionButton/TableActionButton';
import videoThumbs from '../../assets/Videothumbs.png'



const VideoCard=({videoData,videoDelete,videoEdit})=>{

  return(<div className='videocard-wrap'>
             <div className='playIcon'>
              <i className="bi bi-play-circle-fill icon"></i>            
             </div>
            <div className='card-img'>
              <img src={videoThumbs} alt=''  />
            </div>
            <div className='cardAction'>
              <p className='videoTitle' title={videoData.title}>{videoData.title}</p>            
            <TableActionButton showDelete={true} showEdit={true} 
             handleDelete={videoDelete} handleEdit={videoEdit} />
            </div>
         </div>);
   }

export default VideoCard;