import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // 언어 능력
  languages: [
    {
      language: {
        type: String,
        enum: [
          "English",
          "Japanese",
          "Chinese",
          "German",
          "French",
          "Spanish",
          "Korean",
          "Other",
        ],
        required: true,
      },
      level: {
        type: String,
        enum: ["원어민", "상급", "중급", "초급", "없음"],
        required: true,
      },
    },
  ],

  // 희망 연봉
  desiredSalary: {
    type: String,
    enum: [
      "2천만 이하",
      "2천만 ~ 3천만",
      "3천만 ~ 5천만",
      "5천만 ~ 7천만",
      "7천만 ~ 1억",
      "1억 이상",
      "기타 (직접 입력)",
    ],
  },

  // 희망 직무 분류
  desiredJob: {
    mainCategory: {
      type: String,
      enum: [
        "IT / 개발",
        "디자인",
        "의료 / 보건",
        "교육",
        "요리 / 식음료",
        "건축 / 기술직",
        "미용 / 서비스",
        "경영 / 사무 / 마케팅",
        "자영업 / 창업",
        "기타 (직접 입력)",
      ],
    },
    subCategory: {
      type: String,
      enum: [
        // IT / 개발
        "프론트엔드 개발자",
        "백엔드 개발자",
        "풀스택 개발자",
        "데이터 엔지니어",
        "AI/ML 엔지니어",
        "앱 개발자",
        "PM(프로덕트 매니저)",
        "QA/테스터",
        // 디자인
        "UX/UI 디자이너",
        "그래픽 디자이너",
        "제품 디자이너",
        "모션 디자이너",
        "브랜딩 디자이너",
        // 의료 / 보건
        "간호사",
        "물리치료사",
        "치위생사",
        "의사",
        "간병인",
        // 교육
        "영어 교사",
        "유아 교육 교사",
        "과외/튜터",
        "국제학교 교사",
        "언어 교육 강사",
        // 요리 / 식음료
        "셰프",
        "제과제빵사",
        "바리스타",
        "주방보조",
        // 건축 / 기술직
        "전기기사",
        "용접공",
        "목수",
        "건축 설계사",
        "현장 관리자",
        // 미용 / 서비스
        "헤어디자이너",
        "피부관리사",
        "호텔리어",
        "리셉션 매니저",
        // 경영 / 사무 / 마케팅
        "회계사",
        "경영지원",
        "마케터",
        "세일즈 매니저",
        "컨설턴트",
        // 자영업 / 창업
        "카페 운영",
        "음식점 창업",
        "온라인 쇼핑몰 운영",
        "무역업",
        // 기타
        "사용자 직접입력",
      ],
    },
  },

  additionalNotes: { type: String }, // 추가 희망 사항
  createdAt: { type: Date, default: Date.now },
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
export default UserProfile;
