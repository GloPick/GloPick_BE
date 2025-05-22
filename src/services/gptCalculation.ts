// 점수 매핑
const levelMaps = {
  jobDemand: { 높음: 1.0, 중간: 0.7, 낮음: 0.3, 거의없음: 0 },
  foreignAcceptance: { 높음: 1.0, 중간: 0.7, 낮음: 0.3, 거의없음: 0 },
  specPreparation: { 쉬움: 1.0, 보통: 0.6, 어려움: 0.3, 불가: 0.1 },

  budgetLevel: {
    "매우 적합": 1.0,
    적당함: 0.7,
    부족함: 0.5,
    "매우 부족함": 0,
  },

  languageability: {
    "매우 적합": 1.0,
    적당함: 0.7,
    부족함: 0.5,
    "매우 부족함": 0,
  },

  accompanyLevel: {
    "매우 적합": 1.0,
    적당함: 0.7,
    부족함: 0.5,
    "매우 부족함": 0,
  },
  visaLevel: {
    "매우 적합": 1.0,
    적당함: 0.7,
    부족함: 0.5,
    "매우 부족함": 0,
  },
};

// 1. 취업 가능성 계산 함수
export function calculateEmploymentProbability(levels: {
  jobDemandLevel: string;
  foreignAcceptanceLevel: string;
  specPreparationLevel: string;
}): number {
  const jobScore =
    (levelMaps.jobDemand[
      levels.jobDemandLevel as keyof typeof levelMaps.jobDemand
    ] ?? 0) *
      0.4 +
    (levelMaps.foreignAcceptance[
      levels.foreignAcceptanceLevel as keyof typeof levelMaps.foreignAcceptance
    ] ?? 0) *
      0.3 +
    (levelMaps.specPreparation[
      levels.specPreparationLevel as keyof typeof levelMaps.specPreparation
    ] ?? 0) *
      0.3;

  return Math.round(jobScore * 100);
}

// 2. 이주 추천도 계산 함수
export function calculateMigrationSuitability(params: {
  languageLevel: string;
  visaStatus: string;
  budgetSuitabilityLevel: string;
  hasCompanion: string;
  employmentProbability: number; // 0~100 범위
}): number {
  const langScore =
    (levelMaps.languageability[
      params.languageLevel as keyof typeof levelMaps.languageability
    ] ?? 0) * 0.2;
  const visaScore =
    (levelMaps.visaLevel[
      params.visaStatus as keyof typeof levelMaps.visaLevel
    ] ?? 0) * 0.2;
  const budgetScore =
    (levelMaps.budgetLevel[
      params.budgetSuitabilityLevel as keyof typeof levelMaps.budgetLevel
    ] ?? 0) * 0.2;
  const companionScore =
    levelMaps.accompanyLevel[
      params.hasCompanion.toString() as keyof typeof levelMaps.accompanyLevel
    ] * 0.2;
  const employmentScore = (params.employmentProbability / 100) * 0.2;

  const total =
    langScore + visaScore + budgetScore + companionScore + employmentScore;

  return Math.round(total * 100);
}
