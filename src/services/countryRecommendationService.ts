import {
  UserCareerProfile,
  CountryData,
  ScoredCountry,
  CountryRecommendation,
} from "../types/countryRecommendation";
import { ExternalAPIService } from "./externalAPIService";
import { oecdService } from "./oecdService";

interface Weights {
  language: number;
  job: number;
  qualityOfLife: number;
}

let userWeights: Weights = { language: 0, job: 0, qualityOfLife: 0 };

export const saveWeights = (weights: Weights) => {
  userWeights = weights;
  console.log("Weights saved:", userWeights);
};

export const getWeights = () => userWeights;

export class CountryRecommendationService {
  // 메인 추천 로직
  static async getTopCountryRecommendations(
    userProfile: UserCareerProfile
  ): Promise<CountryRecommendation[]> {
    try {
      console.log("국가 데이터 수집 시작...");

      // 1. 외부 API에서 모든 국가 데이터 수집
      const allCountries = await ExternalAPIService.getAllCountryData();
      console.log(`총 ${allCountries.length}개 국가 데이터 수집 완료`);

      // 2. 각 국가별 점수 계산
      const scoredCountries = await this.calculateCountryScores(
        allCountries,
        userProfile
      );

      // 3. 저장된 가중치 가져오기
      const userWeights = getWeights();
      console.log("적용할 가중치:", userWeights);

      // 가중치가 설정되지 않았다면 기본값 사용
      const finalWeights = {
        language: userWeights.language || 30,
        job: userWeights.job || 30,
        qualityOfLife: userWeights.qualityOfLife || 40,
      };

      console.log("최종 가중치:", finalWeights);

      // 4. 사용자 입력 가중치 적용
      const weightedCountries = this.applyDynamicWeights(
        scoredCountries,
        finalWeights
      );

      // 5. 상위 5개 국가 선별
      const topCountries = this.selectTopCountries(weightedCountries, 5);

      // 6. 추천 결과 포맷팅
      return this.formatRecommendations(
        topCountries,
        userProfile,
        finalWeights
      );
    } catch (error) {
      console.error("국가 추천 처리 중 오류:", error);
      throw new Error("국가 추천을 처리하는 중 오류가 발생했습니다.");
    }
  }

  // 사용자 입력 가중치 적용 로직 수정
  private static applyDynamicWeights(
    scoredCountries: ScoredCountry[],
    weights: Weights
  ): ScoredCountry[] {
    return scoredCountries.map((country) => {
      const totalScore =
        country.scores.languageScore * (weights.language / 100) +
        country.scores.jobScore * (weights.job / 100) +
        country.scores.qualityOfLifeScore * (weights.qualityOfLife / 100);

      return { ...country, weightedScore: totalScore };
    });
  }

  // 각 국가별 개별 점수 계산
  private static async calculateCountryScores(
    countries: CountryData[],
    userProfile: UserCareerProfile
  ): Promise<ScoredCountry[]> {
    const scoredCountries: ScoredCountry[] = [];

    for (const country of countries) {
      const languageScore = this.calculateLanguageScore(
        country,
        userProfile.language
      );

      const jobScore = this.calculateJobScore(country, userProfile.jobField);

      // OECD Better Life Index 점수 계산
      let qualityOfLifeScore = 50; // 기본값
      try {
        qualityOfLifeScore = await oecdService.calculateQualityOfLifeScore(
          country.name,
          userProfile.qualityOfLifeWeights
        );
      } catch (error) {
        console.warn(`${country.name}의 OECD 점수 계산 실패:`, error);
      }

      scoredCountries.push({
        country,
        scores: {
          languageScore,
          jobScore,
          qualityOfLifeScore,
        },
        weightedScore: 0, // 나중에 계산
      });
    }

    return scoredCountries;
  }

