import { Request, Response } from "express";
import { GuestProfile } from "../types/guestProfile";
import { getGPTResponse } from "../services/gptService";

// 비회원 GPT 기반 국가 추천
export const recommendCountriesForGuest = async (
  req: Request,
  res: Response
) => {
  try {
    const { languages, desiredSalary, desiredJob, additionalNotes } = req.body;

    const guestProfile: GuestProfile = {
      languages,
      desiredSalary,
      desiredJob,
      additionalNotes,
    };

    const recommendedCountries = await getGPTResponse(guestProfile);

    res.status(200).json({
      code: 200,
      message: "국가 추천 완료",
      data: {
        recommendedCountries,
      },
    });
  } catch (error) {
    console.error("비회원 국가 추천 오류:", error);
    res.status(500).json({
      code: 500,
      message: "국가 추천 실패",
    });
  }
};
