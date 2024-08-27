import   './footer.css';


export default function Footer(){
   const dateTime= new Date();
   return(
    <footer className='bar-color footer-position footer-basic footer-txt-color footer-display'>
       <section className='section-1'> 
        <h2 title='Edo college old boys association'>Powered by ECOBA</h2>
       </section>
       <section className='section-2'>
         <p>&copy; {dateTime.getFullYear()} All Rights Reserved.</p>
       </section >
       <section className="section-3">
         <p id="craftman">crafted by Softcode Techhnologies</p>
       </section>
    </footer>);

}