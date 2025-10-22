import { Request, Response } from "express";
import {
  UserCareerProfile,
  CountryRecommendation,
} from "../types/countryRecommendation";
import { CountryRecommendationService } from "../services/countryRecommendationService";
import { asyncHandler } from "../utils/asyncHandler";

// saveWeights 함수 import (가중치 사용할 수 있도록)
let savedWeights = { language: 30, job: 30, qualityOfLife: 40 };
export const saveWeights = (weights: {
  language: number;
  job: number;
  qualityOfLife: number;
}) => {
  savedWeights = weights;
};
export const getSavedWeights = () => savedWeights;

// 비회원 국가 추천 요청 처리 (회원과 동일한 로직, DB 저장 없음)
export const getGuestCountryRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
    const { userProfile, weights } = req.body;

    // 가중치 필수 검증
    if (
      !weights ||
      weights.language === undefined ||
      weights.job === undefined ||
      weights.qualityOfLife === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "가중치 정보가 필요합니다. language, job, qualityOfLife 가중치를 모두 입력해주세요.",
        data: {
          required: {
            language: "언어 가중치 (숫자)",
            job: "직무 가중치 (숫자)",
            qualityOfLife: "삶의 질 가중치 (숫자)",
          },
          received: weights,
        },
      });
    }

    const finalWeights = {
      language: weights.language,
      job: weights.job,
      qualityOfLife: weights.qualityOfLife,
    };

    // 가중치 검증
    const totalWeight =
      finalWeights.language + finalWeights.job + finalWeights.qualityOfLife;
    if (totalWeight !== 100) {
      return res.status(400).json({
        success: false,
        message: "가중치의 합이 100이어야 합니다.",
        data: {
          currentTotal: totalWeight,
          weights: finalWeights,
        },
      });
    }

    // 입력 데이터 검증
    const validationError = validateGuestProfile(userProfile);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    console.log("비회원 국가 추천 요청:", {
      language: userProfile.language,
      jobField: userProfile.jobField,
      qualityOfLifeWeights: userProfile.qualityOfLifeWeights,
      weights: finalWeights,
    });

    try {
      // 가중치를 서비스에서 사용할 수 있도록 저장
      saveWeights(finalWeights);

      // 국가 추천 서비스 호출 (회원과 동일한 로직)
      const recommendations: CountryRecommendation[] =
        await CountryRecommendationService.getTopCountryRecommendations(
          userProfile
        );

      res.status(200).json({
        success: true,
        message: "비회원 국가 추천이 완료되었습니다.",
        data: {
          userProfile: {
            language: userProfile.language,
            jobField: userProfile.jobField,
            qualityOfLifeWeights: userProfile.qualityOfLifeWeights,
          },
          recommendations,
          appliedWeights: finalWeights,
          timestamp: new Date().toISOString(),
          note: "비회원은 국가 추천까지만 제공됩니다. 시뮬레이션 기능을 이용하려면 회원가입이 필요합니다.",
        },
      });
    } catch (error) {
      console.error("비회원 국가 추천 처리 오류:", error);

      res.status(500).json({
        success: false,
        message: "국가 추천 처리 중 서버 오류가 발생했습니다.",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
);

// 비회원 프로필 검증 함수 (회원과 동일한 검증)
function validateGuestProfile(profile: UserCareerProfile): string | null {
  // 필수 필드 검증
  if (!profile.language || profile.language.trim() === "") {
    return "사용 가능한 언어를 선택해주세요.";
  }

  if (!profile.jobField || !profile.jobField.code || !profile.jobField.nameKo) {
    return "직무 분야를 올바르게 선택해주세요.";
  }

  // ISCO 코드 유효성 검증
  const validISCOCodes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  if (!validISCOCodes.includes(profile.jobField.code)) {
    return "ISCO-08 표준 직무 분류 코드를 선택해주세요.";
  }

  // 삶의 질 가중치 검증
  if (!profile.qualityOfLifeWeights) {
    return "삶의 질 가중치를 설정해주세요.";
  }

  const qolWeights = profile.qualityOfLifeWeights;
  const qolTotal =
    qolWeights.income +
    qolWeights.jobs +
    qolWeights.health +
    qolWeights.lifeSatisfaction +
    qolWeights.safety;

  if (qolTotal !== 100) {
    return "삶의 질 지표별 가중치의 합이 100이어야 합니다.";
  }

  // 언어 검증
  const supportedLanguages = [
    "English",
    "Japanese",
    "Chinese",
    "German",
    "French",
    "Spanish",
    "Korean",
    "Other",
  ];
  if (!supportedLanguages.includes(profile.language)) {
    return "지원되는 언어를 선택해주세요.";
  }

  return null; // 검증 통과
}
