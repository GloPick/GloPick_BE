import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  deleteUser,
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

// 회원가입
router.post("/register", asyncHandler(register));

// 로그인
router.post("/login", asyncHandler(login));

// 사용자 정보 조회
router.get("/me", protect, asyncHandler(getProfile));

// 사용자 정보 수정
router.put("/me", protect, asyncHandler(updateProfile));

// 사용자 탈퇴
router.delete("/me", protect, asyncHandler(deleteUser));

export default router;
