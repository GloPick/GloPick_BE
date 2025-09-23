import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import SimulationInput from "../models/simulationInput";
import SimulationResult from "../models/simulationResult";
import GptRecommendation from "../models/gptRecommendation";
import {
  generateSimulationResponse,
  getCityRecommendations,
} from "../services/gptsimulationService";
import { createFlightLinks } from "../utils/flightLinkGenerator";
import { getBudgetSuitability } from "../services/gptMigrationAssessmentService";
import { calculateMigrationSuitability } from "../services/gptCalculation";
import SimulationList from "../models/simulationList";

// 언어 능력 평가 함수
const assessLanguageLevel = (languageAbility: any[]): string => {
  if (!languageAbility || languageAbility.length === 0) {
    return "부족함";
  }

  // 영어 능력을 우선적으로 확인
  const englishAbility = languageAbility.find(
    (lang) => lang.language === "English"
  );
  if (englishAbility) {
    switch (englishAbility.level) {
      case "원어민":
      case "상급":
        return "우수함";
      case "중급":
        return "보통";
      case "초급":
        return "부족함";
      default:
        return "부족함";
    }
  }

  // 영어가 없으면 다른 언어 중 가장 높은 수준으로 평가
  const maxLevel = Math.max(
    ...languageAbility.map((lang) => {
      switch (lang.level) {
        case "원어민":
          return 4;
        case "상급":
          return 3;
        case "중급":
          return 2;
        case "초급":
          return 1;
        default:
          return 0;
      }
    })
  );

  if (maxLevel >= 3) return "우수함";
  if (maxLevel >= 2) return "보통";
  return "부족함";
};

// 시뮬레이션 점수 계산
const getSimulationScoreValues = async (
  simulationInputId: string,
  userId: string
) => {
  const simulationInput = await SimulationInput.findOne({
    _id: simulationInputId,
    user: userId,
  }).lean();

  if (!simulationInput) throw new Error("시뮬레이션 입력 정보 없음");

  const UserProfile = (await import("../models/UserProfile")).default;
  const userProfile = await UserProfile.findById(
    simulationInput.profile
  ).lean();
  if (!userProfile) throw new Error("사용자 이력 정보 없음");

  const migrationAssessment = await getBudgetSuitability(simulationInput);

  // UserProfile에서 언어 능력 가져옴
  const languageAssessment = assessLanguageLevel(userProfile.languages);

  const migrationSuitability = calculateMigrationSuitability({
    languageLevel: languageAssessment,
    visaStatus: migrationAssessment.visaLevel,
    budgetSuitabilityLevel: migrationAssessment.budgetLevel,
    hasCompanion: migrationAssessment.accompanyLevel ?? "부족함",
  });

  return { migrationSuitability };
};

// 사용자 입력 저장
export const saveSimulationInput = async (req: AuthRequest, res: Response) => {
  try {
    const { recommendationId, profileId } = req.params;
    const {
      selectedRankIndex,
      budget,
      duration,
      hasLicense,
      jobTypes,
      requiredFacilities,
      accompanyingFamily,
      visaStatus,
      departureAirport,
      additionalNotes,
    } = req.body;

    // 추천 결과에서 선택한 국가 추출
    const recommendation = await GptRecommendation.findOne({
      _id: recommendationId,
      user: req.user!._id,
    });

    if (!recommendation || !recommendation.rankings[selectedRankIndex]) {
      return res.status(404).json({
        code: 404,
        message: "선택한 추천 결과를 찾을 수 없습니다.",
        data: null,
      });
    }

    const selectedCountry = recommendation.rankings[selectedRankIndex].country;
    // 이미 시뮬레이션을 실행했던 추가 이력인지 확인
    const isDuplicate = await SimulationInput.findOne({
      user: req.user!._id,
      profile: profileId,
      selectedCountry,
      budget,
      duration,
      hasLicense,
      jobTypes: { $all: jobTypes },
      requiredFacilities: { $all: requiredFacilities },
      accompanyingFamily,
      visaStatus,
      departureAirport,
      additionalNotes,
    });

    if (isDuplicate) {
      return res.status(400).json({
        code: 400,
        message: "이미 동일한 조건으로 시뮬레이션 입력이 존재합니다.",
        data: {
          inputId: isDuplicate._id,
        },
      });
    }

    const input = await SimulationInput.create({
      user: req.user!._id,
      profile: profileId,
      selectedCountry,
      budget,
      duration,
      hasLicense,
      jobTypes,
      requiredFacilities,
      accompanyingFamily,
      visaStatus,
      departureAirport,
      additionalNotes,
    });

    const inputId = input._id;

    res.status(201).json({
      code: 201,
      message: "시뮬레이션 입력 정보 저장 완료",
      data: {
        inputId,
        selectedCountry,
        budget,
        duration,
        hasLicense,
        jobTypes,
        requiredFacilities,
        accompanyingFamily,
        visaStatus,
        departureAirport,
        additionalNotes,
      },
    });
  } catch (error) {
    console.error("입력 저장 실패:", error);
    res.status(500).json({ code: 500, message: "저장 실패", data: null });
  }
};

