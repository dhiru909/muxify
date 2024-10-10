import { log } from "console";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import projectModel from "./projectModel";
import bcrypt from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { config } from "../config/config";
import { Project } from "./projectTypes";
import fs from "node:fs";

import { AuthRequest } from "../middlewares/authenticate";
import path from "node:path";
import cloudinary from "../config/cloudinary";


/**
 * Adds a new project to the database.
 *
 * @param {Request} req - The request object containing the project data and files.
 * @param {Response} res - The response object to send the result of the operation.
 * @param {NextFunction} next - The next middleware function to call if an error occurs.
 * @return {Promise<void>} - A promise that resolves when the operation is complete.
 */
const addProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Validate request body and files
  const {...data } = req.body;
  const files = req.files as { [fileName: string]: Express.Multer.File[] };

  try {
    // Upload project images to cloudinary
    let dpImagesLink: string[] = [];
    for(let i=0;i<files.img.length;i++){
      const dpImageMimeType = files.img[i].mimetype.split("/").at(-1);
      const fileName = files.img[i].filename;
      const filePath = path.resolve(__dirname, "../../public/data/uploads", fileName);
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        filename_override: fileName,
        folder: "projectImages",
        format: dpImageMimeType,
      });
      dpImagesLink.push(uploadResult.secure_url);

      console.log("uploadResult", uploadResult);

      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.log("error", err);
        return next(createHttpError(500, "Error while creating Project"));
      }
    }

    let newProject: Project;
    let location = {"type":"Point",
      "coordinates":[data.longitude,data.latitude]};
    try {
      // Create a new project in the database
      const _req = req as AuthRequest;
      console.log(data);
      
      newProject = await projectModel.create({
        title:data.title,
        location:JSON.parse(data.location),
        address:data.address,
        status:data.status,
        type:data.type,
        description:data.description,
        startedAt:data.startedAt,
        img:dpImagesLink,
        userId:_req.userId
      });
      
      // Send the created project as the response
      res.status(201).json({ "project":newProject });
    } catch (error) {
      return next(createHttpError(500, "Error while creating Project"));
    }
  } catch (error) {
    return next(createHttpError(500, "Failed to upload image or PDF"));
  }
};

/**
 * Retrieves projects based on the specified latitude and longitude within a
 * specified radius.
 *
 * @param {Request} req - The request object containing the latitude and longitude.
 * @param {Response} res - The response object to send the projects.
 * @param {NextFunction} next - The next middleware function.
 * @return {Promise<void>} - A promise that resolves when the projects are sent.
 */
const getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Extract latitude and longitude from the request body
  const { lat, long } = req.body;
  // Set the default radius to 25 kilometers
  const radiusInKm = 30;
  // Set the radius in radians
  const earthRadiusInKm = 6378.1;
  const radiusInRadians = radiusInKm / earthRadiusInKm;

  // Extract the page and limit from the query parameters
  let page = parseInt(req.query.p as string) || 1;
  let limit = parseInt(req.query.l as string) || 20;

  // Calculate the total number of pages and projects
  const projectsCount = await projectModel.countDocuments();
  const pagesCount = Math.ceil(projectsCount / limit);

  // Ensure the page is within the valid range
  if (page < 1) {
    page = 1;
  } else {
    page = Math.min(page, pagesCount);
    if(page==0){
      page = 1;
    }
  }

  try {
    // Calculate the skip value for pagination
    const skip = (page - 1) * limit;

    // Retrieve the projects within the specified radius and paginate them
    const projects = await projectModel
      .find({
        location: {
          $geoWithin: {
            $centerSphere: [[long, lat], radiusInRadians]
          }
        }
      })
      .populate("userId","name dp") // Populate the userId field with the name and dp of the user
      .skip(skip)
      .limit(limit)
      .sort([["createdAt", "desc"]]) // Sort the projects by their creation date in descending order
      .exec();

    // Set the X-Pagination header in the response
    res.set(
      "X-Pagination",
      JSON.stringify({ totalPages: pagesCount, currentPage: page })
    );

    // Send the projects as the response
    res.status(200).json(projects);

  } catch (error) {
    // Handle any errors and pass them to the next middleware function
    return next(createHttpError(500, "Error while finding Project" + error?.toString()));
  }
};

