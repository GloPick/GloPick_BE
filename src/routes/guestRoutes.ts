import express from "express";
import {
  getGuestCountryRecommendations,
  deprecatedNotice,
} from "../controllers/guestController";

const router = express.Router();

// 비회원 국가 추천 엔드포인트
router.post("/recommend", getGuestCountryRecommendations);

// 기존 GPT 기반 엔드포인트들 - 더 이상 사용되지 않음
router.post("/profile", deprecatedNotice);
router.post("/migrate", deprecatedNotice);
router.get("/migrate/:id", deprecatedNotice);

export default router;
