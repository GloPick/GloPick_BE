export interface GuestProfile {
  language: string; // 단일 언어 (예: "English", "Korean")
  desiredJob: string; // ISCO-08 대분류 코드 ("0"-"10")
  qualityOfLifeWeights: {
    income: number;
    jobs: number;
    health: number;
    lifeSatisfaction: number;
    safety: number;
  };
  weights: {
    languageWeight: number;
    jobWeight: number;
    qualityOfLifeWeight: number;
  };
}
