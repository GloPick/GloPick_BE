import axios from "axios";
import { SimulationInputWithCity, CitySimulation } from "../types/simulation";

export async function generateCitySimulation(
  input: SimulationInputWithCity
): Promise<CitySimulation> {
  const {
    selectedCountry,
    selectedCity,
    budget,
    period,
    language,
    hasLicense,
    jobPreference,
    accommodation,
    withFamily,
    visaStatus,
    extraWishes,
  } = input;

  const prompt = `
당신은 ${selectedCity}의 이주 전문가입니다.
아래 조건을 바탕으로 ${selectedCity}로 이주할 경우 예상되는 정착 정보를 아래 JSON 형식으로 제공해주세요.

조건:
- 국가: ${selectedCountry}
- 도시: ${selectedCity}
- 예산: ${budget}만원
- 체류 기간: ${period}개월
- 언어 능력: ${language}
- 운전면허: ${hasLicense ? "보유" : "없음"}
- 희망 직종: ${jobPreference}
- 거주 형태: ${accommodation}
- 동반 가족: ${withFamily ? "있음" : "없음"}
- 비자 상태: ${visaStatus}
- 기타: ${extraWishes || "없음"}

응답 형식 (절대 다른 형식은 출력하지 마세요):

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
      "jobSearchPlatforms": ["Indeed", "LinkedIn"]
    },
    "culturalIntegration": {
      "koreanResourcesLinks": ["https://korean-community.com"],
      "culturalIntegrationPrograms": ["언어교류", "지역 커뮤니티"]
    }
  }
}
`;

  const response = await axios.post(
    process.env.GPT_API_URL!,
    {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "당신은 해외 정착 시뮬레이션 전문가입니다.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const gptRaw = response.data?.choices?.[0]?.message?.content?.trim();
  if (!gptRaw) throw new Error("GPT 응답이 비어 있습니다.");

  const parsed = JSON.parse(gptRaw);
  return parsed.simulation;
}
