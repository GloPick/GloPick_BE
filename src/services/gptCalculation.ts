// 사용자 조건 기반 취업 가능성
// 직업 수요도, 외국인 채용도, 현재 스펙으로 가능성
export function calculateEmploymentProbability({
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
export function calculateMigrationSuitability({
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
    languageLevel: 0.2, // 언어수준
    visaType: 0.2, // 비자유형
    budgetSuitability: 0.2, // 초기예산
    familySuitability: 0.1, // 동반가족
    communitySupport: 0.05, // 커뮤니티 지원
    employmentProbability: 0.25, // 고용 가능성
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
