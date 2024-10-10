// This is the main file that sets up the Express application. It sets up routing for API endpoints,
// middleware for handling JSON data, and middleware for handling CORS (Cross-Origin Resource Sharing).

import express, { NextFunction, Request, Response } from "express"; // Importing the Express framework and some types from it.
import createHttpError, { HttpError } from "http-errors"; // Importing the http-errors module for creating HTTP errors.
import { config } from "./config/config"; // Importing the configuration settings for the application.
import globalErrorHandler from "./middlewares/globalErrorHandler"; // Importing the error handler middleware.
import userRouter from "./user/userRouter"; // Importing the router for user endpoints.
import projRouter from "./project/projectRouter"; // Importing the router for project endpoints.
import cors from "cors"; // Importing the CORS middleware.
import cookieParser from 'cookie-parser';
import rateLimiter from "./middlewares/rateLimiter";
import cluster from "cluster";
const app = express(); // Creating a new Express application.
app.enable('trust proxy');
// app.use(rateLimiter)
// Middleware to parse incoming JSON requests.
app.use(express.json());
// Whitelist of allowed domains for CORS.
var whitelist = ['http://localhost:5173','http://localhost:5174','http://localhost:4173','https://449c-2409-40e4-1015-8cf9-c40c-1f91-9702-7797.ngrok-free.app' /** other domains if any */ ];

// Options for the CORS middleware.
var corsOptions = {
  "Access-Control-Allow-Origin": "*",

  credentials: true, // Allow passing of credentials (cookies, authorization headers, etc.) in cross-origin requests.
  origin: function(origin:any, callback:any) { // Function to determine if a given origin is allowed.
    if (whitelist.indexOf(origin) !== -1) { // If the origin is in the whitelist, allow the request.
      callback(null, true);
    } else { // If the origin is not in the whitelist, deny the request.
      callback(new Error('Not allowed by CORS'));
    }
  }
}

// Adding the CORS middleware to the application.
app.use(cors(corsOptions));
app.use(cookieParser());

// Route handler for the root URL ("/").
app.get("/", (req, res, next) => {
  // Sending a JSON response with a welcome message.
  res.json({ message: "welcome" });
});

// Mounting the user router at the "/api/users" path.
app.use("/api/users",userRouter);

// Mounting the project router at the "/api/projects" path.
app.use("/api/projects", projRouter);

// Adding the global error handler middleware to the application.
app.use(globalErrorHandler);

// Exporting the Express application.
export default app;

