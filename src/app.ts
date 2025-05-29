// src/app.ts
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import simulationRoutes from "./routes/simulationRoutes";
import mypageRoutes from "./routes/mypageRoutes";
import rankingRoutes from "./routes/rankingRoutes";
import guestRoutes from "./routes/guestRoutes";
import { setupSwagger } from "./docs/swagger";

const app = express();

app.use(cors());
app.use(express.json());

// 라우터 등록
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/simulation", simulationRoutes);
app.use("/api/mypage", mypageRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/guest", guestRoutes);

// Swagger 문서
setupSwagger(app);

// 기본 라우트
app.get("/", (req, res) => {
  res.send("서버 실행 중");
});

export default app;
