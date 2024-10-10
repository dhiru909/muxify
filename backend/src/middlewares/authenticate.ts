import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { verify } from "jsonwebtoken";
import { config } from "../config/config";

/**
 * Interface for the authenticated request object that includes the user ID.
 */
export interface AuthRequest extends Request {
  userId: string;
}

/**
 * Middleware function to authenticate the user by checking the authorization token in the request header.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function in the middleware chain.
 */
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Extract the authorization token from the request header
  var ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
  console.log(ip)
  const token = req.header("Authorization");

  // If the token is missing, return a 401 Unauthorized error
  if (!token) {
    return next(createHttpError(401, "Authorization Token is required"));
  }

  try {
    // Extract the token from the authorization header
    const parsedToken = token.split(" ")[1]; // Authorization: Bearer <token>

    // If the token is invalid, return a 403 Forbidden error
    if (!parsedToken) {
      return next(createHttpError(403, "Invalid format of Authorization Token"));
    }

    // Verify the token using the JWT secret
    const decoded = verify(parsedToken, config.jwtSecret as string);

    // Attach the user ID to the request object
    const _req = req as AuthRequest;
    _req.userId = decoded.sub as string;

  } catch (error) {
    // If the token is expired, return a 401 Unauthorized error
    return next(createHttpError(401, "Token expired"));
  }

  // Call the next middleware function
  next();
};

export default authenticate;

