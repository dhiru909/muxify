// This file contains the controller functions for user operations like creating a new user and logging in an existing user.

import { log } from "console";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";
import * as AWS from 'aws-sdk';
import fs from "node:fs";
import path from "node:path";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.S3_REGION;
const Bucket = process.env.S3_BUCKET;
 AWS.config.update({
  region: 'ap-south-1',
  accessKeyId: accessKeyId,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
 const s3 = new AWS.S3();
// This function is responsible for creating a new user in the database.
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  // Validate the request body and files

  const { email, name, password, role } = req.body;

  // Check if all the required fields are present in the request body
  // If any field is missing, return a 400 error response

  const files = req.files as { [fileName: string]: Express.Multer.File[] };

  // Upload the user's profile picture to the cloudinary bucket called 'dpImages'

  console.log(files.dp);

  try{
    const dpImageMimeType = files.dp.at(0)!.mimetype.split("/").at(-1);
    
  }catch(err){
    return next(createHttpError(400, "Upload a profile picture"));
  }
  const dpImageMimeType = files.dp.at(0)!.mimetype.split("/").at(-1);
  const fileName = files.dp[0].filename;
  const filePath = path.resolve(__dirname, "../../public/data/uploads", fileName);

  try {
    const user = await userModel.findOne({ email: email });
    console.log(user);
    
    // Check if a user with the same email already exists in the database
    // If a user with the same email exists, delete the uploaded file and return a 400 error response

    if (user) {
      const error = createHttpError(400, "User Already Exist with this email");
      await fs.promises.unlink(filePath);
      return next(error);
    }
  } catch (error) {
    await fs.promises.unlink(filePath);
    return next(createHttpError(500, "Error while getting user"));
  }

  try {
     
  const params = {
    Bucket: 'dhirajkhali',
    Key: fileName,
    Body: fs.createReadStream(filePath)
  }
  var uploadResult = await s3.upload(params).promise();
    
    console.log("uploadResult", uploadResult);

    // Hash the user's password using bcrypt

    let newUser: User;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Create a new user in the database

      const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword,
        // @ts-ignore
        dp: uploadResult?.Location,
        role,
      });

      // Generate a JWT token for the user

      const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
        expiresIn: "7d",
        algorithm: "HS256",
      });

      try {
        // Delete the uploaded file

        await fs.promises.unlink(filePath);
        // throw new  Error("Files not deleted successfully");
      } catch (err) {
        // Return the JWT token as the response
        res.cookie("userData", JSON.stringify({id:newUser._id, username: newUser.name, dp: newUser.dp,accessToken:token}),  { maxAge: 604800000, httpOnly: false ,sameSite:"lax"});
        res.status(201).json({ accessToken: token });
        return;
      }

      // Return the JWT token as the response

      res.cookie("userData", JSON.stringify({id:newUser._id, username: newUser.name, dp: newUser.dp, accessToken:token}), { maxAge: 604800000, httpOnly: false ,sameSite:"lax"});
        // res.cookie("userData",newUser.toString(),{maxAge:604800,path:'/'});
        // Set the access token cookie with the JWT token
        // The maxAge specifies the duration of the cookie in milliseconds
        // The sameSite attribute is set to "lax" to ensure the cookie is sent 
        // with both GET and POST requests initiated from the same origin.
        // The cookie is marked as HTTP only to prevent client-side JavaScript from accessing it.
        // The cookie is also marked as secure to ensure it is only sent over HTTPS.
        // res.cookie("accessToken", token, {
        //     maxAge: 604800000, // 7 days in milliseconds
        //     sameSite: "lax", // Allow the cookie to be sent with both GET and POST requests
        //     httpOnly: false, // Prevent client-side JavaScript from accessing the cookie
        //     // secure: true // Only send the cookie over HTTPS
        // });
        res.status(201).json({ id:newUser._id,username: newUser.name, dp: newUser.dp, accessToken:token});
    } catch (error) {
      return next(createHttpError(500, "Error while creating user"));
    }
  } catch (error) {
    console.log("error",error)
    return next(createHttpError(500, "Failed to upload image or PDF"));
  }
};

// This function is responsible for logging in an existing user.
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Check if all the required fields are present in the request body
  // If any field is missing, throw a 400 error response

  if (!email || !password) {
    throw createHttpError(400, "All field are required");
  }

  try {
    const user = await userModel.findOne({ email });

    // Check if a user with the same email exists in the database
    // If no user exists, throw a 404 error response

    if (!user) {
      return next(createHttpError(404, "User not found!"));
    }

    // Compare the provided password with the hashed password stored in the database
    // If the passwords match, generate a JWT token for the user
    // If the passwords do not match, throw a 400 error response

    const isMatch = await bcrypt.compare(password, user?.password!);
    if (!isMatch) {
      return next(createHttpError(400, "Password incorrect!!"));
    }

    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
      algorithm: "HS256",
    });

    // Return the JWT token as the response

    res.cookie("userData", JSON.stringify({ id:user._id,username: user.name, dp: user.dp, accessToken:token}), { maxAge: 604800000, httpOnly: false ,sameSite:"lax"});
        // res.cookie("userData",newUser.toString(),{maxAge:604800,path:'/'});
        // Set the access token cookie with the JWT token
        // The maxAge specifies the duration of the cookie in milliseconds
        // The sameSite attribute is set to "lax" to ensure the cookie is sent 
        // with both GET and POST requests initiated from the same origin.
        // The cookie is marked as HTTP only to prevent client-side JavaScript from accessing it.
        // The cookie is also marked as secure to ensure it is only sent over HTTPS.
        // res.cookie("accessToken", token, {
        //     maxAge: 604800000, // 7 days in milliseconds
        //     sameSite: "lax", // Allow the cookie to be sent with both GET and POST requests
        //     httpOnly: false, // Prevent client-side JavaScript from accessing the cookie
        //     // secure: true // Only send the cookie over HTTPS
        // });
      res.status(200).json({id:user._id, username: user.name, dp: user.dp, accessToken:token});
  } catch (error) {
    
    return next(createHttpError(500, "Error while getting user"));
  }

};

const getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userModel.findById(req.params.userId).select('-password');
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    res.status(200).json(user);
  } catch (error) {
    return next(createHttpError(500, "Error while finding user"));
  }
}

// Export the createUser and loginUser functions

export { createUser, loginUser, getUserDetails };

