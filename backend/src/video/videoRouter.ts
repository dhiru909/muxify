import express from "express";
import { completeMultiPartUpload, generateMultiplePresignedUrls, generateSinglePresignedUrl, startMultiPartUpload } from "./videoController";
const videoRouter = express.Router()

videoRouter.post("/generate-single-presigned-url",generateSinglePresignedUrl)
videoRouter.post("/start-multipart-upload",startMultiPartUpload) 
videoRouter.post("/generate-multiple-presigned-url",generateMultiplePresignedUrls)
videoRouter.post("/complete-multipart-upload",completeMultiPartUpload)
export default videoRouter