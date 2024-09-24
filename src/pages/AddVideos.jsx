import { authenticateAdmin } from "../auth/authHandler";
import { catalogueDataLoader } from '../data-utils/dataLoaders';
import { NavLink, useNavigate, useLoaderData, useSearchParams, defer, Await } from "react-router-dom";

import { Tooltip } from 'react-tooltip';
import PromptModal from '../components/ModalDialogs/PromptModal';
import VideoToThumb from 'video-thumb-generator-tool';
import { useState, useEffect, useRef, Suspense } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faUpload } from '@fortawesome/free-solid-svg-icons';
import { uploadVideoSmallFileSize, uploadVideoToS3, uploadVideoThumbsToS3, AddToVideos } from "../data-utils/server";
import progresloop from '../assets/progressloop.gif'
import SectionLoader from "../components/SectionLoader/SectionLoader";

export const loader = async () => {
    authenticateAdmin("/");
    try {

        return defer({catalogueData: catalogueDataLoader() })
    } catch (error) {
        return null;
    }

}

const AddVideos = () => {

    const [submitStatus, setSubmitStatus] = useState("idle");
    const [searchParams, setSearchParams] = useSearchParams();
    const [formmode, setFormMode] = useState(searchParams.get("mode") || "add");

    const [startSubmit, setStartSubmit] = useState(false)
    const [showSuccessMsg, setShowSuccessMsg] = useState(false);
    const [startThumbNailGen, setStartThumbNailGen] = useState(false);
    const [showThumbNail, setShowThumbNail] = useState(false)
    const [removeThumbNail, setRemoveThumbNail] = useState(false);

    const [promptModalShow, setPromptModalShow] = useState(false);
    const [promptMessage, setPromptMessage] = useState("");
    const [promptMode, setPromptMode] = useState("");
    const [promptHeader, setPromptHeader] = useState("");
    const [fileTypeError, setFileTypeError] = useState(false);

    const loadedCataloguePromise = useLoaderData();
    const navigate = useNavigate();

    const videoFileInputRef = useRef(null);
    const thumbsFileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        catalogueRef: "", title: "", creators_origin: "",
        thumbNailName: "", fileName: "", format: "", downloadable: false,
        videoDescription: ""
    });

    const [formError, setFormError] = useState({
        catalogueRef: false, title: false, creators_origin: false,
        thumbNailName: false, videoFile: false, format: false, downloadable: false,
        videoDescription: false
    });

    const tooltipStyle = { backgroundColor: '#20134488' };

    useEffect(() => {
        if (formmode == "edit") {
            console.log("Editing...");
        }
    }, [formmode]);

    useEffect(() => {
        if (startSubmit) {

            const pushUpload = async () => {
                let uploadResponse = null;
                try {
                    if (formData.videoFile.size < (1024 * 1024 * 10)) //less than 10MB.            
                    {
                        const compactUploadResponse = await uploadVideoSmallFileSize(formData, null);
                        uploadResponse = compactUploadResponse.status == 201 ? "success" : null;
                    }
                    else {

                        const videoFileUploadResponse = await uploadVideoToS3(formData.videoFile, null); //upload book file 

                        /* console.log('uploading thumbs...');
                         const thumbNailResponse= await uploadVideoThumbsToS3(formData.videoThumbs, null);
                         const thumbVideoFile = thumbNailResponse.status !== 201 ? thumbNailResponse.data.thumbsNail: null; */
                        let videoDetailsResponse = null;
                        if (videoFileUploadResponse.status == 201) {
                            {
                                formData.fileName = videoFileUploadResponse.filename;
                                formData.thumbNailName = "";

                                videoDetailsResponse = await AddToVideos(formData);
                            }

                            if (videoDetailsResponse?.status == 201)
                                uploadResponse = "success";

                        }
                    }

                } catch (error) {
                    console.log(error)
                }
                finally {
                    if (uploadResponse == "success") {
                        setShowSuccessMsg(true);
                        clearForm();
                    }
                    setStartSubmit(false);
                    setSubmitStatus("idle")
                }
            }
            pushUpload();
        }

    }, [startSubmit]);

    useEffect(() => {

        if (startThumbNailGen) {

            const thumbNailCanvas = document.getElementById("thumbnail-result");
            const videoToThumb = new VideoToThumb(videoFileInputRef.current.files[0]);

            videoToThumb
                .load()
                .positions([232])
                .size([200, 150])
                .error(function (err) {
                    setPromptHeader("ThumbNail Notification");
                    setPromptMode("warning");
                    setPromptMessage("Could not generate thumbnail for video Do you wish to continue?")
                    setPromptModalShow(true);
                    console.log(JSON.stringify(err));

                }).done(function (imgs) {
                    imgs.forEach(function (img) {
                        var elem = new Image();
                        elem.src = img;
                        thumbNailCanvas.appendChild(elem);

                        //set hidden file input  
                        const fileInput = document.getElementById('videothumbs');
                        const videoThumbs = new File([img], 'videoThumbs.png', {
                            type: 'image/png',
                            lastModified: new Date(),
                        });
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(videoThumbs);
                        fileInput.files = dataTransfer.files;
                        setFormData(prevData => ({ ...prevData, videoThumbs: fileInput.files }));
                        setShowThumbNail(true);

                    })

                })

            setStartThumbNailGen(false);
        }

    }, [startThumbNailGen]);

    useEffect(() => {
        if (removeThumbNail) {
            const thumbNailCanvas = document.getElementById("thumbnail-result");

            if (thumbNailCanvas) {
                while (thumbNailCanvas.hasChildNodes())
                    thumbNailCanvas.removeChild(thumbNailCanvas.firstChild);
            }
            setRemoveThumbNail(false)
        }

    }, [removeThumbNail]);

    useEffect(() => {
        if (fileTypeError == true) {
            setPromptHeader("Wrong File format");
            setPromptMode("warning");
            setPromptMessage("  Invalid/wrong format file selected");
            setPromptModalShow(true);
            setFileTypeError(false);
        }
    }, [fileTypeError]);

    const uploadvideo = (event) => {
        event.preventDefault();
        if (validatedVideoFile() || formError.title)
            return;

        setSubmitStatus("submitting")
        setStartSubmit(true);
    }

    function clearForm() {
        setStartSubmit(false);
        setSubmitStatus("idle");
        videoFileInputRef.current.value = "";
        thumbsFileInputRef.current.value = "";

        setFormData({
            catalogueRef: "", title: "", creators_origin: "",
            thumbNailName: "", fileName: "", format: "", downloadable: false,
            videoDescription: ""
        });


        setFormError({
            catalogueRef: false, title: false, creators_origin: false,
            thumbNailName: false, videoFile: { error: "", isError: false }, format: false, downloadable: false,
            videoDescription: false
        });

        setRemoveThumbNail(true);
        setShowThumbNail(false);
    }
    function clearError(event) {
        const { name } = event.target;
        setFormError(prevError => {
            return { ...prevError, [name]: false }
        })
    }
    function setError(name) {
        setFormError(prevError => {
            return { ...prevError, [name]: true }
        })
    }
    const goBackToPreviousPage = () => {
        navigate(-1);
    }
    const moveToVideoListPage = () => {
        navigate("../videos");

    }
    function cancelEdit() {
        setFormMode(preMode => {
            const sp = new URLSearchParams();
            sp.delete("mode")
            return "add";
        })

    }
    function validateForm(event) {
        const { name, value } = event.target;
        if (value == "" || !value)
            setError(name);
    }
    function validatedVideoFile() {
        let errorOnValidation = false;
        const content = videoFileInputRef.current.files[0]?.name ? videoFileInputRef.current.files[0].name : "";
        const fileType = videoFileInputRef.current.files[0]?.type ? videoFileInputRef.current.files[0].type : null;

        if (content == "" || content == null || content == undefined) {
            setFormError(prevErros => ({ ...prevErros, videoFile: { error: `*required `, isError: true } }))
            return errorOnValidation = true;
        }

        switch (fileType) {
            case "video/mp4":
            case "video/avi":
            case "video/mov":
            case "video/wmv":
            case "video/mkv":
            case "video/flv":
                errorOnValidation = false;
                break;
            default:
                errorOnValidation = true;
        }

        if (errorOnValidation) {
            setFormError(prevErros => ({
                ...prevErros, videoFile: {
                    error: `Invalid file format file must be
        of valid video format`, isError: true
                }
            }))
            setFileTypeError(errorOnValidation = true)

        }
        else {
            setFileTypeError(false);
            setFormError(prevErros => ({ ...prevErros, videoFile: { error: "", isError: false } }))
        }
        return false;

    }


    const handleChange = (event) => {
        const { name, type, value } = event.target;

        if (type != "file") {
            setFormData(prevData => {
                return { ...prevData, [name]: type === "checked" ? checked : value }
            })
        }
        else if (type == "file") {
            const fileType = event.target.files[0].type;

            setFormData(prevData => ({ ...prevData, format: fileType, [name]: event.target.files[0] }));
            if (videoFileInputRef.current.files[0])
                setRemoveThumbNail(true)
            if (!validatedVideoFile()) {
                setShowThumbNail(true);
                setStartThumbNailGen(true);

            }

        }
    }


    return <div className="add-book-pg">
        <div className="topNav">
            <button className="btn " data-tooltip-id="tooltipBackButton"
            onClick={goBackToPreviousPage}> <i className="bi bi-chevron-left"></i> Back</button>
            <button className="btn " onClick={moveToVideoListPage}>video List</button>
        </div>

        <div className="addbookHdr">
            <span className="iconSize">
                <FontAwesomeIcon icon={faUpload} /> <FontAwesomeIcon icon={faFilm} />
            </span>
            <h4 >Upload Video to Library</h4>
        </div>
        <div className="add-book-frm">

            <form onSubmit={uploadvideo} encType="multipart/form-data" >
                <label id="catalogue">Catalogue</label>
                <Suspense fallback={<SectionLoader sectionName={"Video upload form"} />}>
                    <Await resolve={loadedCataloguePromise.catalogueData}>
                        {
                            (catalogueCollection) => {
                               const { data: { data: { catalogue: catalogueList } } } = catalogueCollection;
                                return (
                                 <>
                                   {submitStatus == "submitting" && <span className="top-indicator"> Uploading video, Please wait....</span>}
                                    <select name="catalogueRef" className="form-control form-select"
                                        disabled={submitStatus == "submitting"}
                                        value={formData.catalogueRef} onChange={handleChange}>
                                        <option value="">--- Select option ---</option>
                                        {catalogueList.map(catlog => {
                                            return <option key={catlog._id} value={catlog._id}>{catlog.title}</option>
                                        })
                                        }
                                    </select>
                                    <span></span>
                                    <label htmlFor="title">Video Title</label>
                                    <input name="title" type="text" id="title" className="form-control" maxLength={100}
                                        placeholder="Enter video title" disabled={submitStatus == "submitting"}
                                        onChange={handleChange} value={formData.title} onFocus={clearError} onBlur={validateForm} />
                                    {formError.title ? (<p className='errTxt'>*required</p>) : null}

                                    <label htmlFor="videofile">Video File</label>
                                    <input type="file" id="videofile" name="videoFile" className="form-control"
                                        ref={videoFileInputRef} data-tooltip-id="tooltipvideofile" disabled={submitStatus == "submitting"}
                                        placeholder="browse and select video file" onChange={handleChange} />
                                    {formError.videoFile.isError ? (<p className='errTxt'>{formError.videoFile.error}</p>) : null}

                                    <label htmlFor="creator">Creator(source)</label>
                                    <input name="creators_origin" type="text" id="creator" className="form-control"
                                        disabled={submitStatus == "submitting"} placeholder="video creator(s)/source"
                                        data-tooltip-id="tooltipvideoauthors" onChange={handleChange} value={formData.creators_origin} />

                                    <label htmlFor="description">Description</label>
                                    <textarea name="videoDescription" onChange={handleChange} disabled={submitStatus == "submitting"}
                                        className="form-control textarea center" id="description" value={formData.videoDescription} />


                                    <input type="file" id="videothumbs" name="videoThumbs" className="form-control"
                                        data-tooltip-id="tooltipvideofile" disabled={submitStatus == "submitting"}
                                        placeholder="browse and select video file" hidden onChange={handleChange}
                                        ref={thumbsFileInputRef} />

                                    <div className="thumbNail-generator">
                                        {startThumbNailGen &&
                                            <span>
                                                <div className="prgrss-thumbs">
                                                    <img alt="generating thumbnail..." src={progresloop} className="" />
                                                </div>
                                                <div>
                                                    <p className="thumbgen-text">Generating video thumbnail...</p>
                                                </div>
                                            </span>}
                                        {showThumbNail && <div id="thumbnail-result" className="thumbnail-result">

                                        </div>}
                                        {showThumbNail && <div><p className="videoThumbs-caption">Video Thumbs</p></div>}

                                    </div>

                                    <span className="spanarea">
                                        <span className="clearForm" >
                                            {submitStatus != "submitting" && <NavLink onClick={clearForm}  >Clear Form</NavLink>}
                                        </span>
                                        {formmode == "edit" && <span className="cancel-edit" disabled={submitStatus == "submitting"} >
                                            <NavLink onClick={cancelEdit}> Cancel Edit</NavLink>
                                        </span>}
                                    </span>

                                    {/*  <input type="checkbox" id="downloadble"  onChange={handleChange} />
                <label htmlFor="downloadble " style={{ marginLeft: '4px' }}>Downloadable</label> */}
                                    <div className="btn-sctn-addBk">
                                        <button type='submit' className='btn btn-primary btnSubmit clearfix'
                                            disabled={submitStatus == "submitting"}
                                            data-tooltip-id="tooltipsubmit">
                                            {submitStatus == "submitting" ? "Uploading..." : "Submit"}
                                            {submitStatus == "submitting" && (
                                                <div className="spinner-border text-light float-end " role="status">
                                                </div>
                                            )}

                                        </button>
                                    </div>
                                </>);
                            }
                        }
                    </Await>
                </Suspense>
            </form>

            <Tooltip id="tooltipsubmit" style={tooltipStyle} place="bottom"
                content="upload video" />
            <Tooltip id="tooltipvideoauthors" style={tooltipStyle} place="bottom"
                content="enter video author here, you can seperate by commas if more than one" />
            <Tooltip id="tooltipvideofile" style={tooltipStyle} place="bottom"
                content="select the video file to upload" />
            <Tooltip id="tooltipcoverImage" style={tooltipStyle} place="bottom"
                content="select cover image for the video" />
           <Tooltip id="tooltipBackButton" style={tooltipStyle} place="bottom"
            content="back to previous page" />
        </div>
        <div className="bottomNav">
            <button className="btn " onClick={moveToVideoListPage}>Video List</button>
        </div>

        <PromptModal show={promptModalShow} bodyText={promptMessage}
            onHide={() => setPromptModalShow(false)} headerText={promptHeader} mode={promptMode} />
    </div>


}

export default AddVideos;