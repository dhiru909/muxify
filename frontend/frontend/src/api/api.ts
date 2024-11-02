import apiRequest from "@/lib/apiRequest"
type QueryKey={
    fileName:string;
    accessToken:string;
    fileType:string;
}

const getSinglePresignedUrl = async (queryKey:QueryKey) => {
    try {
        
        const response = await apiRequest.post(`/videos/generate-single-presigned-url`,{
            fileName:queryKey.fileName,
            fileType:queryKey.fileType
        },{
            method:'post',
            headers:{
                "Content-Type": "application/json",
                "Authorization":"Bearer "+queryKey.accessToken
            },
        })
        console.log(response.data);
        
        return response.data
    } catch (error) {
        console.error('Error fetching single project:', error);
        throw error;
    }
}

const startMultiPartUpload = async (fileName:string,contentType:string,accessToken:string) => {
    try {
        
        const response = await apiRequest.post(`/videos/start-multipart-upload`,{
            fileName:fileName,
            contentType:contentType
        },{
            method:'get',
            headers:{
                "Content-Type": "application/json",
                "Authorization":"Bearer "+accessToken
            },
        })
        console.log(response.data);
        
        return response.data
    } catch (error) {
        console.error('Error fetching single project:', error);
        throw error;
    }
}

const getMultiplePresignedUrls = async (fileName:string,uploadId:string,partNumbers:Number,accessToken:string) => {
    try {
        
        const response = await apiRequest.post(`/videos/generate-multiple-presigned-url`,{
            fileName:fileName,
            uploadId:uploadId,
            partNumbers:partNumbers
        },{
            method:'post',
            headers:{
                "Content-Type": "application/json",
                "Authorization":"Bearer "+accessToken
            },
        })
        
        return response.data
    } catch (error) {
        console.error('Error fetching single project:', error);
        throw error;
    }
}
const completeMultiPartUpload = async (fileName:string,uploadId:string,parts:[],accessToken:string) => {
    try {
        
        const response = await apiRequest.post(`/videos/complete-multipart-upload`,
          {
            fileName: fileName,
            uploadId: uploadId,
            parts: parts,
          },
          {
            method:"post",
            headers:{
                "Content-Type": "application/json",
                "Authorization":"Bearer "+accessToken
            }
          }
        );
        
        return response.data
    } catch (error) {
        console.error('Error fetching single project:', error);
        throw error;
    }
}
const videoUploaded = async (queryKey:{data:any,accessToken:string}) => {
    try {
        
        const response = await apiRequest.post(`/videos/video-uploaded`,
          queryKey.data,
          {
            method:"post",
            headers:{
                "Content-Type": "application/json",
                "Authorization":"Bearer "+queryKey.accessToken
            }
          }
        );
        
        return response.data
    } catch (error) {
        console.error('Error fetching single project:', error);
        throw error;
    }
}



export   {getSinglePresignedUrl, startMultiPartUpload, getMultiplePresignedUrls ,completeMultiPartUpload, videoUploaded}