import './style-sectionloader.css';
import loaderSpinner  from '../../assets/dtc-chile-circle.gif';

const SectionLoader=({sectionName})=>{
 return(<div className='loadersection'>
          <div className='loadermain'>
             <div className='loaderspinner center'>
                <img src={loaderSpinner} alt='Loading..' />
            </div> 
            <h4 className='loading-caption'>{ sectionName? `Loading ${sectionName}...`:"Loading..."}</h4>   
          </div>
 </div>);
}

export default SectionLoader;