import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  saveSimulationInput,
  generateAndSaveSimulation,
  recommendCities,
} from "../controllers/simulationController";

const router = express.Router();

// 추가 정보 입력
router.post("/input", protect, asyncHandler(saveSimulationInput));

// GPT 기반 시뮬레이션 생성
router.post("/:id/gpt", protect, asyncHandler(generateAndSaveSimulation));

// 도시 3개 추천
router.post("/:id/cities", protect, asyncHandler(recommendCities));

router.post("/:id/gpt/save", protect, asyncHandler(generateAndSaveSimulation));

export default router;
