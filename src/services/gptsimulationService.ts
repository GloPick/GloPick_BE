import axios from "axios";
import SimulationInput from "../models/simulationInput";

const GPT_API_URL = process.env.GPT_API_URL!;
const API_KEY = process.env.API_KEY!;

// 도시 3개 추천 GPT 호출
export const getCityRecommendations = async (input: any) => {
  const {
    selectedCountry,
    budget,
    duration,
    languageLevel,
    hasLicense,
    jobTypes,
    requiredFacilities,
    accompanyingFamily,
    visaStatus,
    additionalNotes,
  } = input;

  const prompt = `
당신은 ${selectedCountry} 이주 전문가입니다.

아래 조건을 바탕으로 ${selectedCountry} 내에서 이주 정착하기 좋은 도시 3곳을 추천해주세요. 각 도시에 대해 요약된 특징을 함께 제공하세요.

조건:
- 예산: ${budget}만원
- 거주 기간: ${duration}
- 언어 능력: ${languageLevel}
- 운전면허: ${hasLicense ? "보유" : "없음"}
- 취업 형태: ${jobTypes.join(", ")}
- 필수 편의시설: ${requiredFacilities.join(", ")}
- 동반 가족: ${accompanyingFamily.join(", ") || "없음"}
- 비자 상태: ${visaStatus.join(", ")}
- 기타: ${additionalNotes || "없음"}

⚠️ 아래 JSON 형식 그대로만 응답하세요:

{
  "cities": [
    { "name": "도시명1", "summary": "한 줄 요약" },
    { "name": "도시명2", "summary": "한 줄 요약" },
    { "name": "도시명3", "summary": "한 줄 요약" }
  ]
}
`;

  const response = await axios.post(
    process.env.GPT_API_URL!,
    {
      model: "gpt-4",
      messages: [
        { role: "system", content: "당신은 도시 이주 추천 전문가입니다." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const gptRaw = response.data?.choices?.[0]?.message?.content;
  const parsed = JSON.parse(gptRaw);
  return parsed.cities;
};

// 선택된 도시 기반 시뮬레이션 GPT 호출
export const generateSimulationResponse = async (input: any) => {
  const {
    selectedCountry,
    selectedCity,
    budget,
    duration,
    languageLevel,
    hasLicense,
    jobTypes,
    requiredFacilities,
    accompanyingFamily,
    visaStatus,
    additionalNotes,
  } = input;

  const prompt = `
  당신은 ${selectedCountry}의 ${selectedCity}로 이주를 고려 중인 사용자를 위한 시뮬레이션 전문가입니다.
  조건:
- 도시: ${selectedCity}
- 초기 예산: ${budget}만원
- 거주 기간: ${duration}
- 언어 능력: ${languageLevel}
- 운전면허: ${hasLicense ? "보유" : "없음"}
- 희망 취업 형태: ${jobTypes.join(", ")}
- 필수 편의시설: ${requiredFacilities.join(", ")}
- 동반 가족: ${accompanyingFamily.join(", ") || "없음"}
- 비자 상태: ${visaStatus.join(", ")}
- 기타: ${additionalNotes || "없음"} `;

  const systemMessage = `당신은 사용자의 해외 정착 조건을 분석하여 현실적인 이주 시뮬레이션을 작성하는 전문가입니다.

아래는 사용자의 조건입니다. 이를 바탕으로 아래 JSON 형식 그대로만 응답하세요:

{
  "simulation": {
    "recommendedCity": "추천 도시명",
    "estimatedMonthlyCost": {
      "housing": "주거 비용 (만원)",
      "food": "식비 (만원)",
      "transportation": "교통비 (만원)",
      "etc": "기타 생활비 (만원)",
      "total": "총합 (만원)"
    },
    "jobOpportunity": "추천 직종 및 취업 가능성 설명",
    "culturalTips": "문화, 언어, 생활 팁",
    "warnings": "주의해야 할 점 및 유의사항"
      "nearestAirport": {
      "name": "공항 전체 이름",
      "city": "공항이 위치한 도시",
      "code": "공항의 IATA 코드"
    }
  }
}

⚠️ 위 JSON 형식 외에는 절대 아무것도 출력하지 마세요. 설명도 하지 마세요. 반드시 한글로 응답하세요.`;

  const response = await axios.post(
    process.env.GPT_API_URL!,
    {
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  // GPT 응답 파싱
  const gptRaw = response.data?.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(gptRaw);
    return parsed.simulation; // simulation 객체만 반환
  } catch (err) {
    console.error("GPT 응답 JSON 파싱 실패:", err);
    throw new Error("GPT 응답을 파싱할 수 없습니다.");
  }
};
