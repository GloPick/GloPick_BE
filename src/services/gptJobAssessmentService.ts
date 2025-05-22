import axios from "axios";
const GPT_API_URL = process.env.GPT_API_URL as string;
const API_KEY = process.env.API_KEY; // 환경변수 파일에 설정했다고 가정

// 프롬프트 생성
function getJobAssessmentPrompt(userData: any): string {
  const {
    education,
    experience,
    skills,
    languages,
    desiredSalary,
    desiredJob,
    additionalNotes,
  } = userData;

  return `
당신은 이력서 평가 전문가입니다. 아래 사용자의 이력 정보를 기반으로 다음 세 가지를 판단해 주세요.

1. 직업 수요도: 높음, 중간, 낮음, 거의없음
2. 외국인 채용도: 높음, 중간, 낮음, 거의없음
3. 직업 준비 난이도: 쉬움, 보통, 어려움, 불가

이력 정보:
- 학력: ${education}
- 경력: ${experience}
- 기술: ${skills?.join(", ") || "없음"}
- 언어 능력: ${languages?.join(", ") || "없음"}
- 희망 직무: ${desiredJob || "명시되지 않음"}
- 희망 월급: ${desiredSalary || "명시되지 않음"}
- 기타 사항: ${additionalNotes || "없음"}

**아래와 같이 반드시 JSON 형식으로 정확하게 응답해 주세요.**
모든 키와 문자열 값은 **반드시 큰따옴표(")**로 감싸야 합니다.
⚠️ "반드시 JSON만 출력하세요. 설명 없이 JSON 객체만 출력하세요. 다른 텍스트를 포함하지 마세요."

응답 형식 (JSON):
{
  "jobDemandLevel": "높음",
  "foreignAcceptanceLevel": "보통",
  "specPreparationLevel": "보통"
}
`;
}

// GPT 호출 함수
export async function getJobLevelAssessment(userData: any): Promise<{
  jobDemandLevel: string;
  foreignAcceptanceLevel: string;
  specPreparationLevel: string;
}> {
  const prompt = getJobAssessmentPrompt(userData);

  const response = await axios.post(
    GPT_API_URL,
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  const parsed = JSON.parse(response.data.choices[0].message.content);
  return parsed;
}
