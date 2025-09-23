import { Request, Response } from "express";
import UserProfile from "../models/UserProfile";
import { AuthRequest } from "../middlewares/authMiddleware";
import { getGPTResponse } from "../services/gptService";
import GptRecommendation from "../models/gptRecommendation";
import { Types } from "mongoose";

// 사용자 이력 등록 (POST /api/profile)
export const createProfile = async (req: AuthRequest, res: Response) => {
  const {
    languages,
    desiredSalary,
    desiredJob,
    additionalNotes,
  } = req.body;

  // 이전 이력과 동일한 내용이면 등록 불가
  const normalize = (value: string) => (value || "").trim().toLowerCase();

  // 언어 능력 비교 함수
  const compareLanguageAbility = (a: any[], b: any[]) => {
    if (!a || !b || a.length !== b.length) return false;
    const sortedA = a.sort((x, y) => x.language.localeCompare(y.language));
    const sortedB = b.sort((x, y) => x.language.localeCompare(y.language));
    return sortedA.every(
      (val, i) =>
        val.language === sortedB[i].language && val.level === sortedB[i].level
    );
  };

  // 직무 카테고리 비교 함수
  const compareJobCategory = (a: any, b: any) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.mainCategory === b.mainCategory && a.subCategory === b.subCategory;
  };

  const existingProfiles = await UserProfile.find({ user: req.user!._id });

  const isDuplicate = existingProfiles.find((profile) => {
    return (
      compareLanguageAbility(profile.languages, languages) &&
      profile.desiredSalary === desiredSalary &&
      compareJobCategory(profile.desiredJob, desiredJob) &&
      normalize(profile.additionalNotes || "") ===
        normalize(additionalNotes || "")
    );
  });

  if (isDuplicate) {
    return res.status(400).json({
      code: 400,
      message: "이전 이력과 내용이 동일합니다. 등록이 불가합니다.",
      data: {
        profileId: isDuplicate._id,
      },
    });
  }

  const profile = await UserProfile.create({
    user: req.user!._id,
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
        data: {
          recommendationId: existingRecommendation._id,
          profileId: profile._id,
        },
      });
    }

    // GPT 호출 및 추천 결과 저장
    const gptResponse = await getGPTResponse(profile);

    const recommendation = await GptRecommendation.create({
      user: req.user!._id,
      profile: profile._id,
      rankings: gptResponse.rankings,
    });

    res.status(200).json({
      code: 200,
      message: "GPT 응답 생성 성공",
      data: { gptResponse, recommendationId: recommendation._id },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ code: 500, message: "GPT 응답 생성 실패", data: null });
  }
};
