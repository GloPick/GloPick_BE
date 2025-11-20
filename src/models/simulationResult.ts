import mongoose from "mongoose";

const simulationResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  input: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SimulationInput",
    required: true,
  },
  country: { type: String, required: true },
  result: {
    recommendedCity: String,
    // 지역 정보
    localInfo: {
      essentialFacilities: [String], // 사용자가 요청한 필수 편의 시설 정보
      publicTransport: String,
      safetyLevel: String,
      climateSummary: String,
      koreanCommunity: String,
      culturalTips: String,
      warnings: String,
    },
    // 편의시설 위치 정보 (Google Maps API)
    facilityLocations: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // 한 달 예산 전략 (사용자 초기 예산 기반)
    estimatedMonthlyCost: {
      housing: String,
      food: String,
      transportation: String,
      etc: String,
      total: String,
      oneYearCost: String,
      costCuttingTips: String,
      cpi: String,
    },

    // 초기 정착 지원
    initialSetup: {
      shortTermHousingOptions: [String],
      longTermHousingPlatforms: [String],
      mobilePlan: String,
      bankAccount: String,
    },
    // 취업 현실 정보
    jobReality: {
      jobSearchPlatforms: [String],
      languageRequirement: String,
      visaLimitationTips: String,
    },
    // 문화 적응 도움 정보
    culturalIntegration: {
      koreanPopulationRate: String,
      foreignResidentRatio: String,
      koreanResourcesLinks: [String],
    },
  },
});

export default mongoose.model("SimulationResult", simulationResultSchema);
