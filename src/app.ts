// src/app.ts
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import { setupSwagger } from "./docs/swagger";

const app = express();

app.use(cors());
app.use(express.json());

// 라우터 등록
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// Swagger 문서
setupSwagger(app);

// 기본 라우트
app.get("/", (req, res) => {
  res.send("서버 실행 중");
});

export default app;
