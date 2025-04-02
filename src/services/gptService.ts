import axios from "axios";
const GPT_API_URL = process.env.GPT_API_URL as string;
const API_KEY = process.env.API_KEY;
// 사용자의 이력 정보를 기반으로 GPT 프롬프트를 조합
const createPrompt = (userData: any) => {
  const {
    education,
    experience,
    skills,
    languages,
    desiredSalary,
    desiredJob,
    additionalNotes,
  } = userData;

  const educationSentence = `사용자는 ${education}을(를) 보유하고 있습니다.`;
  const experienceSentence = `경험은 ${experience}입니다.`;
  const skillsSentence = `기술 스택은 ${skills.join(", ")}입니다.`;
  const languagesSentence = `언어는 ${languages.join(
    ", "
  )}을(를) 구사할 수 있습니다.`;
  const salarySentence = `희망 연봉은 ${desiredSalary}만원입니다.`;
  const jobSentence = `희망 직업은 ${desiredJob}입니다.`;
  const additionalNotesSentence = additionalNotes
    ? `추가 희망사항: ${additionalNotes}`
    : "";

  const prompt = `${educationSentence} ${experienceSentence} ${skillsSentence} ${languagesSentence} ${salarySentence} ${jobSentence} ${additionalNotesSentence}`;

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
          Authorization: `Bearer ${API_KEY}`, // API 키를 Authorization 헤더에 포함
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
