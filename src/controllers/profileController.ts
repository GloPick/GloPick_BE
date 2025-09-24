import { Request, Response } from "express";
import UserProfile from "../models/UserProfile";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Types } from "mongoose";

// 사용자 이력 등록 (POST /api/profile)
export const createProfile = async (req: AuthRequest, res: Response) => {
  const { language, desiredSalary, desiredJob, additionalNotes } = req.body;

  // 이전 이력과 동일한 내용이면 등록 불가
  const normalize = (value: string) => (value || "").trim().toLowerCase();

  // 직무 카테고리 비교 함수
  const compareJobCategory = (a: any, b: any) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.mainCategory === b.mainCategory && a.subCategory === b.subCategory;
  };

  const existingProfiles = await UserProfile.find({ user: req.user!._id });

  const isDuplicate = existingProfiles.find((profile) => {
    return (
      profile.language === language &&
      profile.desiredSalary === desiredSalary &&
      compareJobCategory(profile.desiredJob, desiredJob) &&
      normalize(profile.additionalNotes || "") ===
        normalize(additionalNotes || "")
    );
  });

  if (isDuplicate) {
    return res.status(400).json({
      code: 400,
      message: "이전 이력과 내용이 동일합니다. 등록이 불가합니다.",
      data: {
        profileId: isDuplicate._id,
      },
    });
  }

  const profile = await UserProfile.create({
    user: req.user!._id,
    language,
    desiredSalary,
    desiredJob,
    additionalNotes,
  });

  res.status(201).json({
    code: 201,
    message: "이력이 정상적으로 등록되었습니다.",
    data: null,
  });
};
