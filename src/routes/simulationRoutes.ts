import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  saveSimulationInput,
  generateAndSaveSimulation,
  recommendCities,
} from "../controllers/simulationController";
import { getSimulationFlightLinks } from "../controllers/simulationController";

const router = express.Router();

// GPT 기반 시뮬레이션 생성
router.post("/:id/gpt", protect, asyncHandler(generateAndSaveSimulation));

// 도시 3개 추천
router.post("/:id/cities", protect, asyncHandler(recommendCities));

// 추가 정보 입력
router.post(
  "/:recommendationId/:profileId",
  protect,
  asyncHandler(saveSimulationInput)
);

// 항공권 링크 포함 시뮬레이션 결과 조회
router.get(
  "/:id/flight-links",
  protect,
  asyncHandler(getSimulationFlightLinks)
);

export default router;
