// 클라이언트에서 사용할 드롭다운 옵션 데이터

// 지원 가능한 언어 목록 (OECD 40개국 공식 언어 전체 포함)
export const SUPPORTED_LANGUAGES = [
  "Korean",
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Czech",
  "Hungarian",
  "Greek",
  "Turkish",
  "Japanese",
  "Hebrew",
  "Slovak",
  "Slovene",
  "Icelandic",
  "Estonian",
  "Latvian",
  "Lithuanian",
] as const;

// 직무 분야 목록 (ILOSTAT ISCO-08 대분류 기준)
export const JOB_FIELDS = [
  {
    code: "0",
    nameKo: "군인",
    nameEn: "Armed Forces Occupations",
    description:
      "사관 / 하사관 / 장교 / 부사관 / 병사 / ROTC / 군무원 등 국방 및 군사 관련 직무",
  },
  {
    code: "1",
    nameKo: "관리자",
    nameEn: "Managers",
    description:
      "CEO, 부장, 팀장, 공공기관 관리자, 스타트업 대표, 매니저, 공무원 간부, 정치인 등 조직의 운영·관리·의사결정 책임자",
  },
  {
    code: "2",
    nameKo: "전문가",
    nameEn: "Professionals",
    description:
      "과학·공학(연구원, 데이터 사이언티스트, AI 엔지니어, 소프트웨어 개발자 등), 보건(의사, 간호사, 약사 등), 교육(교수, 교사), 경영·금융(회계사, 경영컨설턴트), 법률·문화(변호사, 디자이너, 작가 등) 등 고숙련 전문직",
  },
  {
    code: "3",
    nameKo: "기술자 및 준전문가",
    nameEn: "Technicians and Associate Professionals",
    description:
      "CAD 기술자, 전산실 기술자, 임상시험코디네이터, 간호조무사, 방송기술자, IT 지원 기술자 등 전문가를 보조하거나 특정 기술을 수행하는 준전문직",
  },
  {
    code: "4",
    nameKo: "사무 종사자",
    nameEn: "Clerical Support Workers",
    description:
      "사무보조, 회계사무원, 인사·총무, 비서, 마케팅 사무원, 콜센터 상담원 등 사무 행정 및 지원 업무",
  },
  {
    code: "6",
    nameKo: "서비스 및 판매 종사자",
    nameEn: "Service and Sales Workers",
    description:
      "요리사, 바리스타, 미용사, 간병인, 호텔리어, 승무원, 판매원, 카페 매니저 등 고객대면 서비스 및 판매 관련 직무",
  },
  {
    code: "7",
    nameKo: "농림어업 숙련 종사자",
    nameEn: "Skilled Agricultural, Forestry and Fishery Workers",
    description:
      "농부, 과수농, 축산농, 임업인, 어부, 양식업 종사자, 조경사, 원예사 등 농림어업 및 원예·조경 분야 숙련 종사자",
  },
  {
    code: "8",
    nameKo: "기능원 및 관련 기능 종사자",
    nameEn: "Craft and Related Trades Workers",
    description:
      "건설 기능공, 목수, 배관공, 용접공, 자동차 정비사, 전기기사, 전자기기 수리공 등 현장 기반의 숙련 기능직",
  },
  {
    code: "9",
    nameKo: "설비·기계 조작 및 운전 종사자",
    nameEn: "Plant and Machine Operators and Drivers",
    description:
      "지게차·버스·트럭 운전기사, 크레인 기사, 생산기계 조작원, 반도체 장비 조작원 등 기계·설비 운전 및 조작 직무",
  },
  {
    code: "10",
    nameKo: "단순노무 종사자",
    nameEn: "Elementary Occupations",
    description:
      "청소원, 환경미화원, 경비원, 택배 상하차원, 음식 배달원, 주방보조, 건설현장 인부 등 단순 반복 작업 중심 직무",
  },
] as const;

// OECD Better Life Index 5가지 핵심 지표
export const QUALITY_OF_LIFE_INDICATORS = {
  income: {
    label: "소득 (Income)",
    description: "가구 순자산, 가구 순조정 가처분소득, 소득 분배 관련 지표",
    unit: "USD",
  },
  jobs: {
    label: "일자리 (Jobs)",
    description: "고용률, 장기실업률, 평균 연간 임금, 직업 안전성",
    unit: "%",
  },
  health: {
    label: "건강 (Health)",
    description: "기대수명, 건강상태 자가평가, 예방 가능 및 치료 가능 사망률",
    unit: "years/score",
  },
  lifeSatisfaction: {
    label: "삶의 만족도 (Life Satisfaction)",
    description: "삶의 만족도 평가 점수, 긍정적/부정적 경험 지표",
    unit: "0-10 scale",
  },
  safety: {
    label: "안전 (Safety)",
    description: "살인율, 야간 보행 안전 인식, 강도 피해율",
    unit: "%",
  },
} as const;

