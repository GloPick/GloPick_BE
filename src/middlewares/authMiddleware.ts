import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";

interface AuthRequest extends Request {
  user?: any;
}

// ✅ JWT 인증 미들웨어
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
