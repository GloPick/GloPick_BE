import { Response } from "express";
import User from "../models/User";
import UserProfile from "../models/UserProfile";
import SimulationInput from "../models/simulationInput";
import { AuthRequest } from "../middlewares/authMiddleware";
import SimulationResult from "../models/simulationResult";
import CountryRecommendationResult from "../models/countryRecommendationResult";

// 시뮬레이션 결과 포맷팅 헬퍼 함수
const formatSimulationResult = (simObj: any) => {
  const result = simObj.result || {};
  return {
    simulationId: simObj._id,
    country: simObj.country,
    recommendedCity: result.recommendedCity || null,
    localInfo: result.localInfo || {},
    initialSetup: result.initialSetup || {},
    jobReality: result.jobReality || {},
    culturalIntegration: result.culturalIntegration || {},
  };
};

// 국가 추천 결과 포맷팅 헬퍼 함수
const formatRecommendationResult = (recObj: any) => {
  const profile = recObj.profile || {};
  return {
    _id: recObj._id,
    profile: {
      language: profile.language || null,
      desiredJob: profile.desiredJob || null,
      qualityOfLifeWeights: profile.qualityOfLifeWeights || null,
      weights: profile.weights || null,
    },
    recommendations: recObj.recommendations.map((country: any) => ({
      country: country.country,
      score: country.score,
      rank: country.rank,
      details: {
        languageScore: country.details?.languageScore || 0,
        jobScore: country.details?.jobScore || 0,
        qualityOfLifeScore: country.details?.qualityOfLifeScore || 0,
      },
      economicData: {
        gdpPerCapita: country.economicData?.gdpPerCapita || null,
        employmentRate: country.economicData?.employmentRate || null,
      },
      countryInfo: {
        region: country.countryInfo?.region || null,
        languages: country.countryInfo?.languages || [],
        population: country.countryInfo?.population || null,
      },
    })),
    weights: {
      language: recObj.weights?.language || 0,
      job: recObj.weights?.job || 0,
      qualityOfLife:
        recObj.weights?.qualityOfLife || recObj.weights?.salary || 0,
    },
    createdAt: recObj.createdAt,
  };
};

// 사용자 정보 조회 API
export const getUserInfo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(404)
        .json({ code: 404, message: "사용자를 찾을 수 없음", data: null });
    }

    // 비밀번호 제외한 사용자 정보만 반환
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({
      code: 200,
      message: "사용자 정보 조회 성공",
      data: {
        userId: user!._id,
        name: user!.name,
        email: user!.email,
        birth: user!.birth,
        phone: user!.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: "서버 오류", data: null });
  }
};

// 사용자 정보 수정 API
export const updateUserInfo = async (req: AuthRequest, res: Response) => {
  const { name, email, password, birth, phone } = req.body;

  const user = await User.findById(req.user!._id);
  if (!user) {
    return res
      .status(404)
      .json({ code: 404, message: "사용자를 찾을 수 없음", data: null });
  }

  // 이메일 중복 확인
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        code: 409,
        message: "이미 사용 중인 이메일입니다.",
        data: null,
      });
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (birth) user.birth = birth;
  if (phone) user.phone = phone;
  if (typeof password === "string" && password.trim() !== "") {
    user.password = password.trim();
  }

  await user.save();

  res.status(200).json({
    code: 200,
    message: "사용자 정보 수정 성공",
    data: {
      userId: user._id,
      name: user.name,
      email: user.email,
      birth: user.birth,
      phone: user.phone,
    },
  });
};

// 회원 탈퇴 API
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);

  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "사용자를 찾을 수 없음",
      data: null,
    });
  }

  await user.deleteOne();
  res.status(200).json({
    code: 200,
    message: "회원 탈퇴 완료!",
    data: null,
  });
};

