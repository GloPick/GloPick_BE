import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";

// 회원가입
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, passwordConfirm, birth, phone } = req.body;

    if (password !== passwordConfirm) {
      return res.status(400).json({
        code: 400,
        message: "비밀번호가 일치하지 않습니다.",
        data: null,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: "이미 존재하는 이메일입니다.",
        data: null,
      });
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

    res.status(201).json({ code: 201, message: "회원가입 성공!", data: null });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({ code: 500, message: "서버 오류", data: null });
  }
};

// 로그인
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      code: 401,
      message: "이메일이 존재하지 않습니다.",
      data: null,
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      code: 401,
      message: "비밀번호가 틀렸습니다.",
      data: null,
    });
  }
  const token = generateToken(user._id.toString());
  console.log(`토큰 : ${token}`);
  res.status(201).json({
    code: 201,
    message: "로그인 성공!",
    data: {
      name: user.name,
      email: user.email,
      token,
    },
  });
};
