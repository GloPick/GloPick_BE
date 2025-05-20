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
import {
  calculateEmploymentProbability,
  calculateMigrationSuitability,
} from "../services/gptCalculation";

// 사용자 입력 저장
export const saveSimulationInput = async (req: AuthRequest, res: Response) => {
  try {
    const { recommendationId, profileId } = req.params;
    const {
      selectedRankIndex,
      budget,
      duration,
      languageLevel,
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
      languageLevel,
      hasLicense,
      jobTypes: { $all: jobTypes, $size: jobTypes.length },
      requiredFacilities: {
        $all: requiredFacilities,
        $size: requiredFacilities.length,
      },
      accompanyingFamily: {
        $all: accompanyingFamily,
        $size: accompanyingFamily.length,
      },
      visaStatus: { $all: visaStatus, $size: visaStatus.length },
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
      languageLevel,
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
        languageLevel,
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

    const selectedCity = input.recommendedCities[selectedCityIndex];
    input.selectedCity = selectedCity;
    await input.save();

    const gptResult = await generateSimulationResponse(input);
    const arrivalAirportCode = gptResult?.nearestAirport?.code || selectedCity;

    const flightLinks = createFlightLinks(
      input.departureAirport,
      arrivalAirportCode
    );

    // 취업 가능성 및 이주 추천도 부분 리팩토링 필요!!!!!!!!!!!!!!!!!!!!!!!!!
    // 취업 가능성
    const employmentProbability = calculateEmploymentProbability({
      jobDemand: 0.8,
      foreignAcceptance: 0.7,
      specPreparation: 0.9,
    });

    const totalCost = parseFloat(gptResult.estimatedMonthlyCost?.total || "0");
    const budgetSuitability =
      totalCost > 0
        ? input.budget > totalCost
          ? 1.0
          : input.budget === totalCost
          ? 0.7
          : 0.3
        : 0.7;

    const familySuitability =
      input.accompanyingFamily && input.accompanyingFamily.length > 0
        ? 1.0
        : 0.5;

    const communitySupport =
      gptResult.culturalIntegration?.koreanResourcesLinks?.length > 0
        ? 1.0
        : 0.3;

    //이주 추천도
    const migrationSuitability = calculateMigrationSuitability({
      languageLevel: input.languageLevel,
      visaType: input.visaStatus[0],
      budgetSuitability,
      familySuitability,
      communitySupport,
      employmentProbability,
    });

    const { ...restResult } = gptResult;

    const saved = await SimulationResult.create({
      user: req.user!._id,
      input: id,
      country: input.selectedCountry,
      result: {
        ...restResult,
        employmentProbability,
        migrationSuitability,
      },
    });

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
