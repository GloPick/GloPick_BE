import express from "express";
import User from "../models/User";
import { UserDocument } from "../models/User";
import { protect } from "../middlewares/authMiddleware";
import { generateToken } from "../utils/generateToken";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

// 회원가입 API
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "이미 존재하는 이메일입니다." });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  })
);

// 로그인 API
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = (await User.findOne({ email })) as UserDocument;
    if (!user) {
      return res.status(401).json({ message: "이메일이 존재하지 않습니다." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  })
);

// 인증된 사용자 정보 조회
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.json(req.user);
  })
);

export default router;
