import { Request, Response } from "express";
import UserProfile from "../models/UserProfile";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Types } from "mongoose";
import {
  JOB_FIELDS,
  SUPPORTED_LANGUAGES,
  QUALITY_OF_LIFE_INDICATORS,
} from "../constants/dropdownOptions";

// 사용자 이력 등록 (POST /api/profile)
export const createProfile = async (req: AuthRequest, res: Response) => {
  const {
    language,
    desiredJob,
    qualityOfLifeWeights, // OECD Better Life Index 5가지 가중치
    languageWeight,
    jobWeight,
    qualityOfLifeWeight,
  } = req.body;

  // OECD Better Life Index 가중치 검증
  if (!qualityOfLifeWeights) {
    return res.status(400).json({
      code: 400,
      message: "삶의 질 지표별 가중치가 필요합니다.",
      data: {
        required: ["income", "jobs", "health", "lifeSatisfaction", "safety"],
      },
    });
  }

  // 사용자가 입력한 가중치를 그대로 사용
  const finalQualityWeights = {
    income: qualityOfLifeWeights.income ?? 0,
    jobs: qualityOfLifeWeights.jobs ?? 0,
    health: qualityOfLifeWeights.health ?? 0,
    lifeSatisfaction: qualityOfLifeWeights.lifeSatisfaction ?? 0,
    safety: qualityOfLifeWeights.safety ?? 0,
  };

  // 삶의 질 가중치 검증 (합계 100)
  const qualityTotal = Object.values(finalQualityWeights).reduce(
    (sum, val) => sum + val,
    0
  );
  if (qualityTotal !== 100) {
    return res.status(400).json({
      code: 400,
      message: "삶의 질 지표별 가중치의 합이 100이어야 합니다.",
      data: {
        currentTotal: qualityTotal,
        weights: finalQualityWeights,
      },
    });
  }

  // 전체 추천 가중치 검증
  if (
    typeof languageWeight !== "number" ||
    typeof jobWeight !== "number" ||
    typeof qualityOfLifeWeight !== "number"
  ) {
    return res.status(400).json({
      code: 400,
      message: "직무, 언어, QOL 가중치가 필요합니다.",
      data: {
        required: ["languageWeight", "jobWeight", "qualityOfLifeWeight"],
      },
    });
  }

  const finalWeights = {
    languageWeight,
    jobWeight,
    qualityOfLifeWeight,
  };

  // 전체 가중치 검증 (직무 + 언어 + QOL = 100)
  const totalWeight = languageWeight + jobWeight + qualityOfLifeWeight;
  if (totalWeight !== 100) {
    return res.status(400).json({
      code: 400,
      message: "직무, 언어, QOL 가중치의 합이 100이어야 합니다.",
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
      profile.desiredJob === desiredJob &&
      // 삶의 질 가중치 비교
      profile.qualityOfLifeWeights?.income === finalQualityWeights.income &&
      profile.qualityOfLifeWeights?.jobs === finalQualityWeights.jobs &&
      profile.qualityOfLifeWeights?.health === finalQualityWeights.health &&
      profile.qualityOfLifeWeights?.lifeSatisfaction ===
        finalQualityWeights.lifeSatisfaction &&
      profile.qualityOfLifeWeights?.safety === finalQualityWeights.safety &&
      // 전체 가중치 비교
      profile.weights?.languageWeight === finalWeights.languageWeight &&
      profile.weights?.jobWeight === finalWeights.jobWeight &&
      profile.weights?.qualityOfLifeWeight === finalWeights.qualityOfLifeWeight
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
    desiredJob,
    qualityOfLifeWeights: finalQualityWeights, // OECD 가중치 저장
    weights: finalWeights, // 전체 추천 가중치 저장
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
      qualityOfLifeIndicators: QUALITY_OF_LIFE_INDICATORS,
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