// 도시 추천
export const recommendCities = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const input = await SimulationInput.findOne({
      _id: id,
      user: req.user!._id,
    });

    if (!input) {
      return res.status(404).json({
        code: 404,
        message: "입력 정보를 찾을 수 없습니다.",
        data: null,
      });
    }
    // 중복 처리
    if (input.recommendedCities && input.recommendedCities.length > 0) {
      return res.status(400).json({
        code: 400,
        message: "이미 도시 추천이 완료된 입력입니다.",
        data: {
          recommendedCities: input.recommendedCities,
          inputId: input._id,
        },
      });
    }

    const cities = await getCityRecommendations(input); // GPT 호출 → 도시 3개 추천

    input.recommendedCities = cities.map((city: { name: string }) => city.name);

    await input.save();

    res.status(200).json({
      code: 200,
      message: "도시 추천 성공",
      data: cities,
    });
  } catch (error) {
    console.error("도시 추천 실패:", error);
    res.status(500).json({ code: 500, message: "GPT 호출 실패", data: null });
  }
};

// 도시 선택 후 시뮬레이션 생성 & 저장
export const generateAndSaveSimulation = async (
  req: AuthRequest,
  res: Response
) => {
  const { id } = req.params;
  const { selectedCityIndex } = req.body;

  try {
    const input = await SimulationInput.findOne({
      _id: id,
      user: req.user!._id,
    });

    if (!input || !Array.isArray(input.recommendedCities)) {
      return res.status(404).json({
        code: 404,
        message: "입력 정보 또는 추천 도시 목록을 찾을 수 없습니다.",
        data: null,
      });
    }

    if (
      typeof selectedCityIndex !== "number" ||
      !input.recommendedCities[selectedCityIndex]
    ) {
      return res.status(400).json({
        code: 400,
        message: "유효한 도시 인덱스가 필요합니다.",
        data: null,
      });
    }

    const existing = await SimulationResult.findOne({
      input: input._id,
      user: req.user!._id,
    });

    if (existing) {
      return res.status(200).json({
        code: 200,
        message: "이미 생성된 시뮬레이션입니다.",
        data: {
          simulationId: existing._id,
          result: {
            country: existing.country,
            ...existing.result,
          },
          flightLinks: createFlightLinks(
            input.departureAirport,
            input.selectedCity ?? input.recommendedCities[0]
          ),
        },
      });
    }

    const selectedCity = input.recommendedCities[selectedCityIndex];
    input.selectedCity = selectedCity;
    await input.save();

    const gptResult = await generateSimulationResponse(input);
    const arrivalAirportCode = gptResult?.nearestAirport?.code || selectedCity;

    const flightLinks = createFlightLinks(
      input.departureAirport,
      arrivalAirportCode
    );

    const { ...restResult } = gptResult;

    const saved = await SimulationResult.create({
      user: req.user!._id,
      input: id,
      country: input.selectedCountry,
      result: {
        ...restResult,
      },
    });

    const recommendation = await GptRecommendation.findOne({
      user: req.user!._id,
      "rankings.country": input.selectedCountry, // 국가 기준으로 찾기
    });

    const matchedRanking = recommendation?.rankings.find(
      (r: any) => r.country === input.selectedCountry
    );
    const desiredJob = matchedRanking?.job || "미지정";
    const { migrationSuitability } = await getSimulationScoreValues(
      input._id.toString(),
      req.user!._id.toString()
    );

    const isAlreadyExist = await SimulationList.findOne({
      user: req.user!._id,
      job: desiredJob,
      country: input.selectedCountry,
      city: selectedCity,
    });

    if (!isAlreadyExist) {
      await SimulationList.create({
        user: req.user!._id,
        job: desiredJob,
        country: input.selectedCountry,
        city: selectedCity,
        migrationSuitability: migrationSuitability,
      });
    }

    const simulationId = saved._id;
    const savedObj = saved.toObject();
    const formatted = {
      simulationId,
      result: {
        country: savedObj.country,
        ...savedObj.result,
      },
      flightLinks,
    };

    res.status(201).json({
      code: 201,
      message: "시뮬레이션 생성 및 저장 완료",
      data: formatted,
    });
  } catch (error) {
    console.error("시뮬레이션 생성 실패:", error);
    res.status(500).json({
      code: 500,
      message: "GPT 호출 또는 저장 실패",
      data: null,
    });
  }
};

