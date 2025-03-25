import { Request, Response } from "express";
import UserProfile from "../models/UserProfile";
import { AuthRequest } from "../middlewares/authMiddleware";

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
