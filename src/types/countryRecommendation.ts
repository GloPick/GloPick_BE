// 사용자 입력 데이터 타입
export interface UserCareerProfile {
  language: string; // 사용 가능 언어 (단일 선택)
  expectedSalary: number; // 희망 연봉 (USD)
  jobField: ISCOJobField; // ISCO-08 기준 직무 분야
  priorities: UserPriorities; // 우선순위
}

// ISCO-08 직무 분류
export interface ISCOJobField {
  code: string; // ISCO-08 대분류 코드 ('1'-'9', '0')
  nameKo: string; // 한국어 직무명
  nameEn: string; // 영어 직무명
}

export interface UserPriorities {
  first: "language" | "salary" | "job"; // 1순위 (가중치 0.5)
  second: "language" | "salary" | "job"; // 2순위 (가중치 0.3)
  third: "language" | "salary" | "job"; // 3순위 (가중치 0.2)
}

// 국가 데이터 타입
export interface CountryData {
  name: string;
  code: string;
  region: string;
  languages: string[];
  gdpPerCapita?: number; // World Bank API에서 가져올 데이터
  employmentRate?: number; // ILOSTAT API에서 가져올 데이터 (고용률)
  population?: number;
}

// 점수가 계산된 국가 데이터
export interface ScoredCountry {
  country: CountryData;
  scores: {
    languageScore: number; // 언어 적합도 점수 (0-100)
    salaryScore: number; // 연봉 적합도 점수 (0-100)
    jobScore: number; // 직무 기회 점수 (0-100)
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
    salaryScore: number;
    jobScore: number;
    appliedWeights: {
      language: number;
      salary: number;
      job: number;
    };
  };
  reasons: string[]; // 추천 이유들
}
