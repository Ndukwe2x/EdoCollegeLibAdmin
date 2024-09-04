import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const PromptModal=({show,bodyText,submitHandler,mode, onHide,headerText})=>{
    
   
 // const iconColor={color:'#72c2e2',fontSize:'32px'};
  const warningColor={color:'#e9bf05',fontSize:'32px'};
  const errorColor={color:'#E80000',fontSize:'32px'};
  const infoColor={color:'#0e8af0',fontSize:'32px'};
  const textColor={color:"#07181f"};
  const WarningIcon=()=><i className="bi bi-exclamation-triangle-fill" style={warningColor}></i> ;
  const ErrorIcon=()=><i className="bi bi-x-octagon-fill" style={errorColor}></i>
  const InfoIcon=()=><i className="bi bi-info-circle-fill" style={infoColor}></i>
  const InfoBIcon=()=><span style={infoColor}> <FontAwesomeIcon  icon={faLightbulb} /></span>

   const DisplayedPrompt=({text})=>{
     let information=<span><InfoBIcon />{text}</span>
     switch(mode){
        case "warning":
          information= <span> <WarningIcon />{text}</span>
        break;
        case "error":
          information= <span><ErrorIcon />{text}</span>
        break;       
     }
     
     return information;
   }
   return <Modal  size="md" aria-labelledby="contained-modal-title-vcenter"
          centered  show={show}  onHide={onHide}   >
      <Modal.Header closeButton >
        <Modal.Title id="contained-modal-title-vcenter">
          {headerText}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        
        <p>          
          <DisplayedPrompt text={bodyText} />
        </p>
      </Modal.Body>
      <Modal.Footer>
         <Button onClick={onHide} variant='primary'>Ok</Button>
      </Modal.Footer>
    </Modal>

}
export default PromptModal;