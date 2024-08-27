import TopBar from "../components/TopBar/TopBar";
import Footer from "../components/Footer/Footer";
import SideBar from "../components/SideBar/SideBar";
import TopLinks from "../components/TopLinks/TopLinks";
import { authenticateAdmin } from "../auth/authHandler";
import { Outlet} from 'react-router-dom';


export  async function loader(){
    const redirectPath="/" 
    await authenticateAdmin(redirectPath) ;
    return null
} 

export default function DashboardSharedLayout() {
 
    
    return (
        <div className="page-enclose relative">
          <TopBar showSideMenu={true} showAvatar={true} />
          <div className="dashboard-home">
            <SideBar />
            <div id="main" >
              <div className="container-fluid">
                <TopLinks  />
                 <Outlet/>
              </div>
            </div>
          </div>
          <Footer />
        </div>
    
      );

}