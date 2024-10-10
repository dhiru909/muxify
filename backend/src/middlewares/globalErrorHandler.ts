import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";

/**
 * Error handler middleware for Express applications.
 *
 * @param {HttpError} err - The error object.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @return {Response} The JSON response containing the error message and stack trace (if in development mode).
 */
const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get the status code from the error object or default to 500
  const statusCode = err.statusCode || 500;

  // Return a JSON response with the error message and stack trace (if in development mode)
  return res.status(statusCode).json({
    message: err.message, // The error message
    errorStack: config.env === "development" ? err.stack : "", // The stack trace (if in development mode)
  });
};

export default globalErrorHandler;
