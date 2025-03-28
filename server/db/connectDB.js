import mongoose from "mongoose";
const connectDB = async () => {
  // Set environment variable to suppress deprecation warnings (optional)
  process.env.MONGO_DISABLE_DEPRECATED_COMMANDS = "true";
  // Get MongoDB URI from .env file
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MongoDB URI is not set in the .env file");
    process.exit(1);
  }
  // Connect to MongoDB
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true, // Add this line
      useFindAndModify: false, // Optional but recommended
    })
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });
};

export default connectDB;
