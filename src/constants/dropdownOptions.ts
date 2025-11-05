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
    code: "1",
    nameKo: "관리자",
    nameEn: "Managers",
    description: "기업, 정부, 기타 조직의 정책 수립 및 계획 수립, 조정, 감독",
  },
  {
    code: "2",
    nameKo: "전문가",
    nameEn: "Professionals",
    description: "과학, 공학, 의학, 교육, 법률, 사회과학, 인문학 등 전문 분야",
  },
  {
    code: "3",
    nameKo: "기술자 및 준전문가",
    nameEn: "Technicians and Associate Professionals",
    description: "기술적 업무 수행 및 전문가 지원 업무",
  },
  {
    code: "4",
    nameKo: "사무종사자",
    nameEn: "Clerical Support Workers",
    description: "사무, 회계, 고객서비스 등 일반 사무 업무",
  },
  {
    code: "5",
    nameKo: "서비스 및 판매 종사자",
    nameEn: "Service and Sales Workers",
    description: "개인서비스, 보안서비스, 판매 업무",
  },
  {
    code: "6",
    nameKo: "농림어업 숙련 종사자",
    nameEn: "Skilled Agricultural, Forestry and Fishery Workers",
    description: "농업, 임업, 어업 분야 숙련 업무",
  },
  {
    code: "7",
    nameKo: "기능원 및 관련 기능 종사자",
    nameEn: "Craft and Related Trades Workers",
    description: "건설, 금속가공, 기계, 전기 등 기능 업무",
  },
  {
    code: "8",
    nameKo: "설비·기계 조작 및 조립 종사자",
    nameEn: "Plant and Machine Operators and Assemblers",
    description: "산업기계 및 설비 조작, 운송장비 운전, 조립 업무",
  },
  {
    code: "9",
    nameKo: "단순노무 종사자",
    nameEn: "Elementary Occupations",
    description: "청소, 건설보조, 제조업 단순작업 등",
  },
  {
    code: "0",
    nameKo: "군인",
    nameEn: "Armed Forces Occupations",
    description: "국방 및 군사 업무",
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
