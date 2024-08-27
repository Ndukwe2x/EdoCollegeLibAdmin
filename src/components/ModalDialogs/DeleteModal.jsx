import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';


const DeleteModal=({show,bodyText,submitHandler,onHide,headerText})=>{
    
   
    const iconColor={color:'#72c2e2'};
    const textColor={color:"#07181f"}
   return <Modal  size="md" aria-labelledby="contained-modal-title-vcenter"
          centered  show={show}  onHide={onHide}   >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {headerText}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
        <span style={iconColor}> <FontAwesomeIcon icon={faTrashCan}  />  
          </span>
         {bodyText}
        </p>
      </Modal.Body>
      <Modal.Footer>
         <Button variant="danger" onClick={submitHandler}>
            Yes
          </Button>
        <Button onClick={onHide} variant='secondary'>No</Button>
      </Modal.Footer>
    </Modal>

}
export default DeleteModal