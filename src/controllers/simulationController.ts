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

// 사용자 입력 저장
export const saveSimulationInput = async (req: AuthRequest, res: Response) => {
  try {
    const {
      recommendationId,
      selectedRankIndex,
      profileId,
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
      return res.status(400).json({
        code: 400,
        message: "선택한 추천 결과를 찾을 수 없습니다.",
        data: null,
      });
    }

    const selectedCountry = recommendation.rankings[selectedRankIndex].country;

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

    res.status(201).json({
      code: 201,
      message: "시뮬레이션 입력 정보 저장 완료",
      data: input,
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

    const cities = await getCityRecommendations(input);

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
  const { selectedCity } = req.body;

  try {
    const input = await SimulationInput.findOne({
      _id: id,
      user: req.user!._id,
    });

    if (!input) {
      return res.status(404).json({
        code: 404,
        message: "시뮬레이션 입력 정보를 찾을 수 없습니다.",
        data: null,
      });
    }

    if (!selectedCity) {
      return res.status(400).json({
        code: 400,
        message: "선택한 도시가 필요합니다.",
        data: null,
      });
    }

    input.selectedCity = selectedCity;
    await input.save();

    const gptResult = await generateSimulationResponse(input);
    const arrivalAirportCode = gptResult?.nearestAirport?.code || selectedCity;

    const flightLinks = createFlightLinks(
      input.departureAirport,
      arrivalAirportCode
    );

    const saved = await SimulationResult.create({
      user: req.user!._id,
      input: id,
      country: input.selectedCountry,
      result: gptResult,
    });

    res.status(201).json({
      code: 201,
      message: "시뮬레이션 생성 및 저장 완료",
      data: {
        simulationResult: saved,
        flightLinks,
      },
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
