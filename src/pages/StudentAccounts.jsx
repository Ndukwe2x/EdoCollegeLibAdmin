
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import {authenticateAdmin } from "../auth/authHandler";
import DeleteModal from "../components/ModalDialogs/DeleteModal";
import { Tooltip } from "react-tooltip";
import DataTableViewer from "../components/DataTableViewer/DataTableViewer";
import { libraryStudentAccounts } from "../data-utils/dataLoaders";
import { approveStudentAccount, deleteStudentAccount } from "../data-utils/server";
import PromptModal from "../components/ModalDialogs/PromptModal";

export const loader = () => {
    authenticateAdmin("/");
    try {
     return   libraryStudentAccounts();
    } catch (error) {
      console.log(error);
      return null;  
    }    
    
}

const StudentAccounts=()=>{
    
    const [recordId,setRecordId]=useState(null);
    const [startDelete,setStartDelete]=useState(false);
    const [startApprove,setStartApprove]=useState(false);
    const [submitting, setSubmitting]=useState(false);
    const [errorOnSubmit,setErrorOnSubmit]=useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [headerText, setHeaderText]=useState("");
    const [modalBody, setModalBody]=useState("");
    const [promptShow,setPromptShow]=useState(false);
    const [promptHeader,setPromptHeader]=useState("");
    const [promptBody,setPromptBody]=useState("")
    const [processingMsg,setProcessingMsg]=useState("");
    const {data: { data: { students: students } } } = useLoaderData();
    const [studentList,setStudentList]=useState(students|| []);
    

    const tooltipStyle = {backgroundColor: '#605286' };


    useEffect(()=>{
        if(startDelete){
           setSubmitting(true);
           
           const performDelete= async()=>{
           try {
              const deleteResult= await deleteStudentAccount(recordId);
               
              if(deleteResult.status==200)
               {   const {data: { data: { students: refreshList } } }= await libraryStudentAccounts();
                   setStudentList(refreshList );
               }
            } catch (error)
            {
             console.log(error);
           }finally{
            setStartDelete(false); 
            setProcessingMsg("");
           }  
            
           }
           performDelete();
        }
        setSubmitting(false);
       
    },[startDelete])
     
    useEffect(()=>{
        if(startApprove){
           setSubmitting(true);
           const performApproval=async()=>{
            try {
                const approveResult= await approveStudentAccount(recordId);
                
                
                if(approveResult.status==200)
                {   const {data: { data: { students:approvedList } } }= await libraryStudentAccounts();
                    setStudentList(approvedList);
                }
              } catch (error) {
               console.log(error);
              }finally{
               setStartApprove(false); 
               setProcessingMsg("");
              }   
           }  
           performApproval();    
        }       
        setSubmitting(false);
        
        
    },[startApprove])

    const handleApprove=(record_id)=>{
       setProcessingMsg("Please wait. Processing user approval...");
       setRecordId(record_id);
       setStartApprove(true);

    }
    const handleDelete=(record_id)=>{
         setHeaderText("Delete Student Account");
         setModalBody("  Do you wish to continue in deleting this student account?");
         setModalShow(true); 
         setRecordId(record_id);
    }
    const deleteStudent=()=>{
        
         setModalShow(false);
         setStartDelete(true);
         setProcessingMsg("Please wait. Deleting user account...");
    }
    const studentListColumns = [
        {
            header: 'First Name',
            accessorKey: 'firstName',
            cell: ({ getValue }) => <p>{getValue()}</p>
        },
        {
            header: 'Last Name',
            accessorKey: 'lastName',
            cell: ({ getValue }) => <p>{getValue()}</p>
        },
        {
            header: 'Login ID',
            accessorKey: 'studentID',
            cell: ({ getValue }) => <p>{getValue()}</p>
        },
        {
            header: 'Entry Year',
            accessorKey: 'entryYear',
            cell: ({ getValue }) => <p>{getValue()}</p>
        },
        {
            header: 'Entry Class',
            accessorKey: 'classOfAdmission',
            cell: ({ getValue }) => <p>{getValue()}</p>
        },
        {
            header: 'Active',
            accessorKey: 'approved',
            cell: ({ getValue }) => <p>{getValue()?`Yes`:`No`}</p>
        },
        {
            header: 'Approve',
            accessorKey: '_id',
            cell: ({ getValue }) =>{
             const studentRecord= studentList.find(std=> std._id==getValue())
             let disabledBtn=false
             if(studentRecord && studentRecord.approved)
                disabledBtn=true;
              return  (
            <button data-tooltip-id="tooltipApprove" className="btn btn-primary btn-size" disabled={disabledBtn}
            onClick={()=>handleApprove(getValue())}>Approve           
            </button>)}
        },
        {  
            header:'Delete',
            accessorKey:'',
            cell: ({cell}) =>{ 
                 const studentId=cell.row.original._id;
                return (
                <button data-tooltip-id="tooltipDelete" className="btn btn-danger btn-size"
                 onClick={()=>handleDelete(studentId)}> <i className="bi bi-trash"></i>Delete          
                </button>)}
          }
    ]
    
     

    return(<div>
           <div className="topNav bckbtn">
            <button className="btn btn-secondary">Back</button>
           </div>
          <div>
            <h2 className="pgCaption">Student list</h2>
          <div className="tab-studentlist">
             {submitting && <div className="process-indication">
                <p className="indicator-text">{`${processingMsg}`}</p>
             </div>}
            <div className="listTable" disabled={submitting}>
                <DataTableViewer columns={studentListColumns} data={studentList} 
                 enableFilter={true} pageLimit={50}/>
               
            </div>

          </div>
          </div>
          <Tooltip id="tooltipDelete" style={tooltipStyle} place="bottom" content="delete student Account" />
          <Tooltip id="tooltipApprove" style={tooltipStyle} place="bottom" content="activate account" />

          <DeleteModal show={modalShow}   bodyText={modalBody}
            onHide={() => setModalShow(false)} headerText={headerText}
           submitHandler={deleteStudent}/>
           <PromptModal onHide={()=>setPromptShow(false)} headerText={promptHeader}
            show={promptShow} bodyText={promptBody} />
        </div>
    );

}
export default StudentAccounts;