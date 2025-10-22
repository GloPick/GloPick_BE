export interface GuestProfile {
  languages: Array<{
    language: string;
    level: string;
  }>;
  qualityOfLifeWeights: {
    income: number;
    jobs: number;
    health: number;
    lifeSatisfaction: number;
    safety: number;
  };
  desiredJob: string; // ISCO-08 대분류 코드 ("0"-"9")
  additionalNotes?: string;
}
