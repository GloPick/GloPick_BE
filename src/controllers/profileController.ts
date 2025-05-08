import { Request, Response } from "express";
import UserProfile from "../models/UserProfile";
import { AuthRequest } from "../middlewares/authMiddleware";
import { getGPTResponse } from "../services/gptService";
import GptRecommendation from "../models/gptRecommendation";
import { Types } from "mongoose";

// 사용자 이력 등록 (POST /api/profile)
export const createProfile = async (req: AuthRequest, res: Response) => {
  const {
    education,
    experience,
    skills,
    languages,
    desiredSalary,
    desiredJob,
    additionalNotes,
  } = req.body;

  // 이전 이력과 동일한 내용이면 등록 불가
  const normalize = (value: string) => value?.trim().toLowerCase() || "";

  const normalizeArray = (arr: string[]) =>
    (arr || []).map(normalize).sort().join(",");

  const existingProfiles = await UserProfile.find({ user: req.user!._id });

  const isDuplicate = existingProfiles.some((profile) => {
    return (
      normalize(profile.education) === normalize(education) &&
      normalize(profile.experience) === normalize(experience) &&
      normalizeArray(profile.skills) === normalizeArray(skills) &&
      normalizeArray(profile.languages) === normalizeArray(languages) &&
      profile.desiredSalary === desiredSalary &&
      normalize(profile.desiredJob || "") === normalize(desiredJob) &&
      normalize(profile.additionalNotes || "") ===
        normalize(additionalNotes || "")
    );
  });

  if (isDuplicate) {
    return res.status(400).json({
      code: 400,
      message: "이전 이력과 내용이 동일합니다. 등록이 불가합니다.",
      data: null,
    });
  }

  const profile = await UserProfile.create({
    user: req.user!._id,
    education,
    experience,
    skills,
    languages,
    desiredSalary,
    desiredJob,
    additionalNotes,
  });

  res.status(201).json({
    code: 201,
    message: "이력이 정상적으로 등록되었습니다.",
    data: null,
  });
};

// 사용자 이력 정보와 GPT 요청을 처리하는 함수

export const handleUserProfile = async (req: Request, res: Response) => {
  const userData = req.body; // 사용자가 입력한 데이터

  try {
    // 이력 등록
    const profile = await UserProfile.create({
      user: req.user!._id, // 로그인한 사용자 정보
      ...userData,
    });

    // 이력 정보와 함께 GPT 응답 생성
    const gptResponse = await getGPTResponse(profile);

    await GptRecommendation.create({
      user: req.user!._id,
      profile: profile._id,
      rankings: gptResponse.rankings,
    });

    res.status(201).json({
      code: 201,
      message: "이력 등록 및 GPT 응답 생성 성공",
      data: {
        profile,
        gptResponse,
      },
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: "이력 등록 실패", data: null });
  }
};

// GPT 응답 생성 API
export const generateGPTResponse = async (req: Request, res: Response) => {
  const { id } = req.params; // URL 경로에서 id 추출

  try {
    // ObjectId로 변환
    const profileId = new Types.ObjectId(id); // MongoDB에서 찾을 수 있도록 ObjectId로 변환

    // 해당 이력 찾기, 로그인된 사용자와 매칭되는 데이터만
    const profile = await UserProfile.findOne({
      _id: profileId,
      user: req.user!._id,
    });

    if (!profile) {
      return res
        .status(404)
        .json({ code: 404, message: "이력을 찾을 수 없습니다.", data: null });
    }
    // 이미 추천받은 이력인지 확인
    const existingRecommendation = await GptRecommendation.findOne({
      user: req.user!._id,
      profile: profile._id,
    });

    if (existingRecommendation) {
      return res.status(400).json({
        code: 400,
        message: "이미 추천받은 이력입니다.",
        data: null,
      });
    }

    // GPT 호출 및 추천 결과 저장
    const gptResponse = await getGPTResponse(profile);

    await GptRecommendation.create({
      user: req.user!._id,
      profile: profile._id,
      rankings: gptResponse.rankings,
    });

    res.status(200).json({
      code: 200,
      message: "GPT 응답 생성 성공",
      data: gptResponse,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ code: 500, message: "GPT 응답 생성 실패", data: null });
  }
};
