
import { Suspense, useEffect, useState } from "react";
import { Await, defer, useLoaderData, useNavigate } from "react-router-dom";
import {authenticateAdmin } from "../auth/authHandler";
import DeleteModal from "../components/ModalDialogs/DeleteModal";
import { Tooltip } from "react-tooltip";
import DataTableViewer from "../components/DataTableViewer/DataTableViewer";
import { libraryStudentAccounts } from "../data-utils/dataLoaders";
import { approveStudentAccount, deleteStudentAccount } from "../data-utils/server";
import PromptModal from "../components/ModalDialogs/PromptModal";
import SectionLoader from "../components/SectionLoader/SectionLoader";

export const loader = () => {
    authenticateAdmin("/");
    try {
     return   defer({studentAccts:libraryStudentAccounts()});
    } catch (error) {
      console.log(error);
      return null;  
    }    
    
}

const StudentAccounts=()=>{
    const studentListPromise=useLoaderData();
    const [recordId,setRecordId]=useState(null);
    const [startDelete,setStartDelete]=useState(false);
    const [startApprove,setStartApprove]=useState(false);
    const [submitting, setSubmitting]=useState(false);
    const [firstInstanceRender,setFirstInstanceRender]=useState(true);  
    const [modalShow, setModalShow] = useState(false);
    const [headerText, setHeaderText]=useState("");
    const [modalBody, setModalBody]=useState("");
    const [promptShow,setPromptShow]=useState(false);
    const [promptHeader,setPromptHeader]=useState("");
    const [promptBody,setPromptBody]=useState("")
    const [processingMsg,setProcessingMsg]=useState("");  
    const [studentList,setStudentList]=useState([]);    

    const tooltipStyle = {backgroundColor: '#605286' };
    const navigate= useNavigate();
   
    useEffect(()=>{
  
        if(firstInstanceRender){
            
         libraryStudentAccounts()
          .then(response=>{
          const {data: { data: { students: studentAccounts } } } = response;
             setStudentList(studentAccounts)
           })
        .catch(error=>console.log(error))
        .finally(()=>setFirstInstanceRender(false))   
        }  
        
      },[]);
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
   
    const goToPreviousPage=()=>{
     navigate(-1); //move back to previous page
    }
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
            <button className="btn " onClick={goToPreviousPage}
             data-tooltip-id="tooltipBackButton"> <i className="bi bi-chevron-left"></i> Back</button>
           </div>
          <div>
            <h2 className="pgCaption">Student list</h2>
          <div className="tab-studentlist">
             {submitting && <div className="process-indication">
                <p className="indicator-text">{`${processingMsg}`}</p>
             </div>}
            <div className="listTable" disabled={submitting}>
                <Suspense fallback={<SectionLoader sectionName={"Student List"} />} >
                 {firstInstanceRender?
                    (<Await resolve={studentListPromise.studentAccts} >
                      {  
                        (accountList)=>{
                           
                           const {data: { data: { students: studentAccounts } } } = accountList;                          
                              return (<DataTableViewer columns={studentListColumns} data={studentAccounts} 
                      enableFilter={true} pageLimit={50}/>)
                         }
                        
                      }                   
                  </Await>): ( <DataTableViewer columns={studentListColumns} data={studentList} 
                      enableFilter={true} pageLimit={50}/>)
                
                  }
                </Suspense>
                
            </div>

          </div>
          </div>
          <Tooltip id="tooltipDelete" style={tooltipStyle} place="bottom" content="delete student Account" />
          <Tooltip id="tooltipApprove" style={tooltipStyle} place="bottom" content="activate account" />
          <Tooltip id="tooltipBackButton" style={tooltipStyle} place="bottom" content="back to previous page" />
          
          <DeleteModal show={modalShow}   bodyText={modalBody}
            onHide={() => setModalShow(false)} headerText={headerText}
           submitHandler={deleteStudent}/>
           <PromptModal onHide={()=>setPromptShow(false)} headerText={promptHeader}
            show={promptShow} bodyText={promptBody} />
        </div>
    );

}
export default StudentAccounts;