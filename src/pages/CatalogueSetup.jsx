import { useLoaderData, Form, useActionData,useNavigation, 
        useNavigate,useSearchParams, defer,  Await} from 'react-router-dom';
import { authenticateAdmin } from '../auth/authHandler';
import { catalogueDataLoader } from '../data-utils/dataLoaders';
import { Tooltip } from 'react-tooltip';
import DataTableViewer from '../components/DataTableViewer/DataTableViewer';
import TableActionButton from "../components/TableActionButton/TableActionButton";
import { Suspense, useEffect, useState } from 'react';
import { addToCatalogue,deleteCatalogueItem, editCatalogueEntry } from '../data-utils/server';
import DeleteModal from '../components/ModalDialogs/DeleteModal';
import PromptModal from '../components/ModalDialogs/PromptModal';
import SectionLoader from '../components/SectionLoader/SectionLoader';



export const loader =async () => {
    authenticateAdmin("/");
   try {
    return defer({catalogueData:catalogueDataLoader()})
   } catch (error) {
    return null
   }
    
}
export const action = async ({ request}) => {
    const formData = await request.formData();
    const title = formData.get("title");
    const parentTitle=null;
    const path= new URL(request.url);                          
    const submitMode= path.searchParams.get("mode");
        
   try {
        let response=null;
        if(submitMode!==null && submitMode=="edit")
         {
            const ref=path.searchParams.get("id");
            response= await editCatalogueEntry(ref,{title,parentTitle})
         }            
        else 
          response = await addToCatalogue({ title, parentTitle, });
          return response;

     } catch (err) {
         const { response } = err;        
        return response;
    }

}

