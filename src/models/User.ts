import mongoose from "mongoose";
import bcrypt from "bcrypt";

// 사용자 타입 인터페이스 정의
export interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string; // 카카오 로그인 시 비밀번호가 없을 수 있음
  birth?: string;
  phone?: string;
  kakaoId?: string; // 카카오 고유 ID
  provider?: string; // 'local' 또는 'kakao'
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // required 제거 (카카오 로그인 사용자는 비밀번호 없음)
  birth: { type: String }, //(ex: "2001-03-19")
  phone: { type: String },
  kakaoId: { type: String, unique: true, sparse: true }, // 카카오 고유 ID
  provider: { type: String, enum: ["local", "kakao"], default: "local" }, // 로그인 제공자
  createdAt: { type: Date, default: Date.now },
});

// 비밀번호 해싱 (저장 전 암호화)
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 비밀번호 검증 메서드 추가
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
