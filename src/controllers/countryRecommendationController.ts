import { Request, Response } from "express";
import {
  UserCareerProfile,
  CountryRecommendation,
} from "../types/countryRecommendation";
import { CountryRecommendationService } from "../services/countryRecommendationService";
import { asyncHandler } from "../utils/asyncHandler";
import CountryRecommendationResult from "../models/countryRecommendationResult";
import UserProfile from "../models/UserProfile";
import { AuthRequest } from "../middlewares/authMiddleware";
import { SUPPORTED_LANGUAGES, JOB_FIELDS } from "../constants/dropdownOptions";

// 인증된 사용자의 특정 프로필 기반 국가 추천 (중복 체크 및 저장)
export const getCountryRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userProfile: UserCareerProfile = req.body;
    const { profileId } = req.params; // URL 파라미터에서 profileId 가져오기

    // 인증된 사용자 확인
    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "인증이 필요합니다.",
      });
    }

    // profileId 필수 확인
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "프로필 ID가 필요합니다.",
      });
    }

    // 입력 데이터 검증
    const validationError = validateUserProfile(userProfile);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // 인증된 사용자이고 profileId가 있는 경우 중복 체크 및 저장 처리
    if (authReq.user && profileId) {
      // 해당 프로필 조회
      const dbProfile = await UserProfile.findOne({
        _id: profileId,
        user: authReq.user._id,
      });

      if (!dbProfile) {
        return res.status(404).json({
          success: false,
          message: "프로필을 찾을 수 없습니다.",
        });
      }

      // 이미 해당 프로필에 대한 추천 결과가 있는지 확인
      const existingRecommendation = await CountryRecommendationResult.findOne({
        user: authReq.user._id,
        profile: profileId,
      }).sort({ createdAt: -1 });

      if (existingRecommendation) {
        return res.status(200).json({
          success: true,
          message: "이미 추천받은 이력입니다.",
          data: {
            isExisting: true,
            recommendationId: existingRecommendation._id,
            profileId: profileId,
            createdAt: existingRecommendation.createdAt,
          },
        });
      }
    }

    console.log("국가 추천 요청:", {
      language: userProfile.language,
      expectedSalary: userProfile.expectedSalary,
      jobField: userProfile.jobField,
      priorities: userProfile.priorities,
    });

    try {
      // 국가 추천 서비스 호출
      const recommendations: CountryRecommendation[] =
        await CountryRecommendationService.getTopCountryRecommendations(
          userProfile
        );

      // 인증된 사용자이고 profileId가 있는 경우 결과 저장
      let savedRecommendationId = null;
      if (authReq.user && profileId) {
        const savedResult = new CountryRecommendationResult({
          user: authReq.user._id,
          profile: profileId,
          recommendations: recommendations.map((rec, index) => ({
            country: rec.country.name,
            score: rec.totalScore,
            rank: index + 1,
            details: {
              economicScore: rec.breakdown.languageScore,
              employmentScore: rec.breakdown.jobScore,
              languageScore: rec.breakdown.languageScore,
              salaryScore: rec.breakdown.salaryScore,
            },
            economicData: {
              gdpPerCapita: rec.country.gdpPerCapita || 0,
              employmentRate: rec.country.employmentRate || 0,
              averageSalary: 0,
            },
            countryInfo: {
              region: rec.country.region,
              languages: rec.country.languages,
              population: rec.country.population || 0,
            },
          })),
        });

        await savedResult.save();
        savedRecommendationId = savedResult._id;
      }

      res.status(200).json({
        success: true,
        message:
          authReq.user && profileId
            ? "국가 추천이 완료되고 저장되었습니다."
            : "국가 추천이 완료되었습니다.",
        data: {
          isExisting: false,
          recommendationId: savedRecommendationId,
          profileId: profileId || null,
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
        },
      });
    } catch (error) {
      console.error("국가 추천 처리 오류:", error);

      res.status(500).json({
        success: false,
        message: "국가 추천 처리 중 서버 오류가 발생했습니다.",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
);

// 인증된 사용자용 국가 추천 (결과 저장)
export const getCountryRecommendationsForUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { profileId } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "인증이 필요합니다.",
      });
    }

    // profileId가 필수로 제공되어야 함
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "profileId가 필요합니다.",
      });
    }

    // 해당 프로필 조회
    const userProfile = await UserProfile.findOne({
      _id: profileId,
      user: req.user._id,
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "프로필을 찾을 수 없습니다.",
      });
    }

    // 이미 해당 프로필에 대한 추천 결과가 있는지 확인
    const existingRecommendation = await CountryRecommendationResult.findOne({
      user: req.user._id,
      profile: profileId,
    }).sort({ createdAt: -1 });

    if (existingRecommendation) {
      return res.status(200).json({
        success: true,
        message: "이미 추천받은 이력입니다.",
        data: {
          isExisting: true,
          recommendationId: existingRecommendation._id,
          profileId: profileId,
          createdAt: existingRecommendation.createdAt,
        },
      });
    }

    // UserProfile을 UserCareerProfile로 변환
    const careerProfile: UserCareerProfile = {
      language: userProfile.language,
      expectedSalary: userProfile.desiredSalary
        ? parseInt(userProfile.desiredSalary.replace(/[^0-9]/g, ""))
        : 50000,
      jobField: userProfile.desiredJob
        ? {
            code: "2", // 기본값으로 "전문가" 설정
            nameKo: userProfile.desiredJob.mainCategory || "기타",
            nameEn: "Professionals",
          }
        : {
            code: "2",
            nameKo: "기타",
            nameEn: "Other",
          },
      priorities: req.body.priorities || {
        first: "language",
        second: "salary",
        third: "job",
      },
    };

    // 입력 데이터 검증
    const validationError = validateUserProfile(careerProfile);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    try {
      // 국가 추천 서비스 호출
      const recommendations: CountryRecommendation[] =
        await CountryRecommendationService.getTopCountryRecommendations(
          careerProfile
        );

      // 추천 결과 저장
      const savedResult = new CountryRecommendationResult({
        user: req.user._id,
        profile: userProfile._id,
        recommendations: recommendations.map((rec, index) => ({
          country: rec.country.name,
          score: rec.totalScore,
          rank: index + 1,
          details: {
            economicScore: rec.breakdown.languageScore,
            employmentScore: rec.breakdown.jobScore,
            languageScore: rec.breakdown.languageScore,
            salaryScore: rec.breakdown.salaryScore,
          },
          economicData: {
            gdpPerCapita: rec.country.gdpPerCapita || 0,
            employmentRate: rec.country.employmentRate || 0,
            averageSalary: 0, // 현재 타입에 없음
          },
          countryInfo: {
            region: rec.country.region,
            languages: rec.country.languages,
            population: rec.country.population || 0,
          },
        })),
      });

      await savedResult.save();

      res.status(200).json({
        success: true,
        message: "국가 추천이 완료되고 저장되었습니다.",
        data: {
          isExisting: false,
          recommendationId: savedResult._id,
          profileId: profileId,
          userProfile: {
            language: careerProfile.language,
            expectedSalary: careerProfile.expectedSalary,
            jobField: careerProfile.jobField,
            priorities: careerProfile.priorities,
          },
          recommendations,
          appliedWeights: {
            first: 0.5,
            second: 0.3,
            third: 0.2,
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("국가 추천 처리 오류:", error);

      res.status(500).json({
        success: false,
        message: "국가 추천 처리 중 서버 오류가 발생했습니다.",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
);

// 사용자 프로필 검증 함수
function validateUserProfile(profile: UserCareerProfile): string | null {
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
  const validISCOCodes: string[] = JOB_FIELDS.map((field) => field.code);
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
  if (!SUPPORTED_LANGUAGES.includes(profile.language as any)) {
    return "지원되는 언어를 선택해주세요.";
  }

  return null; // 검증 통과
}
