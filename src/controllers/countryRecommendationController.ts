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
import CountryRecommendationResult from "../models/countryRecommendationResult";
import UserProfile from "../models/UserProfile";
import { AuthRequest } from "../middlewares/authMiddleware";
import { SUPPORTED_LANGUAGES, JOB_FIELDS } from "../constants/dropdownOptions";

// 연봉 문자열을 숫자로 변환하는 함수
function convertSalaryToNumber(salaryString: string): number {
  const salaryMap: { [key: string]: number } = {
    "2천만 이하": 20000,
    "2천만 ~ 3천만": 25000,
    "3천만 ~ 5천만": 40000,
    "5천만 ~ 7천만": 60000,
    "7천만 ~ 1억": 85000,
    "1억 이상": 120000,
    "기타 (직접 입력)": 50000, // 기본값
  };
  return salaryMap[salaryString] || 50000;
}

// 언어 문자열을 표준화하는 함수
function normalizeLanguage(language: string): string {
  const languageMap: { [key: string]: string } = {
    English: "english",
    Japanese: "japanese",
    Chinese: "chinese",
    German: "german",
    French: "french",
    Spanish: "spanish",
    Korean: "korean",
    Other: "english", // 기본값으로 영어
  };
  return languageMap[language] || "english";
}

// 사용자 프로필 검증 함수
function validateUserProfile(profile: UserCareerProfile): string | null {
  // 필수 필드 검증
  console.log("이력", profile);
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

// 사용자 인증 및 프로필 ID 검증 함수
async function validateUserAndProfile(req: AuthRequest, profileId: string) {
  if (!req.user) {
    throw { status: 401, message: "인증이 필요합니다." };
  }

  if (!profileId) {
    throw { status: 400, message: "프로필 ID가 필요합니다." };
  }

  const dbProfile = await UserProfile.findOne({
    _id: profileId,
    user: req.user._id,
  });

  if (!dbProfile) {
    throw { status: 404, message: "프로필을 찾을 수 없습니다." };
  }

  return dbProfile;
}

// 추천 결과 저장 함수
async function saveRecommendation(
  userId: string,
  profileId: string,
  recommendations: CountryRecommendation[],
  weights: { language: number; salary: number; job: number }
) {
  const savedResult = new CountryRecommendationResult({
    user: userId,
    profile: profileId,
    weights,
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
  return savedResult._id;
}

// 국가 추천 핸들러
export const getCountryRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;

    // URL 파라미터에서 프로필 ID 가져오기
    const profileId = req.params.profileId;

    console.log("===== 국가 추천 요청 시작 =====");
    console.log("프로필 ID:", profileId);
    console.log("사용자 ID:", authReq.user?._id);

    try {
      // 프로필 ID 검증 -> 회원용
      if (!profileId) {
        return res.status(400).json({
          success: false,
          message:
            "프로필 ID가 필요합니다. 게스트 사용자는 /api/guest/recommend를 사용하세요.",
        });
      }

      // 데이터베이스에서 프로필 가져오기
      const dbProfile = await validateUserAndProfile(authReq, profileId);

      // 가중치 검증 (반드시 있어야 함)
      if (
        !dbProfile.weights ||
        dbProfile.weights.languageWeight === undefined ||
        dbProfile.weights.salaryWeight === undefined ||
        dbProfile.weights.jobWeight === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "프로필에 가중치 정보가 없습니다. 프로필을 다시 등록해주세요.",
          data: {
            profileId: profileId,
            currentWeights: dbProfile.weights,
          },
        });
      }

      const weights = {
        language: dbProfile.weights.languageWeight,
        salary: dbProfile.weights.salaryWeight,
        job: dbProfile.weights.jobWeight,
      };

      // 데이터베이스 프로필을 UserCareerProfile 형식으로 변환
      const jobCode = dbProfile.desiredJob || "2"; // 기본값은 "2" (전문가)
      const jobField =
        JOB_FIELDS.find((field) => field.code === jobCode) || JOB_FIELDS[1]; // 기본값: 전문가

      const userProfile = {
        language: normalizeLanguage(dbProfile.language || "English"),
        expectedSalary: dbProfile.desiredSalary
          ? convertSalaryToNumber(dbProfile.desiredSalary)
          : 50000,
        jobField: {
          code: jobField.code,
          nameKo: jobField.nameKo,
          nameEn: jobField.nameEn,
        },
      };

      console.log("추천 요청 프로필:", userProfile);
      console.log("적용된 가중치:", weights);

      // 가중치를 서비스에서 사용할 수 있도록 저장
      saveWeights(weights);

      const recommendations =
        await CountryRecommendationService.getTopCountryRecommendations(
          userProfile
        );

      // 프로필 ID가 있는 경우에만 저장, 없으면 빈 문자열로 처리
      const finalProfileId = profileId || "";

      const savedRecommendationId = await saveRecommendation(
        authReq.user!._id.toString(),
        finalProfileId,
        recommendations,
        weights
      );

      res.status(200).json({
        success: true,
        message: "국가 추천이 완료되고 저장되었습니다.",
        data: {
          isExisting: false,
          recommendationId: savedRecommendationId,
          profileId: profileId || null,
          userProfile,
          recommendations,
          appliedWeights: {
            language: weights.language / 100,
            salary: weights.salary / 100,
            job: weights.job / 100,
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      if ((error as any).status) {
        return res.status((error as any).status).json({
          success: false,
          message: (error as any).message,
        });
      }
      console.error("국가 추천 처리 오류:", error);
      res.status(500).json({
        success: false,
        message: "국가 추천 처리 중 서버 오류가 발생했습니다.",
        error:
          process.env.NODE_ENV === "development"
            ? (error as any).message
            : undefined,
      });
    }
  }
);
