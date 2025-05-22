import axios from "axios";
const GPT_API_URL = process.env.GPT_API_URL as string;
const API_KEY = process.env.API_KEY; // 환경변수 파일에 설정했다고 가정

// 프롬프트 생성
function getMigrationAssessmentPrompt(input: any): string {
  const {
    selectedCountry,
    budget,
    duration,
    languageLevel,
    accompanyingFamily,
    visaStatus,
  } = input;

  return `
당신은 이주 컨설턴트입니다. 아래 조건을 참고하여 예산이 해당 국가에서 생활에 적절한지를 판단해 주세요.

조건:
- 국가: ${selectedCountry}
- 예산: ${budget}만원
- 거주 기간: ${duration}
- 언어 능력: ${languageLevel}
- 동반 가족: ${accompanyingFamily}
- 비자 상태: ${visaStatus.join(", ")}

다음 중 하나의 값으로 평가:
"매우 적합", "적당함", "부족함", "매우 부족함"
**아래와 같이 반드시 JSON 형식으로 정확하게 응답해 주세요.**
동반가족은 0명-"매우 적합", 1명-"적당함", 2명-"부족함", 3명 이상-"매우 부족함"으로 표시해주세요.
모든 키와 문자열 값은 **반드시 큰따옴표(")**로 감싸야 합니다.
⚠️ "반드시 JSON만 출력하세요. 설명 없이 JSON 객체만 출력하세요. 다른 텍스트를 포함하지 마세요."


응답 형식 (JSON):
{
  "budgetLevel": "적당함",
  "languageability": "매우 적합",
  "accompanyLevel": "적당함",
  "visaLevel": "매우 부족함",
}
`;
}

// GPT 호출 함수
export async function getBudgetSuitability(input: any): Promise<{
  budgetLevel: string;
  languageability: string;
  accompanyLevel: string;
  visaLevel: string;
}> {
  const prompt = getMigrationAssessmentPrompt(input);

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
