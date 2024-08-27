import ResourceCounterCard from "../components/ResourceCounterCard/ResourceCounterCard";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faBook, faFilm, faGraduationCap,faDownload,faEllipsisVertical} from '@fortawesome/free-solid-svg-icons';
import ZeroBooks from "../components/ZeroBooks/ZeroBooks";
import DataTableViewer from "../components/DataTableViewer/DataTableViewer";
import TableActionButton from "../components/TableActionButton/TableActionButton";
import { libraryResources } from "../data-utils/dataLoaders";
import { useLoaderData } from "react-router-dom";


const TableTitleViewer=({titleText})=>{
   const textStyle={ whiteSpace:'nowrap',textOverflow:'ellipsis', overflow:'hidden',width:'100%'}
  return <p style={textStyle} title={`${titleText}`}>{titleText}</p>
}

export const  loadLibraryResources=async()=>{   
  const academicResources= await libraryResources();
  return academicResources;
}

const DashboardMain = () => {

    const cardIcon=<FontAwesomeIcon icon={faBook}/>;
    const cardIconVideo=<FontAwesomeIcon icon={faFilm}/>;
    const cardIconAcademic=<FontAwesomeIcon icon={faGraduationCap} />
    
    const libaryMaterials= useLoaderData();

    const bookCount=0; //get book count
    const videoCount=0;
    const bookColumns= [
      {
       header:'Title',
       accessorKey:'title' ,
       cell: (props)=><p>{props.getValue()}</p>
      },
      {
       header:'Author(s)',
        accessorKey:'author',
        cell: (props)=><p>{props.getValue()}</p>  
      }
      ,
      {
       header:'Edition',
        accessorKey:'edition',
        cell: (props)=><p>{props.getValue()}</p>
      }
      ,
      {
       header:'Year Published',
      accessorKey:'yearOfPublication' ,
      cell: (props)=><p>{props.getValue()}</p>
      }
  ];
   function tableActionClick(){

   }
    const videoColumns=   
        [
          {
           header:'Title',
           accessorKey:'title' ,
           cell:({getValue})=><TableTitleViewer titleText={getValue()}/>,
           size:50
          },
          {
           header:'Creator(s)',
            accessorKey:'creator',
            cell: (props)=><p>{props.getValue()}</p>  
          }
          ,
         {
           header:'Video format',
          accessorKey:'fileType' ,
          cell: (props)=><p>{props.getValue()}</p>
          },
          {
           header:()=><><FontAwesomeIcon icon={faDownload} /> Downloadble</>,
            accessorKey:'downloadable',
            cell: (props)=><p>{props.getValue().toString()}</p>
          }
          ,
          {
            header:'Action(s)',
            accessorKey:'id',
            cell:()=><TableActionButton  handleClick={tableActionClick} />
          }
         
      ];
      
    return (
        <div> 
            <section className="counters-sctn center">
              <div className="row justify-content-center  justify-content-sm-start ">
                <div className="col-12 col-sm-4 card-container">
                 <ResourceCounterCard cardTitle={'Books'} resourceCount={5} icon={cardIcon}/>
                 </div>
                 <div className="col-12 mt-3 mt-sm-0 ms-sm-5 ms-md-0 col-sm-4 card-container">
                 <ResourceCounterCard cardTitle={'Videos'} resourceCount={20} icon={cardIconVideo}/>
                 </div>
                 <div className="col-12 mt-3 mt-sm-3 col-sm-4 mt-md-0 card-container">
                  <ResourceCounterCard cardTitle={'Student Accounts'} resourceCount={33}
                   icon={cardIconAcademic}  />
                 </div>                 
                </div>
            </section>
            {
              bookCount < 1 ? (
              <section className="row justify-content-center justify-content-lg-start "> 
                <div className="col-12 col-sm-10 mt-4 mb-5 col-lg-8 ms-lg-5">
                  <ZeroBooks/>
                </div>
            </section>
              ) : (                 
                <section className="books-recent row justify-content-center justify-content-lg-start">
                      <h3 className="header-title">Recently Added Books</h3>
                      <div className="col-12 col-sm-10 ms-lg-4 mb-4">
                      {/*    <DataTableViewer columns={bookColumns} data={tableData} pageLimit={1} enableFilter={true} /> */}
                      </div>
                </section>
                )
            }
           {
             videoCount > 0 && (
               <section className="books-recent row justify-content-center justify-content-lg-start">
                      <h3 className="header-title">Recently videos</h3>

                      <div className="col-12 col-sm-10 ms-lg-4 mb-4">
                      {/* <DataTableViewer columns={videoColumns} enableFilter={false} data={recentVideo.videos} pageLimit={1} /> */}
                      </div>
            </section>
            )

           }
            
           
           
        </div>
    )

}
export default DashboardMain;