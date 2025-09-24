// 📁 routes/profileRoutes.ts
import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { createProfile } from "../controllers/profileController";

const router = express.Router();

// 사용자 이력 등록 (POST /api/profile)
router.post("/", protect, asyncHandler(createProfile));

export default router;
