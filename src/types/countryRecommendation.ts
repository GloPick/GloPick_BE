// 사용자 입력 데이터 타입
export interface UserCareerProfile {
  language: string; // 사용 가능 언어 (단일 선택)
  jobField: ISCOJobField; // ISCO-08 기준 직무 분야
  qualityOfLifeWeights: {
    income: number;
    jobs: number;
    health: number;
    lifeSatisfaction: number;
    safety: number;
  };
  languageScore?: number; // 언어 점수
  jobScore?: number; // 직무 점수
  qualityOfLifeScore?: number; // 삶의 질 점수
  weights?: {
    languageWeight: number; // 언어 가중치
    jobWeight: number; // 직무 가중치
    qualityOfLifeWeight: number; // 삶의 질 가중치
  };
}

// ISCO-08 직무 분류
export interface ISCOJobField {
  code: string; // ISCO-08 대분류 코드 ('1'-'9', '0')
  nameKo: string; // 한국어 직무명
  nameEn: string; // 영어 직무명
}

// 국가 데이터 타입
export interface CountryData {
  name: string;
  code: string;
  region: string;
  languages: string[];
  gdpPerCapita?: number; // World Bank API에서 가져올 데이터
  employmentRate?: number; // ILOSTAT API에서 가져올 데이터 (전체 고용률)
  iscoEmploymentData?: Map<string, number>; // ISCO-08 대분류별 고용 데이터
  population?: number;
}

// 점수가 계산된 국가 데이터
export interface ScoredCountry {
  country: CountryData;
  scores: {
    languageScore: number; // 언어 적합도 점수 (0-100)
    jobScore: number; // 직무 기회 점수 (0-100)
    qualityOfLifeScore: number; // 삶의 질 점수 (0-100)
  };
  weightedScore: number; // 가중치 적용된 최종 점수
}

// 최종 추천 결과
export interface CountryRecommendation {
  rank: number;
  country: CountryData;
  totalScore: number;
  breakdown: {
    languageScore: number;
    jobScore: number;
    qualityOfLifeScore: number;
    appliedWeights: {
      language: number;
      job: number;
      qualityOfLife: number;
    };
  };
  reasons: string[]; // 추천 이유들
}
