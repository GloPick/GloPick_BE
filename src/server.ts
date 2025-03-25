// src/server.ts
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./db";
import app from "./app";

const PORT = process.env.PORT || 5000;

// DB 연결
connectDB();

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중`);
});
