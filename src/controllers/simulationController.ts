import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import SimulationInput from "../models/simulationInput";
import SimulationResult from "../models/simulationResult";
import UserProfile from "../models/UserProfile";
import {
  generateSimulationResponse,
  getSimpleCityRecommendations,
} from "../services/gptsimulationService";
import { createFlightLinks } from "../utils/flightLinkGenerator";
import SimulationList from "../models/simulationList";
import { JOB_FIELDS, REQUIRED_FACILITIES } from "../constants/dropdownOptions";
import { searchFacilities, getCityCenter } from "../services/googleMapsService";

// ===== 헬퍼 함수 =====

// 시뮬레이션 입력 검증 헬퍼 함수
const validateSimulationInput = (
  input: any,
  cityIndex: number,
  initialBudget: string,
  requiredFacilities: string[],
  departureAirport: string
): { isValid: boolean; error?: { code: number; message: string } } => {
  // 도시 인덱스 검증
  if (
    isNaN(cityIndex) ||
    cityIndex < 0 ||
    cityIndex >= (input.recommendedCities?.length || 0)
  ) {
    return {
      isValid: false,
      error: {
        code: 400,
        message: "유효하지 않은 도시 인덱스입니다. (0-2 범위)",
      },
    };
  }

  // 초기 예산 검증
  if (!initialBudget) {
    return {
      isValid: false,
      error: { code: 400, message: "초기 정착 예산을 입력해주세요." },
    };
  }

  // 필수 편의시설 검증
  if (!Array.isArray(requiredFacilities) || requiredFacilities.length === 0) {
    return {
      isValid: false,
      error: {
        code: 400,
        message: "필요한 시설을 최소 1개 이상 선택해주세요.",
      },
    };
  }

  if (requiredFacilities.length > 5) {
    return {
      isValid: false,
      error: {
        code: 400,
        message: "필수 편의시설은 최대 5개까지 선택할 수 있습니다.",
      },
    };
  }

  // 유효한 시설인지 검증
  const validFacilities = REQUIRED_FACILITIES.map(
    (f) => f.value
  ) as readonly string[];
  const invalidFacilities = requiredFacilities.filter(
    (f) => !(validFacilities as readonly string[]).includes(f)
  );

  if (invalidFacilities.length > 0) {
    return {
      isValid: false,
      error: {
        code: 400,
        message: `유효하지 않은 시설: ${invalidFacilities.join(", ")}`,
      },
    };
  }

  // 출발 공항 검증
  if (!departureAirport) {
    return {
      isValid: false,
      error: { code: 400, message: "출발 공항을 선택해주세요." },
    };
  }

  return { isValid: true };
};

