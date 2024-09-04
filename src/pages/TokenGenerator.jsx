import { authenticateAdmin } from "../auth/authHandler";
import { accessTokensLoader } from "../data-utils/dataLoaders";
import { Tooltip } from 'react-tooltip';
import randomToken from 'random-token';
import { useLoaderData,useNavigate,useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import DataTableViewer from "../components/DataTableViewer/DataTableViewer";
import TableActionButton from "../components/TableActionButton/TableActionButton";
import { UTCDateToDateTimeString } from "../code-utility/utilityFunctions";
import DeleteModal from '../components/ModalDialogs/DeleteModal';
import { createToken, deleteToken } from "../data-utils/server";
import PromptModal from "../components/ModalDialogs/PromptModal";




export const loader = async() => {
    authenticateAdmin("/");    
    try{
        return await accessTokensLoader();    
       }
       catch(error){
          return null;
     }
}
const getTokenExpiryDate=(expiryTime,expiryOption)=>{
      const currentTime=Date.now();
      let addedMilliseconds=0;
     
     switch(expiryOption)
     {
        case "minutes":
           addedMilliseconds=60*expiryTime *1000 ;
            break;
        case "hours":
            addedMilliseconds=  60 * 60 *expiryTime *1000 ;
            break;
        case "days":
             addedMilliseconds= 60 *60 *24 *expiryTime* 1000;
            break;   
        case "months":
            addedMilliseconds= 30*60 *60 * 24 *expiryTime* 1000;
             break; 
     }
     const addedTimeMilliseconds= currentTime + addedMilliseconds;
     const addTimeDate= new Date(addedTimeMilliseconds);

    return addTimeDate;
}

const TokenGenerator=()=>{
   
    const tokenList=useLoaderData();
   
    const [listRefreshing,setListRefreshing]=useState(false);
    const [formData,setFormData]=useState({token:"",expiryopt:"",expirytime:""})
    const [modalShow, setModalShow] = useState(false);
    const [renderedTokenList,setRenderedTokenList]=useState(tokenList);
    const [submittError,setSubmitError]=useState(false);
    const tableRecordStyle={font:'normal 0.92em Calibri',margin:'0'};
    const tooltipStyle = {backgroundColor: '#605286' };
    const [promptModalShow,setPromptModalShow]=useState(false);
    const [promptMessage,setPromptMessage]=useState("");
    const [promptMode,setPromptMode]=useState("");
    const [promptHeader,setPromptHeader]=useState("");
    const [recordId,setDeleteRecord]=useState(null);
    const [confirmDelete,setConfirmDelete]=useState(false);
    const [startSubmit,setStartSubmit]=useState(false);
    const navigate=useNavigate();
    const [formSubmitting,setFormSubmitting]=useState(false);
    const [validationError,setValidationError]=useState(false);


    async function tokenReload(){
        try {
            
            setListRefreshing(true);
            const newTokenList= await accessTokensLoader(); 
             setRenderedTokenList(newTokenList);
             
        } catch (error) {
          setPromptMessage("Could not reload data changes, check your internet");
          setPromptMode("warning");
          setPromptModalShow(true);
          
        }finally{  
            clearForm()
            setListRefreshing(false);
        }             
      }
     
     useEffect(()=>{

     if(startSubmit){

         async function  tokenSubmission(){
            try {      
                const token= formData.token;
                const expiryoptions=formData.expiryopt;
                const expirytime=formData.expirytime;
                const expirationTime=getTokenExpiryDate(expirytime,expiryoptions);  
                const  response = await createToken(token,expirationTime);
                 if (response?.status == 201 || response?.status == 200 )
                    { 
                         setSubmitError(false);
                         setFormSubmitting(false);
                         await tokenReload();                         
                    }
                  else if(response?.status != 201 || response?.status != 200)
                     setSubmitError(true);
       
             } catch (err) {
                console.log("Error creating token",err);
                return err;
            }
         }
         
        tokenSubmission();  
         setStartSubmit(false) ;        
      }
     
    },[startSubmit])
   
    useEffect(()=>{
        
       if(confirmDelete){

         async function makeDeleteHapen(token_id){      
          try {
             const deleteResponse= await deleteToken(token_id)
             if(deleteResponse.status==200)
             {
                setPromptHeader("Successful");
                setPromptMessage("Token was deleted successfully");
                setPromptModalShow(true);                
                setListRefreshing(true);
                await tokenReload();
               
             }
          } catch (error) {
            const {response}=error;    
                
            if(response?.status==401)
                navigate("/",{replace:true})//log user out
            else if(error.message=="Network Error"){
                setPromptHeader("Network Error");
                setPromptMessage(" Internet Network Error, check your connection.");
                setPromptMode("warning")
                setPromptModalShow(true);  
            }
            else
           {  
               
               setPromptHeader("Delete Error");
               setPromptMessage(" Delete Operation failed. Internal Server Error, Try again later.");
               setPromptMode("error")
               setPromptModalShow(true);
           } 
          }
        finally{
            setListRefreshing(false); 
            setConfirmDelete(false);
        }
      }
        makeDeleteHapen(recordId);
    }
     
    
    },[confirmDelete]);

    const handleTokenSubmit=(event)=>{
        event.preventDefault();
        if(formData.token==""|| formData.expirytime=="" || formData.expiryopt=="")
          setValidationError(true);             
        else
        {
          setFormSubmitting(true);
          setStartSubmit(true);
        }
   
      }
    const handleGenerate=(event)=>{
        const newTOken= randomToken(9).toUpperCase();
        setSubmitError(false);
        setFormData(prevFormData=>({...prevFormData,token:newTOken}));
       
    }
    const handleChange=(event)=>{
        const {name,value,type}=event.target;
        setFormData(prevFormData=> ({...prevFormData,[name]: type==="checked"?checked: value}));
     }
     const startTokenDelete=(token_id)=>{
               setDeleteRecord(token_id);
               setModalShow(true);
     }
     const clearForm=()=>{
        setFormSubmitting(false);
        setFormData({token:"",expiryopt:"",expirytime:""});
        setValidationError(false);
     }

    function handleTokenDelete(){
        setModalShow(false);
        setConfirmDelete(true);
    }

    
   const tokenListColumns = [
        {
            header: 'Token',
            accessorKey: 'maskedToken',
            cell: ({ getValue }) => <p style={tableRecordStyle}>{getValue()}</p>
        },
        {
            header: 'Expiration',
            accessorKey: 'expiresAt',
            cell: ({ getValue }) => <p style={tableRecordStyle}>{UTCDateToDateTimeString(new Date(getValue()))}</p>
        },
        {
            header: 'Created By',
            accessorKey: 'createdBy',
            cell: ({ getValue }) => <p style={tableRecordStyle}>{getValue()}</p>
        },
        {
            header: 'Created On',
            accessorKey: 'createdAt',
            cell: ({ getValue }) => <p style={tableRecordStyle}>{UTCDateToDateTimeString(new Date(getValue())) }</p>
        },
        {  
            header:'Action(s)',
            accessorKey:'_id',
            cell:({getValue})=><TableActionButton  handleDelete={()=>startTokenDelete(getValue())}
            showEdit={false} />
          }
    ]
   

    return (
             <div className="token-gen-container">
                 <h3 className="page-caption">Login Access Token Generator</h3>
                 <div className="gen-panel shadow">
                    <form  onSubmit={handleTokenSubmit}>
                      <div className="token-section">
                      { validationError && <p className="errTxt">Invalid values for submit!</p>}
                       <span className="d-flex"> <h5>Token Generator</h5> 
                       <i className="bi bi-key-fill keyIcon"></i> </span>
                        <section className="token-wrap">
                        <button className="btn btn-secondary btn-sm gen-btn" type="button"
                         onClick={handleGenerate} disabled={formSubmitting}>
                            Generate
                        </button>
                        <input type="text" readOnly maxLength={10} required onChange={handleChange}
                        className="text-input gen-text ms-2" name="token" value={formData.token} />
                        </section>
                        {submittError && <p className="errTxt">Error! subimtting token</p>}
                        <fieldset className="token-duration" >
                            <legend className="absolute">Token duration</legend>
                            <div className="expiry-opts">
                                <p className="hdr">Expires</p>
                                <input type="radio" name="expiryopt" id="minutes" required
                                 disabled={formSubmitting}
                                checked={formData.expiryopt==="minutes"} onChange={handleChange} value="minutes" />
                                <label htmlFor="minutes" > Minutes</label> <br/>

                                <input type="radio" name="expiryopt" id="hours"  onChange={handleChange} 
                                checked={formData.expiryopt==="hours"} value="hours" required />
                                <label htmlFor="hours" >Hours</label> <br/>
                                <input type="radio" name="expiryopt" id="days" value="days"
                                  checked={formData.expiryopt==="days"} onChange={handleChange} required />
                                <label htmlFor="days" >Days</label> <br/>
                                <input type="radio" name="expiryopt" id="months" value="months"
                                checked={formData.expiryopt==="months"}  onChange={handleChange} required />
                                <label htmlFor="months" > Months</label>                              
                            </div>
                            <div className="epxiry-value" >
                                <input name="expirytime" value={formData.expirytime} type="number"  
                                    onChange={handleChange}  max={365} min={0} className="expirytime"
                                    disabled={formSubmitting} required />
                            </div>

                        </fieldset>
                      </div>
                      <div className="btn-token-submit">
                        <button className="btn btn-primary clearfix btn-height" 
                        disabled={formSubmitting}
                        data-tooltip-id="tooltipSubmit" type="submit" >
                         {formSubmitting  &&
                            <div className="spinner-border text-light float-end " role="status">
                         </div>}
                         {formSubmitting ? "Submitting..." : "Add"  }</button>

                         <button className="btn btn-secondary btn-height" type="button"
                          onClick={clearForm}>Clear</button>
                      </div>
                  </form>
                 </div>
                 <div className="token-list">
                 {
                    listRefreshing ? <p className="loading ce">Fetching token list...</p>:(
                     <>
                       <h5>Access token list</h5>
                      { <DataTableViewer  columns={tokenListColumns} pageLimit={20} 
                       data={renderedTokenList} enableFilter={false} />}
                     </>
                    )
                    }
                 </div>
                 < DeleteModal  show={modalShow}
             bodyText={`  Are you sure, you want to delete token from token list?`}
             onHide={() => setModalShow(false)} headerText={"Token Deletion"}
           submitHandler={handleTokenDelete}/>
           
           <PromptModal show={promptModalShow} bodyText={promptMessage} 
           onHide={()=>setPromptModalShow(false)} headerText={promptHeader} mode={promptMode} />
           
            <Tooltip id="tooltipSubmit" style={tooltipStyle} place="bottom" content="Submit generated token" />
             </div>
      )
    
 }
    
export default TokenGenerator;