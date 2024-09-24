import { Suspense } from "react";
import { authenticateAdmin } from "../auth/authHandler";
import ResourceCounterCard from "../components/ResourceCounterCard/ResourceCounterCard";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faFilm, faGraduationCap, faDownload, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import ZeroBooks from "../components/ZeroBooks/ZeroBooks";
import DataTableViewer from "../components/DataTableViewer/DataTableViewer";
import { libraryResources } from "../data-utils/dataLoaders";
import { useLoaderData, defer, Await } from "react-router-dom";
import SectionLoader from '../components/SectionLoader/SectionLoader';



const TableTitleViewer = ({ titleText }) => {
  const textStyle = { whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%' }
  return <p style={textStyle} title={`${titleText}`}>{titleText}</p>
}

export const loader = () => {
  authenticateAdmin("/");
  try {
    return defer({ libraryMaterials: libraryResources() });
  } catch (error) {
    return null;
  }

}

const getOneMonthAheadValue = () => {
  const currentTime = Date.now();
  const oneMonthInMilliseconds = 30 * 60 * 60 * 24 * 1000;
  const oneMonthAhead = currentTime + oneMonthInMilliseconds;

  return oneMonthAhead;

}
const DashboardMain = () => {

  const cardIcon = <FontAwesomeIcon icon={faBook} />;
  const cardIconVideo = <FontAwesomeIcon icon={faFilm} />;
  const cardIconAcademic = <FontAwesomeIcon icon={faGraduationCap} />

  const libraryMaterialsPromise = useLoaderData();

  let books, videos = [];
  let userCount = 0




  function getResoursesAddedWithinTheMonth(resource) {
    const oneMonthAhead = getOneMonthAheadValue();

    if (resource?.length && resource.length > 0)
      return resource.filter((libMaterial) => {
        const dateInMilliseconds = new Date(libMaterial.createdAt);
        return dateInMilliseconds <= oneMonthAhead
      });
    return resource;
  }

  const bookColumns = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (props) => <p>{props.getValue()}</p>
    },
    {
      header: 'Author(s)',
      accessorKey: 'author',
      cell: (props) => <p>{props.getValue()}</p>
    }
    ,
    {
      header: 'Edition',
      accessorKey: 'edition',
      cell: (props) => <p>{props.getValue()}</p>
    }
    ,
    {
      header: 'Year Published',
      accessorKey: 'yearOfPublication',
      cell: (props) => <p>{props.getValue()}</p>
    }
  ];

  const videoColumns =
    [
      {
        header: 'Title',
        accessorKey: 'title',
        cell: ({ getValue }) => <TableTitleViewer titleText={getValue()} />,
        size: 50
      },
      {
        header: 'Creator(s)',
        accessorKey: 'creator',
        cell: (props) => <p>{props.getValue()}</p>
      }
      ,
      {
        header: 'Video format',
        accessorKey: 'fileType',
        cell: (props) => <p>{props.getValue()}</p>
      },
      {
        header: () => <><FontAwesomeIcon icon={faDownload} /> Downloadble</>,
        accessorKey: 'downloadable',
        cell: (props) => <p>{props.getValue().toString()}</p>
      }

    ];
  const renderDashBoardMain = (bookCount, videoCount) => {
    return (
      <>
        <section className="counters-sctn center">
          <div className="row justify-content-center  justify-content-sm-start ">
            <div className="col-12 col-sm-4 card-container">
              <ResourceCounterCard cardTitle={'Books'} resourceCount={bookCount} icon={cardIcon} />
            </div>
            <div className="col-12 mt-3 mt-sm-0 ms-sm-5 ms-md-0 col-sm-4 card-container">
              <ResourceCounterCard cardTitle={'Videos'} resourceCount={videoCount} icon={cardIconVideo} />
            </div>
            <div className="col-12 mt-3 mt-sm-3 col-sm-4 mt-md-0 card-container">
              <ResourceCounterCard cardTitle={'Student Accounts'} resourceCount={userCount}
                icon={cardIconAcademic} />
            </div>
          </div>
        </section>
        {
          bookCount < 1 ? (
            <section className="row justify-content-center justify-content-lg-start ">
              <div className="col-12 col-sm-10 mt-4 mb-5 col-lg-8 ms-lg-5">
                <ZeroBooks />
              </div>
            </section>
          ) : (
            <section className="books-recent row justify-content-center justify-content-lg-start">
              <h3 className="header-title">Recently Added Books</h3>
              <div className="col-12 col-sm-10 ms-lg-4 mb-4">
                <DataTableViewer columns={bookColumns} data={books} pageLimit={1} enableFilter={false} />
              </div>
            </section>
          )
        }
        {
          videoCount > 0 && (
            <section className="books-recent row justify-content-center justify-content-lg-start">
              <h3 className="header-title">Recently videos</h3>

              <div className="col-12 col-sm-10 ms-lg-4 mb-4">
                <DataTableViewer columns={videoColumns} enableFilter={false} data={videos} pageLimit={1} />
              </div>
            </section>
          )

        }

      </>
    );

  }
  return (
    <div>
      <Suspense fallback={<SectionLoader sectionName="DashBoard main"/>} >
        <Await resolve={libraryMaterialsPromise.libraryMaterials}>
          {
            (libraryMaterials) => {
            
              if (libraryMaterials && libraryMaterials.books) {
                books = libraryMaterials.books;
                books = getResoursesAddedWithinTheMonth(books);
              }
              if (libraryMaterials && libraryMaterials.videos) {
                videos = libraryMaterials.videos;
                videos = getResoursesAddedWithinTheMonth(videos);
              }
              if (libraryMaterials && libraryMaterials.studentsCount)
                userCount = libraryMaterials.studentsCount;

              const bookCount = books?.length ? books.length : 0;//get book count
              const videoCount = videos?.length ? videos.length : 0;

              return renderDashBoardMain(bookCount, videoCount);

            }

          }
        </Await>
      </Suspense>
    </div>
  )

}
export default DashboardMain;