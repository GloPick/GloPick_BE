import axios from "axios";

const GPT_API_URL = process.env.GPT_API_URL!;
const API_KEY = process.env.API_KEY!;

// 도시 3개 추천 GPT 호출
export const getCityRecommendations = async (input: any) => {
  const {
    selectedCountry,
    initialBudget,
    requiredFacilities,
    departureAirport,
  } = input;

  const prompt = `
당신은 ${selectedCountry} 이주 전문가입니다.

아래 조건을 바탕으로 ${selectedCountry} 내에서 이주 정착하기 좋은 도시 3곳을 추천해주세요. 각 도시에 대해 요약된 특징을 함께 제공하세요.

조건:
- 초기 정착 예산: ${initialBudget}
- 필수 편의시설: ${requiredFacilities}
- 출발 공항: ${departureAirport}

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
  const { selectedCity, initialBudget, requiredFacilities, departureAirport } =
    input;

  // 배열을 문자열로 변환
  const facilitiesStr = Array.isArray(requiredFacilities)
    ? requiredFacilities.join(", ")
    : requiredFacilities;

  const prompt = `
사용자 조건:
- 도시: ${selectedCity}
- 초기 정착 예산: ${initialBudget}
- 필수 편의시설: ${facilitiesStr}
- 출발 공항: ${departureAirport}

⚠️ 반드시 순수한 JSON 형식으로만 응답하세요. 추가 설명이나 마크다운 없이 JSON만 반환하세요.
⚠️ 모든 키는 쌍따옴표로 감싸고, 값은 실제 데이터로 작성하세요.
⚠️ 응답을 완성하세요. 중간에 끊기면 안 됩니다.

{
  "simulation": {
    "recommendedCity": "${selectedCity}",
    "localInfo": {
      "essentialFacilities": ["요청받은 시설들을 배열로"],
      "publicTransport": "교통수단 설명 (1-2문장)",
      "safetyLevel": "치안 수준 (1문장)",
      "climateSummary": "기후 설명 (1문장)",
      "koreanCommunity": "한인 커뮤니티 정보 (1문장)",
      "culturalTips": "문화 팁 (1문장)",
      "warnings": "주의사항 (1문장)"
    },
    "estimatedMonthlyCost": {
      "housing": "금액",
      "food": "금액",
      "transportation": "금액",
      "etc": "금액",
      "total": "금액",
      "oneYearCost": "금액",
      "costCuttingTips": "절약 팁 (1문장)",
      "cpi": "한국 대비 물가 비교 (1문장)"
    },
    "initialSetup": {
      "shortTermHousingOptions": ["옵션1", "옵션2", "옵션3"],
      "longTermHousingPlatforms": ["플랫폼1", "플랫폼2"],
      "mobilePlan": "통신 정보 (1문장)",
      "bankAccount": "계좌 개설 정보 (1문장)"
    },
    "jobReality": {
      "jobSearchPlatforms": ["플랫폼1", "플랫폼2", "플랫폼3"],
      "languageRequirement": "언어 요구사항 (1문장)",
      "visaLimitationTips": "비자 관련 팁 (1문장)"
    },
    "culturalIntegration": {
      "koreanPopulationRate": "한국인 비율 정보",
      "foreignResidentRatio": "외국인 비율",
      "koreanResourcesLinks": ["링크1", "링크2"]
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
      max_tokens: 3000, // 토큰 수 증가
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
    // JSON 코드 블록 제거 (```json ... ``` 형태로 온 경우)
    let cleanedResponse = gptRaw.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?$/g, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
    }

    // JSON 파싱 시도
    const parsed = JSON.parse(cleanedResponse);
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

    // finish_reason 확인
    const finishReason = response.data?.choices?.[0]?.finish_reason;
    if (finishReason === "length") {
      throw new Error("GPT 응답이 너무 길어 잘렸습니다. 다시 시도해주세요.");
    }

    throw new Error("시뮬레이션 생성에 실패했습니다. 다시 시도해주세요.");
  }
};

// 간단한 도시 3개 추천 (국가만으로 추천)
export const getSimpleCityRecommendations = async (
  selectedCountry: string,
  userJob?: string,
  userLanguage?: string
) => {
  const prompt = `
당신은 ${selectedCountry} 이주 전문가입니다.

${selectedCountry}에서 이주 정착하기 좋은 도시 3곳을 추천해주세요.
${userJob ? `사용자 희망 직업: ${userJob}` : ""}
${userLanguage ? `사용자 언어 능력: ${userLanguage}` : ""}

각 도시마다 구체적인 이유와 장점을 포함한 상세한 설명을 제공해주세요.

⚠️ 아래 JSON 형식 그대로만 한글로 응답하세요:

{
  "cities": [
    { 
      "name": "도시명1", 
      "summary": "이 도시를 추천하는 구체적인 이유와 장점을 포함한 상세 설명 (2-3문장)" 
    },
    { 
      "name": "도시명2", 
      "summary": "이 도시를 추천하는 구체적인 이유와 장점을 포함한 상세 설명 (2-3문장)" 
    },
    { 
      "name": "도시명3", 
      "summary": "이 도시를 추천하는 구체적인 이유와 장점을 포함한 상세 설명 (2-3문장)" 
    }
  ]
}`;

  try {
    const response = await axios.post(
      GPT_API_URL,
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: "당신은 도시 이주 추천 전문가입니다." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const gptRaw = response.data?.choices?.[0]?.message?.content;
    const parsedResponse = JSON.parse(gptRaw);

    return parsedResponse.cities;
  } catch (error) {
    console.error("도시 추천 GPT 호출 실패:", error);
    throw new Error("도시 추천에 실패했습니다. 다시 시도해주세요.");
  }
};

// GPT를 통한 상세 도시 추천 함수
export async function getDetailedCityRecommendations(
  country: string,
  jobField: string,
  language: string
): Promise<
  Array<{
    name: string;
    reason: string;
    advantages: string[];
    jobOpportunities: string;
  }>
> {
  try {
    const prompt = `
${country}에서 ${jobField} 직종으로 취업을 희망하는 한국인에게 가장 적합한 도시 3곳을 추천해주세요.

사용자 정보:
- 희망 직종: ${jobField}
- 구사 언어: ${language}
- 국적: 한국

요청사항:
1. 해당 직종에 가장 적합한 도시 3곳을 순위별로 추천
2. 각 도시별로 추천 이유를 구체적으로 설명 (3-4문장)
3. 각 도시의 주요 장점 3-4개 나열
4. 해당 직종의 취업 기회에 대한 구체적인 설명
5. 한국어로 응답

응답 형식 (JSON):
{
  "cities": [
    {
      "name": "도시명",
      "reason": "이 도시를 추천하는 구체적인 이유 (3-4문장으로 상세히)",
      "advantages": ["장점1", "장점2", "장점3", "장점4"],
      "jobOpportunities": "해당 직종의 취업 기회에 대한 구체적인 설명"
    }
  ]
}
`;

    const response = await axios.post(
      GPT_API_URL,
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "당신은 해외 취업 전문 컨설턴트입니다. 각 도시의 특성과 취업 시장을 잘 알고 있으며, 구체적이고 실용적인 조언을 제공합니다.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const gptResponse = response.data.choices[0].message.content;
    const parsedResponse = JSON.parse(gptResponse);
    return parsedResponse.cities || [];
  } catch (error) {
    console.error("GPT 도시 추천 실패:", error);
    return [
      {
        name: `${country} 수도`,
        reason:
          "수도로서 정치, 경제, 문화의 중심지이며 다양한 산업이 발달해 있습니다. 외국인을 위한 인프라가 잘 구축되어 있고, 국제적인 기업들이 많이 위치해 있어 취업 기회가 풍부합니다.",
        advantages: [
          "다양한 취업 기회",
          "우수한 인프라",
          "국제적 환경",
          "문화 생활 풍부",
        ],
        jobOpportunities:
          "수도권에는 대기업 본사와 다국적 기업이 집중되어 있어 다양한 직종에서 취업 기회를 찾을 수 있습니다.",
      },
      {
        name: `${country} 주요도시`,
        reason:
          "경제 활동이 매우 활발한 지역으로 많은 기업들이 위치해 있습니다. 비즈니스 환경이 우수하고 경쟁력 있는 급여 수준을 제공합니다.",
        advantages: [
          "높은 급여 수준",
          "비즈니스 기회",
          "교통 편리",
          "경제 활동 활발",
        ],
        jobOpportunities:
          "경제 중심지로서 금융, IT, 제조업 등 다양한 분야에서 전문직 기회가 많습니다.",
      },
      {
        name: `${country} 중소도시`,
        reason:
          "생활비가 상대적으로 저렴하고 안정적인 생활환경을 제공합니다. 경쟁이 덜 치열하여 정착하기 좋은 환경입니다.",
        advantages: [
          "저렴한 생활비",
          "안전한 환경",
          "여유로운 생활",
          "지역 커뮤니티",
        ],
        jobOpportunities:
          "지역 기업들과 중소기업에서 안정적인 취업 기회를 찾을 수 있으며, 장기 근무에 유리합니다.",
      },
    ];
  }
}
