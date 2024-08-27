import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import './sort-button-style.css';

const TableSortButton=({handleSort})=>{
return(
 <span className="sort-button" onClick={handleSort} >
    <FontAwesomeIcon icon={faSort} />
  </span>
)

}
export default TableSortButton;