// 우선순위 옵션 (3가지: 언어, 직무, 삶의 질)
export const PRIORITY_OPTIONS = {
  language: {
    label: "언어 호환성",
    description: "사용 가능한 언어와 현지 언어의 일치도",
  },
  job: {
    label: "직무 기회",
    description: "해당 직무 분야의 취업 기회",
  },
  qualityOfLife: {
    label: "삶의 질",
    description: "OECD Better Life Index 기반 생활 여건",
  },
} as const;

/**
 * 필수 편의시설 옵션 (최대 5개 선택 가능)
 */
export const REQUIRED_FACILITIES = [
  // 의료 시설
  { category: "medical", value: "hospital", label: "종합병원", maxResults: 5 },
  { category: "medical", value: "clinic", label: "병의원", maxResults: 5 },
  { category: "medical", value: "pharmacy", label: "약국", maxResults: 5 },

  // 교육 시설
  {
    category: "education",
    value: "elementary_school",
    label: "초등학교",
    maxResults: 5,
  },
  {
    category: "education",
    value: "middle_school",
    label: "중학교",
    maxResults: 5,
  },
  {
    category: "education",
    value: "high_school",
    label: "고등학교",
    maxResults: 5,
  },
  {
    category: "education",
    value: "university",
    label: "대학교",
    maxResults: 3,
  },

  // 교통 시설
  {
    category: "transportation",
    value: "subway_station",
    label: "지하철",
    maxResults: 5,
  },
  {
    category: "transportation",
    value: "train_station",
    label: "기차역",
    maxResults: 3,
  },
  {
    category: "transportation",
    value: "airport",
    label: "공항",
    maxResults: 1,
  },

  // 생활 편의시설
  {
    category: "living",
    value: "supermarket",
    label: "대형마트",
    maxResults: 5,
  },
  {
    category: "living",
    value: "convenience_store",
    label: "편의점",
    maxResults: 5,
  },
  {
    category: "living",
    value: "korean_grocery",
    label: "한인마트",
    maxResults: 5,
  },
  {
    category: "living",
    value: "korean_restaurant",
    label: "한식당",
    maxResults: 5,
  },

  // 공공/행정 시설
  {
    category: "public",
    value: "korean_embassy",
    label: "한국 대사관/영사관",
    maxResults: 1,
  },
  { category: "public", value: "bank", label: "은행", maxResults: 5 },
  {
    category: "public",
    value: "police_station",
    label: "경찰서",
    maxResults: 3,
  },

  // 문화/여가 시설
  { category: "leisure", value: "park", label: "공원", maxResults: 5 },
  { category: "leisure", value: "library", label: "도서관", maxResults: 5 },
  {
    category: "leisure",
    value: "movie_theater",
    label: "영화관",
    maxResults: 5,
  },
  {
    category: "leisure",
    value: "shopping_mall",
    label: "쇼핑몰",
    maxResults: 3,
  },
  {
    category: "leisure",
    value: "tourist_attraction",
    label: "랜드마크/명소",
    maxResults: 1,
  },

  // 종교 시설
  { category: "religious", value: "church", label: "교회", maxResults: 5 },
  { category: "religious", value: "temple", label: "절/사찰", maxResults: 5 },
] as const;

/**
 * 카테고리별 편의시설 그룹
 */
export const FACILITIES_BY_CATEGORY = {
  medical: {
    label: "의료 시설",
    facilities: REQUIRED_FACILITIES.filter((f) => f.category === "medical"),
  },
  education: {
    label: "교육 시설",
    facilities: REQUIRED_FACILITIES.filter((f) => f.category === "education"),
  },
  transportation: {
    label: "교통 시설",
    facilities: REQUIRED_FACILITIES.filter(
      (f) => f.category === "transportation"
    ),
  },
  living: {
    label: "생활 편의시설",
    facilities: REQUIRED_FACILITIES.filter((f) => f.category === "living"),
  },
  public: {
    label: "공공/행정 시설",
    facilities: REQUIRED_FACILITIES.filter((f) => f.category === "public"),
  },
  leisure: {
    label: "문화/여가 시설",
    facilities: REQUIRED_FACILITIES.filter((f) => f.category === "leisure"),
  },
  religious: {
    label: "종교 시설",
    facilities: REQUIRED_FACILITIES.filter((f) => f.category === "religious"),
  },
} as const;

/**
 * 시설의 최대 검색 개수 가져오기
 */
export const getFacilityMaxResults = (facilityValue: string): number => {
  const facility = REQUIRED_FACILITIES.find((f) => f.value === facilityValue);
  return facility?.maxResults || 5;
};

/**
 * 시설 value로 label 가져오기
 */
export const getFacilityLabel = (facilityValue: string): string => {
  const facility = REQUIRED_FACILITIES.find((f) => f.value === facilityValue);
  return facility?.label || facilityValue;
};

// 타입 정의
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type JobFieldCode = (typeof JOB_FIELDS)[number]["code"];
export type PriorityOption = keyof typeof PRIORITY_OPTIONS;
export type QualityOfLifeIndicator = keyof typeof QUALITY_OF_LIFE_INDICATORS;
export type FacilityValue = (typeof REQUIRED_FACILITIES)[number]["value"];
export type FacilityCategory = (typeof REQUIRED_FACILITIES)[number]["category"];
