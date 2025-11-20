import axios from "axios";
import { CountryData } from "../types/countryRecommendation";

interface WorldBankIndicator {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
  decimal: number;
}

interface ILOSTATData {
  ref_area: { label: string };
  indicator: { label: string };
  obs_value: number;
  time: string;
}

export class ExternalAPIService {
  private static readonly REST_COUNTRIES_API = "https://restcountries.com/v3.1";
  private static readonly WORLD_BANK_API = "https://api.worldbank.org/v2";
  private static readonly ILOSTAT_API =
    "https://rplumber.ilo.org/data/indicator";

  // OECD 회원국 코드 목록 (38개국 + 파트너 2개국)
  private static readonly OECD_COUNTRY_CODES: Set<string> = new Set([
    // OECD 38개 회원국
    "AUS", // 호주
    "AUT", // 오스트리아
    "BEL", // 벨기에
    "CAN", // 캐나다
    "CHL", // 칠레
    "COL", // 콜롬비아
    "CRI", // 코스타리카
    "CZE", // 체코
    "DNK", // 덴마크
    "EST", // 에스토니아
    "FIN", // 핀란드
    "FRA", // 프랑스
    "DEU", // 독일
    "GRC", // 그리스
    "HUN", // 헝가리
    "ISL", // 아이슬란드
    "IRL", // 아일랜드
    "ISR", // 이스라엘
    "ITA", // 이탈리아
    "JPN", // 일본
    "KOR", // 한국
    "LVA", // 라트비아
    "LTU", // 리투아니아
    "LUX", // 룩셈부르크
    "MEX", // 멕시코
    "NLD", // 네덜란드
    "NZL", // 뉴질랜드
    "NOR", // 노르웨이
    "POL", // 폴란드
    "PRT", // 포르투갈
    "SVK", // 슬로바키아
    "SVN", // 슬로베니아
    "ESP", // 스페인
    "SWE", // 스웨덴
    "CHE", // 스위스
    "TUR", // 터키
    "GBR", // 영국
    "USA", // 미국
  ]);

  // Mock 고용률 데이터 (ILOSTAT API에서 데이터가 없는 OECD 국가들만)
  // 2023년 기준, 15-64세 고용률 %
  private static readonly MOCK_EMPLOYMENT_RATES: Record<string, number> = {
    CZE: 75.4, // 체코 (Czech Republic) - ILOSTAT 데이터 없음
    KOR: 68.5, // 한국 (Korea) - ILOSTAT 데이터 없음
    SVK: 69.8, // 슬로바키아 (Slovak Republic) - ILOSTAT 데이터 없음
    TUR: 49.5, // 터키 (Turkey) - ILOSTAT 데이터 없음
    GBR: 75.0, // 영국 (United Kingdom) - ILOSTAT 데이터 없음
    USA: 70.6, // 미국 (United States) - ILOSTAT 데이터 없음
  };

