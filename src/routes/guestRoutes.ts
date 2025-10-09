import express from "express";
import {
  getGuestCountryRecommendations,
} from "../controllers/guestController";

const router = express.Router();

// 비회원 국가 추천 엔드포인트
router.post("/recommend", getGuestCountryRecommendations);

export default router;
