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
    // 대중교통, 치안, 기후, 한인커뮤니티,필수시설, 나라문화, 주의사항
    localInfo: {
      publicTransport: String,
      safetyLevel: String,
      climateSummary: String,
      koreanCommunity: String,
      essentialFacilities: [String],
      culturalTips: String,
      warnings: String,
    },
    // 한 달 예산 전략
    // 주거비, 식비, 교통 비, 기타비용, 한 달 총 비용, 1년 비용, 절약 팁, 물가비교
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

    // 인근 공항
    // 공항 이름, 도시, 공항 코드
    nearestAirport: {
      name: String,
      city: String,
      code: String,
    },

    // 초기 정착 지원
    // 단기/장기 주거 형태, 통신, 계좌
    initialSetup: {
      shortTermHousingOptions: [String],
      longTermHousingPlatforms: [String],
      mobilePlan: String,
      bankAccount: String,
    },
    // 취업 현실 정보
    // 추천 직종, 구직 플랫폼, 언어 조건, 비자 조건
    jobReality: {
      commonJobs: [String],
      jobSearchPlatforms: [String],
      jobOpportunity: String,
      languageRequirement: String,
      visaLimitationTips: String,
    },
    // 문화 적응 도움 정보
    // 한국인 비율, 외국인 비율, 한식당/한국마트 위치 정보
    culturalIntegration: {
      koreanPopulationRate: String,
      foreignResidentRatio: String,
      koreanResourcesLinks: [String],
    },
  },
});

export default mongoose.model("SimulationResult", simulationResultSchema);
