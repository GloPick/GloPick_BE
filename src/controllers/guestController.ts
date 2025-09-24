import { Request, Response } from "express";
import {
  UserCareerProfile,
  CountryRecommendation,
} from "../types/countryRecommendation";
import { CountryRecommendationService } from "../services/countryRecommendationService";
import { asyncHandler } from "../utils/asyncHandler";

// 비회원 국가 추천 요청 처리 (회원과 동일한 로직, DB 저장 없음)
export const getGuestCountryRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
    const userProfile: UserCareerProfile = req.body;

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
      expectedSalary: userProfile.expectedSalary,
      jobField: userProfile.jobField,
      priorities: userProfile.priorities,
    });

    try {
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
            expectedSalary: userProfile.expectedSalary,
            jobField: userProfile.jobField,
            priorities: userProfile.priorities,
          },
          recommendations,
          appliedWeights: {
            first: 0.5,
            second: 0.3,
            third: 0.2,
          },
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

  if (!profile.expectedSalary || profile.expectedSalary <= 0) {
    return "유효한 희망 연봉을 입력해주세요.";
  }

  if (!profile.jobField || !profile.jobField.code || !profile.jobField.nameKo) {
    return "직무 분야를 올바르게 선택해주세요.";
  }

  // ISCO 코드 유효성 검증
  const validISCOCodes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  if (!validISCOCodes.includes(profile.jobField.code)) {
    return "ISCO-08 표준 직무 분류 코드를 선택해주세요.";
  }

  if (!profile.priorities) {
    return "우선순위를 설정해주세요.";
  }

  // 우선순위 검증
  const { first, second, third } = profile.priorities;
  const validPriorities = ["language", "salary", "job"];

  if (
    !validPriorities.includes(first) ||
    !validPriorities.includes(second) ||
    !validPriorities.includes(third)
  ) {
    return "우선순위는 language, salary, job 중에서 선택해주세요.";
  }

  // 우선순위 중복 검증
  const prioritySet = new Set([first, second, third]);
  if (prioritySet.size !== 3) {
    return "우선순위는 서로 다른 값이어야 합니다.";
  }

  // 연봉 범위 검증
  if (profile.expectedSalary < 10000 || profile.expectedSalary > 500000) {
    return "희망 연봉은 $10,000 ~ $500,000 범위로 입력해주세요.";
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

export const deprecatedNotice = async (req: Request, res: Response) => {
  res.status(410).json({
    code: 410,
    message:
      "이 기능은 더 이상 지원되지 않습니다. /api/guest/recommend를 사용하세요.",
    data: null,
  });
};
