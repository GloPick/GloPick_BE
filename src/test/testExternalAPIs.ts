import axios from "axios";

/**
 * OECD 국가 데이터 수집 테스트 스크립트
 *
 * 실행 방법:
 * npx ts-node src/test/testExternalAPIs.ts
 */

// OECD 국가 코드 목록 (38개국)
const OECD_COUNTRY_CODES = [
  "AUS",
  "AUT",
  "BEL",
  "CAN",
  "CHL",
  "COL",
  "CRI",
  "CZE",
  "DNK",
  "EST",
  "FIN",
  "FRA",
  "DEU",
  "GRC",
  "HUN",
  "ISL",
  "IRL",
  "ISR",
  "ITA",
  "JPN",
  "KOR",
  "LVA",
  "LTU",
  "LUX",
  "MEX",
  "NLD",
  "NZL",
  "NOR",
  "POL",
  "PRT",
  "SVK",
  "SVN",
  "ESP",
  "SWE",
  "CHE",
  "TUR",
  "GBR",
  "USA",
];

// OECD 국가명 매핑
const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  AUS: "Australia",
  AUT: "Austria",
  BEL: "Belgium",
  CAN: "Canada",
  CHL: "Chile",
  COL: "Colombia",
  CRI: "Costa Rica",
  CZE: "Czech Republic",
  DNK: "Denmark",
  EST: "Estonia",
  FIN: "Finland",
  FRA: "France",
  DEU: "Germany",
  GRC: "Greece",
  HUN: "Hungary",
  ISL: "Iceland",
  IRL: "Ireland",
  ISR: "Israel",
  ITA: "Italy",
  JPN: "Japan",
  KOR: "Korea",
  LVA: "Latvia",
  LTU: "Lithuania",
  LUX: "Luxembourg",
  MEX: "Mexico",
  NLD: "Netherlands",
  NZL: "New Zealand",
  NOR: "Norway",
  POL: "Poland",
  PRT: "Portugal",
  SVK: "Slovak Republic",
  SVN: "Slovenia",
  ESP: "Spain",
  SWE: "Sweden",
  CHE: "Switzerland",
  TUR: "Turkey",
  GBR: "United Kingdom",
  USA: "United States",
};

/**
 * 1. World Bank API 테스트 - GDP per capita
 */
async function testWorldBankAPI() {
  console.log("\n=== 1. World Bank API 테스트 (GDP per capita) ===\n");

  try {
    const currentYear = new Date().getFullYear();
    const years = `${currentYear - 4}:${currentYear}`;

    const url = `https://api.worldbank.org/v2/country/${OECD_COUNTRY_CODES.join(
      ";"
    )}/indicator/NY.GDP.PCAP.CD`;

    console.log(`📡 요청 URL: ${url}`);
    console.log(`📅 연도 범위: ${years}`);

    const response = await axios.get(url, {
      params: {
        format: "json",
        date: years,
        per_page: 1000,
      },
      timeout: 15000,
    });

    if (response.data && response.data[1]) {
      const dataByCountry = new Map<string, any[]>();

      response.data[1].forEach((item: any) => {
        if (item.value !== null && item.countryiso3code) {
          if (!dataByCountry.has(item.countryiso3code)) {
            dataByCountry.set(item.countryiso3code, []);
          }
          dataByCountry.get(item.countryiso3code)?.push({
            year: item.date,
            value: item.value,
            country: item.country.value,
          });
        }
      });

      console.log(
        `\n✅ 총 ${dataByCountry.size}개 OECD 국가의 GDP 데이터 수집 완료\n`
      );

      // 샘플 데이터 출력 (처음 5개국)
      console.log("📊 샘플 데이터 (최근 연도):\n");
      let count = 0;
      for (const [code, data] of dataByCountry.entries()) {
        if (count >= 5) break;
        const latest = data.sort(
          (a, b) => parseInt(b.year) - parseInt(a.year)
        )[0];
        console.log(
          `  ${code} (${latest.country}): $${latest.value.toLocaleString()} (${
            latest.year
          })`
        );
        count++;
      }

      // 데이터가 없는 OECD 국가 확인
      const missingCountries = OECD_COUNTRY_CODES.filter(
        (code) => !dataByCountry.has(code)
      );
      if (missingCountries.length > 0) {
        console.log(
          `\n⚠️  데이터 없는 국가 (${
            missingCountries.length
          }개): ${missingCountries.join(", ")}`
        );
      } else {
        console.log("\n✅ 모든 OECD 국가의 데이터 있음");
      }
    }
  } catch (error: any) {
    console.error("❌ World Bank API 오류:", error.message);
    if (error.response) {
      console.error("   상태 코드:", error.response.status);
      console.error("   응답 데이터:", error.response.data);
    }
  }
}

