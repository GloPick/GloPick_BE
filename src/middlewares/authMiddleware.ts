import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { UserDocument } from "../models/User";

interface AuthRequest extends Request {
  user?: UserDocument;
}

// JWT 인증 미들웨어
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      const decoded: any = jwt.verify(
        token.split(" ")[1],
        process.env.JWT_SECRET!
      );
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "인증 실패: 유효하지 않은 토큰" });
    }
  } else {
    res.status(401).json({ message: "토큰이 없습니다." });
  }
};

// 회원 정보 조회 미들웨어
export const getUserProfile = async (req: AuthRequest, res: Response) => {
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

// 회원 정보 수정 미들웨어
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;

  try {
    if (!req.user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 이름, 이메일, 비밀번호 업데이트
    if (name) user.name = name;
    if (email) user.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt); // 비밀번호 해시화
    }

    await user.save(); // 변경사항 저장

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "서버 오류" });
  }
};

export { AuthRequest };
