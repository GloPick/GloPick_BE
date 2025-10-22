import axios from "axios";

// OECD Better Life Index 5가지 핵심 지표
export interface OECDBetterLifeData {
  country: string;
  countryCode: string;
  income: number;
  jobs: number;
  health: number;
  lifeSatisfaction: number;
  safety: number;
}

// OECD API 응답 타입
interface OECDApiResponse {
  structure: {
    dimensions: {
      observation: Array<{
        id: string;
        name: string;
        values: Array<{
          id: string;
          name: string;
        }>;
      }>;
    };
  };
  dataSets: Array<{
    observations: Record<string, [number]>;
  }>;
}

class OECDService {
  private baseUrl = "https://stats.oecd.org/SDMX-JSON/data";

  // 데이터 캐싱을 위한 변수
  private cachedData: OECDBetterLifeData[] | null = null;
  private cachedAverages: Omit<
    OECDBetterLifeData,
    "country" | "countryCode"
  > | null = null;
  private dataLoadPromise: Promise<OECDBetterLifeData[]> | null = null;
  private cachedMinMaxValues: any = null;

  // Better Life Index 지표별 데이터셋 ID
  private indicators = {
    income: "BLI/INCOME",
    jobs: "BLI/JOBS",
    health: "BLI/HEALTH",
    lifeSatisfaction: "BLI/LIFE_SATISFACTION",
    safety: "BLI/SAFETY",
  };

  // OECD 국가 코드 매핑 (한국어)
  private countryMapping: Record<string, string> = {
    호주: "AUS",
    오스트리아: "AUT",
    벨기에: "BEL",
    캐나다: "CAN",
    칠레: "CHL",
    체코: "CZE",
    덴마크: "DNK",
    에스토니아: "EST",
    핀란드: "FIN",
    프랑스: "FRA",
    독일: "DEU",
    그리스: "GRC",
    헝가리: "HUN",
    아이슬란드: "ISL",
    아일랜드: "IRL",
    이스라엘: "ISR",
    이탈리아: "ITA",
    일본: "JPN",
    한국: "KOR",
    라트비아: "LVA",
    리투아니아: "LTU",
    룩셈부르크: "LUX",
    멕시코: "MEX",
    네덜란드: "NLD",
    뉴질랜드: "NZL",
    노르웨이: "NOR",
    폴란드: "POL",
    포르투갈: "PRT",
    슬로바키아: "SVK",
    슬로베니아: "SVN",
    스페인: "ESP",
    스웨덴: "SWE",
    스위스: "CHE",
    터키: "TUR",
    영국: "GBR",
    미국: "USA",
  };

  // 영어 국가명 → OECD 코드 매핑
  private englishCountryMapping: Record<string, string> = {
    Australia: "AUS",
    Austria: "AUT",
    Belgium: "BEL",
    Canada: "CAN",
    Chile: "CHL",
    Colombia: "COL",
    "Costa Rica": "CRC",
    "Czech Republic": "CZE",
    Denmark: "DNK",
    Estonia: "EST",
    Finland: "FIN",
    France: "FRA",
    Germany: "DEU",
    Greece: "GRC",
    Hungary: "HUN",
    Iceland: "ISL",
    Ireland: "IRL",
    Israel: "ISR",
    Italy: "ITA",
    Japan: "JPN",
    Korea: "KOR",
    "South Korea": "KOR",
    Latvia: "LVA",
    Lithuania: "LTU",
    Luxembourg: "LUX",
    Mexico: "MEX",
    Netherlands: "NLD",
    "New Zealand": "NZL",
    Norway: "NOR",
    Poland: "POL",
    Portugal: "PRT",
    "Slovak Republic": "SVK",
    Slovakia: "SVK",
    Slovenia: "SVN",
    Spain: "ESP",
    Sweden: "SWE",
    Switzerland: "CHE",
    Turkey: "TUR",
    "United Kingdom": "GBR",
    UK: "GBR",
    "United States": "USA",
    USA: "USA",
    US: "USA",
    Singapore: "SGP",
    "Hong Kong": "HKG",
  };

  /**
   * 특정 지표의 모든 OECD 국가 데이터 조회
   * 실제 OECD API 대신 mock 데이터 사용 (임시)
   */
  private async getIndicatorData(
    indicator: keyof typeof this.indicators
  ): Promise<Record<string, number>> {
    try {
      // Mock 데이터 - 실제 Better Life Index 기반 근사값
      const mockData = this.getMockIndicatorData(indicator);
      return mockData;
    } catch (error) {
      console.error(`${indicator} 데이터 조회 실패:`, error);
      return {};
    }
  }

