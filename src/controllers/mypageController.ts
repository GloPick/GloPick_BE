import { Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import UserProfile from "../models/UserProfile";
import SimulationInput from "../models/simulationInput";
import { AuthRequest } from "../middlewares/authMiddleware";
import SimulationResult from "../models/simulationResult";
import CountryRecommendationResult from "../models/countryRecommendationResult";

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
  const profiles = await UserProfile.find({ user: req.user!._id }).populate(
    "user",
    "name email"
  );

  if (!profiles) {
    return res
      .status(404)
      .json({ code: 404, message: "이력 정보가 없습니다.", data: null });
  }
  // 각 이력 정보를 포맷팅
  const formattedProfiles = profiles.map((profile) => {
    const profileObj = profile.toObject() as any;

    return {
      profileId: profileObj._id,
      user: {
        userId: profileObj.user?._id || null,
        name: profileObj.user?.name || null,
        email: profileObj.user?.email || null,
      },
      languages: profileObj.language, // 단일 언어로 변경
      desiredSalary: profileObj.desiredSalary,
      desiredJob: profileObj.desiredJob,
      additionalNotes: profileObj.additionalNotes,
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
    "desiredSalary",
    "desiredJob",
    "additionalNotes",
  ];

  fields.forEach((field) => {
    if (req.body[field]) (profile as any)[field] = req.body[field];
  });

  await profile.save();

  const profileObj = profile.toObject();
  const responseData = {
    profileId: profileObj._id,
    languages: profileObj.language, // 변경된 필드명
    desiredSalary: profileObj.desiredSalary,
    desiredJob: profileObj.desiredJob,
    additionalNotes: profileObj.additionalNotes,
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

// 시뮬레이션 결과 조회 API
export const getUserSimulations = async (req: AuthRequest, res: Response) => {
  try {
    const simulations = await SimulationResult.find({ user: req.user!._id })
      .select("result country createdAt")
      .sort({ createdAt: -1 });

    if (!simulations || simulations.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "시뮬레이션 결과가 없습니다.",
        data: null,
      });
    }

    const formattedSimulations = simulations.map((sim) => {
      const simObj = sim.toObject();
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
      .populate("profile", "language desiredSalary desiredJob additionalNotes")
      .sort({ createdAt: -1 });

    if (!recommendations || recommendations.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "저장된 추천 결과가 없습니다.",
        data: null,
      });
    }

    const formattedRecommendations = recommendations.map((rec) => {
      const recObj = rec.toObject();
      const profile = recObj.profile as any; // populate된 데이터 타입 캐스팅
      return {
        _id: recObj._id,
        profile: {
          language: profile?.language || null,
          desiredSalary: profile?.desiredSalary || null,
          desiredJob: profile?.desiredJob || null,
          additionalNotes: profile?.additionalNotes || null,
        },
        recommendations: recObj.recommendations.map((country: any) => ({
          country: country.country,
          score: country.score,
          rank: country.rank,
          details: country.details,
          economicData: country.economicData,
          countryInfo: country.countryInfo,
        })),
        createdAt: recObj.createdAt,
      };
    });

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
      .populate("profile", "language desiredSalary desiredJob additionalNotes")
      .sort({ createdAt: -1 });

    if (!recommendations || recommendations.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "해당 이력에 대한 추천 결과가 없습니다.",
        data: null,
      });
    }

    const formattedRecommendations = recommendations.map((rec) => {
      const recObj = rec.toObject() as any;
      const profile = recObj.profile || {};
      return {
        _id: recObj._id,
        profile: {
          language: profile.language || null,
          desiredSalary: profile.desiredSalary || null,
          desiredJob: profile.desiredJob || null,
          additionalNotes: profile.additionalNotes || null,
        },
        recommendations: recObj.recommendations.map((country: any) => ({
          country: country.country,
          score: country.score,
          rank: country.rank,
          details: country.details,
          economicData: country.economicData,
          countryInfo: country.countryInfo,
        })),
        createdAt: recObj.createdAt,
      };
    });

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

// 시뮬레이션 전 추가 정보 조회 API
export const getUserSimulationInputs = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const inputs = await SimulationInput.find({ user: req.user!._id }).sort({
      createdAt: -1,
    });

    if (!inputs || inputs.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "입력한 시뮬레이션 조건이 없습니다.",
        data: null,
      });
    }

    const formatted = inputs.map((input) => {
      const obj = input.toObject();

      return {
        inputId: obj._id,
        selectedCountry: obj.selectedCountry,
        budget: obj.budget,
        duration: obj.duration,
        hasLicense: obj.hasLicense,
        jobTypes: obj.jobTypes,
        requiredFacilities: obj.requiredFacilities,
        accompanyingFamily: obj.accompanyingFamily,
        visaStatus: obj.visaStatus,
        additionalNotes: obj.additionalNotes,
        recommendedCities: obj.recommendedCities,
        departureAirport: obj.departureAirport,
        selectedCity: obj.selectedCity,
      };
    });

    res.status(200).json({
      code: 200,
      message: "입력 조건 조회 성공",
      data: formatted,
    });
  } catch (error) {
    console.error("입력 조건 조회 실패:", error);
    res.status(500).json({
      code: 500,
      message: "서버 오류",
      data: null,
    });
  }
};

// 특정 이력별 시뮬레이션 결과 조회 API
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
    }).sort({ createdAt: -1 });

    if (!simulations || simulations.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "해당 이력에 대한 시뮬레이션 결과가 없습니다.",
        data: null,
      });
    }

    const formatted = simulations.map((sim) => {
      const obj = sim.toObject();
      const result = obj.result || {};

      return {
        simulationId: obj._id,
        country: obj.country,
        recommendedCity: result.recommendedCity || null,

        localInfo: result.localInfo || {},
        initialSetup: result.initialSetup || {},
        jobReality: result.jobReality || {},
        culturalIntegration: result.culturalIntegration || {},
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
