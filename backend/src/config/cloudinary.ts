/**
 * This module configures the Cloudinary SDK with the necessary credentials.
 * It then exports the Cloudinary instance.
 */

import { v2 as cloudinary } from "cloudinary"; // Importing the Cloudinary SDK.
import { config } from "./config"; // Importing the configuration settings.

/**
 * Configuring the Cloudinary SDK with the necessary credentials.
 * @see https://cloudinary.com/documentation/javascript_configuration#configuration_parameters
 */
cloudinary.config({
  cloud_name: config.cloudinaryName, // The Cloudinary cloud name.
  api_key: config.cloudinaryApiKey, // The Cloudinary API key.
  api_secret: config.cloudinaryApiSecret, // The Cloudinary API secret.
});

/**
 * Exporting the Cloudinary instance.
 * @type {import("cloudinary").Cloudinary}
 */
export default cloudinary;

