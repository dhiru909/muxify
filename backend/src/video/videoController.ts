
import { NextFunction, Request, Response } from "express";
import * as AWS from 'aws-sdk';

import { config } from "../config/config";
const accessKeyId = config.awsS3.accessKeyId;
const secretAccessKey = config.awsS3.secretAccessKey;
const region = config.awsS3.region;
const Bucket = config.awsS3.bucket;

const s3 = new AWS.S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region,
  signatureVersion: "v4",
});
/**
 * Generates a single presigned URL for uploading a video to S3.
 * The client should include the filename in the request body.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function in the middleware chain.
 */
const generateSinglePresignedUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileName = req.body.fileName;
    const fileType = req.body.fileType;
    /**
     * The parameters for the getSignedUrl call to generate the presigned URL.
     * The Bucket is set to the value of the Bucket property in the config object.
     * The Key is set to the filename passed in the request body.
     * The Expires property is set to 60 seconds, which is the time the presigned
     * URL is valid for.
     * The ACL property is set to "bucket-owner-full-control", which means that
     * the owner of the bucket has full control over the object.
     */
    const params = {
      Bucket: Bucket,
      Key: "videos/"+fileName,

      Expires: 600, // Expires in 60 seconds
      ACL: "bucket-owner-full-control",
      ContentType:fileType
    };

    /**
     * The getSignedUrlPromise method is called to generate the presigned URL.
     * The method takes two arguments, the first is the method to call on the
     * S3 client, in this case "putObject", and the second is the parameters
     * object that was created above.
     * The method returns a promise that resolves to the presigned URL.
     */
    let url = await s3.getSignedUrlPromise("putObject", params);

    /**
     * The presigned URL is returned in the response with a status code of 200.
     */
    return res.status(200).json({ url });
  } catch (err) {
    console.log(err);
    /**
     * If there is an error generating the presigned URL, an error response is
     * returned with a status code of 500 and a message indicating that there was
     * an error generating the presigned URL.
     */
    return res.status(500).json({ error: "Error generating presigned URL" });
  }
}

/**
 * Starts a multipart upload of a video to S3. The client should include the
 * filename and content type in the request body.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function in the middleware chain.
 */

const startMultiPartUpload =async (req: Request, res: Response, next: NextFunction) => {
let fileName = "videos/"+req.body.fileName;
  let contentType = req.body.contentType;
console.log(req.body);

  const params = {
    Bucket: config.awsS3.bucket!,
    Key: fileName,
    ContentDisposition : "inline",
    ContentType :contentType
  };

  // add extra params if content type is video
  if (contentType == "VIDEO") {
    
  }

  try {
    const multipart = await s3.createMultipartUpload(params).promise();
    res.json({ uploadId: multipart.UploadId });
  } catch (error) {
    console.error("Error starting multipart upload:", error);
    return res.status(500).json({ error: "Error starting multipart upload" });
  }

}

/**
 * Generates pre-signed URLs for all parts of a multipart upload
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @param {NextFunction} next - Next function
 */

/**
 * Generates pre-signed URLs for all parts of a multipart upload
 * This function takes a JSON payload from the client with the following properties:
 * - fileName: the name of the file to be uploaded
 * - uploadId: the ID of the multipart upload
 * - partNumbers: an array of numbers representing the parts to be uploaded
 *
 * The function will return a JSON payload with a property called "presignedUrls" which is an array of
 * pre-signed URLs for each part of the upload.
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @param {NextFunction} next - Next function
 */
const generateMultiplePresignedUrls = async (req: Request, res: Response, next: NextFunction) => {
  // Extract the file name, upload ID, and part numbers from the request body
  const { fileName, uploadId, partNumbers } = req.body;
  console.log(req.body);

  // Create an array of numbers from 1 to the number of parts specified in the request body
  const totalParts = Array.from({ length: partNumbers }, (_, i) => i + 1);

  try {
    // Use Promise.all to generate pre-signed URLs for each part of the upload
    const presignedUrls = await Promise.all(
      totalParts.map(async (partNumber) => {
        // Create a parameter object for the getSignedUrl call
        const params = {
          Bucket: config.awsS3.bucket,
          Key: "videos/"+fileName,
          PartNumber: partNumber,
          UploadId: uploadId,
          Expires: 3600 * 48, // expires in 30 hours
        };

        // Call getSignedUrl with the parameter object to generate a pre-signed URL for this part
        return s3.getSignedUrl("uploadPart", {
          ...params,
        });
      })
    );

    // Return the array of pre-signed URLs in the response
    res.json({ presignedUrls });
  } catch (error) {
    // Catch any errors that occur during the generation of the pre-signed URLs
    console.error("Error generating pre-signed URLs:", error);
    // Return a 500 error with a JSON payload containing an error message
    return res.status(500).json({ error: "Error generating pre-signed URLs" });
  }
};


const completeMultiPartUpload = async(req:Request,res:Response,next:NextFunction)=>{
  // Req body
  let fileName = "videos/"+req.body.fileName!;
  let uploadId = req.body.uploadId!;
  let parts = req.body.parts!;

  const params = {
    Bucket: config.awsS3.bucket,
    Key: fileName,
    UploadId: uploadId,

    MultipartUpload: {
      Parts: parts.map((part:any, index:any) => ({
        ETag: part.etag,
        PartNumber: index + 1,
      })),
    },
  };
  try {
    // @ts-ignore
    const data = await s3.completeMultipartUpload(params).promise();
    res.status(200).json({ fileData: data });
  } catch (error) {
    console.error("Error completing multipart upload:", error);
    return res.status(500).json({ error: "Error completing multipart upload" });
  }

}

export {generateSinglePresignedUrl, startMultiPartUpload, generateMultiplePresignedUrls, completeMultiPartUpload}