// 📁 routes/profileRoutes.ts
import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/profileController";

const router = express.Router();

// 사용자 이력 입력 (POST /api/profile)
router.post("/", protect, asyncHandler(createProfile));

// 사용자 이력 조회 (GET /api/profile)
router.get("/", protect, asyncHandler(getProfile));
// 사용자 이력 수정 (PUT /api/profile/:id)
router.put("/:id", protect, asyncHandler(updateProfile));
// 사용자 이력 삭제 (DELETE /api/profile/:id)
router.delete("/:id", protect, asyncHandler(deleteProfile));
export default router;
