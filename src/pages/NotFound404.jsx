
import {Link,useLocation} from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import TopBar from '../components/TopBar/TopBar';

const NotFound404=()=>{
   
  return (
    <div className="page-enclose relative">
       <TopBar showSideMenu={true} showAvatar={true} />
           
         <Link to="/">
        {` << Back`} 
        </Link>{/*  back to previous if anay */}  
       
     <h1>404 Page Not Found error!</h1>
     <Footer />
    </div>
  );

}
export default NotFound404;