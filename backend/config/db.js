import mongoose from "mongoose";

const DEFAULT_URI = "mongodb://127.0.0.1:27017/cybersafe";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== "" ? process.env.MONGODB_URI : DEFAULT_URI;
  if (!process.env.MONGODB_URI) {
    console.warn(`[db] MONGODB_URI not set; falling back to ${DEFAULT_URI}`);
  }
  try {
    await mongoose.connect(uri, { autoIndex: true });
    console.log(`MongoDB connected (${uri})`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("Stack:", error.stack);
    // Do not exit immediately; allow app to continue for health endpoint / potential retry logic.
  }
};

export default connectDB;
