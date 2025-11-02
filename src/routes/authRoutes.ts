import express from "express";
import {
  register,
  login,
  getKakaoAuthUrl,
  kakaoCallback,
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

// 일반 회원가입
router.post("/register", asyncHandler(register));

// 일반 로그인
router.post("/login", asyncHandler(login));

// 카카오 로그인 - 인증 URL 요청
router.get("/kakao", getKakaoAuthUrl);

// 카카오 로그인 - 콜백
router.get("/kakao/callback", asyncHandler(kakaoCallback));

export default router;
