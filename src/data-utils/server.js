import api from '../api/axiosConfig';
import { uploadApi } from '../api/axiosConfig';


export const addToCatalogue = async ({ title, parentTitle, description }) => {
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };

    const formSubmitData = {};
    formSubmitData.title = title;
    if (parentTitle != "--Select--")
        formSubmitData.parentTitle = parentTitle;

    try {
        const response = await api.post("admin/catalogue",
            formSubmitData, authHeader);
        return response;
    }
    catch (err) {
        throw err;
    }
}
export const deleteCatalogueItem = async (catalogueId) => {

    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };
    try {
        const deleteResponse = await api.delete(`admin/catalogue/${catalogueId}`,
            authHeader);
        return deleteResponse;
    }
    catch (err) {
        throw err;
    }

}
export const deleteBook=async(bookId)=>{
       
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };
    try {
       
        const response = await uploadApi.delete(`admin/books/${bookId}`, authHeader);
        
        return response;
    }
    catch (err) {
        throw err;
     }
}
export const deleteVideo=async(videoId)=>{
       
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };
    try {
        const response = await uploadApi.delete(`admin/videos/${videoId}`, authHeader);
       
        return response;
    }
    catch (err) {
        throw err;
     }
}
export const createToken = async (token, expiryDate) => {
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };
    
    const tokenSubmitData = { token: token, expiresAt: expiryDate, createdAt:Date.now()}

    try {
        const response = await api.post("admin/token",
            tokenSubmitData, authHeader);

        return response;
    }
    catch (err) {
        throw err;
    }
}
export const deleteToken = async (token_Id) => {
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };
    try {
        const response = await api.delete(`admin/token/${token_Id}`, authHeader);
        return response;
    }
    catch (err) {
        throw err;
    }
}

