import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import SimulationInput from "../models/simulationInput";
import SimulationResult from "../models/simulationResult";
import UserProfile from "../models/UserProfile";
import {
  generateSimulationResponse,
  getCityRecommendations,
  getSimpleCityRecommendations,
  getDetailedCityRecommendations,
} from "../services/gptsimulationService";
import { createFlightLinks } from "../utils/flightLinkGenerator";
import SimulationList from "../models/simulationList";
import { JOB_FIELDS } from "../constants/dropdownOptions";

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

// 시뮬레이션 추가 정보 입력 및 저장 (도시 선택 후)
export const saveSimulationInput = async (req: AuthRequest, res: Response) => {
  try {
    const {
      inputId,
      selectedCity,
      initialBudget,
      requiredFacilities,
      departureAirport,
    } = req.body;

    // 기본 SimulationInput 조회
    const input = await SimulationInput.findOne({
      _id: inputId,
      user: req.user!._id,
    });

    if (!input) {
      return res.status(404).json({
        code: 404,
        message: "입력 정보를 찾을 수 없습니다.",
        data: null,
      });
    }

    // 선택한 도시 검증 (인덱스 또는 도시명 지원)
    if (selectedCity === undefined || selectedCity === null) {
      return res.status(400).json({
        code: 400,
        message: "도시를 선택해주세요.",
        data: null,
      });
    }

    let actualSelectedCity: string;

    // 숫자인 경우 인덱스로 처리
    if (!isNaN(Number(selectedCity))) {
      const cityIndex = Number(selectedCity);
      if (
        cityIndex < 0 ||
        cityIndex >= (input.recommendedCities?.length || 0)
      ) {
        return res.status(400).json({
          code: 400,
          message: "유효하지 않은 도시 인덱스입니다.",
          data: null,
        });
      }
      actualSelectedCity = input.recommendedCities![cityIndex];
    } else {
      // 문자열인 경우 도시명으로 처리
      if (!input.recommendedCities?.includes(selectedCity)) {
        return res.status(400).json({
          code: 400,
          message: "추천된 도시 중에서 선택해주세요.",
          data: null,
        });
      }
      actualSelectedCity = selectedCity;
    }

    // 초기 예산 검증
    if (!initialBudget) {
      return res.status(400).json({
        code: 400,
        message: "초기 정착 예산을 입력해주세요.",
        data: null,
      });
    }

    // 필수 편의시설 검증
    if (!requiredFacilities || requiredFacilities.trim() === "") {
      return res.status(400).json({
        code: 400,
        message: "필요한 시설 및 서비스를 입력해주세요.",
        data: null,
      });
    }

    // 출발 공항 검증
    if (!departureAirport) {
      return res.status(400).json({
        code: 400,
        message: "출발 공항을 선택해주세요.",
        data: null,
      });
    }

    // 추가 정보 업데이트
    input.selectedCity = actualSelectedCity;
    input.initialBudget = initialBudget;
    input.requiredFacilities = requiredFacilities;
    input.departureAirport = departureAirport;

    await input.save();

    res.status(201).json({
      code: 201,
      message: "시뮬레이션 입력 정보 저장 성공",
      data: {
        inputId: input._id,
        selectedCountry: input.selectedCountry,
        selectedCity: input.selectedCity,
        initialBudget: input.initialBudget,
        requiredFacilities: input.requiredFacilities,
        departureAirport: input.departureAirport,
      },
    });
  } catch (error) {
    console.error("시뮬레이션 입력 저장 실패:", error);
    res.status(500).json({ code: 500, message: "저장 실패", data: null });
  }
};

