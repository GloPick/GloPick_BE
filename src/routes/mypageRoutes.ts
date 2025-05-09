import express from "express";
import {
  getUserInfo,
  updateUserInfo,
  deleteUser,
  getGptRecommendations,
} from "../controllers/mypageController";
import {
  getProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/mypageController";
import { protect } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { getUserSimulations } from "../controllers/mypageController";

const router = express.Router();

// 사용자 정보 관리

// 사용자 정보 조회
router.get("/account", protect, asyncHandler(getUserInfo));
// 사용자 정보 수정
router.put("/account", protect, asyncHandler(updateUserInfo));
// 회원 탈퇴
router.delete("/account", protect, asyncHandler(deleteUser));

//  이력 관리

// 사용자 이력 조회 (GET /api/profile)
router.get("/profiles", protect, asyncHandler(getProfile));
// 사용자 이력 수정 (PUT /api/profile/:id)
router.put("/profiles/:id", protect, asyncHandler(updateProfile));
// 사용자 이력 삭제 (DELETE /api/profile/:id)
router.delete("/profiles/:id", protect, asyncHandler(deleteProfile));

// GPT 추천 결과 조회
router.get("/recommendations", protect, asyncHandler(getGptRecommendations));

router.get("/simulations", protect, asyncHandler(getUserSimulations));

export default router;
