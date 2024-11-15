import   './style-sidebar.css';
import {Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faBook,  faDownload,  faFilm, faGraduationCap,
   faListOl, faPersonCircleCheck, faScrewdriverWrench, faUpload, faUserTie} from '@fortawesome/free-solid-svg-icons';

const SideBar=({})=>{
 return(
  <aside id='sidebar' className='sidebar'>
   <ul id='sidebar-nav' className='sidebar-nav'> 
     <li className='nav-item'>
       <Link className='nav-link' to="." >
         <i className="bi bi-grid"></i>
         <span>Dashboard</span>
       </Link>
     </li>

     <li className='nav-item'>       
      <Link className='nav-link'  to="catalogue" >
         <i className="bi bi bi-collection"></i> 
         <span>Catalogue </span>        
        </Link>     
      </li>
       
     <li className='nav-item'>
       <Link className='nav-link collapsed' 
        data-bs-target="#bookmenu" data-bs-toggle="collapse" href='#'>        
         <FontAwesomeIcon icon={faBook} /> <span className='ms-3'>Books</span>            
         <i className="bi bi-chevron-down ms-auto"></i>
       </Link>
        <ul id="bookmenu" className="nav-content collapse"
        data-bs-parent="#sidebar-nav">
         <li>
            <Link to="addbooks" title='upload book to library'>
            <FontAwesomeIcon icon={faUpload} /> 
              <span className="ms-1">upload book</span>
            </Link>
          </li>
          <li>
            <Link to="books" title='view books on library'>
            <FontAwesomeIcon icon={faListOl} /> 
              <span className='ms-1'>book list</span>
            </Link>
          </li>
        </ul>
     </li>
     <li className='nav-item'>
       <Link className='nav-link collapsed' 
        data-bs-target="#videomenu" data-bs-toggle="collapse" href='#'>        
         <FontAwesomeIcon icon={faFilm} /> <span className='ms-3'>Videos</span>            
         <i className="bi bi-chevron-down ms-auto"></i>
       </Link>
        <ul id="videomenu" className="nav-content collapse"
        data-bs-parent="#sidebar-nav">
          <li>
            <Link to="addvideos">
            <FontAwesomeIcon icon={faUpload} /> 
             <span className="ms-1">upload video</span>
            </Link>
          </li>
          <li>
            <Link to="videos">
            <FontAwesomeIcon icon={faListOl} /> 
              <span className="ms-1">video listing</span>
            </Link>
          </li>
        </ul>
     </li>
     <li className='nav-item'>
       <Link className='nav-link ' to="token-generator">
         <i className="bi bi-key"></i> 
         <span>Login Token </span>
        
       </Link>
      
     </li>
     <li className='nav-item'>
       <Link className='nav-link collapsed' data-bs-target="#studentmenu" 
       data-bs-toggle="collapse" href='#'>
         <FontAwesomeIcon icon={faGraduationCap} />  
         <span className='ms-3'>Student Accts </span>
         <i className="bi  bi-chevron-down ms-auto"></i>
       </Link>
        <ul id="studentmenu" className="nav-content collapse"
        data-bs-parent="#sidebar-nav">
          <li>
            <Link to="students">
            <FontAwesomeIcon icon={faPersonCircleCheck} /> 
              <span className='ms-1'>Approve student</span>
            </Link>
          </li>
          <li>
            <Link to="students">
            <FontAwesomeIcon icon={faListOl} /> 
              <span className='ms-1'>student list</span>
            </Link>
          </li>
          
        </ul>
     </li>
     <li className='nav-item'>
       <Link className='nav-link collapsed' data-bs-target="#adminmenu" 
       data-bs-toggle="collapse" href='#'>
         <FontAwesomeIcon icon={faScrewdriverWrench} />  
         <span className='ms-3'>Admin Settings </span>
         <i className="bi  bi-chevron-down ms-auto"></i>
       </Link>
        <ul id="adminmenu" className="nav-content collapse"
        data-bs-parent="#sidebar-nav">
          <li>
            <Link href="#">
            <FontAwesomeIcon icon={faUserTie} /> 
              <span className='ms-1'>admin listing</span>
            </Link>
          </li>
                   
        </ul>
     </li>
     <li className='nav-item'>       
      <Link className='nav-link collapsed'  data-bs-target="#downloadmenu" data-bs-toggle="collapse" href='#' >
         <FontAwesomeIcon icon={faDownload} /> 
         <span className='ms-1'>Book Downloads</span>   
         <i className="bi  bi-chevron-down ms-auto"></i>     
        </Link>   
        <ul id="downloadmenu" className="nav-content collapse"
        data-bs-parent="#sidebar-nav">
          <li>
            <Link to="https://libgen.is/" target='_blank'>           
              <span className='ms-1'>Library Genesis</span>
            </Link>
          </li>
          <li>
            <Link to="https://www.pdfdrive.com/" target='_blank'>           
              <span className='ms-1'>PDF Drive</span>
            </Link>
          </li>
          <li>
            <Link to="https://books.google.com/" 
            target='_blank'>           
              <span className='ms-1'>Google Books</span>
            </Link>
          </li>
                   
        </ul>  
      </li>
   </ul>
  </aside>
) ; 
}

export default SideBar;