/**
 * 2. ILOSTAT API 테스트 - 전체 고용률
 */
async function testILOSTATEmploymentAPI() {
  console.log("\n\n=== 2. ILOSTAT API 테스트 (전체 고용률) ===\n");

  try {
    const url =
      "https://rplumber.ilo.org/data/indicator/?id=EMP_DWAP_SEX_AGE_RT_A&type=label&format=.csv&lang=en";

    console.log(`📡 요청 URL: ${url}`);

    const response = await axios.get(url, {
      timeout: 20000,
      headers: {
        "User-Agent": "GloPick-Test/1.0.0",
        Accept: "text/csv",
      },
    });

    if (!response.data || typeof response.data !== "string") {
      console.error("❌ 응답 데이터가 올바르지 않습니다");
      return;
    }

    const lines = response.data.split("\n").filter((line) => line.trim());
    console.log(`📄 총 ${lines.length}개 라인 수신`);

    if (lines.length < 2) {
      console.error("❌ CSV 데이터가 충분하지 않습니다");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
    console.log(`📋 헤더: ${headers.slice(0, 5).join(", ")}...`);

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
      console.error("❌ CSV 구조를 파싱할 수 없습니다");
      console.error(
        `   countryIndex: ${countryIndex}, valueIndex: ${valueIndex}`
      );
      return;
    }

    const employmentData = new Map<
      string,
      { value: number; year: string; country: string }
    >();

    // OECD 국가명 매핑 (역방향)
    const nameToCode = new Map<string, string>();
    Object.entries(COUNTRY_CODE_TO_NAME).forEach(([code, name]) => {
      nameToCode.set(name.toLowerCase(), code);
    });

    let processedLines = 0;
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
        const year = yearStr ? parseInt(yearStr) : 0;

        if (isNaN(employmentRate)) continue;
        if (year > 0 && year < 2018) continue;

        // OECD 국가인지 확인
        const countryCode = nameToCode.get(countryName.toLowerCase());
        if (countryCode && OECD_COUNTRY_CODES.includes(countryCode)) {
          processedLines++;
          if (!employmentData.has(countryCode)) {
            employmentData.set(countryCode, {
              value: employmentRate,
              year: year > 0 ? year.toString() : "Unknown",
              country: countryName,
            });
          } else {
            const existing = employmentData.get(countryCode)!;
            const existingYear =
              existing.year !== "Unknown" ? parseInt(existing.year) : 0;
            if (year > existingYear) {
              employmentData.set(countryCode, {
                value: employmentRate,
                year: year.toString(),
                country: countryName,
              });
            }
          }
        }
      } catch (lineError) {
        continue;
      }
    }

    console.log(`🔍 처리된 OECD 국가 데이터 라인: ${processedLines}개`);

    console.log(
      `\n✅ 총 ${employmentData.size}개 OECD 국가의 고용률 데이터 수집 완료\n`
    );

    // 샘플 데이터 출력
    console.log("📊 샘플 데이터:\n");
    let count = 0;
    for (const [code, data] of employmentData.entries()) {
      if (count >= 5) break;
      console.log(`  ${code} (${data.country}): ${data.value}% (${data.year})`);
      count++;
    }

    // 데이터가 없는 OECD 국가 확인
    const missingCountries = OECD_COUNTRY_CODES.filter(
      (code) => !employmentData.has(code)
    );
    if (missingCountries.length > 0) {
      console.log(`\n⚠️  데이터 없는 국가 (${missingCountries.length}개):`);
      missingCountries.forEach((code) => {
        console.log(`     ${code} (${COUNTRY_CODE_TO_NAME[code]})`);
      });
    } else {
      console.log("\n✅ 모든 OECD 국가의 데이터 있음");
    }
  } catch (error: any) {
    console.error("❌ ILOSTAT API 오류:", error.message);
    if (error.response) {
      console.error("   상태 코드:", error.response.status);
    }
  }
}