  /**
   * OECD Better Life Index 2023년 기준 정적 데이터 (40개국)
   */
  private getMockIndicatorData(
    indicator: keyof typeof this.indicators
  ): Record<string, number> {
    const baseValues = {
      income: {
        // OECD 회원국 (38개국)
        AUS: 7.3, // Australia
        AUT: 7.4, // Austria
        BEL: 7.1, // Belgium
        CAN: 7.2, // Canada
        CHL: 4.4, // Chile
        COL: 3.8, // Colombia
        CRC: 4.2, // Costa Rica
        CZE: 5.9, // Czech Republic
        DNK: 7.8, // Denmark
        EST: 6.1, // Estonia
        FIN: 7.2, // Finland
        FRA: 6.7, // France
        DEU: 6.9, // Germany
        GRC: 4.8, // Greece
        HUN: 5.3, // Hungary
        ISL: 7.6, // Iceland
        IRL: 7.5, // Ireland
        ISR: 6.8, // Israel
        ITA: 6.0, // Italy
        JPN: 6.2, // Japan
        KOR: 5.8, // Korea
        LVA: 5.7, // Latvia
        LTU: 6.0, // Lithuania
        LUX: 8.9, // Luxembourg
        MEX: 3.8, // Mexico
        NLD: 7.7, // Netherlands
        NZL: 6.9, // New Zealand
        NOR: 8.2, // Norway
        POL: 5.8, // Poland
        PRT: 5.9, // Portugal
        SVK: 5.6, // Slovak Republic
        SVN: 6.3, // Slovenia
        ESP: 6.3, // Spain
        SWE: 7.5, // Sweden
        CHE: 8.4, // Switzerland
        TUR: 4.2, // Turkey
        GBR: 6.8, // United Kingdom
        USA: 8.1, // United States

        // 추가 주요국 (OECD 비회원 2개국)
        SGP: 7.8, // Singapore (추정값)
        HKG: 7.0, // Hong Kong (추정값)
      },
      jobs: {
        // OECD 회원국 (38개국)
        AUS: 7.8, // Australia
        AUT: 7.6, // Austria
        BEL: 6.4, // Belgium
        CAN: 7.5, // Canada
        CHL: 5.9, // Chile
        COL: 6.0, // Colombia
        CRC: 6.8, // Costa Rica
        CZE: 7.8, // Czech Republic
        DNK: 7.9, // Denmark
        EST: 7.4, // Estonia
        FIN: 7.3, // Finland
        FRA: 6.8, // France
        DEU: 7.4, // Germany
        GRC: 4.2, // Greece
        HUN: 7.1, // Hungary
        ISL: 8.7, // Iceland
        IRL: 7.0, // Ireland
        ISR: 6.8, // Israel
        ITA: 5.5, // Italy
        JPN: 7.1, // Japan
        KOR: 6.4, // Korea
        LVA: 7.5, // Latvia
        LTU: 7.2, // Lithuania
        LUX: 7.2, // Luxembourg
        MEX: 6.2, // Mexico
        NLD: 7.8, // Netherlands
        NZL: 8.1, // New Zealand
        NOR: 8.0, // Norway
        POL: 6.6, // Poland
        PRT: 6.7, // Portugal
        SVK: 6.3, // Slovak Republic
        SVN: 7.0, // Slovenia
        ESP: 5.8, // Spain
        SWE: 7.8, // Sweden
        CHE: 8.2, // Switzerland
        TUR: 4.8, // Turkey
        GBR: 7.2, // United Kingdom
        USA: 7.0, // United States

        // 추가 주요국 (OECD 비회원 2개국)
        SGP: 7.9, // Singapore (추정값)
        HKG: 7.1, // Hong Kong (평균값 적용)
      },
      health: {
        // OECD 회원국 (38개국)
        AUS: 8.9, // Australia
        AUT: 8.6, // Austria
        BEL: 8.7, // Belgium
        CAN: 8.7, // Canada
        CHL: 8.2, // Chile
        COL: 7.8, // Colombia
        CRC: 8.4, // Costa Rica (평균값 적용)
        CZE: 7.8, // Czech Republic
        DNK: 8.9, // Denmark
        EST: 7.6, // Estonia
        FIN: 8.8, // Finland
        FRA: 8.6, // France
        DEU: 8.2, // Germany
        GRC: 8.2, // Greece
        HUN: 7.2, // Hungary
        ISL: 9.0, // Iceland
        IRL: 8.6, // Ireland
        ISR: 8.7, // Israel
        ITA: 8.9, // Italy
        JPN: 9.1, // Japan
        KOR: 8.8, // Korea
        LVA: 7.3, // Latvia
        LTU: 7.4, // Lithuania
        LUX: 8.8, // Luxembourg
        MEX: 6.9, // Mexico
        NLD: 8.7, // Netherlands
        NZL: 9.0, // New Zealand
        NOR: 8.8, // Norway
        POL: 7.5, // Poland
        PRT: 8.4, // Portugal
        SVK: 7.6, // Slovak Republic
        SVN: 8.3, // Slovenia
        ESP: 9.2, // Spain
        SWE: 8.9, // Sweden
        CHE: 9.3, // Switzerland
        TUR: 6.8, // Turkey
        GBR: 8.1, // United Kingdom
        USA: 7.8, // United States

        // 추가 주요국 (OECD 비회원 2개국)
        SGP: 9.2, // Singapore (추정값)
        HKG: 8.4, // Hong Kong (평균값 적용)
      },
      lifeSatisfaction: {
        // OECD 회원국 (38개국)
        AUS: 7.3, // Australia
        AUT: 7.1, // Austria
        BEL: 6.9, // Belgium
        CAN: 7.4, // Canada
        CHL: 6.7, // Chile
        COL: 6.5, // Colombia
        CRC: 6.7, // Costa Rica (평균값 적용)
        CZE: 6.6, // Czech Republic
        DNK: 7.5, // Denmark
        EST: 6.0, // Estonia
        FIN: 7.8, // Finland
        FRA: 6.5, // France
        DEU: 7.0, // Germany
        GRC: 5.4, // Greece
        HUN: 6.0, // Hungary
        ISL: 7.5, // Iceland
        IRL: 7.0, // Ireland
        ISR: 7.4, // Israel
        ITA: 6.0, // Italy
        JPN: 5.9, // Japan
        KOR: 5.8, // Korea
        LVA: 5.9, // Latvia
        LTU: 6.1, // Lithuania
        LUX: 7.2, // Luxembourg
        MEX: 8.2, // Mexico
        NLD: 7.4, // Netherlands
        NZL: 7.3, // New Zealand
        NOR: 7.4, // Norway
        POL: 6.1, // Poland
        PRT: 5.9, // Portugal
        SVK: 6.1, // Slovak Republic
        SVN: 6.3, // Slovenia
        ESP: 6.4, // Spain
        SWE: 7.3, // Sweden
        CHE: 7.6, // Switzerland
        TUR: 5.5, // Turkey
        GBR: 6.9, // United Kingdom
        USA: 6.9, // United States

        // 추가 주요국 (OECD 비회원 2개국)
        SGP: 6.4, // Singapore (추정값)
        HKG: 6.7, // Hong Kong (평균값 적용)
      },
      safety: {
        // OECD 회원국 (38개국)
        AUS: 8.4, // Australia
        AUT: 9.0, // Austria
        BEL: 7.9, // Belgium
        CAN: 8.7, // Canada
        CHL: 6.1, // Chile
        COL: 4.8, // Colombia
        CRC: 8.2, // Costa Rica (평균값 적용)
        CZE: 8.8, // Czech Republic
        DNK: 9.0, // Denmark
        EST: 8.9, // Estonia
        FIN: 9.7, // Finland
        FRA: 7.8, // France
        DEU: 8.9, // Germany
        GRC: 7.5, // Greece
        HUN: 8.2, // Hungary
        ISL: 9.6, // Iceland
        IRL: 8.0, // Ireland
        ISR: 7.8, // Israel
        ITA: 7.9, // Italy
        JPN: 9.4, // Japan
        KOR: 8.8, // Korea
        LVA: 7.8, // Latvia
        LTU: 8.1, // Lithuania
        LUX: 9.0, // Luxembourg
        MEX: 4.6, // Mexico
        NLD: 8.7, // Netherlands
        NZL: 8.5, // New Zealand
        NOR: 9.5, // Norway
        POL: 8.5, // Poland
        PRT: 8.9, // Portugal
        SVK: 8.6, // Slovak Republic
        SVN: 9.2, // Slovenia
        ESP: 8.2, // Spain
        SWE: 8.6, // Sweden
        CHE: 9.3, // Switzerland
        TUR: 7.2, // Turkey
        GBR: 7.5, // United Kingdom
        USA: 7.1, // United States

        // 추가 주요국 (OECD 비회원 2개국)
        SGP: 9.1, // Singapore (추정값)
        HKG: 8.2, // Hong Kong (평균값 적용)
      },
    };

    return baseValues[indicator] || {};
  }

