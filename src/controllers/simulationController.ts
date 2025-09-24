import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import SimulationInput from "../models/simulationInput";
import SimulationResult from "../models/simulationResult";
import UserProfile from "../models/UserProfile";
import {
  generateSimulationResponse,
  getCityRecommendations,
} from "../services/gptsimulationService";
import { createFlightLinks } from "../utils/flightLinkGenerator";
import { getBudgetSuitability } from "../services/gptMigrationAssessmentService";
import { calculateMigrationSuitability } from "../services/gptCalculation";
import SimulationList from "../models/simulationList";

// 언어 능력 평가 함수 (단일 언어로 변경)
const assessLanguageLevel = (language: string): string => {
  if (!language || language.trim() === "") {
    return "부족함";
  }

  // 영어인 경우 우수함으로 평가
  if (language === "English") {
    return "우수함";
  }

  // 기타 주요 언어들은 보통으로 평가
  const majorLanguages = ["German", "French", "Spanish", "Japanese", "Chinese"];
  if (majorLanguages.includes(language)) {
    return "보통";
  }

  // 한국어나 기타 언어는 부족함으로 평가 (해외 이주 관점에서)
  return "부족함";
};

// 사용자 입력 저장
export const saveSimulationInput = async (req: AuthRequest, res: Response) => {
  try {
    const { profileId } = req.params;
    const {
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
    } = req.body;

    // 선택한 국가 검증
    if (!selectedCountry) {
      return res.status(400).json({
        code: 400,
        message: "국가를 선택해주세요.",
        data: null,
      });
    }

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

    // 사용자 프로필에서 직무 정보 가져오기 (GPT 추천 대신)
    const userProfile = await UserProfile.findOne({
      _id: input.profile,
      user: req.user!._id,
    });

    const desiredJob = userProfile?.desiredJob?.mainCategory || "미지정";

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
