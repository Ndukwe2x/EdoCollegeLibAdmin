import { authenticateAdmin } from "../auth/authHandler";
import { libraryResourcesVideos } from "../data-utils/dataLoaders";
import { Suspense, useEffect, useState, useTransition } from "react";
import CardContainer from "../components/CardContainer/CardContainer";
import TableActionButton from "../components/TableActionButton/TableActionButton";
import DataTableViewer from "../components/DataTableViewer/DataTableViewer";
import { Await, defer, useLoaderData, useNavigate } from "react-router-dom";
import DeleteModal from "../components/ModalDialogs/DeleteModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { deleteVideo } from "../data-utils/server";
import SectionLoader from "../components/SectionLoader/SectionLoader";
import { Tooltip } from "react-tooltip";


export const loader = () => {
  authenticateAdmin("/")
  try {
    return defer({ videoList: libraryResourcesVideos() });
  }
  catch (error) {
    return null;
  }
}



const LibraryVideos = () => {
  const loadedlibraryVideosPromise = useLoaderData();
  const [libraryVideos, setLibraryVideos] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [submitting, setSumbitting] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [headerText, setHeaderText] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [recordId, setRecordId] = useState()
  const [startDelete, setStartDelete] = useState(false);
  const [firstInstanceRender, setFirstInstanceRender] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const navigate= useNavigate();

  const tableRecordStyle = { font: 'normal 0.92em Calibri', margin: '0' };
  const tooltipStyle = { backgroundColor: '#20134488' };

  function handleEdit(videoId) {


  }
  function handleDelete(videoId) {
    setHeaderText("Delete Book");
    setModalBody("  Are you sure, you want to delete this resource from library?");
    setRecordId(videoId);
    setModalShow(true);

  }
  useEffect(() => {

    if (firstInstanceRender) {
      libraryResourcesVideos()
        .then(response => {
          const { data: { data: { videos: videoCollection } } } = response;
          setLibraryVideos(videoCollection);
          setSearchResult(videoCollection);
        })
        .catch(error => console.log(error))
        .finally(() => setFirstInstanceRender(false))
    }

  }, []);

  useEffect(() => {
    if (startDelete) {
      setSumbitting(true);
      const performDelete = async () => {
        try {
          const deleteResponse = await deleteVideo(recordId);
          if (deleteResponse.status == 200) {
            const videosInLibrary = await libraryResourcesVideos();
            const { data: { data: { videos: videoCollection } } } = videosInLibrary;
            setLibraryVideos(videoCollection)
          }

        }
        catch (error) {
          console.log(error)
        } finally {
          setSumbitting(false);
        }
      }
      performDelete();
      setStartDelete(false);

    }


  }, [startDelete]);

  const goBackToPreviousPage = () => {
    navigate(-1); // move back to previous page
  }
  const deleteLibVideo = () => {
    setModalShow(false);
    setStartDelete(true);
  }

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
    startTransition(() => {
      setLibraryVideos(searchResult.filter(video => video.title.toLocaleLowerCase().includes(value.toLocaleLowerCase())));
    })

  }


  const videoListColumns = [
    {
      header: 'Video Title',
      accessorKey: 'title',
      cell: ({ getValue }) => <p style={tableRecordStyle}>{getValue()}</p>
    },
    {
      header: 'Creators/Source',
      accessorKey: 'creators_origin',
      cell: ({ getValue }) => <p style={tableRecordStyle}>{getValue()}</p>
    },
    {
      header: 'Vidoe Format',
      accessorKey: 'format',
      cell: ({ getValue }) => <p style={tableRecordStyle}>{getValue()}</p>
    },
    {
      header: 'About Video',
      accessorKey: 'videoDescription',
      cell: ({ getValue }) => <p style={tableRecordStyle}>{getValue()}</p>
    },
    {
      header: 'Action(s)',
      accessorKey: '_id',
      cell: ({ getValue }) => <TableActionButton showDelete={true} showEdit={true}
        handleDelete={() => handleDelete(getValue())} handleEdit={() => handleEdit(getValue())} />
    }
  ]
  return (
    <div>
      <div className="topSearch">
        <p className="matchcount">{searchResult.length !== libraryVideos.length ? `${libraryVideos.length} macthes` : null}</p>
        <div className="searchNav">
          <button className="btn "  data-tooltip-id="tooltipBackButton"
          onClick={goBackToPreviousPage}> <i className="bi bi-chevron-left"></i> Back</button>
          <div className="input-group control-search">
            <input type="text" className="form-control searchBox" placeholder="Search"
              onChange={handleSearch} value={searchTerm} name="txtSearch" />
            <button className="btn  search-btn" onClick={handleSearch}
              type="button"><FontAwesomeIcon icon={faMagnifyingGlass} size="lg" /></button>
          </div>
        </div>
        <h2 className="page-caption listpg-caption ">Video List</h2>
      </div>
      <div disabled={submitting}>
        {
          firstInstanceRender ? (
            <Suspense fallback={<SectionLoader sectionName={"video listing cards"} />}>
              <Await resolve={loadedlibraryVideosPromise.videoList}>
                {
                  (resolvedList) => {
                    const { data: { data: { videos: videoCollection } } } = resolvedList;
                   
                    return <CardContainer cardType={"video"} cardData={videoCollection} pageLimit={20} handleDelete={handleDelete}
                      handleEdit={handleEdit} loading={isPending} />;
                  }
                }
              </Await>
            </Suspense>
          ) : (<CardContainer cardType={"video"} cardData={libraryVideos} pageLimit={20} handleDelete={handleDelete}
            handleEdit={handleEdit} loading={isPending} />)
        }

      </div>

      <div className="table-sectn" disabled={submitting}>
        {firstInstanceRender ? (
          <Suspense fallback={<SectionLoader sectionName={"video listing table"} />}>
            <Await resolve={loadedlibraryVideosPromise.videoList} >
              {(resolvedList) => {
                const { data: { data: { videos: videoCollection } } } = resolvedList;
                return <DataTableViewer columns={videoListColumns} data={videoCollection}
                  enableFilter={true} pageLimit={25} />;
              }
              }

            </Await>
          </Suspense>) : (<DataTableViewer columns={videoListColumns} data={libraryVideos}
            enableFilter={true} pageLimit={25} />)}
      </div>
      < DeleteModal show={modalShow}
        bodyText={modalBody}
        onHide={() => setModalShow(false)} headerText={headerText}
        submitHandler={() => deleteLibVideo()} />
          <Tooltip id="tooltipBackButton" style={tooltipStyle} place="bottom"
            content="back to previous page" />
          
    </div>
  )

}

export default LibraryVideos;

