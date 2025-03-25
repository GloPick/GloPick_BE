import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  education: { type: String, required: true }, // 학력
  experience: { type: String, required: true }, // 경력
  skills: { type: [String], default: [] }, // 기술 및 자격증
  languages: { type: [String], default: [] }, // 언어 능력
  desiredSalary: { type: String }, // 희망 월급 (문자열로 입력 자유롭게 받기)
  desiredJob: { type: String }, // 희망 직무/직군
  additionalNotes: { type: String }, // 추가 희망 사항
  createdAt: { type: Date, default: Date.now },
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
export default UserProfile;
