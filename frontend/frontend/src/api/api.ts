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
        console.error('Error fetching presigned url:', error);
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
        console.error('Error starting upload:', error);
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
        console.error('Error fetching presigned url:', error);
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
        console.error('Error completing upload:', error);
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
        console.error('Error uploading video:', error);
        throw error;
    }
}
const getTotalVideoCount = async (queryKey: { accessToken: string }) => {
    console.log(queryKey)
    try {
        const response = await apiRequest.get(`/videos/get-total-count`,
        
          
          {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + queryKey.accessToken
            }
            
          }
        );

        return response.data.total;
    } catch (error) {
        console.error('Error fetching total video count:', error);
        throw error;
    }
}
const getVideos = async (queryKey:{data:any,accessToken:string}) => {
    try {
        
        const response = await apiRequest.get(`/videos/fetch-videos`,
          {
            headers:{
                "Content-Type": "application/json",
                "Authorization":"Bearer "+queryKey.accessToken
            },params:{
                page:queryKey.data.page,
                limit:queryKey.data.limit
            },
          }
        );
        
        return response.data
    } catch (error) {
        console.error('Error fetching videos:', error);
        throw error;
    }
}



export   {getSinglePresignedUrl, startMultiPartUpload, getMultiplePresignedUrls ,completeMultiPartUpload, videoUploaded,getTotalVideoCount,getVideos}