export const editCatalogueEntry = async (catalogueId, { title, parentTitle }) => {
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };
    const formSubmitData = {};
    formSubmitData.title = title;
    if (parentTitle != "--Select--")
        formSubmitData.parentTitle = parentTitle;
    try {
        const deleteResponse = await api.patch(`admin/catalogue/${catalogueId}`,
            formSubmitData, authHeader);
        return deleteResponse;
    }
    catch (err) {
        throw err;
    }

}
export const AddToBooks = async ({ catalogueRef, title, author, docType, bookCover, bookFile,
    edition, yearOfPublication, isbn, bookDescription, downloadable }) => {

    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };
   
    const bookData = {};
    bookData.catalogueRef = catalogueRef; bookData.title = title;
    bookData.author = author; bookData.docType = docType; bookData.edition = edition;
    bookData.isbn = isbn; bookData.yearOfPublication = yearOfPublication;
    bookData.bookDescription = bookDescription;
    bookData.fileName = bookFile;
    bookData.coverImageName = bookCover.key;

    
    try {
        const booksAddresponse = await uploadApi.post('admin/books/add', bookData, authHeader);
        
        return booksAddresponse;
    }
    catch (err) {
        console.log(err);
        throw err;
    }

}
export const AddToVideos = async ({ catalogueRef, title, creators_origin, thumbNailName,
    fileName, format, downloadable, videoDescription }) => {

    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };

    const videoData = {};

    videoData.catalogueRef = catalogueRef;
    videoData.title = title;
    videoData.creators_origin = creators_origin;
    videoData.thumbNailName = thumbNailName;
    videoData.fileName = fileName;
    videoData.format = format;
    videoData.videoDescription = videoDescription;
    videoData.downloadable = downloadable;

    try {
       

        const videoAddresponse = await uploadApi.post('admin/videos/add', videoData, authHeader);
        
        return videoAddresponse;
    }
    catch (err) {
        console.log(err);
        throw err;
    }

}
export const uploadCoverImageToS3 = async (bookCover, progressBarObject) => {
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    let authHeader = {
        headers: { "Authorization": `Bearer ${loggedInCred.token}` }
    };
    try {

        const formData = new FormData();
        formData.append('bookCover', bookCover);
        const bookUploadResponse = await uploadApi.post('admin/books/temp/bookcover', formData, authHeader);

        return bookUploadResponse;
    } catch (error) {
        console.log(error);
        throw error;
    }

}
export const uploadVideoThumbsToS3 = async (videoThumbs) => {
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    let authHeader = {
        headers: { "Authorization": `Bearer ${loggedInCred.token}` }
    };
    try {
        let videoUploadResponse;
        if (videoThumbs) {
            const formData = new FormData();
            formData.append('videoThumbs', videoThumbs);
            videoUploadResponse = await uploadApi.post('admin/videos/thumbNail', formData, authHeader);
        } else
            videoUploadResponse = { status: 400, message: "invalid video thumbs file" }
        return videoUploadResponse;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export const uploadSmallSizeBookFile= async(bookFile)=>{
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    let authHeader = {
        headers: { "Authorization": `Bearer ${loggedInCred.token}` }
    };
    try {

        const formData = new FormData();
        formData.append('bookFile', bookFile);
       
        const bookUploadResponse = await uploadApi.post('admin/books/temp', formData, authHeader);

        return bookUploadResponse;
    } catch (error) {
        console.log(error);
        throw error;
    }


}
export const uploadBookSmallFileSize = async (uploadData, progressBarObject) => {


    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    let authHeader = {
        headers: { "Authorization": `Bearer ${loggedInCred.token}` }
    };
    try {
        const formData = new FormData();

        formData.append('catalogueRef', uploadData.catalogueRef);
        formData.append('title', uploadData.title);
        formData.append('author', uploadData.author);
        formData.append('docType', uploadData.docType);
        formData.append('bookCover', uploadData.bookCover);
        formData.append('bookFile', uploadData.bookFile);
        formData.append('edition', uploadData.edition);
        formData.append('yearOfPublication', uploadData.yearOfPublication);
        formData.append('isbn', uploadData.isbn);
        formData.append('bookDescription', uploadData.bookDescription);


        const bookUploadResponse = await uploadApi.post('admin/books', formData, authHeader);

        return bookUploadResponse;
    } catch (error) {
        console.log(error);
        throw error;
    }


}
export const uploadVideoSmallFileSize = async (uploadData, progressBarObject) => {


    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    let authHeader = {
        headers: { "Authorization": `Bearer ${loggedInCred.token}` }
    };
    try {
        const formData = new FormData();

        formData.append('catalogueRef', uploadData.catalogueRef);
        formData.append('title', uploadData.title);
        formData.append('creators_origin', uploadData.creators_origin);
        formData.append('format', uploadData.format);
        formData.append('videoFile', uploadData.videoFile);
       // formData.append('videoThumbs', uploadData.videoThumbs);
        formData.append('videoDescription', uploadData.videoDescription);

        const videoUploadResponse = await uploadApi.post('admin/videos', formData, authHeader);

        return videoUploadResponse;
    } catch (error) {
        console.log(error);
        throw error;
    }


}
export const uploadBookToS3 = async (uploadFile, progressBarUpdate) => {

    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    let authHeader = {
        headers: { "Authorization": `Bearer ${loggedInCred.token}` }
    };

    try {
        //initiate multipart upload     
        const response = await uploadApi.post("admin/books/fastupload/start/", { filetype: "book",tempUpload:true }, authHeader);

        const { data: { fileName: fileName, uploadId: uploadId } } = response.data;

        const CHUNK_SIZE = 8 * 1024 * 1024;
        const fileSize = uploadFile.size;
      
        const numberOfChunks = Math.ceil(fileSize / CHUNK_SIZE);        

        const uploadPromises = [];
        let uploadedChunks = 0;
        let start = 0, end;
        authHeader = {
            headers: {
                "Authorization": `Bearer ${loggedInCred.token}`,
            }
        };

        for (let i = 0; i < numberOfChunks; i++) {

            end = start + CHUNK_SIZE;
            const filechunk = uploadFile.slice(start, end);
            const formData = new FormData();
            formData.append('index', i);
            formData.append('totalChunks', numberOfChunks);
            formData.append('bookFile', filechunk);
            formData.append("fileName", fileName);
            formData.append('uploadId', uploadId);
            

            const uploadPromise = uploadApi.post("admin/books/fastupload/push", formData, 
                authHeader).then(()=>{
                uploadedChunks++;
                const progress = Math.floor((uploadedChunks / numberOfChunks) * 100);
                progressBarUpdate(progress);
              });

            uploadPromises.push(uploadPromise);
            start = end;
        }
        await Promise.all(uploadPromises);

        // Complete multipart upload
        const uploadCompleteResp = await uploadApi.post('admin/books/fastupload/end',
            { "fileName": fileName, "uploadId": uploadId, "filetype": "book" }, authHeader);


        if (!uploadCompleteResp) {
            throw new Error('Error completing upload');
        }
        const { data: { fileData: { Key: filename } } } = uploadCompleteResp;

        if (uploadCompleteResp.status == 201)
            return { message: "successful", status: 201, filename: filename };

        return { message: "unsuccessful", filename: null };

    } catch (error) {

        console.log(error);
        alert('Error uploading file');
        throw error;
    }

}

export const uploadVideoToS3 = async (uploadFile, proggresBarObject) => {

    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    let authHeader = {
        headers: { "Authorization": `Bearer ${loggedInCred.token}` }
    };

    try {
        //initiate multipart upload     
        const response = await uploadApi.post("admin/videos/fastupload/start/", { filetype: "video" }, authHeader);

        const { data: { fileName: fileName, uploadId: uploadId } } = response.data;

        const CHUNK_SIZE = 8 * 1024 * 1024;
        const fileSize = uploadFile.size;
        const numberOfChunks = Math.ceil(fileSize / CHUNK_SIZE);


        const uploadPromises = [];
        let uploadedChunks = 0;
        let start = 0, end;
        authHeader = {
            headers: {
                "Authorization": `Bearer ${loggedInCred.token}`,
            }
        };

        for (let i = 0; i < numberOfChunks; i++) {

            end = start + CHUNK_SIZE;
            const filechunk = uploadFile.slice(start, end);
            const formData = new FormData();
            formData.append('index', i);
            formData.append('totalChunks', numberOfChunks);
            formData.append('videoFile', filechunk);
            formData.append("fileName", fileName);
            formData.append('uploadId', uploadId);

            const uploadPromise = uploadApi.post("admin/videos/fastupload/push", formData, authHeader)
            uploadPromises.push(uploadPromise);
            start = end;
        }
        await Promise.all(uploadPromises);

        // Complete multipart upload
        const uploadCompleteResp = await uploadApi.post('admin/videos/fastupload/end',
            { "fileName": fileName, "uploadId": uploadId, "filetype": "video" }, authHeader);

        if (!uploadCompleteResp) {
            throw new Error('Error completing upload');
        }
        const { data: { fileData: { Key: filename } } } = uploadCompleteResp;

        if (uploadCompleteResp.status == 201)
            return { message: "successful", status: 201, filename: filename };

        return { message: "unsuccessful", filename: null };

    } catch (error) {

        console.log(error);
        alert('Error uploading file');
        throw error;
    }

}
export const approveStudentAccount=async(recordId)=>{
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };
    const formData={approved:true}
    try {
        const approveResponse= await api.patch(`/admin/student/${recordId}`,formData,authHeader);
        return approveResponse;
    } catch (error) {
        throw error;
    }
}
export const deleteStudentAccount=async(student_id)=>{
    const loggedInCred = JSON.parse(localStorage.getItem("credentials"));
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loggedInCred.token}`
        }
    };
    try {
        const response = await api.delete(`admin/student/${student_id}`, authHeader);
        
        return response;
    }
    catch (err) {
        throw err;
     }
}