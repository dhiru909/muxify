import apiRequest from "@/lib/apiRequest"

const fetchProjects = async(queryKey:any)=>{
    
    try {
        // var formData = new FormData();
        // formData.append('lat', queryKey.lat);
        // formData.append('long', queryKey.long);
        
//         let data = JSON.stringify({
//   "lat": queryKey.lat,
//   "long": queryKey.long
// });
console.log({lat:queryKey.lat,long:queryKey.long});

    const response = await apiRequest.post('/projects',{lat:queryKey.lat,long:queryKey.long},{
        // data:formData,
        method:'get',
        maxBodyLength:Infinity,
        headers:{
            // "Authorization": "Bearer "+ queryKey.userInfo.accessToken,
            "Content-Type": "application/json"
        },
        
    })
    return response.data
    } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

const fetchSingleProject = async (id:string) => {
    try {
        const response = await apiRequest.get(`/projects/${id}`,{
            method:'get',
            headers:{
                "Content-Type": "application/json"
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching single project:', error);
        throw error;
    }
}
const fetchProjectsOfUSer = async (id:string) => {
    try {
        const response = await apiRequest.get(`/projects/own-projects/${id}`,{
            method:'get',
            headers:{
                "Content-Type": "application/json"
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching single project:', error);
        throw error;
    }
}

const deleteProject = async (queryKey:any)=>{
    try {
        const response = await apiRequest.delete(`/projects/${queryKey.id}`,{
            method:'delete',
            headers:{
                 "Authorization": "Bearer "+ queryKey.userInfo.accessToken,
                "Content-Type": "application/json"
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching single project:', error);
        throw error;
    }
}
const updateProject = async (queryKey:any)=>{
    try {
        
        const response = await apiRequest.patch(`/projects/${queryKey.id}`,queryKey.formData,{            
            method:'patch',
            
            headers:{
                 "Authorization": "Bearer "+ queryKey.userInfo.accessToken,
                 
                
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching single project:', error);
        throw error;
    }
}
const uploadProject = async (queryKey:any)=>{
    try {
        
        const response = await apiRequest.post(`/projects/add-project`,queryKey.formData,{            
            method:'post',
            headers:{
                 "Authorization": "Bearer "+ queryKey.userInfo.accessToken,
                 
                
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching single project:', error);
        throw error;
    }
}
const getUserDetails = async(id:string)=>{
    try {
        const response = await apiRequest.get(`/users/${id}`,{
            method:'get',
            headers:{
                 
                "Content-Type": "application/json"
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching single project:', error);
        throw error;
    }
}



export   {fetchProjects,fetchSingleProject,deleteProject,getUserDetails,fetchProjectsOfUSer,updateProject,uploadProject}