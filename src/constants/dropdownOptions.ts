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

// 타입 정의
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type JobFieldCode = (typeof JOB_FIELDS)[number]["code"];
export type PriorityOption = keyof typeof PRIORITY_OPTIONS;
export type QualityOfLifeIndicator = keyof typeof QUALITY_OF_LIFE_INDICATORS;