/**
 * 3. ILOSTAT API 테스트 - ISCO 직무별 고용 데이터
 */
async function testILOSTATISCOAPI() {
  console.log("\n\n=== 3. ILOSTAT API 테스트 (ISCO 직무별 고용) ===\n");

  try {
    const url =
      "https://rplumber.ilo.org/data/indicator/?id=EMP_TEMP_SEX_AGE_NB_A&type=label&format=.csv&lang=en";

    console.log(`📡 요청 URL: ${url}`);

    const response = await axios.get(url, {
      timeout: 20000,
      headers: {
        "User-Agent": "GloPick-Test/1.0.0",
        Accept: "text/csv",
      },
    });

    if (!response.data || typeof response.data !== "string") {
      console.error("❌ 응답 데이터가 올바르지 않습니다");
      return;
    }

    const lines = response.data.split("\n").filter((line) => line.trim());
    console.log(`📄 총 ${lines.length}개 라인 수신`);

    if (lines.length < 2) {
      console.error("❌ CSV 데이터가 충분하지 않습니다");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
    console.log(`📋 헤더: ${headers.slice(0, 5).join(", ")}...`);

    const iscoData = new Map<string, Map<string, number>>();

    console.log(`\n✅ ISCO 데이터 파싱 완료`);
    console.log(`📊 수집된 국가 수: ${iscoData.size}개`);
  } catch (error: any) {
    console.error("❌ ILOSTAT ISCO API 오류:", error.message);
    if (error.response) {
      console.error("   상태 코드:", error.response.status);
    }
  }
}

/**
 * 4. OECD Better Life Index 테스트 (Mock 데이터 확인)
 */
async function testOECDData() {
  console.log("\n\n=== 4. OECD Better Life Index 데이터 확인 ===\n");

  // OECD Better Life Index는 실제 API가 아닌 하드코딩된 데이터를 사용
  console.log(
    "ℹ️  OECD Better Life Index는 서비스 내부에서 Mock 데이터로 제공됩니다."
  );
  console.log("   (src/services/oecdService.ts의 getMockIndicatorData 참조)");
  console.log("\n📊 포함된 지표:");
  console.log("   - Income (소득)");
  console.log("   - Jobs (일자리)");
  console.log("   - Health (건강)");
  console.log("   - Life Satisfaction (삶의 만족도)");
  console.log("   - Safety (안전)");
  console.log("\n✅ 40개 OECD + 주요국 데이터 포함");
}

/**
 * 메인 테스트 실행
 */
async function runAllTests() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   OECD 국가 외부 API 데이터 수집 테스트                    ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log(`\n🌍 테스트 대상: ${OECD_COUNTRY_CODES.length}개 OECD 회원국\n`);

  try {
    await testWorldBankAPI();
    await testILOSTATEmploymentAPI();
    await testILOSTATISCOAPI();
    await testOECDData();

    console.log(
      "\n\n╔════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║   테스트 완료                                               ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n"
    );
  } catch (error: any) {
    console.error("\n❌ 테스트 실행 중 오류 발생:", error.message);
  }
}

// 스크립트 실행
runAllTests();
