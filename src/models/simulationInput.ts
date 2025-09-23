import mongoose from "mongoose";

const simulationInputSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserProfile",
    required: true,
  },
  selectedCountry: { type: String, required: true }, // 1,2,3 순위 중 선택 국가
  // 예산
  budget: {
    type: String,
    enum: [
      "300만~500만원",
      "500만~800만원",
      "800만~1200만원",
      "1200만~1500만원",
      "1500만원 이상",
    ],
    required: true,
  },

  // 거주 기간
  duration: {
    type: String,
    enum: ["1년 미만", "1~2년", "3~4년", "5~10년", "10년 이상", "평생 거주"],
    required: true,
  },
  hasLicense: { type: Boolean, required: true }, // 운전면허 여부
  // 희망 취업 형태
  jobTypes: [
    {
      type: String,
      enum: ["정규직", "아르바이트", "창업/자영업", "프리랜서", "기타"],
    },
  ],

  // 필수 편의 시설
  requiredFacilities: [
    {
      type: String,
      enum: [
        "대중교통 접근성",
        "마트/슈퍼 근접성",
        "병원/약국 접근성",
        "유치원/학교 접근성",
        "반려동물 친화",
        "공원/자연환경",
        "피트니스/헬스장",
        "카페/문화 시설",
        "치안",
      ],
    },
  ],

  // 동반자
  accompanyingFamily: {
    spouse: { type: Number, min: 0, max: 1, default: 0 }, // 배우자
    children: { type: Number, min: 0, max: 10, default: 0 }, // 자녀 수
    parents: { type: Number, min: 0, max: 2, default: 0 }, // 부모 수
  },

  // 비자 상태
  visaStatus: {
    type: String,
    enum: ["있음", "없음"],
    required: true,
  },
  additionalNotes: { type: String }, // 기타 희망사항
  selectedCity: { type: String }, // 선택 도시
  recommendedCities: { type: [String], default: [] }, // 도시 3개
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
    required: true,
  },
});

export default mongoose.model("SimulationInput", simulationInputSchema);
