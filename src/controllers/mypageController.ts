import { Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import UserProfile from "../models/UserProfile";

import GptRecommendation from "../models/gptRecommendation";
import { AuthRequest } from "../middlewares/authMiddleware";

// 사용자 정보 조회
export const getUserInfo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(404)
        .json({ code: 404, message: "사용자를 찾을 수 없음", data: null });
    }

    // 비밀번호 제외한 사용자 정보만 반환
    const user = await User.findById(req.user._id).select("-password");
    res
      .status(200)
      .json({ code: 200, message: "사용자 정보 조회 성공", data: user });
  } catch (error) {
    res.status(500).json({ code: 500, message: "서버 오류", data: null });
  }
};

// 사용자 정보 수정
export const updateUserInfo = async (req: AuthRequest, res: Response) => {
  const { name, email, password, birth, phone } = req.body;

  const user = await User.findById(req.user!._id);
  if (!user) {
    return res
      .status(404)
      .json({ code: 404, message: "사용자를 찾을 수 없음", data: null });
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

  res
    .status(200)
    .json({ code: 200, message: "사용자 정보 수정 성공", data: user });
};

// 사용자 삭제
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);

  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "사용자를 찾을 수 없음",
      data: null,
    });
  }

  await user.deleteOne();
  res.status(200).json({
    code: 200,
    message: "회원 탈퇴 완료!",
    data: null,
  });
};

// 사용자 이력 조회 (GET /api/profile)
export const getProfile = async (req: AuthRequest, res: Response) => {
  const profiles = await UserProfile.find({ user: req.user!._id }).populate(
    "user",
    "name email"
  );

  if (!profiles) {
    return res
      .status(404)
      .json({ code: 404, message: "이력 정보가 없습니다.", data: null });
  }

  res.status(200).json({
    code: 200,
    message: "이력 정보 조회 성공",
    data: profiles,
  });
};
// 사용자 이력 수정 (PUT /api/profile/:id)
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const profile = await UserProfile.findOne({
    _id: req.params.id,
    user: req.user!._id,
  });

  if (!profile) {
    return res
      .status(404)
      .json({ code: 404, message: "이력을 찾을 수 없습니다.", data: null });
  }

  const fields = [
    "education",
    "experience",
    "skills",
    "languages",
    "desiredSalary",
    "desiredJob",
    "additionalNotes",
  ];

  fields.forEach((field) => {
    if (req.body[field]) (profile as any)[field] = req.body[field];
  });

  await profile.save();
  res.status(200).json({
    code: 200,
    message: "이력 정보 수정 성공",
    data: profile,
  });
};
// 사용자 이력 삭제 (DELETE /api/profile/:id)
export const deleteProfile = async (req: AuthRequest, res: Response) => {
  const profile = await UserProfile.findOneAndDelete({
    _id: req.params.id,
    user: req.user!._id,
  });

  if (!profile) {
    return res
      .status(404)
      .json({ code: 404, message: "이력을 찾을 수 없습니다.", data: null });
  }

  res.status(200).json({
    code: 200,
    message: "이력 삭제 완료",
    data: null,
  });
};

// GPT 추천 결과 조회 API
export const getGptRecommendations = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const results = await GptRecommendation.find({ user: req.user!._id })
      .populate("profile", "-__v")
      .sort({ createdAt: -1 });

    if (!results || results.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "저장된 추천 결과가 없습니다.",
        data: null,
      });
    }

    res.status(200).json({
      code: 200,
      message: "추천 결과 조회 성공",
      data: results,
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: "조회 실패", data: null });
  }
};
