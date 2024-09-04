import { useEffect, useState } from 'react';
import BookCard from '../BookCard/BookCard';
import VideoCard from '../VideoCard/VideoCard';
import   './style-cardcontainer.css';
import  loadingLoop from '../../assets/dtc-chile-circle.gif'


const CardContainer=({cardData, cardType,handleDelete,handleEdit,pageLimit,loading})=>{

const [pageNumber,setPageNumber]=useState(1);


  const getPageCount=()=>{
    return Math.ceil(cardData.length/pageLimit);
  }
  const displayCard=()=>{
      const startPoint=(pageNumber -1) * pageLimit; 
      const endPoint=pageNumber * pageLimit;
    
     if(cardData.length==0)
        return <p>Zero Matching Search..</p>    
     
      if(cardType=="books")
       {
         return cardData.slice(startPoint,endPoint).map(book=>(< BookCard bookData={book} key={book._id}
          bookDelete={()=>handleDelete(book._id)} bookEdit={()=>handleEdit(book._id)} />)
       );
       }else{
        return cardData.slice(startPoint,endPoint).map( video=>(<VideoCard videoData={video} 
        videoEdit={()=>handleEdit(video._id)} videoDelete={()=>handleDelete(video._id)} />));
       
       }

  }
  const previousPage=()=>{
     setPageNumber(prevPageNumber=>prevPageNumber > 1? --prevPageNumber:1)
  }
  const moveToNextPage=()=>{
      setPageNumber(prevPageNumber=>prevPageNumber<getPageCount()? ++prevPageNumber:prevPageNumber)
  }
  useEffect(( )=>{
    displayCard()
      
  },[pageNumber]);

 return (
    <div className='cntnr-main'>
      <div className='container-edges'>
          { loading ? (<div className='loadingValues'>
            <img src={loadingLoop} alt="Loading..." />
            <p>Loading...</p>
          </div>):displayCard() }
          
        </div> 
      <div className='pager-section'>
      {(getPageCount()) > 1 && 
       <>
       <span className='page-counter'>{ `${pageNumber} of  ${getPageCount()}`}</span>
       <button className="pager-btn" title='previous' onClick={previousPage}>{`< `}</button>
       <button className="pager-btn " title='next' onClick={moveToNextPage}>{`>`}</button> 
       </>  } 
      </div>

  
    </div>
  )

}

export default CardContainer;