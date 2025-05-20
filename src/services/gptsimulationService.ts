import axios from "axios";
import SimulationInput from "../models/simulationInput";

const GPT_API_URL = process.env.GPT_API_URL!;
const API_KEY = process.env.API_KEY!;

function getMappedValue(map: any, key: string) {
  return map[key] !== undefined ? map[key] : 0;
}

// 사용자 조건 기반 취업 가능성
// 직업 수요도, 외국인 채용도, 현재 스펙으로 가능성
function calculateEmploymentProbability({
  jobDemand,
  foreignAcceptance,
  specPreparation,
}: {
  jobDemand: number;
  foreignAcceptance: number;
  specPreparation: number;
}): number {
  const weights = {
    jobDemand: 0.3,
    foreignAcceptance: 0.3,
    specPreparation: 0.4,
  };

  const score =
    jobDemand * weights.jobDemand +
    foreignAcceptance * weights.foreignAcceptance +
    specPreparation * weights.specPreparation;

  return Math.round(score * 100); // 퍼센트로 반환 (0~100)
}

// 사용자 이력 기반 이주 추천도
// 예산 적합도, 동반자 적합도, 한인 커뮤니티 지원, 언어 수준, 비자 유형
function calculateMigrationSuitability({
  languageLevel,
  visaType,
  budgetSuitability,
  familySuitability,
  communitySupport,
  employmentProbability,
}: {
  languageLevel: string;
  visaType: string;
  budgetSuitability: number;
  familySuitability: number;
  communitySupport: number;
  employmentProbability: number;
}): number {
  const weights = {
    languageLevel: 0.2,
    visaType: 0.2,
    budgetSuitability: 0.2,
    familySuitability: 0.1,
    communitySupport: 0.05,
    employmentProbability: 0.25,
  };

  const levelMap: Record<string, number> = {
    능숙: 1.0,
    중간: 0.5,
    기초: 0.3,
    불가: 0.0,
  };

  const visaMap: Record<string, number> = {
    취업비자: 1.0,
    영주권: 1.0,
    학생비자: 0.6,
    무비자: 0.1,
  };

  const getMappedValue = (map: Record<string, number>, key: string): number =>
    map[key] !== undefined ? map[key] : 0;

  const score =
    weights.languageLevel * getMappedValue(levelMap, languageLevel) +
    weights.visaType * getMappedValue(visaMap, visaType) +
    weights.budgetSuitability * budgetSuitability +
    weights.familySuitability * familySuitability +
    weights.communitySupport * communitySupport +
    weights.employmentProbability * (employmentProbability / 100);

  return Math.round(score * 100); // 퍼센트 반환
}

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
⚠️ jobAccessibilityScore는 생략하지 말고 0~1 사이 실수값으로 정확히 작성하세요.

{
  "simulation": {
    "recommendedCity": "추천 도시명",
    ...
    "jobAccessibilityScore": {
      "jobDemand": 0.8,
      "foreignAcceptance": 0.7,
      "specPreparation": 0.9
    }
  }
}

📌 employmentProbability와 migrationSuitability는 GPT가 계산하지 마세요. 서버에서 계산합니다.
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

    const score = simulation.jobAccessibilityScore;

    if (
      !score ||
      typeof score.jobDemand !== "number" ||
      typeof score.foreignAcceptance !== "number" ||
      typeof score.specPreparation !== "number"
    ) {
      throw new Error(
        "jobAccessibilityScore 항목이 누락되었거나 수치가 잘못되었습니다."
      );
    }

    const employmentProbability = calculateEmploymentProbability({
      jobDemand: score.jobDemand,
      foreignAcceptance: score.foreignAcceptance,
      specPreparation: score.specPreparation,
    });

    const totalCost = parseFloat(simulation.estimatedMonthlyCost?.total || "0");
    const budgetSuitability =
      totalCost > 0
        ? budget > totalCost
          ? 1.0
          : budget === totalCost
          ? 0.7
          : 0.3
        : 0.7;

    const familySuitability = accompanyingFamily.length > 0 ? 1.0 : 0.5;
    const communitySupport = simulation.localInfo?.koreanCommunity ? 1.0 : 0.3;

    const migrationSuitability = calculateMigrationSuitability({
      languageLevel,
      visaType: visaStatus[0],
      budgetSuitability,
      familySuitability,
      communitySupport,
      employmentProbability,
    });

    // 👉 사용자에게는 jobAccessibilityScore 숨기기
    delete simulation.jobAccessibilityScore;

    return {
      ...simulation,
      employmentProbability,
      migrationSuitability,
    };
  } catch (err) {
    console.error("GPT 응답 파싱 실패:", err);
    console.error("GPT 응답 원본:", gptRaw);
    throw new Error("시뮬레이션 생성에 실패했습니다. 다시 시도해주세요.");
  }
};
