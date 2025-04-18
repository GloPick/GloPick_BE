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
    recommendedCity: String, // 추천 도시
    estimatedMonthlyCost: {
      housing: String, // 주거비용 (만원)
      food: String, // 식비 (만원)
      transportation: String, // 교통비 (만원)
      etc: String, // 기타 생활비 (만원)
      total: String, // 총합 (만원)
    },
    jobOpportunity: String, // 취업 가능성 및 추천 직종 설명
    culturalTips: String, // 문화, 언어, 생활 관련 팁
    warnings: String, // 유의사항 및 주의할 점
    nearestAirport: {
      name: String,
      city: String,
      code: String,
    },
  },
});

export default mongoose.model("SimulationResult", simulationResultSchema);
