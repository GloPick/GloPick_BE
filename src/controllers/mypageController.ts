import { Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import UserProfile from "../models/UserProfile";
import SimulationInput from "../models/simulationInput";
import GptRecommendation from "../models/gptRecommendation";
import { AuthRequest } from "../middlewares/authMiddleware";
import SimulationResult from "../models/simulationResult";

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
  // 각 이력에 대한 GPT 추천 결과 id 찾기
  const resultsWithResponseId = await Promise.all(
    profiles.map(async (profile) => {
      const recommendation = await GptRecommendation.findOne({
        profile: profile._id,
      }).select("_id");

      const profileObj = profile.toObject() as any;
      const user = profileObj.user;

      return {
        profileId: profileObj._id,
        user: {
          userId: profileObj.user?._id || null,
          name: profileObj.user?.name || null,
          email: profileObj.user?.email || null,
        },

        education: profileObj.education,
        experience: profileObj.experience,
        skills: profileObj.skills,
        languages: profileObj.languages,
        desiredSalary: profileObj.desiredSalary,
        desiredJob: profileObj.desiredJob,
        additionalNotes: profileObj.additionalNotes,
        responseId: recommendation?._id || null,
      };
    })
  );

  res.status(200).json({
    code: 200,
    message: "이력 정보 조회 성공",
    data: resultsWithResponseId,
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
    "education",
    "experience",
    "skills",
    "languages",
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
    education: profileObj.education,
    experience: profileObj.experience,
    skills: profileObj.skills,
    languages: profileObj.languages,
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
  // 관련 GPT 추천 삭제
  const recommendations = await GptRecommendation.find({ profile: profileId });
  await GptRecommendation.deleteMany({ profile: profileId });

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

// GPT 추천 결과 조회 API
export const getGptRecommendations = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const results = await GptRecommendation.find({ user: req.user!._id })
      .populate("profile", "-__v")
      .sort({ createdAt: -1 });

    if (!results || results.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "저장된 추천 결과가 없습니다.",
        data: null,
      });
    }

    const formattedResults = results.map((result) => {
      const obj = result.toObject() as any;

      return {
        recommendationId: obj._id,
        profile: {
          education: obj.profile?.education || null,
          experience: obj.profile?.experience || null,
          skills: obj.profile?.skills || [],
          languages: obj.profile?.languages || [],
          desiredSalary: obj.profile?.desiredSalary || null,
          desiredJob: obj.profile?.desiredJob || null,
          additionalNotes: obj.profile?.additionalNotes || null,
        },
        rankings: (obj.rankings || []).map((r: any) => ({
          country: r.country,
          job: r.job,
          reason: r.reason,
        })),
      };
    });

    res.status(200).json({
      code: 200,
      message: "추천 결과 조회 성공",
      data: formattedResults,
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: "조회 실패", data: null });
  }
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
    res.status(500).json({ code: 500, message: "서버 오류", data: null });
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
        languageLevel: obj.languageLevel,
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

// 특정 이력별 GPT 추천 결과 조회 API
export const getGptRecommendationByProfileId = async (
  req: AuthRequest,
  res: Response
) => {
  const { profileId } = req.params;

  try {
    const recommendation = await GptRecommendation.findOne({
      user: req.user!._id,
      profile: profileId,
    }).populate("profile", "-__v");

    if (!recommendation) {
      return res.status(404).json({
        code: 404,
        message: "해당 이력에 대한 추천 결과가 없습니다.",
        data: null,
      });
    }

    const recObj = recommendation.toObject() as any;
    const rankings = (recObj.rankings || []).map((r: any) => ({
      country: r.country,
      job: r.job,
      reason: r.reason,
    }));

    const formatted = {
      recommendationId: recObj._id,
      profileId: recObj.profile?._id || null,
      education: recObj.profile?.education || null,
      experience: recObj.profile?.experience || null,
      skills: recObj.profile?.skills || [],
      languages: recObj.profile?.languages || [],
      desiredSalary: recObj.profile?.desiredSalary || null,
      desiredJob: recObj.profile?.desiredJob || null,
      additionalNotes: recObj.profile?.additionalNotes || null,
      rankings,
    };

    res.status(200).json({
      code: 200,
      message: "추천 결과 조회 성공",
      data: formatted,
    });
  } catch (error) {
    console.error("GPT 추천 결과 조회 실패:", error);
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
