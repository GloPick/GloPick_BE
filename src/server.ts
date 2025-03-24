import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { connectDB } from "./db";
import authRoutes from "./routes/authRoutes";
import { setupSwagger } from "./docs/swagger";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
setupSwagger(app);
app.get("/", (req, res) => {
  res.send("서버 실행 중");
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중`);
});
