// 클라이언트에서 사용할 드롭다운 옵션 데이터

// 지원 가능한 언어 목록
export const SUPPORTED_LANGUAGES = [
  "Korean",
  "English", 
  "Chinese",
  "Japanese",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Arabic",
  "Hindi",
  "Dutch",
  "Swedish",
  "Norwegian",
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

// 우선순위 옵션
export const PRIORITY_OPTIONS = {
  language: {
    label: "언어 호환성",
    description: "사용 가능한 언어와 현지 언어의 일치도",
  },
  salary: {
    label: "연봉 조건", 
    description: "희망 연봉 달성 가능성",
  },
  job: {
    label: "직무 기회",
    description: "해당 직무 분야의 취업 기회",
  },
} as const;

// 우선순위 가중치
export const PRIORITY_WEIGHTS = {
  first: 0.5,  // 1순위 가중치
  second: 0.3, // 2순위 가중치  
  third: 0.2,  // 3순위 가중치
} as const;

// 타입 정의
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
export type JobFieldCode = typeof JOB_FIELDS[number]["code"];
export type PriorityOption = keyof typeof PRIORITY_OPTIONS;