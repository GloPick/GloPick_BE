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
  const {
    selectedCity,
    initialBudget,
    requiredFacilities,
    departureAirport,
  } = input;

  const prompt = `
사용자 조건:
- 도시: ${selectedCity}
- 초기 정착 예산: ${initialBudget}
- 필수 편의시설: ${requiredFacilities}
- 출발 공항: ${departureAirport}

아래 항목을 포함하여 현실적인 시뮬레이션을 JSON 형식으로 응답하세요:

⚠️ 반드시 아래 예시 형식의 JSON으로만 응답하세요.
⚠️ 반드시 모든 키는 **쌍따옴표(")**로 감싸세요.
단, 값은 사용자의 조건을 바탕으로 평가하여 예시 값을 따라하지말고 실제 값으로 작성해야 합니다.


{
  "simulation": {
    "recommendedCity": "도시명",
    "localInfo": {
      "essentialFacilities": ["사용자가 요청한 필수 편의시설의 구체적인 위치 정보"],
      "publicTransport": "버스와 지하철이 주요 교통수단입니다.",
      "safetyLevel": "대한민국과 비교하여 치안이 조금 낮으니 주의 필요",
      "climateSummary": "사계절이 뚜렷하며 겨울에 눈이 자주 내림",
      "koreanCommunity": "한인 마트와 한식당이 밀집된 지역이 있음",
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

    "initialSetup": {
      "shortTermHousingOptions": ["호텔", "호스텔", "에어비앤비"],
      "longTermHousingPlatforms": ["Zumper", "Immoweb"],
      "mobilePlan": "선불 심카드가 편리함 (예: Lycamobile)",
      "bankAccount": "여권과 주소 증빙만으로 계좌 개설 가능"
    },

    "jobReality": {
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
): Promise<Array<{ name: string; reason: string; advantages: string[]; jobOpportunities: string }>> {
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
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '당신은 해외 취업 전문 컨설턴트입니다. 각 도시의 특성과 취업 시장을 잘 알고 있으며, 구체적이고 실용적인 조언을 제공합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const gptResponse = response.data.choices[0].message.content;
    const parsedResponse = JSON.parse(gptResponse);
    return parsedResponse.cities || [];
  } catch (error) {
    console.error('GPT 도시 추천 실패:', error);
    return [
      { 
        name: `${country} 수도`, 
        reason: "수도로서 정치, 경제, 문화의 중심지이며 다양한 산업이 발달해 있습니다. 외국인을 위한 인프라가 잘 구축되어 있고, 국제적인 기업들이 많이 위치해 있어 취업 기회가 풍부합니다.", 
        advantages: ["다양한 취업 기회", "우수한 인프라", "국제적 환경", "문화 생활 풍부"],
        jobOpportunities: "수도권에는 대기업 본사와 다국적 기업이 집중되어 있어 다양한 직종에서 취업 기회를 찾을 수 있습니다."
      },
      { 
        name: `${country} 주요도시`, 
        reason: "경제 활동이 매우 활발한 지역으로 많은 기업들이 위치해 있습니다. 비즈니스 환경이 우수하고 경쟁력 있는 급여 수준을 제공합니다.", 
        advantages: ["높은 급여 수준", "비즈니스 기회", "교통 편리", "경제 활동 활발"],
        jobOpportunities: "경제 중심지로서 금융, IT, 제조업 등 다양한 분야에서 전문직 기회가 많습니다."
      },
      { 
        name: `${country} 중소도시`, 
        reason: "생활비가 상대적으로 저렴하고 안정적인 생활환경을 제공합니다. 경쟁이 덜 치열하여 정착하기 좋은 환경입니다.", 
        advantages: ["저렴한 생활비", "안전한 환경", "여유로운 생활", "지역 커뮤니티"],
        jobOpportunities: "지역 기업들과 중소기업에서 안정적인 취업 기회를 찾을 수 있으며, 장기 근무에 유리합니다."
      }
    ];
  }
}
