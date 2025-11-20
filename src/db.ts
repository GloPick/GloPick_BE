import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "GloPickDB",
    });
    console.log("MongoDB Atlas 연결 테스트");
  } catch (error) {
    console.error(" MongoDB 연결 실패:", error);
    process.exit(1);
  }
};