  /**
   * 모든 Better Life Index 지표 데이터 조회 (캐싱 적용)
   */
  async getAllBetterLifeData(): Promise<OECDBetterLifeData[]> {
    // 이미 캐시된 데이터가 있으면 반환
    if (this.cachedData) {
      return this.cachedData;
    }

    // 이미 로딩 중인 Promise가 있으면 기다림
    if (this.dataLoadPromise) {
      return this.dataLoadPromise;
    }

    // 새로운 데이터 로딩 시작
    this.dataLoadPromise = this.loadAllData();
    this.cachedData = await this.dataLoadPromise;
    this.dataLoadPromise = null;

    return this.cachedData;
  }

  /**
   * 실제 데이터 로딩 로직
   */
  private async loadAllData(): Promise<OECDBetterLifeData[]> {
    try {
      console.log("🔄 OECD 데이터 로딩 시작...");

      // 모든 지표 데이터를 병렬로 조회
      const [
        incomeData,
        jobsData,
        healthData,
        lifeSatisfactionData,
        safetyData,
      ] = await Promise.all([
        this.getIndicatorData("income"),
        this.getIndicatorData("jobs"),
        this.getIndicatorData("health"),
        this.getIndicatorData("lifeSatisfaction"),
        this.getIndicatorData("safety"),
      ]);

      // 모든 국가 코드 수집
      const allCountryCodes = new Set([
        ...Object.keys(incomeData),
        ...Object.keys(jobsData),
        ...Object.keys(healthData),
        ...Object.keys(lifeSatisfactionData),
        ...Object.keys(safetyData),
      ]);

      // 국가별 데이터 통합
      const results: OECDBetterLifeData[] = [];

      for (const countryCode of allCountryCodes) {
        // 국가명 찾기 (매핑에서 역으로 찾기)
        const countryName =
          Object.keys(this.countryMapping).find(
            (name) => this.countryMapping[name] === countryCode
          ) || countryCode;

        // 모든 지표에 데이터가 있는 국가만 포함
        if (
          incomeData[countryCode] !== undefined &&
          jobsData[countryCode] !== undefined &&
          healthData[countryCode] !== undefined &&
          lifeSatisfactionData[countryCode] !== undefined &&
          safetyData[countryCode] !== undefined
        ) {
          results.push({
            country: countryName,
            countryCode,
            income: incomeData[countryCode],
            jobs: jobsData[countryCode],
            health: healthData[countryCode],
            lifeSatisfaction: lifeSatisfactionData[countryCode],
            safety: safetyData[countryCode],
          });
        }
      }

      console.log(`✅ OECD 데이터 로딩 완료: ${results.length}개국`);
      return results;
    } catch (error) {
      console.error("❌ OECD Better Life Index 데이터 조회 실패:", error);
      // 오류가 발생해도 빈 배열 반환하여 서비스 중단 방지
      return [];
    }
  }

