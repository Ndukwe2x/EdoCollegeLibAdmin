import {faEllipsisVertical, faTrashCan} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';

import  './vertical-ellipsis-style.css';


const TableActionButton=({handleEdit,handleDelete,showEdit=true,showDelete=true})=>{
    const tooltipStyle = { backgroundColor: '#6d7e8d' };
    const deleteStyle={color:"#f12805",cursor:"pointer"}
    const editStyle={cursor:"pointer"}

 
   return(
    <div className='dropdown'>
     <div  data-tooltip-id="tooltipvellipsis" className='ellipsis-button'
       id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false" >
       
        <FontAwesomeIcon icon={faEllipsisVertical}  />
      
      </div>
      <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
      {showEdit &&  <li><a className="dropdown-item" style={editStyle} onClick={handleEdit}>
         <span><FontAwesomeIcon icon={faPencil} />  Edit</span> 
         </a></li>}
        { showDelete && <>{ showEdit && <li><hr className="dropdown-divider"/></li>}
        <li><a className="dropdown-item align-center" style={deleteStyle} onClick={handleDelete} >
           <span> <FontAwesomeIcon icon={faTrashCan}  />  Delete</span>
        </a></li></>}       
    </ul>
    <Tooltip  id="tooltipvellipsis" style={tooltipStyle} place="bottom" content="click to edit or delete" />
  </div>);
 }

 export default TableActionButton