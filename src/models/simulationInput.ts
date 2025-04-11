import mongoose from "mongoose";

const simulationInputSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserProfile",
    required: true,
  },
  selectedCountry: { type: String, required: true }, // 1,2,3 순위 중 선택 국가
  budget: { type: Number, required: true }, // 초기 예산
  duration: { type: String, required: true }, // 거주 기간
  languageLevel: {
    // 언어 능력
    type: String,
    enum: ["능숙", "기초", "통역 필요"],
    required: true,
  },
  hasLicense: { type: Boolean, required: true }, // 운전면허 여부
  jobTypes: [String], // 희망 취업 형태
  requiredFacilities: [String], // 필수 편의 시설
  accompanyingFamily: [String], // 동반 가족 여부
  visaStatus: [String], // 비자 종류 및 상태
  additionalNotes: { type: String }, // 기타 희망사항
  selectedCity: { type: String }, // 선택 도시
});

export default mongoose.model("SimulationInput", simulationInputSchema);
