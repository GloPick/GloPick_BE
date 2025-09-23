// 점수 매핑
const levelMaps = {
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

// 이주 추천도 계산 함수
export function calculateMigrationSuitability(params: {
  languageLevel: string;
  visaStatus: string;
  budgetSuitabilityLevel: string;
  hasCompanion: string;
}): number {
  const langScore =
    (levelMaps.languageability[
      params.languageLevel as keyof typeof levelMaps.languageability
    ] ?? 0) * 0.25;
  const visaScore =
    (levelMaps.visaLevel[
      params.visaStatus as keyof typeof levelMaps.visaLevel
    ] ?? 0) * 0.25;
  const budgetScore =
    (levelMaps.budgetLevel[
      params.budgetSuitabilityLevel as keyof typeof levelMaps.budgetLevel
    ] ?? 0) * 0.25;
  const companionScore =
    levelMaps.accompanyLevel[
      params.hasCompanion.toString() as keyof typeof levelMaps.accompanyLevel
    ] * 0.25;

  const total = langScore + visaScore + budgetScore + companionScore;

  return Math.round(total * 100);
}
