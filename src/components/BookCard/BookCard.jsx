
import defaultBookCover from '../../assets/noBookCover_small.gif';

import   './style-bookcard.css';
import TableActionButton from '../TableActionButton/TableActionButton';
const BookCard=({bookData,bookDelete,bookEdit})=>{
     
    return(
        <div className='card-wrap'>
          <div className='card-img'>
            <img  src={defaultBookCover}    />
          </div>
          <div>
            <div className='cardAction'>
              <p className='bookTitle' title={bookData.title}>{bookData.title}</p>            
            <TableActionButton showDelete={true} showEdit={true} 
             handleDelete={bookDelete} handleEdit={bookEdit} />
            </div>
          </div>
        </div>
    )

}
export default BookCard;