import mongoose from "mongoose";

const simulationInputSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserProfile", 
    required: true,
  },
  selectedCountry: { type: String, required: true }, // 1,2,3 순위 중 선택 국가
  selectedCity: { type: String, required: false }, // 선택 도시 (선택사항)
  
  // 초기 정착 예산
  initialBudget: {
    type: String,
    enum: [
      "300만~500만원",
      "500만~800만원", 
      "800만~1200만원",
      "1200만~1500만원",
      "1500만원 이상",
    ],
    required: false, // 도시 추천 단계에서는 선택사항
  },

  // 필수 편의 시설 (문자열로 변경)
  requiredFacilities: {
    type: String, // 자유 입력으로 변경
    required: false, // 도시 추천 단계에서는 선택사항
  },

  // 출발 공항
  departureAirport: {
    type: String,
    enum: [
      "인천국제공항",
      "김포국제공항", 
      "김해국제공항",
      "제주국제공항",
      "청주국제공항",
      "대구국제공항",
      "무안국제공항",
    ],
    required: false, // 도시 추천 단계에서는 선택사항
  },

  recommendedCities: { type: [String], default: [] }, // 도시 3개
});

export default mongoose.model("SimulationInput", simulationInputSchema);
