import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  saveSimulationInput,
  generateAndSaveSimulation,
  recommendCities,
  getSimulationFlightLinks,
  getSimulationList,
  testGoogleMaps,
} from "../controllers/simulationController";

const router = express.Router();

// === Google Maps API 테스트 ===
router.post("/test-google-maps", asyncHandler(testGoogleMaps));

// === 새로운 워크플로우 ===
// 1. 도시 추천 (국가 추천 이후 바로 실행)
router.post(
  "/recommend-cities/:recommendationId/:profileId",
  protect,
  asyncHandler(recommendCities)
);

// 2. 시뮬레이션 추가 정보 입력 + 시뮬레이션 자동 생성 (통합됨)
router.post("/input/:id", protect, asyncHandler(saveSimulationInput));

// 3. [Deprecated] GPT 기반 시뮬레이션 생성 - 이제 /input/{id}에서 자동으로 처리됨
// router.post("/:id/generate", protect, asyncHandler(generateAndSaveSimulation));

// 항공권 링크 포함 시뮬레이션 결과 조회
router.get(
  "/:id/flight-links",
  protect,
  asyncHandler(getSimulationFlightLinks)
);

export default router;
