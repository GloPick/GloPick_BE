import { Response } from "express";
import bcrypt from "bcryptjs";
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
    res
      .status(200)
      .json({ code: 200, message: "사용자 정보 조회 성공", data: user });
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

  if (name) user.name = name;
  if (email) user.email = email;
  if (birth) user.birth = birth;
  if (phone) user.phone = phone;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  await user.save();

  res
    .status(200)
    .json({ code: 200, message: "사용자 정보 수정 성공", data: user });
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

      return {
        ...profile.toObject(),
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
  res.status(200).json({
    code: 200,
    message: "이력 정보 수정 성공",
    data: profile,
  });
};
// 사용자 이력 삭제 API
export const deleteProfile = async (req: AuthRequest, res: Response) => {
  const profile = await UserProfile.findOneAndDelete({
    _id: req.params.id,
    user: req.user!._id,
  });

  if (!profile) {
    return res
      .status(404)
      .json({ code: 404, message: "이력을 찾을 수 없습니다.", data: null });
  }

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

    res.status(200).json({
      code: 200,
      message: "추천 결과 조회 성공",
      data: results,
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

    res.status(200).json({
      code: 200,
      message: "시뮬레이션 결과 조회 성공",
      data: simulations,
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

    res.status(200).json({
      code: 200,
      message: "입력 조건 조회 성공",
      data: inputs,
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

    res.status(200).json({
      code: 200,
      message: "추천 결과 조회 성공",
      data: recommendation,
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

    res.status(200).json({
      code: 200,
      message: "시뮬레이션 결과 조회 성공",
      data: simulations,
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
