import { Router } from "express";
import { getCountryRecommendations } from "../controllers/countryRecommendationController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

/**
 * GET /api/country-recommendations/:profileId
 * 인증된 사용자의 특정 프로필 기반 국가 추천
 */
router.get("/:profileId", protect, getCountryRecommendations);

export default router;
