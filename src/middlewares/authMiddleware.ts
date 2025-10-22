import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
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

// 선택적 JWT 인증 미들웨어 (토큰이 있으면 인증, 없으면 통과)
export const optionalAuth = async (
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
    } catch (error) {
      // 토큰이 유효하지 않아도 계속 진행 (req.user는 undefined)
      console.log("토큰 검증 실패, 비인증 상태로 진행:", error);
    }
  }
  // 토큰이 없거나 유효하지 않아도 next() 호출
  next();
};

export { AuthRequest };
