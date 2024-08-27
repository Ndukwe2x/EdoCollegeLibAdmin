
import { faCircleDot, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './tree-style.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";



const CatalogueTree = ({ data,deleteItem }) => {
    const [editMode,setEditMode]= useState(false)
    const [treeData,setTreeData]=useState(data);
    const [deleting,setDeleting]=useState(false);
    const navigate= useNavigate();

    function toggleShow(event){    
     
       const clickedNode= event.target;
       const  clickedNodeName=event.target.nodeName;
       let collaspableNode= null
       switch(clickedNodeName){
        case 'svg':
               collaspableNode= clickedNode.parentElement;
            break;
        case 'path':
              collaspableNode= clickedNode.parentElement.parentElement;
            break;
        case "SPAN":
            if(clickedNode.className=="")
                collaspableNode=clickedNode.parentElement;
             else
               collaspableNode= clickedNode;
            break;
       }
       const targetElement=collaspableNode.nextElementSibling;

       if(targetElement.classList.contains("hide-item"))
            targetElement.classList.remove("hide-item")
        else
            targetElement.classList.add("hide-item")
    }
    const handleDelete=async(catLogId)=>{
        try {
          setDeleting(true);  
          const response= await deleteItem(catLogId); 
          if(response.status==200)
            removeDeletedEntry(catLogId); 
         } catch (error) {
            const {response}=error;
            if(response.status==401)
                navigate("/",{replace:true})//log user out
            else
             alert("Delete failed.\nInternal Server Error. Try again later");            
        }
        finally{
            setDeleting(false);
        }
       
    }
    const removeDeletedEntry=(Id)=>{
          setTreeData(prevData=>prevData.filter(catLogEntry=>catLogEntry._id!=Id));   
          setEditMode(false);
         console.log("Data filter: ",treeData);
        
    }
    function toggleEditMode(event){
         setEditMode(prevEdit=>(
            prevEdit=event.target.checked?true:false
            ));
    }
    return (<>
           { deleting?<p className="loading">Reloading...</p>:
            
            <div className="tree-container">
            <div className="tree-item">
                <span className="uncategorised">
                    <FontAwesomeIcon icon={faCircleDot} />-<span>Uncategorized</span>
                    <span className="editmode"> 
                    <input name="editMode" type="checkbox" onClick={toggleEditMode}/>
                     {` Edit Mode`}
                    </span>
                 </span>
            </div>
            <hr className="item-liner"/>
            { treeData.map((catalogeEntry,index,collection)=>{
               if(catalogeEntry.title!=="Uncategorised"){
                   if(!catalogeEntry.parentTitle){
                    const catlogId=catalogeEntry._id;
                     return(
                        <>
                        <div className="tree-item" key={catlogId} >
                        <span className="singleItem"> 
                            <FontAwesomeIcon icon={faCircleDot} />-<span>{catalogeEntry.title}</span>
                           {editMode &&  <i className="bi bi-trash delete-catalogue" title="delete" 
                          onClick={()=>handleDelete(catlogId)}>
                        </i>}
                           </span>
                       </div>
                       {collection.length==index+1 ? "": <hr className="item-liner"/>}
                       </>
                     )                    
                   }
               }
            })
            }
         {/*    <div className="tree-item" >
                <span className="pointer singleItem" onClick={toggleShow }>
                    <FontAwesomeIcon icon={faCirclePlus} />-<span>Maths</span>
                    {editMode &&
                     <i className="bi bi-trash delete-catalogue" title="delete" 
                     onClick={()=>handleDelete(catLogId)}>
                     </i>}
                </span>
                <div className="child-tree hide-item">
                    <div className="tree-item ">
                    <span className="singleItem">  <FontAwesomeIcon icon={faCircleDot} />-<span>Geometery</span>
                        {editMode && <i className="bi bi-trash delete-catalogue" title="delete"></i>}</span>
                    </div>
                </div>
            </div> */}
        
        </div>}
        
        </>
    );
}
export default CatalogueTree