/**
 * Retrieves a single project from the database based on the specified project ID.
 *
 * @param {Request} req - The request object containing the project ID.
 * @param {Response} res - The response object to send the project data.
 * @param {NextFunction} next - The next middleware function to call if an error occurs.
 * @return {Promise<void>} - A promise that resolves when the operation is complete.
 */
const getSingleProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  
  if(req.params.projId=="ownProjects"){
    getOwnProjects(req,res,next)
  }else{

  
  try {
    // Find the project in the database by its ID and populate the userId field with the name and dp of the user
    const project = await projectModel.findById(req.params.projId).populate("userId","name dp");
    
    // Send the project data as the response
    res.status(200).json(project);
    
  } catch (error) {
    // Handle any errors and pass them to the next middleware function
    return next(createHttpError(500, "Error while finding Project"));
  }
  }
}

/**
 * Deletes a project from the database based on the specified project ID.
 *
 * @param {Request} req - The request object containing the project ID.
 * @param {Response} res - The response object to send the delete result.
 * @param {NextFunction} next - The next middleware function to call if an error occurs.
 * @return {Promise<void>} - A promise that resolves when the operation is complete.
 */
const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Delete the project from the database based on its ID
    const deleteResult = await projectModel.deleteOne({_id:req.params.projId});
console.log(deleteResult);

    // Send the delete result as the response
    res.status(200).json(deleteResult);
    console.log("success");
    

  } catch (error) {
    // Handle any errors and pass them to the next middleware function
    return next(createHttpError(500, "Error while finding Project"+ error?.toString()));
  }
}


/**
 * Updates a project in the database based on the specified project ID.
 * Uploads project images to cloudinary and updates the project with the new images.
 *
 * @param {Request} req - The request object containing the project data and files.
 * @param {Response} res - The response object to send the updated project data.
 * @param {NextFunction} next - The next middleware function to call if an error occurs.
 * @return {Promise<void>} - A promise that resolves when the operation is complete.
 */
const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  // Validate request body and files
  const {...data } = req.body;
  const files = req.files as { [fileName: string]: Express.Multer.File[] };
console.log(files);

  try {
    // Upload project images to cloudinary
    let dpImagesLink = [];
    
    if(files.img){
      for(let i=0;i<files.img.length;i++){

      // Get the mime type and file name of the image
      const dpImageMimeType = files.img[i].mimetype.split("/").at(-1);
      const fileName = files.img[i].filename;

      // Resolve the file path
      const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        fileName
      );

      // Upload the image to cloudinary
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        filename_override: fileName,
        folder: "projectImages",
        format: dpImageMimeType,
      });

      // Add the secure URL of the uploaded image to the array
      dpImagesLink.push(uploadResult.secure_url);

      console.log("uploadResult", uploadResult);

      try {
        // Delete the local image file
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.log("error", err);
        return next(createHttpError(500, "Error while creating Project"));
      }
    }
  }

    let newProject: Project;
    
    try {
      // Update the project in the database with the new data and images
      const _req = req as AuthRequest;
      newProject = await projectModel.updateOne({_id:req.params.projId},{
        ...data,
        $push:{
          img:{
            $each:dpImagesLink
          }
        }
      })
    
      // Send the updated project data as the response
      res.status(203).json({ "project":newProject });
    } catch (error) {
      return next(createHttpError(500, "Error while creating Project"));
    }
  } catch (error) {
    // Handle errors related to image upload and send an error response
    return next(createHttpError(500, "Failed to upload image or PDF"));
  }
};

/**
 * Retrieves the projects owned by the authenticated user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @return {Promise<void>} A promise that resolves when the operation is complete.
 */
const getOwnProjects = async (req: Request, res: Response, next: NextFunction) => {
  // Extract the user ID from the authenticated request
  // const _req = req as AuthRequest;
  const userId = req.params.userId
// var ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
  // console.log(ip)

  try {
    // Find the projects owned by the user in the database
    const projects = await projectModel.find({userId:userId});

    // Send the projects data as the response
    // console.log(projects);
    
    res.status(200).json(projects);
  } catch (error) {
    // Handle any errors and pass them to the next middleware function
    return next(createHttpError(500, "Error while finding Project"));
  }
};


export { addProject, getProjects,getSingleProject,deleteProject ,updateProject,getOwnProjects};

