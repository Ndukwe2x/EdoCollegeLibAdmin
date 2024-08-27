
import {Link,useLocation} from 'react-router-dom';

const NotFound404=()=>{

  return (
    <div>
        <Link to="/">
        {` << Back`} 
        </Link>{/*  back to previous if anay */}
     <h1>404 Page Not Found error!</h1>
    </div>
  );

}
export default NotFound404;