  /**
   * 특정 국가의 Better Life Index 데이터 조회
   */
  async getCountryBetterLifeData(
    countryName: string
  ): Promise<OECDBetterLifeData | null> {
    const allData = await this.getAllBetterLifeData();

    // 1. 영어 국가명으로 OECD 코드 찾기
    const countryCode =
      this.englishCountryMapping[countryName] ||
      this.countryMapping[countryName];

    return (
      allData.find(
        (data) =>
          data.country.toLowerCase() === countryName.toLowerCase() ||
          data.countryCode === countryCode ||
          data.countryCode === this.englishCountryMapping[countryName]
      ) || null
    );
  }

  /**
   * OECD 평균값 계산 (캐싱 적용)
   */
  async getOECDAverages(): Promise<
    Omit<OECDBetterLifeData, "country" | "countryCode">
  > {
    // 이미 캐시된 평균값이 있으면 반환
    if (this.cachedAverages) {
      return this.cachedAverages;
    }

    const allData = await this.getAllBetterLifeData();

    if (allData.length === 0) {
      console.warn("⚠️ OECD 데이터가 없어 기본 평균값을 사용합니다.");
      // 기본 평균값 반환 (실제 OECD 평균 근사값)
      this.cachedAverages = {
        income: 6.8,
        jobs: 7.1,
        health: 8.4,
        lifeSatisfaction: 6.7,
        safety: 8.2,
      };
      return this.cachedAverages;
    }

    this.cachedAverages = {
      income: allData.reduce((sum, d) => sum + d.income, 0) / allData.length,
      jobs: allData.reduce((sum, d) => sum + d.jobs, 0) / allData.length,
      health: allData.reduce((sum, d) => sum + d.health, 0) / allData.length,
      lifeSatisfaction:
        allData.reduce((sum, d) => sum + d.lifeSatisfaction, 0) /
        allData.length,
      safety: allData.reduce((sum, d) => sum + d.safety, 0) / allData.length,
    };

    return this.cachedAverages;
  }

