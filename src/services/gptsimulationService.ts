import axios from "axios";

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
}`;

  const response = await axios.post(
    process.env.GPT_API_URL!,
    {
      model: "gpt-4",
      messages: [
        { role: "system", content: "당신은 도시 이주 추천 전문가입니다." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0,
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
사용자 조건:
- 도시: ${selectedCity}
- 예산: ${budget}만원
- 기간: ${duration}
- 운전면허: ${hasLicense ? "보유" : "없음"}
- 취업 형태: ${jobTypes.join(", ")}
- 필수 편의시설: ${requiredFacilities.join(", ")}
- 언어 능력: ${languageLevel}
- 비자 상태: ${visaStatus.join(", ")}
- 동반 가족: ${accompanyingFamily.join(", ") || "없음"}
- 기타: ${additionalNotes || "없음"}

아래 항목을 포함하여 현실적인 시뮬레이션을 JSON 형식으로 응답하세요:

⚠️ 반드시 아래 예시 형식의 JSON으로만 응답하세요.


{
  "simulation": {
    "recommendedCity": "도시명",
    "localInfo": {
      "publicTransport": "교통 요약",
      "safetyLevel": "치안 수준",
      "climateSummary": "기후 요약",
      "essentialFacilities": ["병원", "마트", "은행"]
    },
    "initialSetup": {
      "shortTermHousingOptions": ["호텔", "에어비앤비"],
      "longTermHousingPlatforms": ["Zumper", "Immoweb"]
    },
    "jobReality": {
      "commonJobs": ["요식업", "물류"],
      "jobSearchPlatforms":
       ["Indeed", "LinkedIn"]
    },
    "culturalIntegration": {
      "koreanResourcesLinks": ["https://korean-community.com"],
      "culturalIntegrationPrograms": ["언어교류", "지역 커뮤니티"]
    }
  }
}

`;

  const systemMessage = `당신은 해외 이주 시뮬레이션 전문가입니다. 사용자 조건을 바탕으로 실제적이고 현실적인 데이터를 제공합니다.`;

  const response = await axios.post(
    process.env.GPT_API_URL!,
    {
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const gptRaw = response.data?.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(gptRaw);
    const simulation = parsed.simulation;

    if (!simulation) {
      throw new Error("GPT 응답에 simulation 항목이 없습니다.");
    }

    return {
      ...simulation,
    };
  } catch (err) {
    console.error("GPT 응답 파싱 실패:", err);
    console.error("GPT 응답 원본:", gptRaw);
    throw new Error("시뮬레이션 생성에 실패했습니다. 다시 시도해주세요.");
  }
};
