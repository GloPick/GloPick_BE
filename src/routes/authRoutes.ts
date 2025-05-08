import express from "express";
import { register, login } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

// 회원가입
router.post("/register", asyncHandler(register));

// 로그인
router.post("/login", asyncHandler(login));

export default router;
