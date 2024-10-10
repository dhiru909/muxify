/**
 * This module exports the configuration settings for the application.
 * The configuration settings are sourced from the .env file.
 * The configuration settings are frozen to prevent accidental modification.
 */

import { config as conf } from "dotenv";

// import { config } from "../config/config";


const sanitizeRedisUrl = (url:string )=> url?.replace(/^(redis\:\/\/)/, '');
// Load environment variables from .env file
conf();

/**
 * The configuration settings for the application.
 */
const _config = {
  /**
   * The port number on which the application will listen.
   */
  port: process.env.PORT,

  /**
   * The MongoDB connection string.
   */
  databaseUrl: process.env.MONGO_CONNECTION_STRING,

  /**
   * The environment in which the application is running.
   */
  env: process.env.NODE_ENV,

  /**
   * The secret key used for signing JSON Web Tokens.
   */
  jwtSecret: process.env.JWT_SECRET,

  /**
   * The Cloudinary cloud name.
   */
  cloudinaryName: process.env.CLOUDINARY_NAME || 'dummy',

  /**
   * The Cloudinary API key.
   */
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || 'dummy',

  /**
   * The Cloudinary API secret.
   */
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || 'dummy',

  /**
   * The frontend domain.
   */
  frontendDomain: process.env.FRONTEND_DOMAIN,


  redis: {
        endpointUri: process.env.REDIS_ENDPOINT_URI
            ? sanitizeRedisUrl(process.env.REDIS_ENDPOINT_URI)
            : `${sanitizeRedisUrl(process.env.REDIS_HOST!)}:${process.env.REDIS_PORT}`,
        password: process.env.REDIS_PASSWORD || undefined,
        port :process.env.REDIS_PORT as unknown as number
    },
    
};

/**
 * The frozen configuration settings for the application.
 * @type {Readonly<{port: string, databaseUrl: string, env: string, jwtSecret: string, cloudinaryName: string, cloudinaryApiKey: string, cloudinaryApiSecret: string, frontendDomain: string}>}
 */
export const config = Object.freeze(_config);
