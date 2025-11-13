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
        summary: "시뮬레이션 추가 정보 입력 및 즉시 생성",
        description:
          "도시를 선택하고 추가 정보를 입력하면 자동으로 GPT 기반 시뮬레이션이 생성되어 저장됩니다. 별도의 생성 단계 없이 한 번에 처리됩니다.",
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
            description: "시뮬레이션 입력 및 생성 완료",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "integer", example: 201 },
                    message: {
                      type: "string",
                      example: "시뮬레이션 입력 및 생성 완료",
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
                        simulationId: {
                          type: "string",
                          example: "64f1234567890abcdef12347",
                          description: "생성된 시뮬레이션 ID",
                        },
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
                                },
                                publicTransport: { type: "string" },
                                safetyLevel: { type: "string" },
                                climateSummary: { type: "string" },
                                koreanCommunity: { type: "string" },
                                culturalTips: { type: "string" },
                                warnings: { type: "string" },
                              },
                            },
                            estimatedMonthlyCost: {
                              type: "object",
                              properties: {
                                housing: { type: "string" },
                                food: { type: "string" },
                                transportation: { type: "string" },
                                etc: { type: "string" },
                                total: { type: "string" },
                                oneYearCost: { type: "string" },
                                costCuttingTips: { type: "string" },
                                cpi: { type: "string" },
                              },
                            },
                            initialSetup: { type: "object" },
                            jobReality: { type: "object" },
                            culturalIntegration: { type: "object" },
                            facilityLocations: {
                              type: "object",
                              description: "Google Maps로 조회한 편의시설 위치",
                            },
                          },
                        },
                        flightLinks: {
                          type: "object",
                          properties: {
                            googleFlights: { type: "string" },
                            skyscanner: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          200: {
            description:
              "이미 동일한 조건으로 생성된 시뮬레이션이 있음 (기존 결과 반환)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "integer", example: 200 },
                    message: {
                      type: "string",
                      example:
                        "이미 동일한 조건으로 시뮬레이션이 생성되어 있습니다.",
                    },
                    data: {
                      type: "object",
                      properties: {
                        isExisting: { type: "boolean", example: true },
                        inputId: { type: "string" },
                        simulationId: { type: "string" },
                        result: { type: "object" },
                        flightLinks: { type: "object" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "잘못된 요청 데이터" },
          404: { description: "입력 정보를 찾을 수 없음" },
          500: { description: "시뮬레이션 생성 실패" },
        },
      },
    },
  },
};
