// 📁 routes/profileRoutes.ts
import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { createProfile } from "../controllers/profileController";
import {
  handleUserProfile,
  generateGPTResponse,
} from "../controllers/profileController";

const router = express.Router();

// 사용자 이력 등록 (POST /api/profile)
router.post("/", protect, asyncHandler(createProfile));

// 이력 등록
router.post("/", protect, asyncHandler(handleUserProfile));

// GPT 추천 생성
router.post("/:id/gpt", protect, asyncHandler(generateGPTResponse));

export default router;
