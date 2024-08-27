import './style-countercard.css';


const ResourceCounterCard=({cardTitle,resourceCount,icon})=>{

return(
    <div className='card-layout relative'>
        <h3>{cardTitle}</h3>
        <div className='cf item-count-section'>
          <span className='icon-style d-block ms-3 float_L'>{icon}</span> 
           <span className='d-block float_L resource-count'>{resourceCount}</span>
         </div>
         <p className='count-note absolute'>{`Number of ${cardTitle}`}</p>
    </div>
)

}


export default ResourceCounterCard;