import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import { AuthRequest } from "../middlewares/authMiddleware";

// 회원가입
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, passwordConfirm, birth, phone } = req.body;

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "이미 존재하는 이메일입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password,
      birth,
      phone,
    });
    await newUser.save();

    res.status(201).send("회원가입 성공!");
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 로그인
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "이메일이 존재하지 않습니다." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
  }
  const token = generateToken(user._id.toString());
  console.log(`토큰 : ${token}`);
  res.status(201).send("로그인 성공!");
};

// 사용자 정보 조회
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 비밀번호 제외한 사용자 정보만 반환
    const user = await User.findById(req.user._id).select("-password");
    res.json(user); // 사용자 정보 반환
  } catch (error) {
    res.status(500).json({ message: "서버 오류" });
  }
};

// 사용자 정보 수정
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name, email, password, birth, phone } = req.body;

  const user = await User.findById(req.user!._id);
  if (!user) {
    return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (birth) user.birth = birth;
  if (phone) user.phone = phone;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  await user.save();

  res.json(user);
};

// 사용자 삭제
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);

  if (!user) {
    return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
  }

  await user.deleteOne();
  res.json({ message: "회원 탈퇴가 완료되었습니다." });
};