// 시뮬레이션 결과 + 항공권 링크 반환
export const getSimulationFlightLinks = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const simulation = await SimulationInput.findOne({
      _id: id,
      user: req.user!._id,
    });

    if (!simulation) {
      return res.status(404).json({
        code: 404,
        message: "시뮬레이션 입력 정보를 찾을 수 없습니다.",
        data: null,
      });
    }

    if (!simulation.departureAirport || !simulation.selectedCity) {
      return res.status(400).json({
        code: 400,
        message: "출발 공항 또는 선택 도시 정보가 없습니다.",
        data: null,
      });
    }

    const flightLinks = createFlightLinks(
      simulation.departureAirport,
      simulation.selectedCity
    );

    res.status(200).json({
      code: 200,
      message: "항공권 링크 생성 완료",
      data: {
        simulation: {
          _id: simulation._id,
          departureAirport: simulation.departureAirport,
          selectedCity: simulation.selectedCity,
        },
        flightLinks,
      },
    });
  } catch (error) {
    console.error("항공권 링크 생성 실패:", error);
    res.status(500).json({
      code: 500,
      message: "서버 오류",
      data: null,
    });
  }
};

// 취업 가능성 및 이주 추천도 점수 API
export const calculateSimulationScores = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { simulationInputId } = req.params;
    const { migrationSuitability } = await getSimulationScoreValues(
      simulationInputId,
      req.user!._id.toString()
    );
    res.status(200).json({
      code: 200,
      message: "점수 계산 성공",
      data: {
        migrationSuitability,
      },
    });
  } catch (error) {
    console.error("점수 계산 실패:", error);
    res.status(500).json({
      code: 500,
      message: "오류 발생",
      data: null,
    });
  }
};

// 시뮬레이션 요약보기
export const getSimulationList = async (req: AuthRequest, res: Response) => {
  try {
    const simulations = await SimulationList.find({ user: req.user!._id }).sort(
      { createdAt: -1 }
    );

    res.status(200).json({
      code: 200,
      message: "시뮬레이션 요약 조회 성공",
      data: simulations,
    });
  } catch (error) {
    console.error("시뮬레이션 요약 조회 실패:", error);
    res.status(500).json({
      code: 500,
      message: "시뮬레이션 요약 조회 실패",
    });
  }
};
