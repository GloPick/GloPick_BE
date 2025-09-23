import axios from "axios";

const GPT_API_URL = process.env.GPT_API_URL!;
const API_KEY = process.env.API_KEY!;

// 도시 3개 추천 GPT 호출
export const getCityRecommendations = async (input: any) => {
  const {
    selectedCountry,
    budget,
    duration,
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
- 예산: ${budget}
- 거주 기간: ${duration}
- 운전면허: ${hasLicense ? "보유" : "없음"}
- 취업 형태: ${jobTypes.join(", ")}
- 필수 편의시설: ${requiredFacilities.join(", ")}
- 동반 가족: 배우자 ${accompanyingFamily.spouse}명, 자녀 ${
    accompanyingFamily.children
  }명, 부모 ${accompanyingFamily.parents}명
- 비자 상태: ${visaStatus}
- 기타: ${additionalNotes || "없음"}

⚠️ 아래 JSON 형식 그대로만 한글로 응답하세요:

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
    selectedCity,
    budget,
    duration,
    hasLicense,
    jobTypes,
    requiredFacilities,
    accompanyingFamily,
    visaStatus,
    additionalNotes,
  } = input;

  const accompanyingFamilyText = `${
    accompanyingFamily.hasFamily ? "있음" : "없음"
  }${
    accompanyingFamily.hasFamily && accompanyingFamily.familyComposition
      ? ` (${accompanyingFamily.familyComposition})`
      : ""
  }`;

  const prompt = `
사용자 조건:
- 도시: ${selectedCity}
- 예산: ${budget}
- 기간: ${duration}
- 운전면허: ${hasLicense ? "보유" : "없음"}
- 취업 형태: ${jobTypes.join(", ")}
- 필수 편의시설: ${requiredFacilities.join(", ")}
- 비자 상태: ${visaStatus}
- 동반 가족: ${accompanyingFamilyText}
- 기타: ${additionalNotes || "없음"}

아래 항목을 포함하여 현실적인 시뮬레이션을 JSON 형식으로 응답하세요:

⚠️ 반드시 아래 예시 형식의 JSON으로만 응답하세요.
⚠️ 반드시 모든 키는 **쌍따옴표(")**로 감싸세요.
단, 값은 사용자의 조건을 바탕으로 평가하여 예시 값을 따라하지말고 실제 값으로 작성해야 합니다.


{
  "simulation": {
    "recommendedCity": "도시명",
    "localInfo": {
      "publicTransport": "버스와 지하철이 주요 교통수단입니다.",
      "safetyLevel": "대한민국과 비교하여 치안이 조금 낮으니 주의 필요",
      "climateSummary": "사계절이 뚜렷하며 겨울에 눈이 자주 내림",
      "koreanCommunity": "한인 마트와 한식당이 밀집된 지역이 있음",
      "essentialFacilities": ["가까운 대형 병원명", "가까운 대형 마트명", "가까운 대사관명"],
      "culturalTips": "현지인은 정시에 민감하고 예절을 중시함",
      "warnings": "겨울철 눈길 교통사고 다발지역 주의"
    },

    "estimatedMonthlyCost": {
      "housing": "60만원",
      "food": "30만원",
      "transportation": "10만원",
      "etc": "20만원",
      "total": "120만원",
      "oneYearCost": "1440만원",
      "costCuttingTips": "공공 교통 패스 이용 추천, 중고 가구 활용",
      "cpi" : "대한민국 보다 1.5배 정도 물가가 낮은 편입니다."
    },

    "nearestAirport": {
      "name": "인천국제공항",
      "city": "인천",
      "code": "ICN"
    },

    "initialSetup": {
      "shortTermHousingOptions": ["호텔", "호스텔", "에어비앤비"],
      "longTermHousingPlatforms": ["Zumper", "Immoweb"],
      "mobilePlan": "선불 심카드가 편리함 (예: Lycamobile)",
      "bankAccount": "여권과 주소 증빙만으로 계좌 개설 가능"
    },

    "jobReality": {
      "commonJobs": "사용자가 희망하는 직종과 관련된 직종 중 추천하는 직종",
      "jobSearchPlatforms": ["Indeed", "LinkedIn", "Workopolis"],
      "languageRequirement": "영어 중급 이상 필수 또는 일본어 기초 필요",
      "visaLimitationTips": "취업 비자는 고용주 스폰서 필요"
    },

    "culturalIntegration": {
      "koreanPopulationRate": "전체 인구의 약 1.2% 이므로 타국가에 비해 한국인이 많은 편",
      "foreignResidentRatio": "15%",
      "koreanResourcesLinks": ["https://korea-center.ca", "https://hanin.ca"]
    },
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
