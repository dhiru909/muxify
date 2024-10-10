// Import necessary modules
const mongoose = require('mongoose');

// Import the Project type from the projectTypes module
import { Project } from "./projectTypes";

// Define the Project schema
/**
 * Represents a project in the database.
 * @typedef {Object} Project
 * @property {string} title - The title of the project.
 * @property {string[]} img - The list of image URLs for the project.
 * @property {string} address - The address of the project.
 * @property {Object} location - The geographic location of the project.
 * @property {string} location.type - The type of the location (default: 'Point').
 * @property {number[]} location.coordinates - The coordinates of the location (longitude, latitude).
 * @property {string} status - The status of the project.
 * @property {string} type - The type of the project.
 * @property {ObjectId} userId - The ID of the user who created the project.
 * @property {Date} startedAt - The date when the project was started.
 * @property {Date} createdAt - The date when the project was created.
 * @property {Date} updatedAt - The date when the project was last updated.
 */
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  img:{
    type: [String],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  status: {
    type: String,
    required: true,
  },
  type: {
    type: String, // Assuming Type is a string, update if it's a reference to another model
    required: true,
  },
  description:String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startedAt: {
    type: Date,
    required: true,
  },
},{
  timestamps: true,
});

// Index the location field using 2dsphere index for geospatial queries
projectSchema.index({ location: '2dsphere' });

// Create the Project model
/**
 * Represents the Project model in the database.
 * @type {Model<Project>}
 */
export default  mongoose.model("Project",projectSchema);

