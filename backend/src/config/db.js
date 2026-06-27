import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `[Database] MongoDB Connected Safely to Cluster: ${conn.connection.host}`,
    );
  } catch (error) {
    console.error(
      `[Database Error] Connection Failure encountered: ${error.message}`,
    );
    // Exit application process with failure code
    process.exit(1);
  }
};

export default connectDB;