// 도시 추천 (국가 추천 이후 바로 실행)
// 도시 추천 (국가 추천 이후 바로 실행)
export const recommendCities = async (req: AuthRequest, res: Response) => {
  const { recommendationId, profileId } = req.params;
  const { selectedCountryIndex } = req.body;

  try {
    // 국가 추천 결과 조회
    const CountryRecommendationResult =
      require("../models/countryRecommendationResult").default;
    const recommendation = await CountryRecommendationResult.findOne({
      _id: recommendationId,
      user: req.user!._id,
      profile: profileId,
    });

    if (!recommendation) {
      return res.status(404).json({
        code: 404,
        message: "추천 결과를 찾을 수 없습니다.",
        data: null,
      });
    }

    // 선택된 인덱스 검증
    if (
      selectedCountryIndex < 0 ||
      selectedCountryIndex >= recommendation.recommendations.length
    ) {
      return res.status(400).json({
        code: 400,
        message: "유효하지 않은 국가 인덱스입니다.",
        data: null,
      });
    }

    const selectedCountry =
      recommendation.recommendations[selectedCountryIndex].country;

    // 프로필 정보 조회
    const profile = await UserProfile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        code: 404,
        message: "프로필을 찾을 수 없습니다.",
        data: null,
      });
    }

    // GPT를 통한 상세 도시 추천 (ISCO 코드 사용)
    const jobCode = profile.desiredJob || "2"; // 기본값: 전문가
    const jobField =
      JOB_FIELDS.find((field) => field.code === jobCode) || JOB_FIELDS[1];
    const userJob = jobField.nameKo;
    const userLanguage = profile.language;
    const cityRecommendations = await getSimpleCityRecommendations(
      selectedCountry,
      userJob || undefined,
      userLanguage || undefined
    );

    // 기본 SimulationInput 생성 (추후 추가 정보 입력용)
    const newInput = new SimulationInput({
      user: req.user!._id,
      profile: profileId,
      selectedCountry,
      recommendedCities: cityRecommendations.map((city: any) => city.name),
      // 초기 예산 등은 아직 입력하지 않음
    });

    await newInput.save();

    res.status(200).json({
      code: 200,
      message: "도시 추천 성공",
      data: {
        inputId: newInput._id,
        selectedCountry,
        recommendedCities: cityRecommendations,
      },
    });
  } catch (error) {
    console.error("도시 추천 실패:", error);
    res.status(500).json({
      code: 500,
      message: "GPT 호출 실패",
      data: null,
    });
  }
};

// 도시 선택 후 시뮬레이션 생성 & 저장
export const generateAndSaveSimulation = async (
  req: AuthRequest,
  res: Response
) => {
  const { id } = req.params;
  const {
    selectedCityIndex,
    initialBudget,
    requiredFacilities,
    departureAirport,
  } = req.body;

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

    // 필수 필드 검증
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

    if (!initialBudget) {
      return res.status(400).json({
        code: 400,
        message: "초기 정착 예산을 입력해주세요.",
        data: null,
      });
    }

    if (!requiredFacilities || requiredFacilities.trim() === "") {
      return res.status(400).json({
        code: 400,
        message: "필요한 시설 및 서비스를 입력해주세요.",
        data: null,
      });
    }

    if (!departureAirport) {
      return res.status(400).json({
        code: 400,
        message: "출발 공항을 선택해주세요.",
        data: null,
      });
    }

    // 이미 생성된 시뮬레이션 확인
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
            departureAirport,
            input.selectedCity ?? input.recommendedCities[selectedCityIndex]
          ),
        },
      });
    }

    // SimulationInput 업데이트
    const selectedCity = input.recommendedCities[selectedCityIndex];
    input.selectedCity = selectedCity;
    input.initialBudget = initialBudget;
    input.requiredFacilities = requiredFacilities;
    input.departureAirport = departureAirport;
    await input.save();

    const gptResult = await generateSimulationResponse(input);
    const arrivalAirportCode = gptResult?.nearestAirport?.code || selectedCity;

    const flightLinks = createFlightLinks(departureAirport, arrivalAirportCode);

    const { ...restResult } = gptResult;

    const saved = await SimulationResult.create({
      user: req.user!._id,
      input: id,
      country: input.selectedCountry,
      result: {
        ...restResult,
      },
    });

    // 사용자 프로필에서 직무 정보 가져오기 (ISCO 코드 사용)
    const userProfile = await UserProfile.findOne({
      _id: input.profile,
      user: req.user!._id,
    });

    const jobCode = userProfile?.desiredJob || "2"; // 기본값: 전문가
    const jobField =
      JOB_FIELDS.find((field) => field.code === jobCode) || JOB_FIELDS[1];
    const desiredJob = jobField.nameKo;

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

// 새로운 플로우: 국가 선택 후 GPT를 통한 도시 추천
export const selectCountryAndGetCities = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { selectedCountry, profileId } = req.body;

    if (!selectedCountry || !profileId) {
      return res.status(400).json({
        code: 400,
        message: "선택한 국가와 프로필 ID가 필요합니다.",
        data: null,
      });
    }

    const profile = await UserProfile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        code: 404,
        message: "프로필을 찾을 수 없습니다.",
        data: null,
      });
    }

    // GPT를 통한 도시 추천 (ISCO 코드 사용)
    const jobCode = profile.desiredJob || "2"; // 기본값: 전문가
    const jobField =
      JOB_FIELDS.find((field) => field.code === jobCode) || JOB_FIELDS[1];
    const recommendedCities = await getDetailedCityRecommendations(
      selectedCountry,
      jobField.nameKo,
      profile.language
    );

    res.status(200).json({
      code: 200,
      message: "도시 추천이 완료되었습니다.",
      data: {
        selectedCountry,
        recommendedCities,
        profileId,
      },
    });
  } catch (error) {
    console.error("도시 추천 실패:", error);
    res.status(500).json({
      code: 500,
      message: "도시 추천 중 오류가 발생했습니다.",
      data: null,
    });
  }
};
