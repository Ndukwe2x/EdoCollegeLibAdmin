 
 import './pager-style.css';
const Pager =({pager})=>{

function moveToNextPage(){
   if(  pager.getState().pagination.pageIndex + 1 >= pager.getPageCount())
      return
   pager.nextPage();
}
 return(    
      <div className="pager-section">
       {pager.getPageCount() > 1 && 
       <>
       <span className='page-counter'>{ `Page ${pager.getState().pagination.pageIndex + 1}  of  ${pager.getPageCount()}`}</span>
       <button className="pager-btn" title='previous' onClick={()=>pager.previousPage()}>{`< `}</button>
       <button className="pager-btn " title='next' onClick={moveToNextPage}>{`>`}</button> 
       </>  }    
      </div>
   
  );

}
export default Pager;