// 사용자 이력 조회 API
export const getProfile = async (req: AuthRequest, res: Response) => {
  const profiles = await UserProfile.find({ user: req.user!._id });

  if (!profiles || profiles.length === 0) {
    return res
      .status(404)
      .json({ code: 404, message: "이력 정보가 없습니다.", data: null });
  }
  // 각 이력 정보를 포맷팅
  const formattedProfiles = profiles.map((profile) => {
    const profileObj = profile.toObject();

    return {
      profileId: profileObj._id,
      language: profileObj.language,
      desiredJob: profileObj.desiredJob,
      qualityOfLifeWeights: {
        income: profileObj.qualityOfLifeWeights?.income || 0,
        jobs: profileObj.qualityOfLifeWeights?.jobs || 0,
        health: profileObj.qualityOfLifeWeights?.health || 0,
        lifeSatisfaction:
          profileObj.qualityOfLifeWeights?.lifeSatisfaction || 0,
        safety: profileObj.qualityOfLifeWeights?.safety || 0,
      },
      weights: {
        languageWeight: profileObj.weights?.languageWeight || 0,
        jobWeight: profileObj.weights?.jobWeight || 0,
        qualityOfLifeWeight: profileObj.weights?.qualityOfLifeWeight || 0,
      },
      createdAt: profileObj.createdAt,
    };
  });

  res.status(200).json({
    code: 200,
    message: "이력 정보 조회 성공",
    data: formattedProfiles,
  });
};
// 사용자 이력 수정 API
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const profile = await UserProfile.findOne({
    _id: req.params.id,
    user: req.user!._id,
  });

  if (!profile) {
    return res
      .status(404)
      .json({ code: 404, message: "이력을 찾을 수 없습니다.", data: null });
  }

  const fields = [
    "language", // 변경된 필드명
    "desiredJob",
    "qualityOfLifeWeights",
    "weights",
  ];

  fields.forEach((field) => {
    if (req.body[field]) (profile as any)[field] = req.body[field];
  });

  await profile.save();

  const profileObj = profile.toObject();
  const responseData = {
    profileId: profileObj._id,
    languages: profileObj.language, // 변경된 필드명
    desiredJob: profileObj.desiredJob,
    qualityOfLifeWeights: profileObj.qualityOfLifeWeights,
    weights: profileObj.weights,
  };

  res.status(200).json({
    code: 200,
    message: "이력 정보 수정 성공",
    data: responseData,
  });
};
// 사용자 이력 삭제 API
export const deleteProfile = async (req: AuthRequest, res: Response) => {
  const profileId = req.params.id;
  const profile = await UserProfile.findOneAndDelete({
    _id: profileId,
    user: req.user!._id,
  });

  if (!profile) {
    return res
      .status(404)
      .json({ code: 404, message: "이력을 찾을 수 없습니다.", data: null });
  }

  // 관련 SimulationInput 삭제
  const inputs = await SimulationInput.find({ profile: profileId });
  const inputIds = inputs.map((input) => input._id);
  await SimulationInput.deleteMany({ profile: profileId });

  // 관련 SimulationResult 삭제
  await SimulationResult.deleteMany({ input: { $in: inputIds } });

  res.status(200).json({
    code: 200,
    message: "이력 삭제 완료",
    data: null,
  });
};

// 시뮬레이션 결과 조회 API (입력 정보 포함)
export const getUserSimulations = async (req: AuthRequest, res: Response) => {
  try {
    const simulations = await SimulationResult.find({ user: req.user!._id })
      .populate("input")
      .sort({ createdAt: -1 });

    if (!simulations || simulations.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "시뮬레이션 결과가 없습니다.",
        data: null,
      });
    }

    const formattedSimulations = simulations.map((sim) => {
      const simObj = sim.toObject() as any;
      const inputObj = simObj.input as any;
      const result = (simObj.result || {}) as any;

      return {
        _id: simObj._id,
        // 입력 정보
        input: {
          inputId: inputObj?._id || null,
          selectedCountry: inputObj?.selectedCountry || null,
          selectedCity: inputObj?.selectedCity || null,
          initialBudget: inputObj?.initialBudget || null,
          requiredFacilities: inputObj?.requiredFacilities || [],
          departureAirport: inputObj?.departureAirport || null,
          recommendedCities: inputObj?.recommendedCities || [],
        },
        // 시뮬레이션 결과
        country: simObj.country,
        result: {
          recommendedCity: result.recommendedCity || null,
          localInfo: result.localInfo || {},
          estimatedMonthlyCost: result.estimatedMonthlyCost || {},
          initialSetup: result.initialSetup || {},
          jobReality: result.jobReality || {},
          culturalIntegration: result.culturalIntegration || {},
          facilityLocations: result.facilityLocations || {},
        },
        createdAt: simObj.createdAt,
      };
    });

    res.status(200).json({
      code: 200,
      message: "시뮬레이션 결과 조회 성공",
      data: formattedSimulations,
    });
  } catch (error) {
    console.error("시뮬레이션 결과 조회 실패:", error);
    res.status(500).json({
      code: 500,
      message: "서버 오류",
      data: null,
    });
  }
};