  // 언어 적합도 점수 계산 (0-100)
  private static calculateLanguageScore(
    country: CountryData,
    userLanguage: string
  ): number {
    if (!country.languages || country.languages.length === 0) {
      return 0;
    }

    // 사용자 언어와 국가 언어의 매칭 확인
    const hasMatchingLanguage = country.languages.some(
      (countryLang) =>
        countryLang.toLowerCase().includes(userLanguage.toLowerCase()) ||
        userLanguage.toLowerCase().includes(countryLang.toLowerCase())
    );

    if (hasMatchingLanguage) {
      return 100; // 완전 매칭
    }

    // 영어 사용 국가인 경우 기본 점수 제공 (사용자 언어가 영어가 아닌 경우)
    if (userLanguage.toLowerCase() !== "english") {
      const hasEnglish = country.languages.some((lang) =>
        lang.toLowerCase().includes("english")
      );
      return hasEnglish ? 30 : 10;
    }

    return 0; // 매칭되지 않는 경우
  }

  // 연봉 적합도 점수는 OECD Better Life Index의 Income 지표로 대체됨

  // 직무 기회 점수 계산 (0-100)
  private static calculateJobScore(
    country: CountryData,
    jobField: any
  ): number {
    let baseScore = 50;

    // 고용률이 높을수록 높은 점수 (고용률은 보통 40-80% 범위)
    if (country.employmentRate !== undefined) {
      // 고용률을 0-100 점수로 변환 (50% 이상이면 좋은 편)
      const employmentScore = Math.min(
        100,
        Math.max(0, (country.employmentRate - 40) * 2)
      );
      baseScore = (baseScore + employmentScore) / 2;
    }

    // 선진국/기술 선진국 가산점
    const developedCountries = [
      "USA",
      "CAN",
      "GBR",
      "DEU",
      "FRA",
      "JPN",
      "KOR",
      "AUS",
      "NZL",
      "SGP",
      "CHE",
      "NLD",
      "SWE",
      "NOR",
      "DNK",
      "FIN",
    ];

    if (developedCountries.includes(country.code)) {
      baseScore += 20;
    }

    // ISCO 코드별 추가 점수 (국가별 특화 분야)
    const jobFieldBonus = this.getJobFieldBonus(country.code, jobField.code);
    baseScore += jobFieldBonus;

    return Math.min(100, Math.max(0, baseScore));
  }

  // ISCO-08 코드별 직무 분야 보너스 점수
  private static getJobFieldBonus(
    countryCode: string,
    iscoCode: string
  ): number {
    // ISCO-08 대분류별 국가 특화 점수
    const iscoJobFieldMap: {
      [iscoCode: string]: { [country: string]: number };
    } = {
      "1": {
        // 관리자
        USA: 25,
        GBR: 20,
        CAN: 20,
        AUS: 18,
        CHE: 22,
        SGP: 20,
        HKG: 18,
        DEU: 18,
        FRA: 15,
        NLD: 15,
      },
      "2": {
        // 전문가 (의사, 변호사, 교수, 엔지니어 등)
        USA: 25,
        GBR: 22,
        CAN: 20,
        DEU: 22,
        CHE: 25,
        AUS: 18,
        NLD: 20,
        SWE: 20,
        NOR: 18,
        DNK: 18,
        JPN: 15,
        KOR: 15,
        FRA: 18,
        SGP: 20,
      },
      "3": {
        // 기술자 및 준전문가
        DEU: 25,
        CHE: 20,
        JPN: 22,
        KOR: 20,
        USA: 18,
        CAN: 15,
        AUS: 15,
        SGP: 18,
        NLD: 18,
        SWE: 15,
      },
      "4": {
        // 사무종사자
        SGP: 18,
        HKG: 15,
        USA: 15,
        GBR: 12,
        CAN: 12,
        AUS: 10,
        JPN: 12,
        KOR: 10,
        DEU: 10,
        FRA: 10,
      },
      "5": {
        // 서비스 및 판매 종사자
        USA: 20,
        GBR: 15,
        CAN: 15,
        AUS: 15,
        SGP: 12,
        JPN: 10,
        KOR: 8,
        FRA: 12,
        ITA: 10,
        ESP: 8,
      },
      "6": {
        // 농림어업 숙련 종사자
        AUS: 20,
        NZL: 25,
        CAN: 18,
        USA: 15,
        NOR: 15,
        DNK: 12,
        NLD: 10,
        FRA: 8,
        ESP: 10,
        ITA: 8,
      },
      "7": {
        // 기능원 및 관련 기능 종사자
        DEU: 25,
        CHE: 22,
        AUT: 20,
        CAN: 18,
        AUS: 18,
        USA: 15,
        JPN: 15,
        KOR: 12,
        NLD: 15,
        SWE: 15,
      },
      "8": {
        // 설비·기계 조작 및 조립 종사자
        DEU: 22,
        JPN: 20,
        KOR: 18,
        USA: 18,
        CAN: 15,
        CHE: 15,
        AUT: 15,
        SWE: 12,
        NLD: 12,
        CZE: 10,
      },
      "9": {
        // 단순노무 종사자
        USA: 10,
        CAN: 8,
        AUS: 8,
        GBR: 6,
        DEU: 6,
        SGP: 8,
        JPN: 5,
        KOR: 5,
        FRA: 6,
        ITA: 5,
      },
      "0": {
        // 군인
        USA: 15,
        KOR: 12,
        GBR: 10,
        FRA: 8,
        DEU: 6,
        CAN: 8,
        AUS: 8,
        SGP: 8,
        JPN: 5,
        ITA: 5,
      },
    };

    return iscoJobFieldMap[iscoCode]?.[countryCode] || 0;
  }

