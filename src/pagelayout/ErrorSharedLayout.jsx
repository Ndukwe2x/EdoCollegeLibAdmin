
import TopBar from "../components/TopBar/TopBar";
import SideBar from "../components/SideBar/SideBar";
import TopLinks from "../components/TopLinks/TopLinks";
import Footer from "../components/Footer/Footer";

const ErrorSharedLayout=()=>{    
    
   return(
    <div className="page-enclose relative">
    <TopBar showSideMenu={true} showAvatar={true} />
    <div className="dashboard-home">
      <SideBar />
      <div id="main" >
        <div className="container-fluid">
          <TopLinks  />
            <main>
                <p>Error component</p>
            </main>
        </div>
      </div>
    </div>
    <Footer />
  </div>
   )

}
export default ErrorSharedLayout;