  // REST Countries API에서 기본 국가 정보 가져오기
  static async getCountriesBasicInfo(): Promise<CountryData[]> {
    try {
      console.log("REST Countries API 호출 시작...");

      // 필요한 필드들을 명시하여 API 호출
      const fields = "name,cca3,region,languages,population";
      const response = await axios.get(
        `${this.REST_COUNTRIES_API}/all?fields=${fields}`,
        {
          timeout: 10000, // 10초 타임아웃
          headers: {
            "User-Agent": "GloPick-Backend/1.0.0",
            Accept: "application/json",
          },
        }
      );

      console.log(
        `REST Countries API 응답: ${response.status}, 데이터 수: ${response.data.length}`
      );

      const filteredCountries = response.data
        .filter(
          (country: any) =>
            country.name?.common &&
            country.cca3 &&
            country.region &&
            this.OECD_COUNTRY_CODES.has(country.cca3) // OECD 국가만 필터링
        )
        .map((country: any) => ({
          name: country.name.common,
          code: country.cca3,
          region: country.region,
          languages: country.languages ? Object.values(country.languages) : [],
          population: country.population,
        }));

      console.log(`OECD 국가 수집: ${filteredCountries.length}개국`);
      console.log("✅ REST Countries API 데이터 수집 완료");
      return filteredCountries;
    } catch (error: any) {
      console.error("REST Countries API 호출 실패:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      throw error;
    }
  }

  // World Bank API에서 경제 데이터 가져오기 (GDP per capita)
  static async getEconomicData(
    countryCodes: string[]
  ): Promise<Map<string, number>> {
    const economicData = new Map<string, number>();

    try {
      // 최신 연도부터 5년치 데이터 요청
      const currentYear = new Date().getFullYear();
      const years = `${currentYear - 4}:${currentYear}`;

      const response = await axios.get(
        `${this.WORLD_BANK_API}/country/${countryCodes.join(
          ";"
        )}/indicator/NY.GDP.PCAP.CD`,
        {
          params: {
            format: "json",
            date: years,
            per_page: 1000,
          },
        }
      );

      if (response.data && response.data[1]) {
        response.data[1].forEach((item: WorldBankIndicator) => {
          if (item.value !== null && item.countryiso3code) {
            // 최신 데이터로 업데이트 (같은 국가의 경우 더 최신 데이터가 우선)
            const existing = economicData.get(item.countryiso3code);
            if (!existing || parseInt(item.date) > parseInt(item.date)) {
              economicData.set(item.countryiso3code, item.value);
            }
          }
        });
      }

      console.log("✅ World Bank API 데이터 수집 완료");
      return economicData;
    } catch (error) {
      console.error("World Bank API 호출 실패:", error);
      return economicData; // 빈 맵이라도 반환
    }
  }

  // ILOSTAT API에서 ISCO-08 대분류별 고용 데이터 가져오기
  static async getISCOEmploymentData(
    countryCodes: string[]
  ): Promise<Map<string, Map<string, number>>> {
    const iscoEmploymentData = new Map<string, Map<string, number>>();

    try {
      console.log("ILOSTAT ISCO 고용 데이터 수집 시작...");

      // EMP_TEMP_SEX_AGE_NB_A: Employment by occupation (ISCO-08)
      const response = await axios.get(
        `${this.ILOSTAT_API}/?id=EMP_TEMP_SEX_AGE_NB_A&type=label&format=.csv&lang=en`,
        {
          timeout: 20000,
          headers: {
            "User-Agent": "GloPick-Backend/1.0.0",
            Accept: "text/csv",
          },
        }
      );

      if (!response.data || typeof response.data !== "string") {
        console.warn("ILOSTAT ISCO 데이터 응답이 올바르지 않습니다");
        return iscoEmploymentData;
      }

      const lines = response.data.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        console.warn("ILOSTAT ISCO CSV 데이터가 충분하지 않습니다");
        return iscoEmploymentData;
      }

      const headers = lines[0]
        .split(",")
        .map((h) => h.replace(/"/g, "").trim());

      const countryIndex = headers.findIndex(
        (h: string) =>
          h.toLowerCase().includes("country") ||
          h.toLowerCase().includes("ref_area")
      );
      const valueIndex = headers.findIndex(
        (h: string) =>
          h.toLowerCase().includes("obs_value") ||
          h.toLowerCase().includes("value")
      );
      const timeIndex = headers.findIndex(
        (h: string) =>
          h.toLowerCase().includes("time") || h.toLowerCase().includes("year")
      );
      const occupationIndex = headers.findIndex(
        (h: string) =>
          h.toLowerCase().includes("occupation") ||
          h.toLowerCase().includes("classif1")
      );

      if (countryIndex === -1 || valueIndex === -1 || occupationIndex === -1) {
        console.warn("ILOSTAT ISCO CSV 구조를 파싱할 수 없습니다");
        return iscoEmploymentData;
      }

      // ISCO-08 대분류 코드 매핑
      const iscoMapping: { [key: string]: string } = {
        Managers: "1",
        Professionals: "2",
        "Technicians and associate professionals": "3",
        "Clerical support workers": "4",
        "Service and sales workers": "5",
        "Skilled agricultural, forestry and fishery workers": "6",
        "Craft and related trades workers": "7",
        "Plant and machine operators, and assemblers": "8",
        "Elementary occupations": "9",
        "Armed forces occupations": "0",
      };

      // 데이터 파싱
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        try {
          const columns = line
            .split(",")
            .map((col) => col.replace(/"/g, "").trim());

          if (
            columns.length <=
            Math.max(countryIndex, valueIndex, timeIndex, occupationIndex)
          ) {
            continue;
          }

          const countryName = columns[countryIndex];
          const employmentValue = columns[valueIndex];
          const yearStr = timeIndex >= 0 ? columns[timeIndex] : "";
          const occupationStr = columns[occupationIndex];

          if (!countryName || !employmentValue || !occupationStr) continue;

          const employmentRate = parseFloat(employmentValue);
          const year = yearStr ? parseInt(yearStr) : 2023;

          if (isNaN(employmentRate) || year < 2018) continue;

          // ISCO 코드 찾기
          let iscoCode = "";
          for (const [occupationName, code] of Object.entries(iscoMapping)) {
            if (
              occupationStr.toLowerCase().includes(occupationName.toLowerCase())
            ) {
              iscoCode = code;
              break;
            }
          }

          if (!iscoCode) continue;

          const countryCode = this.getCountryCodeFromName(countryName);
          if (countryCode && countryCodes.includes(countryCode)) {
            if (!iscoEmploymentData.has(countryCode)) {
              iscoEmploymentData.set(countryCode, new Map());
            }

            const countryData = iscoEmploymentData.get(countryCode)!;

            // 최신 데이터만 유지
            if (!countryData.has(iscoCode) || year > 2020) {
              countryData.set(iscoCode, employmentRate);
            }
          }
        } catch (lineError) {
          continue;
        }
      }

      console.log(
        `ILOSTAT ISCO 데이터: ${iscoEmploymentData.size}개국 수집 완료`
      );
      return iscoEmploymentData;
    } catch (error) {
      console.error("ILOSTAT ISCO API 호출 실패:", error);
      return iscoEmploymentData;
    }
  }

  // ILOSTAT API에서 전체 고용률 데이터 가져오기 (백업용)
  static async getEmploymentData(
    countryCodes: string[]
  ): Promise<Map<string, number>> {
    const employmentData = new Map<string, number>();

    try {
      console.log("ILOSTAT 전체 고용률 데이터 수집 시작...");

      // ILOSTAT API: EMP_DWAP_SEX_AGE_RT_A (고용률 지표)
      const response = await axios.get(
        `${this.ILOSTAT_API}/?id=EMP_DWAP_SEX_AGE_RT_A&type=label&format=.csv&lang=en`,
        {
          timeout: 15000,
          headers: {
            "User-Agent": "GloPick-Backend/1.0.0",
            Accept: "text/csv",
          },
        }
      );

      if (!response.data || typeof response.data !== "string") {
        console.warn("ILOSTAT API 응답 데이터가 올바르지 않습니다");
        return employmentData;
      }

      const lines = response.data.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        console.warn("ILOSTAT CSV 데이터가 충분하지 않습니다");
        return employmentData;
      }

      const headers = lines[0]
        .split(",")
        .map((h) => h.replace(/"/g, "").trim());

      const countryIndex = headers.findIndex(
        (h: string) =>
          h.toLowerCase().includes("country") ||
          h.toLowerCase().includes("ref_area")
      );
      const valueIndex = headers.findIndex(
        (h: string) =>
          h.toLowerCase().includes("obs_value") ||
          h.toLowerCase().includes("value")
      );
      const timeIndex = headers.findIndex(
        (h: string) =>
          h.toLowerCase().includes("time") || h.toLowerCase().includes("year")
      );

      if (countryIndex === -1 || valueIndex === -1) {
        console.warn("ILOSTAT CSV 구조를 파싱할 수 없습니다");
        return employmentData;
      }

      // 데이터 파싱
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        try {
          const columns = line
            .split(",")
            .map((col) => col.replace(/"/g, "").trim());
          if (
            columns.length <= Math.max(countryIndex, valueIndex, timeIndex || 0)
          )
            continue;

          const countryName = columns[countryIndex];
          const employmentRateStr = columns[valueIndex];
          const yearStr = timeIndex >= 0 ? columns[timeIndex] : "";

          if (!countryName || !employmentRateStr) continue;

          const employmentRate = parseFloat(employmentRateStr);
          const year = yearStr ? parseInt(yearStr) : 2023;

          if (isNaN(employmentRate) || year < 2018) continue;

          const countryCode = this.getCountryCodeFromName(countryName);
          if (countryCode && countryCodes.includes(countryCode)) {
            if (!employmentData.has(countryCode) || year > 2020) {
              employmentData.set(countryCode, employmentRate);
            }
          }
        } catch (lineError) {
          continue;
        }
      }

      console.log(`ILOSTAT 전체 고용률: ${employmentData.size}개국 수집 완료`);
      return employmentData;
    } catch (error) {
      console.error("ILOSTAT 전체 고용률 API 호출 실패:", error);
      return employmentData;
    }
  }

  // 국가명을 ISO 코드로 매핑하는 헬퍼 함수
  private static getCountryCodeFromName(countryName: string): string | null {
    const countryMapping: { [key: string]: string } = {
      "United States": "USA",
      "United States of America": "USA",
      Canada: "CAN",
      "United Kingdom": "GBR",
      Germany: "DEU",
      France: "FRA",
      Japan: "JPN",
      Korea: "KOR",
      "Republic of Korea": "KOR",
      "South Korea": "KOR",
      Australia: "AUS",
      "New Zealand": "NZL",
      Singapore: "SGP",
      Switzerland: "CHE",
      Netherlands: "NLD",
      Sweden: "SWE",
      Norway: "NOR",
      Denmark: "DNK",
      Finland: "FIN",
      Austria: "AUT",
      Belgium: "BEL",
      Ireland: "IRL",
      Spain: "ESP",
      Italy: "ITA",
      Portugal: "PRT",
      Greece: "GRC",
      "Czech Republic": "CZE",
      Czechia: "CZE",
      Poland: "POL",
      Hungary: "HUN",
      Slovakia: "SVK",
      Slovenia: "SVN",
      Estonia: "EST",
      Latvia: "LVA",
      Lithuania: "LTU",
      Iceland: "ISL",
      Luxembourg: "LUX",
      Malta: "MLT",
    };

    return countryMapping[countryName] || null;
  }

  // 모든 외부 API 데이터를 한번에 수집
  static async getAllCountryData(): Promise<CountryData[]> {
    try {
      console.log("🌍 OECD 국가 기본 정보 수집 중...");
      const countries = await this.getCountriesBasicInfo();
      const countryCodes = countries.map((c) => c.code);

      console.log(
        `📍 ${countries.length}개 OECD 국가에 대한 데이터 수집 중...`
      );

      // 병렬로 외부 API 호출
      const [economicData, iscoEmploymentData, employmentData] =
        await Promise.all([
          this.getEconomicData(countryCodes),
          this.getISCOEmploymentData(countryCodes),
          this.getEmploymentData(countryCodes),
        ]);

      // 데이터 병합 - API 데이터가 없으면 mock 데이터 사용
      const finalCountries = countries.map((country) => {
        const apiEmploymentRate = employmentData.get(country.code);
        const mockEmploymentRate = this.MOCK_EMPLOYMENT_RATES[country.code];

        return {
          ...country,
          gdpPerCapita: economicData.get(country.code),
          employmentRate:
            apiEmploymentRate !== undefined
              ? apiEmploymentRate
              : mockEmploymentRate,
          iscoEmploymentData: iscoEmploymentData.get(country.code) || new Map(),
        };
      });

      // 데이터 누락 통계 로깅
      const missingEmploymentRate = finalCountries.filter(
        (c) => c.employmentRate === undefined
      ).length;
      const mockEmploymentCount = finalCountries.filter((c) => {
        const apiData = employmentData.get(c.code);
        const mockData = this.MOCK_EMPLOYMENT_RATES[c.code];
        return apiData === undefined && mockData !== undefined;
      }).length;
      const missingGDP = finalCountries.filter(
        (c) => c.gdpPerCapita === undefined
      ).length;

      console.log(`\n📊 OECD 국가 데이터 수집 통계:`);
      console.log(`  - 총 OECD 국가 수: ${finalCountries.length}개국`);
      console.log(`  - 고용률 API 데이터: ${employmentData.size}개국`);
      console.log(`  - 고용률 Mock 데이터: ${mockEmploymentCount}개국`);
      console.log(`  - 고용률 데이터 없음: ${missingEmploymentRate}개국`);
      console.log(
        `  - GDP 데이터 있음: ${finalCountries.length - missingGDP}개국`
      );
      console.log(`  - GDP 데이터 없음: ${missingGDP}개국\n`);

      // 고용률 데이터가 완전히 없는 국가 목록 (최대 10개만 표시)
      if (missingEmploymentRate > 0) {
        const missingCountries = finalCountries
          .filter((c) => c.employmentRate === undefined)
          .slice(0, 10)
          .map((c) => c.name);
        console.log(
          `⚠️  고용률 데이터 없는 국가 (일부): ${missingCountries.join(", ")}${
            missingEmploymentRate > 10
              ? ` 외 ${missingEmploymentRate - 10}개국`
              : ""
          }`
        );
      }

      return finalCountries;
    } catch (error) {
      console.error("외부 API 데이터 수집 실패:", error);
      throw error;
    }
  }
}
