// Simulation
export const simulationSwaggerDocs = {
  paths: {
    "/api/simulation/test-google-maps": {
      post: {
        summary: "Google Maps API 테스트",
        description:
          "Google Maps Places API와 Geocoding API가 정상적으로 작동하는지 테스트합니다. 도시와 편의시설을 입력하면 해당 위치 정보를 반환합니다.",
        tags: ["Simulation"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  city: {
                    type: "string",
                    example: "도쿄",
                    description: "검색할 도시명",
                  },
                  country: {
                    type: "string",
                    example: "일본",
                    description: "국가명",
                  },
                  facilities: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    example: ["병원", "슈퍼마켓", "약국"],
                    description: "검색할 편의시설 목록",
                  },
                },
                required: ["city", "country", "facilities"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Google Maps API 테스트 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    code: { type: "integer", example: 200 },
                    message: {
                      type: "string",
                      example: "Google Maps API 테스트 성공",
                    },
                    data: {
                      type: "object",
                      properties: {
                        mapCenter: {
                          type: "object",
                          properties: {
                            lat: { type: "number", example: 35.6762 },
                            lng: { type: "number", example: 139.6503 },
                          },
                          description: "도시의 중심 좌표",
                        },
                        facilityLocations: {
                          type: "object",
                          additionalProperties: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: {
                                  type: "string",
                                  example: "도쿄대학병원",
                                },
                                address: {
                                  type: "string",
                                  example: "일본 도쿄도 분쿄구...",
                                },
                                location: {
                                  type: "object",
                                  properties: {
                                    lat: { type: "number", example: 35.7148 },
                                    lng: { type: "number", example: 139.7628 },
                                  },
                                },
                                placeId: { type: "string", example: "ChIJ..." },
                                rating: { type: "number", example: 4.2 },
                              },
                            },
                          },
                          description: "각 편의시설별 위치 정보 (최대 5개씩)",
                          example: {
                            병원: [
                              {
                                name: "도쿄대학병원",
                                address: "일본 도쿄도 분쿄구...",
                                location: { lat: 35.7148, lng: 139.7628 },
                                placeId: "ChIJ...",
                                rating: 4.2,
                              },
                            ],
                            슈퍼마켓: [
                              {
                                name: "세븐일레븐 신주쿠점",
                                address: "일본 도쿄도 신주쿠구...",
                                location: { lat: 35.6895, lng: 139.7004 },
                                placeId: "ChIJ...",
                                rating: 4.0,
                              },
                            ],
                          },
                        },
                        summary: {
                          type: "object",
                          properties: {
                            city: { type: "string", example: "도쿄" },
                            country: { type: "string", example: "일본" },
                            facilitiesSearched: { type: "integer", example: 3 },
                            totalLocationsFound: {
                              type: "integer",
                              example: 15,
                            },
                          },
                          description: "검색 결과 요약",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "잘못된 요청 (필수 파라미터 누락)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    code: { type: "integer", example: 400 },
                    message: {
                      type: "string",
                      example: "city, country, facilities(배열)가 필요합니다.",
                    },
                    data: { type: "null" },
                  },
                },
              },
            },
          },
          500: {
            description: "Google Maps API 호출 실패",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    code: { type: "integer", example: 500 },
                    message: {
                      type: "string",
                      example: "Google Maps API 호출 중 오류가 발생했습니다.",
                    },
                    data: { type: "null" },
                    error: { type: "string", example: "API key is invalid" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/simulation/recommend-cities/{recommendationId}/{profileId}": {
      post: {
        summary: "선택한 국가 기반으로 도시 3개 추천",
        tags: ["Simulation"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "recommendationId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "국가 추천 결과 ID",
          },
          {
            name: "profileId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "사용자 프로필 ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  selectedCountryIndex: {
                    type: "integer",
                    minimum: 0,
                    maximum: 4,
                    example: 0,
                    description: "선택한 국가의 순위 인덱스 (0-4)",
                  },
                },
                required: ["selectedCountryIndex"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "도시 추천 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "integer", example: 200 },
                    message: { type: "string", example: "도시 추천 성공" },
                    data: {
                      type: "object",
                      properties: {
                        isExisting: {
                          type: "boolean",
                          example: false,
                          description: "기존 추천 존재 여부",
                        },
                        inputId: {
                          type: "string",
                          example: "64f1234567890abcdef12346",
                        },
                        selectedCountry: {
                          type: "string",
                          example: "Canada",
                        },
                        recommendedCities: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string", example: "Vancouver" },
                              summary: {
                                type: "string",
                                example:
                                  "기후가 온화하고 다문화 환경이 좋음. 한국인 커뮤니티가 활발하며 IT 산업이 발달되어 있어 취업 기회가 많습니다.",
                              },
                            },
                          },
                          example: [
                            {
                              name: "Vancouver",
                              summary: "기후가 온화하고 다문화 환경이 좋음",
                            },
                            {
                              name: "Toronto",
                              summary: "경제 중심지로 취업 기회가 많음",
                            },
                            {
                              name: "Montreal",
                              summary: "문화가 풍부하고 생활비가 저렴함",
                            },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "유효하지 않은 국가 인덱스" },
          404: { description: "추천 결과 또는 프로필을 찾을 수 없음" },
          409: {
            description:
              "중복된 도시 추천 요청 (이미 해당 국가에 대한 도시 추천을 받았습니다)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "integer", example: 409 },
                    message: {
                      type: "string",
                      example: "이미 해당 국가에 대한 도시 추천을 받았습니다.",
                    },
                    data: {
                      type: "object",
                      properties: {
                        isExisting: {
                          type: "boolean",
                          example: true,
                        },
                        inputId: {
                          type: "string",
                          example: "64f1234567890abcdef12346",
                          description: "기존 도시 추천 Input ID",
                        },
                        selectedCountry: {
                          type: "string",
                          example: "Canada",
                        },
                        recommendedCities: {
                          type: "array",
                          items: { type: "string" },
                          example: ["Vancouver", "Toronto", "Montreal"],
                          description: "기존 추천된 도시 목록",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          500: { description: "GPT 호출 실패" },
        },
      },
    },
    "/api/simulation/input/{id}": {
      post: {
        summary: "시뮬레이션 추가 정보 입력 및 저장",
        tags: ["Simulation"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "도시 추천에서 받은 SimulationInput ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  selectedCityIndex: {
                    type: "integer",
                    minimum: 0,
                    maximum: 2,
                    example: 0,
                    description: "선택한 도시의 인덱스 (0-2)",
                  },
                  initialBudget: {
                    type: "string",
                    enum: [
                      "300만~500만원",
                      "500만~800만원",
                      "800만~1200만원",
                      "1200만~1500만원",
                      "1500만원 이상",
                    ],
                    example: "500만~800만원",
                    description: "초기 정착 예산",
                  },
                  requiredFacilities: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: [
                        "hospital",
                        "clinic",
                        "pharmacy",
                        "elementary_school",
                        "middle_school",
                        "high_school",
                        "university",
                        "subway_station",
                        "train_station",
                        "airport",
                        "supermarket",
                        "convenience_store",
                        "korean_grocery",
                        "korean_restaurant",
                        "korean_embassy",
                        "bank",
                        "police_station",
                        "park",
                        "library",
                        "movie_theater",
                        "shopping_mall",
                        "tourist_attraction",
                        "church",
                        "temple",
                      ],
                    },
                    example: [
                      "hospital",
                      "subway_station",
                      "supermarket",
                      "bank",
                      "park",
                    ],
                    description: "필요한 시설 (최대 5개 선택)",
                    maxItems: 5,
                    minItems: 1,
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
                    description: "출발 공항",
                  },
                },
                required: [
                  "selectedCityIndex",
                  "initialBudget",
                  "requiredFacilities",
                  "departureAirport",
                ],
              },
            },
          },
        },
        responses: {
          201: {
            description: "시뮬레이션 입력 정보 저장 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "integer", example: 201 },
                    message: {
                      type: "string",
                      example: "시뮬레이션 입력 정보 저장 성공",
                    },
                    data: {
                      type: "object",
                      properties: {
                        isExisting: {
                          type: "boolean",
                          example: false,
                          description: "기존 데이터 존재 여부",
                        },
                        inputId: {
                          type: "string",
                          example: "64f1234567890abcdef12346",
                        },
                        selectedCountry: { type: "string", example: "Canada" },
                        selectedCity: { type: "string", example: "Vancouver" },
                        initialBudget: {
                          type: "string",
                          example: "500만~800만원",
                        },
                        requiredFacilities: {
                          type: "array",
                          items: { type: "string" },
                          example: [
                            "hospital",
                            "subway_station",
                            "supermarket",
                          ],
                        },
                        departureAirport: {
                          type: "string",
                          example: "인천국제공항",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "잘못된 요청 데이터" },
          404: { description: "입력 정보를 찾을 수 없음" },
          409: {
            description:
              "중복된 입력 정보 (이미 동일한 조건으로 저장되어 있습니다)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "integer", example: 409 },
                    message: {
                      type: "string",
                      example:
                        "이미 동일한 조건으로 입력 정보가 저장되어 있습니다.",
                    },
                    data: {
                      type: "object",
                      properties: {
                        isExisting: {
                          type: "boolean",
                          example: true,
                        },
                        inputId: {
                          type: "string",
                          example: "64f1234567890abcdef12346",
                          description: "기존 입력 정보 ID",
                        },
                        selectedCountry: {
                          type: "string",
                          example: "Canada",
                        },
                        selectedCity: {
                          type: "string",
                          example: "Vancouver",
                        },
                        initialBudget: {
                          type: "string",
                          example: "500만~800만원",
                        },
                        requiredFacilities: {
                          type: "array",
                          items: { type: "string" },
                          example: [
                            "hospital",
                            "subway_station",
                            "supermarket",
                          ],
                        },
                        departureAirport: {
                          type: "string",
                          example: "인천국제공항",
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
    "/api/simulation/{id}/generate": {
      post: {
        summary: "선택한 도시 기반 시뮬레이션 생성 및 저장",
        description:
          "이전 단계(/api/simulation/input/{id})에서 저장된 정보를 사용하여 GPT 기반 시뮬레이션을 생성합니다. Request body 없이 inputId만 전달하면 됩니다.",
        tags: ["Simulation"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description:
              "SimulationInput ID (추가 정보 입력 단계에서 저장된 inputId)",
          },
        ],
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
                            country: { type: "string", example: "캐나다" },
                            recommendedCity: {
                              type: "string",
                              example: "밴쿠버",
                            },
                            localInfo: {
                              type: "object",
                              properties: {
                                essentialFacilities: {
                                  type: "array",
                                  items: { type: "string" },
                                  example: [
                                    "VGH (Vancouver General Hospital)",
                                    "T&T Supermarket (한국 식재료)",
                                    "SkyTrain 역",
                                  ],
                                },
                                publicTransport: {
                                  type: "string",
                                  example:
                                    "SkyTrain과 버스가 잘 연결되어 있어 대중교통 이용이 편리합니다.",
                                },
                                safetyLevel: {
                                  type: "string",
                                  example:
                                    "캐나다는 안전한 국가로 유명하며, 밴쿠버도 비교적 안전합니다.",
                                },
                                climateSummary: {
                                  type: "string",
                                  example:
                                    "온화한 해양성 기후로 겨울에도 영하로 잘 내려가지 않습니다.",
                                },
                                koreanCommunity: {
                                  type: "string",
                                  example:
                                    "한인타운이 발달되어 있어 한국 음식과 서비스를 쉽게 이용할 수 있습니다.",
                                },
                                culturalTips: {
                                  type: "string",
                                  example:
                                    "다문화를 존중하는 문화가 잘 정착되어 있습니다.",
                                },
                                warnings: {
                                  type: "string",
                                  example:
                                    "집값이 비싸므로 예산을 충분히 준비하세요.",
                                },
                              },
                            },
                            estimatedMonthlyCost: {
                              type: "object",
                              properties: {
                                housing: { type: "string", example: "150만원" },
                                food: { type: "string", example: "60만원" },
                                transportation: {
                                  type: "string",
                                  example: "15만원",
                                },
                                etc: { type: "string", example: "40만원" },
                                total: { type: "string", example: "265만원" },
                                oneYearCost: {
                                  type: "string",
                                  example: "3180만원",
                                },
                                costCuttingTips: {
                                  type: "string",
                                  example:
                                    "룸메이트와 함께 거주하거나 외곽 지역을 고려해보세요.",
                                },
                                cpi: {
                                  type: "string",
                                  example:
                                    "한국 대비 약 1.3배 정도 물가가 높습니다.",
                                },
                              },
                            },
                            initialSetup: {
                              type: "object",
                              properties: {
                                shortTermHousingOptions: {
                                  type: "array",
                                  items: { type: "string" },
                                  example: [
                                    "호스텔",
                                    "에어비앤비",
                                    "단기 렌탈",
                                  ],
                                },
                                longTermHousingPlatforms: {
                                  type: "array",
                                  items: { type: "string" },
                                  example: [
                                    "Craigslist",
                                    "PadMapper",
                                    "Kijiji",
                                  ],
                                },
                                mobilePlan: {
                                  type: "string",
                                  example:
                                    "Fido, Rogers 등에서 선불 또는 후불 요금제 선택 가능",
                                },
                                bankAccount: {
                                  type: "string",
                                  example:
                                    "TD Bank, RBC 등에서 신분증으로 계좌 개설 가능",
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
                                    "IT 개발자",
                                    "마케팅 전문가",
                                    "서비스업",
                                    "한국어 강사",
                                  ],
                                },
                                jobSearchPlatforms: {
                                  type: "array",
                                  items: { type: "string" },
                                  example: ["Indeed", "LinkedIn", "Workopolis"],
                                },
                                languageRequirement: {
                                  type: "string",
                                  example:
                                    "영어 중급 이상 필수, 불어 가능하면 더 유리",
                                },
                                visaLimitationTips: {
                                  type: "string",
                                  example: "워킹홀리데이 비자나 취업 비자 필요",
                                },
                              },
                            },
                            culturalIntegration: {
                              type: "object",
                              properties: {
                                koreanPopulationRate: {
                                  type: "string",
                                  example:
                                    "전체 인구의 약 2% 정도로 한국인 커뮤니티가 활발합니다.",
                                },
                                foreignResidentRatio: {
                                  type: "string",
                                  example: "45%",
                                },
                                koreanResourcesLinks: {
                                  type: "array",
                                  items: { type: "string" },
                                  example: [
                                    "https://www.vankoreancommunity.com",
                                    "https://www.facebook.com/groups/vancouver.korean",
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
                                "https://www.google.com/travel/flights?q=Flights from ICN to YVR/one way",
                            },
                            skyscanner: {
                              type: "string",
                              example:
                                "https://www.skyscanner.co.kr/transport/flights/icn/yvr/",
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
          400: { description: "필수 정보 누락" },
          404: { description: "입력 정보 없음" },
          500: { description: "GPT 호출 또는 저장 실패" },
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
                          country: {
                            type: "string",
                            example: "캐나다",
                          },
                          city: {
                            type: "string",
                            example: "밴쿠버",
                          },
                          initialBudget: {
                            type: "string",
                            example: "500만~800만원",
                          },
                          createdAt: {
                            type: "string",
                            example: "2024-01-01T00:00:00.000Z",
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