const CatalogueSetup = () => {

    
    const [selectedCatalogue,setSelectedCatalogue]=useState("");   
    const [recordId,setRecordId]=useState(null);
    const [editMode,setEditMode]=useState(false);
    const navigation = useNavigation();
    const [modalShow, setModalShow] = useState(false);
    const [promptModalShow,setPromptModalShow]=useState(false);
    const [promptMessage,setPromptMessage]=useState("");
    const [firstInstanceRender,setFirstInstanceRender]=useState(true);
    const [searchParam,setSearchParams]=useSearchParams();
    const  navigate=useNavigate();
    const [formData,setFormData]=useState({title:""})
        
    const catalogueDataPromise= useLoaderData();
    const [catalogueData, setCatalogueData] = useState([]);
    const actionResponse = useActionData();

    const tooltipStyle = {backgroundColor: '#605286' };
    let submitErr = false
    let dataRefresh=false 
    
    if (actionResponse) //set error
    {   
        if (actionResponse.status != 201 && actionResponse.status!=200)
            submitErr=true
        else
         {  
           submitErr=false;
           dataRefresh=true
         }
    }
  
    useEffect(()=>{
        if(firstInstanceRender){
            catalogueDataLoader()
            .then(response=>{
               const {data:{data:{catalogue:catalogueList}}}=response;
               setCatalogueData(catalogueList);          
            })
          .catch(error=>console.log(error))
          .finally(()=>setFirstInstanceRender(false))   
          }  
      
    },[])
  
    useEffect(()=>{
        if(dataRefresh){
            setFirstInstanceRender(false);
            async function getReloadData(){
                try {
                   const reloadData=await catalogueDataLoader(); 
                   const {data:{data:{catalogue:freshData}}}= reloadData;
                   setSearchParams({});
                   setEditMode(false);
                   setFormData(prevData=>({...prevData,title:""}));
                   setCatalogueData(freshData);
                } catch (error) {
                   console.log(error);   
                }
             }
             getReloadData();
            }     
    },[dataRefresh]); 

    
    function startEdit(record_id)
    {
        const editRecord=findCatalogueRecord(record_id);
        if(editRecord && editRecord?.title=="Uncategorised"){
            setPromptMessage(`You not permitted to modify Uncategorised Catalagoue.
                Critical for system use`);
           setPromptModalShow(true);
            return false;
        }        
            
        if(editRecord)
        {   setEditMode(true);
            setSearchParams({mode:"edit",id:record_id});  
            setFormData(prevFormData=> ({...prevFormData,title:editRecord.title}));   //update control    
          
        }
     }
     
    function findCatalogueRecord(record_Id){
      return  catalogueData.find((record)=>record._id==record_Id);
    }
    function enforceNonDeleteable(recordId){
        //make sure the entry is not uncategorized.
       const markedForDelete= findCatalogueRecord(recordId);
       if(markedForDelete && markedForDelete?.title=="Uncategorised")        
            return false;
        return true;
    }
    function handleDeleteCatalogue(record_id){
        const catalougeInfo= findCatalogueRecord(record_id);
        setSelectedCatalogue(catalougeInfo);
        setRecordId(record_id);
        setModalShow(true);

    }

    async function deleteCatalogue(recordIndex){
      
        setModalShow(false); //close modal before delete processing.

       if(!enforceNonDeleteable(recordIndex))
        {  
            setPromptMessage(`You not permitted to delete Uncategorised Catalagoue.
                 Critical for system use`);
            setPromptModalShow(true);
             return;
        }
           
        try {          
           const response= await deleteCatalogueItem(recordIndex); 
           if(response.status==200)                        
              removeDeletedEntry(recordIndex);             
              
           } catch (error) {
              const {response}=error;
              
              if(response.status==401)
                  navigate("/",{replace:true})//log user out
              else
             { 
                setPromptMessage("Delete Operation failed. Internal Server Error, Try again later.")
                setPromptModalShow(true);
             }           
          }finally{
           
            setSearchParams({}); //clear search params
          }         
        
     }
     const goToPreviousPage=()=>{
        navigate(-1);//move to the previous page
     }
     const handleChange=(event)=>{
        const {name,value}=event.target;
        setFormData(prevFormData=> ({...prevFormData,[name]:value}));
     }
     const removeDeletedEntry=(Id)=>{
          setCatalogueData(prevData=>prevData.filter(catLogEntry=>catLogEntry._id!=Id));
      }
    const catalogueColumns = [
        {
            header: 'Title',
            accessorKey: 'title',
            cell: ({ getValue }) => <p>{getValue()}</p>
        },
        {  
            header:'Action(s)',
            accessorKey:'_id',
            cell:({getValue})=><TableActionButton  
             handleDelete={()=>handleDeleteCatalogue(getValue())}
              handleEdit={()=>startEdit(getValue())}  />
          }
    ]
    function handleCancel(){
      setEditMode(false);
      setSearchParams({});  
      setFormData(prevFormData=> ({...prevFormData,title:""}));     
    }
    function setButtonText(){
       if(editMode)
       {
        if(editMode & navigation.state=="submitting")
          return "Updating...";
        else if(editMode & navigation.state=="idle")
          return "Update";
      }
      else{
         return navigation.state === "submitting" ? "Adding..." : "Add";
      }

    }
    return (
        <>
        <div className='catalogue-pg row'>
            <div className='topnav-catlogue'><button className='btn '
             onClick={goToPreviousPage} data-tooltip-id="tooltipBackButton">
                <i className="bi bi-chevron-left"></i> <span className='bckbtnTxt'>Back</span> </button>
                  <h3 >Catalogue Setup</h3></div>
            <div className='row justify-content-center justify-content-start-lg'>
                <div className="col-11 col-sm-8 col-md-7 col-lg-6 catalogue-form ">
                    <Form method='post' >
                        {submitErr && <p className='errTxt'>Error submitting catalogue!</p>}
                        <label htmlFor='title' className='form-label'>Catalogue Title:</label>
                        <input id='title' type='text' name='title' value={formData.title}
                            onChange={handleChange}
                            placeholder='Catalogue title' maxLength={29} className='form-control'
                            disabled={navigation.state === "submitting"} required minLength={3} />
                          
                        <label htmlFor='description'>Description:</label>
                        <textarea id='description' name='description'
                            className='form-control textarea' disabled={navigation.state === "submitting"} />
                        <div className='row justify-content-end relative'>
                            {navigation.state === "submitting" &&
                                <div className="spinner-border text-primary spinner-position" role="status">
                                </div>}
                            {editMode && <button className='btn btn-secondary btn-md mt-4 col-3 me-5' onClick={handleCancel}
                                data-tooltip-id="tooltipCancel" disabled={navigation.state === "submitting"}>
                               Cancel Edit
                            </button>}

                            <button className='btn btn-primary btn-md mt-4 col-3 me-4' 
                                data-tooltip-id="tooltipsubmit" disabled={navigation.state === "submitting"}>
                               {setButtonText()}
                            </button>
                        </div>
                    </Form>
                </div>
                <div className='cat-tree-section col-11 col-sm-8 col-lg-5 '>
                    <h5>Catalogue List</h5>
                    <div className='catalogue-table '>
                     <Suspense fallback={<SectionLoader sectionName={"Catalogue List"} />}>
                       {  
                        firstInstanceRender ?(                       
                            <Await resolve={catalogueDataPromise.catalogueData}>
                              {
                                (catalogue)=>{
                                 const {data:{data:{catalogue:catalogueList}}}=catalogue;
                                  return(<DataTableViewer columns={catalogueColumns}
                                    data={catalogueList} enableFilter={false} pageLimit={5} />);
                                }
                              }  
                            </Await>
                     
                      ) :(<DataTableViewer columns={catalogueColumns}
                        data={catalogueData} enableFilter={false} pageLimit={5} />)
                       }  
                     </Suspense>
                 </div>                    
                </div>
                <Tooltip id="tooltipCancel" style={tooltipStyle} place="bottom" content="cancel edit process" />
                <Tooltip id="tooltipsubmit" style={tooltipStyle} place="bottom" content="add to list of catalogue" />
                <Tooltip id="tooltipBackButton" style={tooltipStyle} place="bottom" content="back to previous page" />
            </div>
        </div>
         
          <DeleteModal  show={modalShow}
           bodyText={`  Are you sure, you want to delete ${selectedCatalogue.title} from catalogue?`}
           onHide={() => setModalShow(false)} headerText={"Delete catalogue"}
           submitHandler={()=>deleteCatalogue(recordId)}/>

           <PromptModal show={promptModalShow} bodyText={promptMessage} 
           onHide={()=>setPromptModalShow(false)} headerText={"System Warning"}  />
        </>
    );
}
export default CatalogueSetup;