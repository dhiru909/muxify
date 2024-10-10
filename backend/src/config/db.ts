import mongoose from "mongoose";
import { config } from "./config";
import { error, log } from "console";

/**
 * Connects to the MongoDB database using the connection string from the config file.
 * Emits events when the connection is established or when an error occurs.
 * 
 * @returns {Promise<void>} - A promise that resolves when the database connection is established.
 * @throws {Error} - If the database connection fails, the process exits with status code 1.
 */
const connectDB = async () => {
  try {
    // Event emitted when the database connection is established successfully
    mongoose.connection.on("connected", () => {
      console.log(`MongoDB connected successfully`);
    });

    // Event emitted when there is an error while connecting to the database
    mongoose.connection.on("error", (err) => {
      log(`error in connecting to database`, err);
    });

    // Connect to the database using the connection string from the config file
    await mongoose.connect(config.databaseUrl as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

  } catch (err) {
    // If the database connection fails, log the error and exit the process
    console.log("failed to connect to database ", err);
    process.exit(1);
  }
};

export default connectDB;