// API 기반 국가 추천 결과 목록 조회 API
export const getUserRecommendations = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const recommendations = await CountryRecommendationResult.find({
      user: req.user!._id,
    })
      .populate("profile", "language desiredJob qualityOfLifeWeights weights")
      .sort({ createdAt: -1 });

    if (!recommendations || recommendations.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "저장된 추천 결과가 없습니다.",
        data: null,
      });
    }

    const formattedRecommendations = recommendations.map((rec) =>
      formatRecommendationResult(rec.toObject())
    );

    res.status(200).json({
      code: 200,
      message: "추천 결과 조회 성공",
      data: formattedRecommendations,
    });
  } catch (error) {
    console.error("추천 결과 조회 실패:", error);
    res.status(500).json({
      code: 500,
      message: "서버 오류",
      data: null,
    });
  }
};

// 특정 이력의 API 기반 국가 추천 결과 조회 API
export const getRecommendationsByProfileId = async (
  req: AuthRequest,
  res: Response
) => {
  const { profileId } = req.params;

  try {
    const recommendations = await CountryRecommendationResult.find({
      user: req.user!._id,
      profile: profileId,
    })
      .populate("profile", "language desiredJob qualityOfLifeWeights weights")
      .sort({ createdAt: -1 });

    if (!recommendations || recommendations.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "해당 이력에 대한 추천 결과가 없습니다.",
        data: null,
      });
    }

    const formattedRecommendations = recommendations.map((rec) =>
      formatRecommendationResult(rec.toObject())
    );

    res.status(200).json({
      code: 200,
      message: "추천 결과 조회 성공",
      data: formattedRecommendations,
    });
  } catch (error) {
    console.error("특정 이력 추천 결과 조회 실패:", error);
    res.status(500).json({
      code: 500,
      message: "서버 오류",
      data: null,
    });
  }
};

// 특정 이력별 시뮬레이션 결과 조회 API (입력 정보 포함)
export const getSimulationsByProfileId = async (
  req: AuthRequest,
  res: Response
) => {
  const { profileId } = req.params;

  try {
    const inputs = await SimulationInput.find({
      user: req.user!._id,
      profile: profileId,
    });

    const inputIds = inputs.map((input) => input._id);

    const simulations = await SimulationResult.find({
      user: req.user!._id,
      input: { $in: inputIds },
    })
      .populate("input")
      .sort({ createdAt: -1 });

    if (!simulations || simulations.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "해당 이력에 대한 시뮬레이션 결과가 없습니다.",
        data: null,
      });
    }

    const formatted = simulations.map((sim) => {
      const simObj = sim.toObject() as any;
      const inputObj = simObj.input as any;
      const result = (simObj.result || {}) as any;

      return {
        _id: simObj._id,
        // 입력 정보
        input: {
          inputId: inputObj?._id || null,
          selectedCountry: inputObj?.selectedCountry || null,
          selectedCity: inputObj?.selectedCity || null,
          initialBudget: inputObj?.initialBudget || null,
          requiredFacilities: inputObj?.requiredFacilities || [],
          departureAirport: inputObj?.departureAirport || null,
          recommendedCities: inputObj?.recommendedCities || [],
        },
        // 시뮬레이션 결과
        country: simObj.country,
        result: {
          recommendedCity: result.recommendedCity || null,
          localInfo: result.localInfo || {},
          estimatedMonthlyCost: result.estimatedMonthlyCost || {},
          initialSetup: result.initialSetup || {},
          jobReality: result.jobReality || {},
          culturalIntegration: result.culturalIntegration || {},
          facilityLocations: result.facilityLocations || {},
        },
        createdAt: simObj.createdAt,
      };
    });

    res.status(200).json({
      code: 200,
      message: "시뮬레이션 결과 조회 성공",
      data: formatted,
    });
  } catch (error) {
    console.error("시뮬레이션 결과 조회 실패:", error);
    res.status(500).json({
      code: 500,
      message: "서버 오류",
      data: null,
    });
  }
};