  // 상위 N개 국가 선별
  private static selectTopCountries(
    weightedCountries: ScoredCountry[],
    count: number
  ): ScoredCountry[] {
    return weightedCountries
      .sort((a, b) => b.weightedScore - a.weightedScore)
      .slice(0, count);
  }

  // 최종 추천 결과 포맷팅
  private static formatRecommendations(
    topCountries: ScoredCountry[],
    userProfile: UserCareerProfile,
    appliedWeights: Weights
  ): CountryRecommendation[] {
    return topCountries.map((scored, index) => {
      const normalizedWeights = {
        language: appliedWeights.language / 100,
        job: appliedWeights.job / 100,
        qualityOfLife: appliedWeights.qualityOfLife / 100,
      };

      return {
        rank: index + 1,
        country: scored.country,
        totalScore: Math.round(scored.weightedScore * 100) / 100,
        breakdown: {
          languageScore: Math.round(scored.scores.languageScore * 100) / 100,
          jobScore: Math.round(scored.scores.jobScore * 100) / 100,
          qualityOfLifeScore:
            Math.round(scored.scores.qualityOfLifeScore * 100) / 100,
          appliedWeights: normalizedWeights,
        },
        reasons: this.generateReasons(scored, userProfile),
      };
    });
  }

  // 추천 이유 생성
  private static generateReasons(
    scored: ScoredCountry,
    userProfile: UserCareerProfile
  ): string[] {
    const reasons: string[] = [];
    const { country, scores } = scored;

    // 언어 관련 이유
    if (scores.languageScore > 70) {
      reasons.push(
        `사용 가능한 언어와 높은 호환성 (${Math.round(scores.languageScore)}점)`
      );
    } else if (scores.languageScore > 30) {
      reasons.push("영어 사용 가능 국가로 의사소통 가능");
    }

    // 삶의 질 관련 이유
    if (scores.qualityOfLifeScore > 80) {
      reasons.push(
        `우수한 삶의 질 (${Math.round(scores.qualityOfLifeScore)}점)`
      );
    } else if (scores.qualityOfLifeScore > 60) {
      reasons.push("양호한 생활 환경");
    }

    // 직무 관련 이유
    if (scores.jobScore > 75) {
      reasons.push(`${userProfile.jobField.nameKo} 분야 취업 기회 풍부`);
    } else if (scores.jobScore > 60) {
      reasons.push("안정적인 고용 시장");
    }

    // 추가 정보
    if (country.gdpPerCapita && country.gdpPerCapita > 40000) {
      reasons.push("높은 경제 수준");
    }

    if (country.employmentRate && country.employmentRate > 65) {
      reasons.push("높은 고용률");
    }

    return reasons.length > 0 ? reasons : ["종합적인 생활 환경 고려"];
  }
}
