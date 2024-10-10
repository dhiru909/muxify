import express from "express";
import authenticate from "../middlewares/authenticate";
import {addProject,getProjects,getSingleProject,deleteProject, updateProject, getOwnProjects} from "./projectController"

// Import multer to handle file uploads
import multer from "multer";

// Import path module to resolve file paths
import path from "node:path";

// Define storage options for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set the destination for uploaded files to the public/data/uploads directory
        cb(null, path.resolve(__dirname, "../../public/data/uploads"));
    },
    filename: function (req, file, cb) {
        // Generate a unique filename for the uploaded file
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.originalname.replace(/\.[^/.]+$/, "") + // Remove the extension from the filename
            "-" +
            uniqueSuffix + // Add a unique suffix to the filename
            "." +
            file.mimetype.split("/").at(-1) // Add the original extension to the filename
        );
    },
});

// Define the supported file types for uploads
const supportedFileTypes = ["jpg", "jpeg", "png", "bmp", "webp"];

// Define multer options for file uploads
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10mb
    },
    fileFilter: (req, file, cb) => {
        // Check if the uploaded file is of a supported type
        if (supportedFileTypes.includes(file.mimetype.split("/").at(-1)!)) {
            cb(null, true);
        } else {
            // Return an error if the file type is not supported
            cb(new Error('Invalid file type'));
        }
    },
});

// Define the project router
const projRouter = express.Router();

// Define the routes for the project router
// TODO fix this to get
projRouter.post("/", getProjects); // Get all projects
projRouter.get("/:projId", getSingleProject); // Get a single project by ID
projRouter.get("/own-projects/:userId",getOwnProjects);
projRouter.post("/add-project", authenticate, upload.fields([ // Add a new project
    { name: "img", maxCount: 10 }, // Upload up to 10 images for the project
]), addProject);
projRouter.patch("/:projId", authenticate, upload.fields([ // Update an existing project
    { name: "img", maxCount: 10 }, // Upload up to 10 images for the project
]), updateProject);
projRouter.delete("/:projId", authenticate, deleteProject); // Delete a project by ID

// Export the project router
export default projRouter;

