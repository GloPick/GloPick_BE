import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // 언어 능력 (단일 언어 선택)
  language: {
    type: String,
    enum: [
      "Korean",
      "English",
      "Spanish",
      "French",
      "German",
      "Portuguese",
      "Italian",
      "Dutch",
      "Swedish",
      "Norwegian",
      "Danish",
      "Finnish",
      "Polish",
      "Czech",
      "Hungarian",
      "Greek",
      "Turkish",
      "Japanese",
      "Chinese",
      "Hebrew",
      "Slovak",
      "Slovene",
      "Icelandic",
      "Estonian",
      "Latvian",
      "Lithuanian",
      "Other",
    ],
    required: true,
  },

  // OECD Better Life Index 우선순위 가중치 (5가지 핵심 지표)
  qualityOfLifeWeights: {
    income: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 20,
    },
    jobs: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 20,
    },
    health: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 20,
    },
    lifeSatisfaction: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 20,
    },
    safety: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 20,
    },
  },

  // 희망 직무 분류 (ISCO-08 대분류 기준)
  desiredJob: {
    type: String,
    enum: [
      "0", // 군인
      "1", // 관리자
      "2", // 전문가
      "3", // 기술자 및 준전문가
      "4", // 사무종사자
      "5", // 서비스 및 판매 종사자
      "6", // 농림어업 숙련 종사자
      "7", // 기능원 및 관련 기능 종사자
      "8", // 설비·기계 조작 및 조립 종사자
      "9", // 단순노무 종사자
    ],
    required: true,
  },

  // 전체 추천 가중치 (언어 + 직무 + 삶의 질)
  weights: {
    languageWeight: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 30,
    },
    jobWeight: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 30,
    },
    qualityOfLifeWeight: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 40,
    },
  },

  additionalNotes: { type: String }, // 추가 희망 사항
  createdAt: { type: Date, default: Date.now },
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
export default UserProfile;
