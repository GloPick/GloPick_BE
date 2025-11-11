import { Request, Response } from "express";
import {
  UserCareerProfile,
  CountryRecommendation,
} from "../types/countryRecommendation";
import {
  CountryRecommendationService,
  saveWeights,
} from "../services/countryRecommendationService";
import { asyncHandler } from "../utils/asyncHandler";
import { SUPPORTED_LANGUAGES, JOB_FIELDS } from "../constants/dropdownOptions";

// 비회원 국가 추천 요청 처리 (회원과 동일한 로직, DB 저장 없음)
export const getGuestCountryRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
    const { language, desiredJob, qualityOfLifeWeights, weights } = req.body;

    // OECD Better Life Index 가중치 검증
    if (!qualityOfLifeWeights) {
      return res.status(400).json({
        success: false,
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
        success: false,
        message: "삶의 질 지표별 가중치의 합이 100이어야 합니다.",
        data: {
          currentTotal: qualityTotal,
          weights: finalQualityWeights,
        },
      });
    }

    // 전체 추천 가중치 기본값 설정 및 검증
    const finalWeights = {
      languageWeight: weights?.languageWeight || 30,
      jobWeight: weights?.jobWeight || 30,
      qualityOfLifeWeight: weights?.qualityOfLifeWeight || 40,
    };

    // 전체 가중치 검증
    const totalWeight =
      finalWeights.languageWeight +
      finalWeights.jobWeight +
      finalWeights.qualityOfLifeWeight;
    if (totalWeight !== 100) {
      return res.status(400).json({
        success: false,
        message: "전체 추천 가중치의 합이 100이어야 합니다.",
        data: {
          currentTotal: totalWeight,
          weights: finalWeights,
        },
      });
    }

    // UserCareerProfile 형태로 변환
    const userProfile: UserCareerProfile = {
      language,
      jobField: {
        code: desiredJob,
        nameKo:
          JOB_FIELDS.find((field) => field.code === desiredJob)?.nameKo || "",
        nameEn:
          JOB_FIELDS.find((field) => field.code === desiredJob)?.nameEn || "",
      },
      qualityOfLifeWeights: finalQualityWeights,
    };

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
      saveWeights({
        language: finalWeights.languageWeight,
        job: finalWeights.jobWeight,
        qualityOfLife: finalWeights.qualityOfLifeWeight,
      });

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
            desiredJob,
            qualityOfLifeWeights: userProfile.qualityOfLifeWeights,
            weights: finalWeights,
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

  // 언어 검증
  if (!SUPPORTED_LANGUAGES.includes(profile.language as any)) {
    return "지원되는 언어를 선택해주세요.";
  }

  if (!profile.jobField || !profile.jobField.code || !profile.jobField.nameKo) {
    return "직무 분야를 올바르게 선택해주세요.";
  }

  // ISCO 코드 유효성 검증
  const validISCOCodes: string[] = JOB_FIELDS.map((field) => field.code);
  if (!validISCOCodes.includes(profile.jobField.code)) {
    return "ISCO-08 표준 직무 분류 코드를 선택해주세요.";
  }

  // 삶의 질 가중치 검증
  if (!profile.qualityOfLifeWeights) {
    return "삶의 질 가중치를 설정해주세요.";
  }

  return null; // 검증 통과
}
