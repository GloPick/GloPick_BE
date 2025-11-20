import { searchFacilities } from "../services/googleMapsService";
import dotenv from "dotenv";

// .env 파일 로드
dotenv.config();

const testGoogleMapsAPI = async () => {
  console.log("🧪 Google Maps API 테스트 시작...\n");

  try {
    // 테스트 데이터
    const city = "도쿄";
    const country = "일본";
    const facilities = ["병원", "슈퍼마켓", "약국"];

    console.log(`📍 검색 조건:`);
    console.log(`   - 도시: ${city}`);
    console.log(`   - 국가: ${country}`);
    console.log(`   - 편의시설: ${facilities.join(", ")}\n`);

    // Google Maps API 호출
    const results = await searchFacilities(city, country, facilities);

    console.log("✅ API 호출 성공!\n");

    // 결과 출력
    for (const [facility, locations] of Object.entries(results)) {
      console.log(`📌 ${facility} (${locations.length}개 발견):`);

      if (locations.length === 0) {
        console.log("   검색 결과 없음\n");
        continue;
      }

      locations.forEach((location, index) => {
        console.log(`   ${index + 1}. ${location.name}`);
        console.log(`      주소: ${location.address}`);
        console.log(
          `      위치: ${location.location.lat}, ${location.location.lng}`
        );
        console.log(`      평점: ${location.rating || "N/A"}`);
        console.log(`      Place ID: ${location.placeId}\n`);
      });
    }

    console.log("🎉 테스트 완료!");
  } catch (error: any) {
    console.error("❌ 테스트 실패:", error.message);

    if (error.message.includes("API 키")) {
      console.log(
        "\n💡 .env 파일에 GOOGLE_MAPS_API_KEY를 설정했는지 확인하세요."
      );
    }
  }
};

testGoogleMapsAPI();
