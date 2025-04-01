import { Request, Response } from "express";
import UserProfile from "../models/UserProfile";
import { AuthRequest } from "../middlewares/authMiddleware";
import { getGPTResponse } from "../services/gptService";
import { Types } from "mongoose";

// 사용자 이력 입력 (POST /api/profile)
export const createProfile = async (req: AuthRequest, res: Response) => {
  const {
    education,
    experience,
    skills,
    languages,
    desiredSalary,
    desiredJob,
    additionalNotes,
  } = req.body;

  const profile = await UserProfile.create({
    user: req.user!._id,
    education,
    experience,
    skills,
    languages,
    desiredSalary,
    desiredJob,
    additionalNotes,
  });

  res.status(201).json(profile);
};
// 사용자 이력 조회 (GET /api/profile)
export const getProfile = async (req: AuthRequest, res: Response) => {
  const profiles = await UserProfile.find({ user: req.user!._id }).populate(
    "user",
    "name email"
  );

  if (!profiles) {
    return res.status(404).json({ message: "이력 정보가 없습니다." });
  }

  res.json(profiles);
};
// 사용자 이력 수정 (PUT /api/profile/:id)
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const profile = await UserProfile.findOne({
    _id: req.params.id,
    user: req.user!._id,
  });

  if (!profile) {
    return res.status(404).json({ message: "이력 정보를 찾을 수 없습니다." });
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
  res.json(profile);
};
// 사용자 이력 삭제 (DELETE /api/profile/:id)
export const deleteProfile = async (req: AuthRequest, res: Response) => {
  const profile = await UserProfile.findOneAndDelete({
    _id: req.params.id,
    user: req.user!._id,
  });

  if (!profile) {
    return res.status(404).json({ message: "이력 정보를 찾을 수 없습니다." });
  }

  res.json({ message: "이력 삭제 완료" });
};

// 사용자 이력 정보와 GPT 요청을 처리하는 함수

export const handleUserProfile = async (req: Request, res: Response) => {
  const userData = req.body; // 사용자가 입력한 데이터

  try {
    // 이력 등록
    const profile = await UserProfile.create({
      user: req.user!._id, // 로그인한 사용자 정보
      ...userData,
    });

    // 이력 정보와 함께 GPT 응답 생성
    const gptResponse = await getGPTResponse(profile);

    res.status(201).json({
      message: "이력 등록 및 GPT 응답 생성 성공",
      data: {
        profile,
        gptResponse,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "이력 등록 실패", error });
  }
};

// GPT 응답 생성 API
export const generateGPTResponse = async (req: Request, res: Response) => {
  const { id } = req.params; // URL 경로에서 id 추출

  try {
    // ObjectId로 변환
    const profileId = new Types.ObjectId(id); // MongoDB에서 찾을 수 있도록 ObjectId로 변환

    // 해당 이력 찾기, 로그인된 사용자와 매칭되는 데이터만
    const profile = await UserProfile.findOne({
      _id: profileId,
      user: req.user!._id,
    });

    if (!profile) {
      return res.status(404).json({ message: "이력을 찾을 수 없습니다." });
    }

    // GPT 응답 생성
    const gptResponse = await getGPTResponse(profile);

    res.json({
      message: "GPT 응답 생성 성공",
      data: gptResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "GPT 응답 생성 실패", error });
  }
};
