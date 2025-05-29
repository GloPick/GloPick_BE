import { Router } from "express";
import { recommendCountriesForGuest } from "../controllers/guestController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// 비회원 이력 정보 입력 후 GPT 기반 국가 3개 추천
router.post("/recommend", asyncHandler(recommendCountriesForGuest));
export default router;