// 시뮬레이션 추가 정보 입력 및 시뮬레이션 생성 (통합)
export const saveSimulationInput = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // inputId를 parameter로 받음
    const {
      selectedCityIndex,
      initialBudget,
      requiredFacilities,
      departureAirport,
    } = req.body;

    // 기본 SimulationInput 조회
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

    // 선택한 도시 인덱스 검증
    if (selectedCityIndex === undefined || selectedCityIndex === null) {
      return res.status(400).json({
        code: 400,
        message: "도시 인덱스를 입력해주세요.",
        data: null,
      });
    }

    const cityIndex = Number(selectedCityIndex);

    // 통합 검증 실행
    const validation = validateSimulationInput(
      input,
      cityIndex,
      initialBudget,
      requiredFacilities,
      departureAirport
    );

    if (!validation.isValid) {
      return res.status(validation.error!.code).json({
        code: validation.error!.code,
        message: validation.error!.message,
        data: null,
      });
    }

    const actualSelectedCity = input.recommendedCities![cityIndex];

    // 중복 체크: 동일한 조건으로 이미 저장된 입력이 있는지 확인
    // selectedCity가 null이 아닌 완성된 입력들만 조회
    const existingInputs = await SimulationInput.find({
      user: req.user!._id,
      profile: input.profile,
      selectedCountry: input.selectedCountry,
      selectedCity: { $ne: null }, // 완성된 입력만 조회
      initialBudget: { $ne: null },
      departureAirport: { $ne: null },
    });

    // 배열 비교를 위한 정렬된 문자열 비교
    const sortedRequiredFacilities = [...requiredFacilities].sort().join(",");
    const existingInput = existingInputs.find((existing) => {
      // 모든 조건이 일치하는지 확인
      const isSameCity = existing.selectedCity === actualSelectedCity;
      const isSameBudget = existing.initialBudget === initialBudget;
      const isSameAirport = existing.departureAirport === departureAirport;
      const sortedExisting = [...(existing.requiredFacilities || [])]
        .sort()
        .join(",");
      const isSameFacilities = sortedExisting === sortedRequiredFacilities;

      return isSameCity && isSameBudget && isSameAirport && isSameFacilities;
    });

    if (existingInput) {
      // 기존 입력이 있으면 해당 시뮬레이션 결과도 함께 반환
      const existingSimulation = await SimulationResult.findOne({
        input: existingInput._id,
        user: req.user!._id,
      });

      if (existingSimulation) {
        const flightLinks = createFlightLinks(
          existingInput.departureAirport as string,
          existingInput.selectedCity as string
        );

        return res.status(200).json({
          code: 200,
          message: "이미 동일한 조건으로 시뮬레이션이 생성되어 있습니다.",
          data: {
            isExisting: true,
            inputId: existingInput._id,
            simulationId: existingSimulation._id,
            result: {
              country: existingSimulation.country,
              ...existingSimulation.result,
            },
            flightLinks,
          },
        });
      }
    }

    // 추가 정보 업데이트
    input.selectedCity = actualSelectedCity;
    input.initialBudget = initialBudget;
    input.requiredFacilities = requiredFacilities;
    input.departureAirport = departureAirport;

    await input.save();

    // === 바로 시뮬레이션 생성 시작 ===
    console.log("🚀 시뮬레이션 생성 시작...");

    const gptResult = await generateSimulationResponse(input);
    const arrivalAirportCode =
      gptResult?.nearestAirport?.code || actualSelectedCity;

    const flightLinks = createFlightLinks(
      input.departureAirport as string,
      arrivalAirportCode as string
    );

    // Google Maps API로 편의시설 위치 정보 조회
    let facilityLocations = {};
    if (input.requiredFacilities && input.requiredFacilities.length > 0) {
      try {
        facilityLocations = await searchFacilities(
          actualSelectedCity,
          input.selectedCountry,
          input.requiredFacilities
        );
        const foundCount = Object.keys(facilityLocations).length;
        console.log(
          `✅ Google Maps API: ${actualSelectedCity}의 편의시설 위치 조회 완료 (${foundCount}/${input.requiredFacilities.length}개 발견)`
        );
      } catch (error) {
        console.error("Google Maps API 호출 실패:", error);
        // API 실패 시에도 시뮬레이션은 계속 진행
      }
    }

    const { ...restResult } = gptResult;

    const saved = await SimulationResult.create({
      user: req.user!._id,
      input: id,
      country: input.selectedCountry,
      result: {
        ...restResult,
        facilityLocations, // Google Maps 위치 정보 추가
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
      city: actualSelectedCity,
    });

    if (!isAlreadyExist) {
      await SimulationList.create({
        user: req.user!._id,
        job: desiredJob,
        country: input.selectedCountry,
        city: actualSelectedCity,
      });
    }

    const simulationId = saved._id;
    const savedObj = saved.toObject();

    console.log("✅ 시뮬레이션 생성 및 저장 완료");

    res.status(201).json({
      code: 201,
      message: "시뮬레이션 입력 및 생성 완료",
      data: {
        isExisting: false,
        inputId: input._id,
        simulationId,
        result: {
          country: savedObj.country,
          ...savedObj.result,
        },
        flightLinks,
      },
    });
  } catch (error) {
    console.error("시뮬레이션 입력 및 생성 실패:", error);
    res.status(500).json({
      code: 500,
      message: "시뮬레이션 생성 실패",
      data: null,
    });
  }
};

