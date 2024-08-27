import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const PromptModal=({show,bodyText,submitHandler,onHide,headerText})=>{
    
   
  const iconColor={color:'#72c2e2'};
  const textColor={color:"#07181f"};

   return <Modal  size="md" aria-labelledby="contained-modal-title-vcenter"
          centered  show={show}  onHide={onHide}   >
      <Modal.Header closeButton >
        <Modal.Title id="contained-modal-title-vcenter">
          {headerText}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {bodyText}
        </p>
      </Modal.Body>
      <Modal.Footer>
         <Button onClick={onHide} variant='primary'>Ok</Button>
      </Modal.Footer>
    </Modal>

}
export default PromptModal;