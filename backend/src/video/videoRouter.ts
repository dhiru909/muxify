import express from "express";
import { completeMultiPartUpload, generateMultiplePresignedUrls, generateSinglePresignedUrl, getTotalVideoCountOfUser, getVideos, startMultiPartUpload ,videoUploaded} from "./videoController";
const videoRouter = express.Router()

videoRouter.post("/generate-single-presigned-url",generateSinglePresignedUrl)
videoRouter.post("/start-multipart-upload",startMultiPartUpload) 
videoRouter.post("/generate-multiple-presigned-url",generateMultiplePresignedUrls)
videoRouter.post("/complete-multipart-upload",completeMultiPartUpload)
videoRouter.post("/video-uploaded",videoUploaded)
videoRouter.get("/fetch-videos",getVideos)
videoRouter.get("/get-total-count",getTotalVideoCountOfUser)
export default videoRouter