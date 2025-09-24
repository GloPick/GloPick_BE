import { Router } from "express";
import { getCountryRecommendations } from "../controllers/countryRecommendationController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

/**
 * POST /api/country-recommendations/:profileId
 * 인증된 사용자의 특정 프로필 기반 국가 추천 (중복 체크 및 저장)
 */
router.post("/:profileId", protect, getCountryRecommendations);

export default router;
