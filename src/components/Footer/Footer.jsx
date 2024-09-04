import { useState } from 'react';
import PromptModal from '../ModalDialogs/PromptModal';
import   './footer.css';



export default function Footer(){
  
   const [showPromtModal,setShowPromptModal]=useState(false);

   const showAboutEcoba=()=>{
     setShowPromptModal(true);
   }
   const AboutEdocollegeLib=()=>{
   return (<div>
            <p>
              Edo college digital library was commissioned
              by the honourable set of Old Boys Association from the college
             </p>
             <p>
              Ecoba as is mainly called championed the realisation of 
              this honorable project.
             </p>
         </div>)
   }
   const dateTime= new Date();
   return(
    <footer className='bar-color footer-position footer-basic footer-txt-color footer-display'>
       <section className='section-1'> 
        <h2 title='Edo college old boys association' onClick={showAboutEcoba}>Powered by ECOBA</h2>
       </section>
       <section className='lnk-sch-web section-1-1' >
            <a href='https://edocollegebenin.com' target='_blank'>Edo college Benin</a>
       </section>
       <section className='section-2'>
         <p>&copy; {dateTime.getFullYear()} All Rights Reserved.</p>
       </section >
       <section className="section-3">
         <p id="craftman">crafted by Softcode Techhnologies</p>
       </section>
       <PromptModal onHide={()=>setShowPromptModal(false)} headerText={"About Edo College Library"} 
       show={showPromtModal} bodyText={<AboutEdocollegeLib/>} />
    </footer>);

}