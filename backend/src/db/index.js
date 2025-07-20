import mongoose from "mongoose";
// In your server.js file or wherever you set up your Mongoose connection

import "../models/bid.model.js";
import "../models/city.model.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`,
      {
        // Add connection options for better stability (removed unsupported options)
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: "majority"
      }
    );
    console.log("Connected to DB", `${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    
    // Retry connection after 5 seconds
    console.log("Retrying connection in 5 seconds...");
    setTimeout(() => {
      connectDB();
    }, 5000);
  }
};

export default connectDB;
