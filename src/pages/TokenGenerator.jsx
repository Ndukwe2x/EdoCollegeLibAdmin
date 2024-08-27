import { authenticateAdmin } from "../auth/authHandler";
import { accessTokensLoader } from "../data-utils/dataLoaders";
import { Tooltip } from 'react-tooltip';
import randomToken from 'random-token';
import { useLoaderData,Form,useActionData,useNavigate,useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import DataTableViewer from "../components/DataTableViewer/DataTableViewer";
import TableActionButton from "../components/TableActionButton/TableActionButton";
import { UTCDateToDateTimeString } from "../code-utility/utilityFunctions";
import DeleteModal from '../components/ModalDialogs/DeleteModal';
import { createToken, deleteToken } from "../data-utils/server";
import PromptModal from "../components/ModalDialogs/PromptModal";




export const loader = () => {
    authenticateAdmin("/");
    return accessTokensLoader();
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
export const action = async ({ request }) => {
    const formData = await request.formData();
    const token= formData.get("token");
    const expiryoptions= formData.get("expiryopt");
    const expirytime=formData.get("expirytime");
    const expirationTime=getTokenExpiryDate(expirytime,expiryoptions);

    try {        
        const  response = await createToken(token,expirationTime);
        return response;

     } catch (err) {
        console.log("Error creating token",err);
        return err;
    }
  
}
const TokenGenerator=()=>{
   
    const tokenList=useLoaderData();
    let   actionDataResponse=useActionData();
    const [listRefreshing,setListRefreshing]=useState(false);
    const [formData,setFormData]=useState({token:"",expiryopt:"",expirytime:""})
    const [modalShow, setModalShow] = useState(false);
    const [renderedTokenList,setRenderedTokenList]=useState(tokenList);
    const tableRecordStyle={font:'normal 0.92em Calibri',margin:'0'}
    const tooltipStyle = {backgroundColor: '#605286' };
    const [promptModalShow,setPromptModalShow]=useState(false);
    const [promptMessage,setPromptMessage]=useState("");
    const [promptHeader,setPromptHeader]=useState("");
    const [recordId,setDeleteRecord]=useState(null);
    const [confirmDelete,setConfirmDelete]=useState(false);
    const navigate=useNavigate()

     let submitErr=false;
     let dataRefresh=false;
     if(actionDataResponse)
    {
        console.log("action response: ",actionDataResponse);
        if (actionDataResponse.status != 201 && actionDataResponse.status!=200)
            submitErr=true
        else if(actionDataResponse.status == 201 || actionDataResponse.status==200)
        {  
            console.log("subission was successful");
            submitErr=false;
            dataRefresh=true
        }
    }
   
    useEffect(()=>{
       
     if(dataRefresh){
          async function tokenReload(){
            try {
                console.log("Refreshing...");
                setListRefreshing(true);
                const newTokenList= await accessTokensLoader(); 
                console.log("Reloaded tokens",newTokenList)
              
                setRenderedTokenList(newTokenList);
                 
            } catch (error) {
              setPromptMessage("Could not reload data changes");
              setPromptModalShow(true);
              console.log(error);
            }finally{  
                setFormData({token:"",expiryopt:"",expirytime:""});
                setListRefreshing(false);
            }             
          }
          tokenReload();
      }
     
    },[dataRefresh])
   
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
                removeDeletedEntry(token_id);
               
             }
          } catch (error) {
            const {response}=error;    
            console.log(error);          
            if(response.status==401)
                navigate("/",{replace:true})//log user out
            else
           {  
               setPromptMessage("Delete Operation failed. Internal Server Error, Try again later.")
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


    const handleGenerate=(event)=>{
        const newTOken= randomToken(9).toUpperCase();
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


    function handleTokenDelete(){
        setModalShow(false);
        setConfirmDelete(true);
    }

    const removeDeletedEntry=(Id)=>{
        setRenderedTokenList(prevTokenList=>prevTokenList.filter(token=>token._id!=Id));        
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
                    <Form method="post">
                      <div className="token-section">
                       <span className="d-flex"> <h5>Token Generator</h5> 
                       <i className="bi bi-key-fill keyIcon"></i> </span>
                        <section className="token-wrap">
                        <button className="btn btn-secondary btn-sm gen-btn" type="button"
                         onClick={handleGenerate}>
                            Generate
                        </button>
                        <input type="text" readOnly maxLength={10} required onChange={handleChange}
                        className="text-input gen-text ms-2" name="token" value={formData.token} />
                        </section>
                        {submitErr && <p className="errTxt">Error! subimtting token</p>}
                        <fieldset className="token-duration" >
                            <legend className="absolute">Token duration</legend>
                            <div className="expiry-opts">
                                <p className="hdr">Expires</p>
                                <input type="radio" name="expiryopt" id="minutes" required
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
                            <div className="epxiry-value">
                                <input name="expirytime" value={formData.expirytime} type="number"  
                                    onChange={handleChange}    max={365} min={0} className="expirytime" required />
                            </div>

                        </fieldset>
                      </div>
                      <div className="btn-token-submit">
                        <button className="btn btn-primary"  data-tooltip-id="tooltipSubmit"
                        >Add</button>
                      </div>
                  </Form>
                 </div>
                 <div className="token-list">
                 {
                    listRefreshing ? <p className="loading">Fetching data...</p>:(
                     <>
                       <h5>Access token list</h5>
                       <DataTableViewer  columns={tokenListColumns} pageLimit={20} 
                       data={renderedTokenList} enableFilter={false} />
                     </>
                    )
                    }
                 </div>
                 < DeleteModal  show={modalShow}
             bodyText={`  Are you sure, you want to delete token from token list?`}
             onHide={() => setModalShow(false)} headerText={"Token Deletion"}
           submitHandler={handleTokenDelete}/>
           
           <PromptModal show={promptModalShow} bodyText={promptMessage} 
           onHide={()=>setPromptModalShow(false)} headerText={promptHeader} S />
           
            <Tooltip id="tooltipSubmit" style={tooltipStyle} place="bottom" content="Submit generated token" />
             </div>
      )
    
 }
    
export default TokenGenerator;