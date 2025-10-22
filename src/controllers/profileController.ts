import { Request, Response } from "express";
import UserProfile from "../models/UserProfile";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Types } from "mongoose";
import { JOB_FIELDS, SUPPORTED_LANGUAGES } from "../constants/dropdownOptions";

// 사용자 이력 등록 (POST /api/profile)
export const createProfile = async (req: AuthRequest, res: Response) => {
  const {
    language,
    desiredSalary,
    desiredJob,
    additionalNotes,
    weights, // 가중치 추가
  } = req.body;

  // 가중치 기본값 설정 및 검증
  const finalWeights = {
    languageWeight: weights?.languageWeight || 30,
    salaryWeight: weights?.salaryWeight || 30,
    jobWeight: weights?.jobWeight || 40,
  };

  // 가중치 검증
  const totalWeight =
    finalWeights.languageWeight +
    finalWeights.salaryWeight +
    finalWeights.jobWeight;
  if (totalWeight !== 100) {
    return res.status(400).json({
      code: 400,
      message: "가중치의 합이 100이어야 합니다.",
      data: {
        currentTotal: totalWeight,
        weights: finalWeights,
      },
    });
  }

  // 이전 이력과 동일한 내용이면 등록 불가
  const normalize = (value: string) => (value || "").trim().toLowerCase();

  const existingProfiles = await UserProfile.find({ user: req.user!._id });

  const isDuplicate = existingProfiles.find((profile) => {
    return (
      profile.language === language &&
      profile.desiredSalary === desiredSalary &&
      profile.desiredJob === desiredJob &&
      normalize(profile.additionalNotes || "") ===
        normalize(additionalNotes || "") &&
      // 가중치 비교
      profile.weights?.languageWeight === finalWeights.languageWeight &&
      profile.weights?.salaryWeight === finalWeights.salaryWeight &&
      profile.weights?.jobWeight === finalWeights.jobWeight
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
    weights: finalWeights, // 가중치 저장
    additionalNotes,
  });

  res.status(201).json({
    code: 201,
    message: "이력과 가중치가 정상적으로 등록되었습니다.",
    data: {
      profileId: profile._id,
    },
  });
};

// 드롭다운 옵션 조회 (GET /api/profile/options)
export const getProfileOptions = async (req: Request, res: Response) => {
  try {
    const options = {
      languages: SUPPORTED_LANGUAGES,
      jobFields: JOB_FIELDS,
      salaryRanges: [
        "2천만 이하",
        "2천만 ~ 3천만",
        "3천만 ~ 5천만",
        "5천만 ~ 7천만",
        "7천만 ~ 1억",
        "1억 이상",
        "기타 (직접 입력)",
      ],
    };

    res.status(200).json({
      code: 200,
      message: "드롭다운 옵션 조회 성공",
      data: options,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "서버 오류",
      data: null,
    });
  }
};
