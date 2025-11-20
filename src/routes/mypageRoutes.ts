import express from "express";
import {
  getUserInfo,
  updateUserInfo,
  deleteUser,
  getSimulationsByProfileId,
  getUserRecommendations,
  getRecommendationsByProfileId,
  getProfile,
  updateProfile,
  deleteProfile,
  getUserSimulations,
} from "../controllers/mypageController";
import { protect } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { getSimulationList } from "../controllers/simulationController";

const router = express.Router();

// 사용자 정보 관리 API

// 사용자 정보 조회
router.get("/account", protect, asyncHandler(getUserInfo));
// 사용자 정보 수정
router.put("/account", protect, asyncHandler(updateUserInfo));
// 회원 탈퇴
router.delete("/account", protect, asyncHandler(deleteUser));

//  이력 관리 API

// 사용자 이력 조회 (GET /api/profile)
router.get("/profiles", protect, asyncHandler(getProfile));
// 사용자 이력 수정 (PUT /api/profile/:id)
router.put("/profiles/:id", protect, asyncHandler(updateProfile));
// 사용자 이력 삭제 (DELETE /api/profile/:id)
router.delete("/profiles/:id", protect, asyncHandler(deleteProfile));

// 시뮬레이션 결과 조회 (입력 정보 포함)
router.get("/simulations", protect, asyncHandler(getUserSimulations));

// 특정 이력별 시뮬레이션 결과 조회 API
router.get(
  "/simulations/by-profile/:profileId",
  protect,
  asyncHandler(getSimulationsByProfileId)
);

// API 기반 국가 추천 결과 조회 API
router.get("/recommendations", protect, asyncHandler(getUserRecommendations));

// 특정 이력별 API 기반 국가 추천 결과 조회 API
router.get(
  "/recommendations/by-profile/:profileId",
  protect,
  asyncHandler(getRecommendationsByProfileId)
);

// 시뮬레이션 요약 리스트 조회 API
router.get("/simulations/list", protect, asyncHandler(getSimulationList));

export default router;