// 도시 추천
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

    // 중복 체크: 동일한 국가로 이미 도시 추천을 받았는지 확인
    const existingInput = await SimulationInput.findOne({
      user: req.user!._id,
      profile: profileId,
      selectedCountry: selectedCountry,
    }).sort({ createdAt: -1 }); // 가장 최근 것

    if (existingInput) {
      console.log("기존 도시 추천 발견:", existingInput._id);
      return res.status(409).json({
        code: 409,
        message: "이미 해당 국가에 대한 도시 추천을 받았습니다.",
        data: {
          isExisting: true,
          inputId: existingInput._id,
          selectedCountry: existingInput.selectedCountry,
          recommendedCities: existingInput.recommendedCities,
        },
      });
    }

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
        isExisting: false,
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
  // 이제 시뮬레이션 생성시에는 request body를 받지 않습니다.
  // 추가 정보(selectedCity, initialBudget, requiredFacilities, departureAirport)는
  // 이전 단계의 saveSimulationInput에서 SimulationInput 문서에 저장되어 있어야 합니다.

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

    // 이미 생성된 시뮬레이션 확인 (조기 체크로 불필요한 검증 방지)
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
            input.departureAirport as string,
            input.selectedCity as string
          ),
        },
      });
    }

    // 생성 시에는 input 문서에 추가 정보가 이미 저장되어 있어야 함
    if (!input.selectedCity) {
      return res.status(400).json({
        code: 400,
        message:
          "선택된 도시 정보(selectedCity)가 없습니다. 먼저 추가 정보 입력을 완료해주세요.",
        data: null,
      });
    }
    if (!input.initialBudget) {
      return res.status(400).json({
        code: 400,
        message:
          "초기 정착 예산(initialBudget)이 없습니다. 먼저 추가 정보 입력을 완료해주세요.",
        data: null,
      });
    }
    if (
      !Array.isArray(input.requiredFacilities) ||
      input.requiredFacilities.length === 0
    ) {
      return res.status(400).json({
        code: 400,
        message:
          "필요한 시설(requiredFacilities)이 없습니다. 먼저 추가 정보 입력을 완료해주세요.",
        data: null,
      });
    }
    if (!input.departureAirport) {
      return res.status(400).json({
        code: 400,
        message:
          "출발 공항(departureAirport)이 없습니다. 먼저 추가 정보 입력을 완료해주세요.",
        data: null,
      });
    }

    const selectedCity = input.selectedCity;

    const gptResult = await generateSimulationResponse(input);
    const arrivalAirportCode = gptResult?.nearestAirport?.code || selectedCity;

    const flightLinks = createFlightLinks(
      input.departureAirport as string,
      arrivalAirportCode as string
    );

    // Google Maps API로 편의시설 위치 정보 조회
    let facilityLocations = {};
    if ((input.requiredFacilities || []).length > 0) {
      try {
        facilityLocations = await searchFacilities(
          selectedCity,
          input.selectedCountry,
          input.requiredFacilities
        );
        const foundCount = Object.keys(facilityLocations).length;
        console.log(
          `✅ Google Maps API: ${selectedCity}의 편의시설 위치 조회 완료 (${foundCount}/${
            (input.requiredFacilities || []).length
          }개 발견)`
        );
      } catch (error) {
        console.error("Google Maps API 호출 실패:", error);
        // API 실패 시에도 시뮬레이션은 계속 진행
      }
    }

    const { ...restResult } = gptResult;

    const saved = await SimulationResult.create({
      user: req.user!._id,
      input: id,
      country: input.selectedCountry,
      result: {
        ...restResult,
        facilityLocations, // Google Maps 위치 정보 추가
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

// Google Maps API 테스트
export const testGoogleMaps = async (req: Request, res: Response) => {
  try {
    const { city, country, facilities } = req.body;

    // 입력 검증
    if (!city || !country || !facilities || !Array.isArray(facilities)) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "city, country, facilities(배열)가 필요합니다.",
        data: null,
      });
    }

    console.log(`🗺️ Google Maps API 테스트 시작: ${city}, ${country}`);

    // 도시 중심 좌표 가져오기
    const mapCenter = await getCityCenter(city, country);
    console.log(`✅ 도시 중심 좌표:`, mapCenter);

    // 편의시설 위치 검색
    const facilityLocations = await searchFacilities(city, country, facilities);
    console.log(`✅ 편의시설 검색 완료:`, Object.keys(facilityLocations));

    res.status(200).json({
      success: true,
      code: 200,
      message: "Google Maps API 테스트 성공",
      data: {
        mapCenter,
        facilityLocations,
        summary: {
          city,
          country,
          facilitiesSearched: facilities.length,
          totalLocationsFound: Object.values(facilityLocations).reduce(
            (sum, arr) => sum + arr.length,
            0
          ),
        },
      },
    });
  } catch (error) {
    console.error("❌ Google Maps API 테스트 실패:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Google Maps API 호출 중 오류가 발생했습니다.",
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
