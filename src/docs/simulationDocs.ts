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

                  budget: { type: "number", example: 3000 },
                  duration: { type: "string", example: "1년" },
                  languageLevel: {
                    type: "string",
                    enum: ["능숙", "기초", "통역 필요"],
                    example: "기초",
                  },
                  hasLicense: { type: "boolean", example: true },
                  jobTypes: {
                    type: "array",
                    items: { type: "string" },
                    example: ["원격 근무"],
                  },
                  requiredFacilities: {
                    type: "array",
                    items: { type: "string" },
                    example: ["병원", "대중교통"],
                  },
                  accompanyingFamily: {
                    type: "array",
                    items: { type: "string" },
                    example: ["배우자"],
                  },
                  visaStatus: {
                    type: "array",
                    items: { type: "string" },
                    example: ["취업 비자"],
                  },
                  departureAirport: {
                    type: "string",
                    example: "ICN",
                  },
                  additionalNotes: {
                    type: "string",
                    example: "추운 나라 희망",
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
                        simulationResult: {
                          type: "object",
                          properties: {
                            country: { type: "string", example: "캐나다" },
                            result: {
                              type: "object",
                              properties: {
                                recommendedCity: {
                                  type: "string",
                                  example: "밴프",
                                },
                                nearestAirport: {
                                  type: "object",
                                  properties: {
                                    name: {
                                      type: "string",
                                      example: "Calgary International Airport",
                                    },
                                    city: {
                                      type: "string",
                                      example: "Calgary",
                                    },
                                    code: { type: "string", example: "YYC" },
                                  },
                                },
                                estimatedMonthlyCost: {
                                  type: "object",
                                  properties: {
                                    housing: { type: "string", example: "180" },
                                    food: { type: "string", example: "30" },
                                    transportation: {
                                      type: "string",
                                      example: "10",
                                    },
                                    etc: { type: "string", example: "50" },
                                    total: { type: "string", example: "270" },
                                  },
                                },
                                jobOpportunity: {
                                  type: "string",
                                  example: "원격 근무 가능 직종 많음",
                                },
                                culturalTips: {
                                  type: "string",
                                  example: "다문화 친화적이며 영어 사용 환경",
                                },
                                warnings: {
                                  type: "string",
                                  example: "비자 준비 필요",
                                },
                                employmentProbability: {
                                  type: "number",
                                  example: 82,
                                },
                                migrationSuitability: {
                                  type: "number",
                                  example: 76,
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
                                "https://www.google.com/travel/flights?q=Flights from ICN to YYC/one way",
                            },
                            skyscanner: {
                              type: "string",
                              example:
                                "https://www.skyscanner.co.kr/transport/flights/icn/yyc/",
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
                              example: "ICN",
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
  },
};
