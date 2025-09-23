import axios from "axios";
const GPT_API_URL = process.env.GPT_API_URL as string;
const API_KEY = process.env.API_KEY;
// 사용자의 이력 정보를 기반으로 GPT 프롬프트를 조합
const createPrompt = (userData: any) => {
  const { languages, desiredSalary, desiredJob, additionalNotes } = userData;

  // 언어 능력을 문자열로 변환
  const languagesString =
    languages
      ?.map((lang: any) => `${lang.language}(${lang.level})`)
      .join(", ") || "없음";
  const languagesSentence = `언어는 ${languagesString}을(를) 구사할 수 있습니다.`;

  const salarySentence = `희망 연봉은 ${desiredSalary}입니다.`;

  // 직무 카테고리를 문자열로 변환
  const jobString =
    desiredJob?.mainCategory && desiredJob?.subCategory
      ? `${desiredJob.mainCategory} - ${desiredJob.subCategory}`
      : "명시되지 않음";
  const jobSentence = `희망 직업은 ${jobString}입니다.`;

  const additionalNotesSentence = additionalNotes
    ? `추가 희망사항: ${additionalNotes}`
    : "";

  const prompt = `${languagesSentence} ${salarySentence} ${jobSentence} ${additionalNotesSentence}`;

  return prompt;
};

// GPT API에 요청 보내는 함수
export const getGPTResponse = async (profile: any) => {
  const prompt = createPrompt(profile);

  try {
    const response = await axios.post(
      GPT_API_URL,
      {
        model: "gpt-4", // GPT-4 모델 사용
        messages: [
          {
            role: "system",
            content: `당신은 경력 기반으로 대한민국을 제외한 해외의 직업을 추천해주는 도우미입니다. 
        사용자의 정보를 바탕으로 아래 JSON 형식 그대로만 응답하세요:

{
  "rankings": [
    {
      "country": "국가명",
      "job": "추천 직업",
      "reason": "간단한 이유"
    },
    {
      "country": "국가명",
      "job": "추천 직업",
      "reason": "간단한 이유"
    },
    {
      "country": "국가명",
      "job": "추천 직업",
      "reason": "간단한 이유"
    }
  ]
}

⚠️ 위 JSON 형식 외에는 절대 아무것도 출력하지 마세요.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],

        max_tokens: 500,
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const gptRaw = response.data?.choices?.[0]?.message?.content;
    let gptParsed;

    try {
      gptParsed = JSON.parse(gptRaw);
    } catch (err) {
      console.error("GPT 응답 JSON 파싱 실패:", err);
      throw new Error("잘못된 형식의 GPT 응답입니다.");
    }

    return gptParsed;
  } catch (error) {
    console.error("Error calling GPT API:", error);
    throw error;
  }
};
