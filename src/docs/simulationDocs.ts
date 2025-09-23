// Simulation
export const simulationSwaggerDocs = {
  paths: {
    "/api/simulation/{recommendationId}/{profileId}": {
      post: {
        summary: "시뮬레이션 입력 정보 저장",
        tags: ["Simulation"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "recommendationId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "GPT 추천 결과 ID",
          },
          {
            name: "profileId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "사용자 이력(Profile) ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  selectedRankIndex: { type: "integer", example: 0 },
                  selectedCountry: { type: "string", example: "Canada" },
                  budget: {
                    type: "string",
                    enum: [
                      "300만~500만원",
                      "500만~800만원",
                      "800만~1200만원",
                      "1200만~1500만원",
                      "1500만원 이상",
                    ],
                    example: "500만~800만원",
                  },
                  duration: {
                    type: "string",
                    enum: [
                      "1년 미만",
                      "1~2년",
                      "3~4년",
                      "5~10년",
                      "10년 이상",
                      "평생 거주",
                    ],
                    example: "1~2년",
                  },
                  hasLicense: { type: "boolean", example: true },
                  jobTypes: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: [
                        "정규직",
                        "아르바이트",
                        "창업/자영업",
                        "프리랜서",
                        "기타",
                      ],
                    },
                    example: ["정규직", "프리랜서"],
                  },
                  requiredFacilities: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: [
                        "대중교통 접근성",
                        "마트/슈퍼 근접성",
                        "병원/약국 접근성",
                        "유치원/학교 접근성",
                        "반려동물 친화",
                        "공원/자연환경",
                        "피트니스/헬스장",
                        "카페/문화 시설",
                        "치안",
                      ],
                    },
                    example: ["대중교통 접근성", "병원/약국 접근성"],
                  },
                  accompanyingFamily: {
                    type: "object",
                    properties: {
                      spouse: {
                        type: "number",
                        minimum: 0,
                        maximum: 1,
                        example: 1,
                      },
                      children: {
                        type: "number",
                        minimum: 0,
                        maximum: 10,
                        example: 2,
                      },
                      parents: {
                        type: "number",
                        minimum: 0,
                        maximum: 2,
                        example: 0,
                      },
                    },
                  },
                  visaStatus: {
                    type: "string",
                    enum: ["있음", "없음"],
                    example: "없음",
                  },
                  additionalNotes: {
                    type: "string",
                    example: "추운 나라 희망",
                  },
                  selectedCity: {
                    type: "string",
                    example: "Vancouver",
                  },
                  recommendedCities: {
                    type: "array",
                    items: { type: "string" },
                    example: ["Vancouver", "Toronto", "Montreal"],
                  },
                  departureAirport: {
                    type: "string",
                    enum: [
                      "인천국제공항",
                      "김포국제공항",
                      "김해국제공항",
                      "제주국제공항",
                      "청주국제공항",
                      "대구국제공항",
                      "무안국제공항",
                    ],
                    example: "인천국제공항",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "시뮬레이션 입력 정보 저장 성공" },
          400: {
            description: "중복된 시뮬레이션 입력",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        inputId: {
                          type: "string",
                          example: "665abc123...",
                        },
                      },
                    },
                  },
                },
              },
            },
          },

          500: { description: "서버 오류" },
        },
      },
    },
    "/api/simulation/{id}/cities": {
      post: {
        summary: "GPT 기반 도시 3개 추천",
        tags: ["Simulation"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "SimulationInput ID",
          },
        ],
        responses: {
          200: {
            description: "도시 추천 성공",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "array",
                        items: { type: "string" },
                        example: ["밴쿠버", "토론토", "몬트리올"],
                      },
                      summary: {
                        type: "string",
                        example: "기후 온화하고 교통 좋음",
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "이미 도시 추천이 완료된 입력",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "이미 도시 추천이 완료된 입력입니다.",
                    },
                    data: {
                      type: "object",
                      properties: {
                        recommendedCities: {
                          type: "array",
                          items: { type: "string" },
                          example: ["밴쿠버", "토론토", "몬트리올"],
                        },
                        inputId: {
                          type: "string",
                          example: "664df123abc...",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: "선택한 추천 결과를 찾을 수 없습니다." },
          500: { description: "GPT 호출 실패" },
        },
      },
    },
    "/api/simulation/{id}/gpt": {
      post: {
        summary: "선택한 도시 기반 시뮬레이션 생성 및 저장",
        tags: ["Simulation"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "SimulationInput ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  selectedCityIndex: { type: "number", example: "1" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "시뮬레이션 생성 및 저장 완료",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: {
                      type: "integer",
                      example: 201,
                    },
                    message: {
                      type: "string",
                      example: "시뮬레이션 생성 및 저장 완료",
                    },
                    data: {
                      type: "object",
                      properties: {
                        result: {
                          type: "object",
                          properties: {
                            country: { type: "string", example: "미국" },
                            recommendedCity: {
                              type: "string",
                              example: "매디슨",
                            },
                            localInfo: {
                              type: "object",
                              properties: {
                                publicTransport: {
                                  type: "string",
                                  example:
                                    "버스가 주요 교통수단입니다. 하지만 운전면허가 있으므로 차량 이용이 가능합니다.",
                                },
                                safetyLevel: {
                                  type: "string",
                                  example:
                                    "대한민국과 비교하여 치안이 좋으나, 항상 주의가 필요합니다.",
                                },
                                climateSummary: {
                                  type: "string",
                                  example:
                                    "사계절이 뚜렷하며 겨울에는 매우 추워집니다.",
                                },
                                koreanCommunity: {
                                  type: "string",
                                  example:
                                    "한인 마트와 한식당이 몇 군데 있습니다.",
                                },
                                essentialFacilities: {
                                  type: "array",
                                  items: { type: "string" },
                                  example: [
                                    "University Hospital",
                                    "Woodman's Food Market",
                                    "Chicago Consulate General",
                                  ],
                                },
                                culturalTips: {
                                  type: "string",
                                  example:
                                    "현지인들은 친절하며, 다양한 문화를 존중합니다.",
                                },
                                warnings: {
                                  type: "string",
                                  example:
                                    "겨울철 눈길 운전에 주의해야 합니다.",
                                },
                              },
                            },
                            estimatedMonthlyCost: {
                              type: "object",
                              properties: {
                                housing: { type: "string", example: "100만원" },
                                food: { type: "string", example: "40만원" },
                                transportation: {
                                  type: "string",
                                  example: "20만원",
                                },
                                etc: { type: "string", example: "30만원" },
                                total: { type: "string", example: "190만원" },
                                oneYearCost: {
                                  type: "string",
                                  example: "2280만원",
                                },
                                costCuttingTips: {
                                  type: "string",
                                  example:
                                    "대중교통을 이용하거나, 중고 가구를 활용하는 것이 좋습니다.",
                                },
                                cpi: {
                                  type: "string",
                                  example:
                                    "대한민국 보다 1.2배 정도 물가가 높은 편입니다.",
                                },
                              },
                            },
                            nearestAirport: {
                              type: "object",
                              properties: {
                                name: {
                                  type: "string",
                                  example: "Dane County Regional Airport",
                                },
                                city: { type: "string", example: "매디슨" },
                                code: { type: "string", example: "MSN" },
                              },
                            },
                            initialSetup: {
                              type: "object",
                              properties: {
                                shortTermHousingOptions: {
                                  type: "array",
                                  items: { type: "string" },
                                  example: ["호텔", "호스텔", "에어비앤비"],
                                },
                                longTermHousingPlatforms: {
                                  type: "array",
                                  items: { type: "string" },
                                  example: ["Zillow", "Apartments.com"],
                                },
                                mobilePlan: {
                                  type: "string",
                                  example:
                                    "선불 심카드가 편리합니다 (예: AT&T, T-Mobile)",
                                },
                                bankAccount: {
                                  type: "string",
                                  example:
                                    "여권과 주소 증빙만으로 계좌 개설이 가능합니다.",
                                },
                              },
                            },
                            jobReality: {
                              type: "object",
                              properties: {
                                commonJobs: {
                                  type: "array",
                                  items: { type: "string" },
                                  example: [
                                    "원격 근무가 가능한 IT, 마케팅, 디자인 등의 직종이 추천됩니다.",
                                  ],
                                },
                                jobSearchPlatforms: {
                                  type: "array",
                                  items: { type: "string" },
                                  example: ["Indeed", "LinkedIn", "Glassdoor"],
                                },
                                languageRequirement: {
                                  type: "string",
                                  example: "영어 중급 이상 필수",
                                },
                                visaLimitationTips: {
                                  type: "string",
                                  example:
                                    "취업 비자는 고용주 스폰서가 필요합니다.",
                                },
                              },
                            },
                            culturalIntegration: {
                              type: "object",
                              properties: {
                                koreanPopulationRate: {
                                  type: "string",
                                  example:
                                    "전체 인구의 약 0.5% 이므로 한국인이 많지 않습니다.",
                                },
                                foreignResidentRatio: {
                                  type: "string",
                                  example: "8.5%",
                                },
                                koreanResourcesLinks: {
                                  type: "array",
                                  items: { type: "string" },
                                  example: [
                                    "https://www.koreanmadison.org",
                                    "https://www.facebook.com/groups/2204690880",
                                  ],
                                },
                              },
                            },
                          },
                        },
                        flightLinks: {
                          type: "object",
                          properties: {
                            googleFlights: {
                              type: "string",
                              example:
                                "https://www.google.com/travel/flights?q=Flights from Incheon%20International%20Airport%20(ICN) to MSN/one way",
                            },
                            skyscanner: {
                              type: "string",
                              example:
                                "https://www.skyscanner.co.kr/transport/flights/icn/msn/",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "도시 선택 안 됨" },
          404: { description: "입력 정보 없음" },
          500: { description: "GPT 호출 또는 저장 실패" },
        },
      },
    },

    "/api/simulation/{id}/flight-links": {
      get: {
        summary: "항공권 링크 생성",
        tags: ["Simulation"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "SimulationInput ID",
          },
        ],
        responses: {
          200: {
            description: "항공권 링크 생성 완료",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: {
                      type: "integer",
                      example: 200,
                    },
                    message: {
                      type: "string",
                      example: "항공권 링크 생성 완료",
                    },
                    data: {
                      type: "object",
                      properties: {
                        simulation: {
                          type: "object",
                          properties: {
                            _id: { type: "string", example: "6632abc123..." },
                            departureAirport: {
                              type: "string",
                              example: "인천국제공항",
                            },
                            selectedCity: {
                              type: "string",
                              example: "Vancouver",
                            },
                          },
                        },

                        flightLinks: {
                          type: "object",
                          properties: {
                            googleFlights: {
                              type: "string",
                              example:
                                "https://www.google.com/travel/flights?q=Flights from ICN to Vancouver/one way",
                            },
                            skyscanner: {
                              type: "string",
                              example:
                                "https://www.skyscanner.co.kr/transport/flights/icn/vancouver/",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "출발지 또는 도착지 정보 누락",
          },
          404: {
            description: "시뮬레이션 정보 없음",
          },
          500: {
            description: "서버 오류",
          },
        },
      },
    },
    "/api/simulation/scores/{simulationInputId}": {
      get: {
        summary: "취업 가능성과 이주 추천도 계산",
        tags: ["Simulation"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "simulationInputId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "SimulationInput ID (MongoDB ObjectId)",
          },
        ],
        responses: {
          200: {
            description: "점수 계산 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: {
                      type: "integer",
                      example: 200,
                    },
                    message: {
                      type: "string",
                      example: "점수 계산 성공",
                    },
                    data: {
                      type: "object",
                      properties: {
                        migrationSuitability: {
                          type: "integer",
                          example: 74,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "입력 정보 또는 사용자 이력 정보 없음",
          },
          500: {
            description: "서버 오류",
          },
        },
      },
    },

    "/api/simulation/list": {
      get: {
        summary: "시뮬레이션 요약 리스트 조회",
        tags: ["Simulation"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "시뮬레이션 요약 리스트 조회 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: {
                      type: "integer",
                      example: 200,
                    },
                    message: {
                      type: "string",
                      example: "시뮬레이션 요약 리스트 조회 성공",
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          simulationId: {
                            type: "string",
                            example: "663fe59a5230fdd9c41a67af",
                          },
                          job: {
                            type: "string",
                            example: "한식 요리사",
                          },
                          country: {
                            type: "string",
                            example: "캐나다",
                          },
                          city: {
                            type: "string",
                            example: "밴쿠버",
                          },
                          migrationSuitability: {
                            type: "number",
                            example: 76,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "인증 실패 (토큰 없음 또는 만료)",
          },
          500: {
            description: "서버 오류",
          },
        },
      },
    },
  },
};