  /**
   * 각 지표별 Min-Max 값 계산 (IQR 보정 적용)
   */
  async getMinMaxValues(): Promise<{
    income: { min: number; max: number };
    jobs: { min: number; max: number };
    health: { min: number; max: number };
    lifeSatisfaction: { min: number; max: number };
    safety: { min: number; max: number };
  }> {
    if (this.cachedMinMaxValues) {
      return this.cachedMinMaxValues;
    }

    const allData = await this.getAllBetterLifeData();

    const calculateMinMaxWithIQR = (values: number[]) => {
      const sorted = values.sort((a, b) => a - b);
      const n = sorted.length;

      // 사분위수 계산
      const q1Index = Math.floor(n * 0.25);
      const q3Index = Math.floor(n * 0.75);
      const q1 = sorted[q1Index];
      const q3 = sorted[q3Index];
      const iqr = q3 - q1;

      // IQR 기반 이상치 제거된 범위 계산
      const adjustedMin = Math.max(sorted[0], q1 - 1.5 * iqr);
      const adjustedMax = Math.min(sorted[n - 1], q3 + 1.5 * iqr);

      return { min: adjustedMin, max: adjustedMax };
    };

    this.cachedMinMaxValues = {
      income: calculateMinMaxWithIQR(allData.map((d) => d.income)),
      jobs: calculateMinMaxWithIQR(allData.map((d) => d.jobs)),
      health: calculateMinMaxWithIQR(allData.map((d) => d.health)),
      lifeSatisfaction: calculateMinMaxWithIQR(
        allData.map((d) => d.lifeSatisfaction)
      ),
      safety: calculateMinMaxWithIQR(allData.map((d) => d.safety)),
    };

    return this.cachedMinMaxValues;
  }

  /**
   * Min-Max 정규화로 0-100 점수 계산
   */
  private normalizeScore(value: number, min: number, max: number): number {
    if (max === min) return 50; // 모든 값이 같을 경우 중간 점수
    const normalized = ((value - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, normalized)); // 0-100 범위 보장
  }

  /**
   * 국가별 데이터와 Min-Max 정규화를 통한 점수 계산
   */
  async calculateQualityOfLifeScore(
    countryName: string,
    userWeights: {
      income: number;
      jobs: number;
      health: number;
      lifeSatisfaction: number;
      safety: number;
    }
  ): Promise<number> {
    const [countryData, minMaxValues] = await Promise.all([
      this.getCountryBetterLifeData(countryName),
      this.getMinMaxValues(),
    ]);

    if (!countryData) {
      // OECD 회원국이 아닌 국가는 기본 점수 반환
      return 50;
    }

    // Min-Max 정규화로 각 지표별 점수 계산 (0-100 범위)
    const scores = {
      income: this.normalizeScore(
        countryData.income,
        minMaxValues.income.min,
        minMaxValues.income.max
      ),
      jobs: this.normalizeScore(
        countryData.jobs,
        minMaxValues.jobs.min,
        minMaxValues.jobs.max
      ),
      health: this.normalizeScore(
        countryData.health,
        minMaxValues.health.min,
        minMaxValues.health.max
      ),
      lifeSatisfaction: this.normalizeScore(
        countryData.lifeSatisfaction,
        minMaxValues.lifeSatisfaction.min,
        minMaxValues.lifeSatisfaction.max
      ),
      safety: this.normalizeScore(
        countryData.safety,
        minMaxValues.safety.min,
        minMaxValues.safety.max
      ),
    };

    // 가중치 적용하여 최종 점수 계산
    const finalScore =
      (scores.income * userWeights.income +
        scores.jobs * userWeights.jobs +
        scores.health * userWeights.health +
        scores.lifeSatisfaction * userWeights.lifeSatisfaction +
        scores.safety * userWeights.safety) /
      100;

    return Math.round(finalScore * 100) / 100; // 소수점 2자리로 반올림
  }
}

export const oecdService = new OECDService();
