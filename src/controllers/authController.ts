import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";

// 회원가입 컨트롤러
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "이미 존재하는 이메일입니다." });
      return;
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새로운 사용자 생성
    const newUser = new User({ email, password: hashedPassword, name });

    // DB에 저장
    await newUser.save();

    // 회원가입 성공 응답
    res.status(201).json({ message: "회원가입 성공" });
  } catch (err) {
    console.error("회원가입 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};
