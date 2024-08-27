import TopBar from "../components/TopBar/TopBar";
import AdminLogin from "../components/AdminLogin/AdminLogin";
import Footer from "../components/Footer/Footer";


export default function Home(){
  
  
  return (
      <div className="homepage page-enclose" >
         <TopBar showSideMenu={false} showAvatar={false}/>  
         <section className="section-login">       
           <AdminLogin  />
         </section>
         <Footer/>      
       </div> 
       ) 

}