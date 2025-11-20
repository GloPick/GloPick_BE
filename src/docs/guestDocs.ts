// Guest Service
export const guestSwaggerDocs = {
  paths: {
    "/api/guest/recommend": {
      post: {
        summary: "비회원 국가 추천",
        description:
          "비회원이 언어, 직무, 삶의 질 가중치, 전체 추천 가중치를 입력하여 API 기반으로 국가 추천을 받습니다. 회원과 동일한 추천 알고리즘을 사용하지만 데이터베이스에 저장하지 않으며 시뮬레이션 기능은 제공하지 않습니다.",
        tags: ["Guest"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  language: {
                    type: "string",
                    enum: [
                      "English",
                      "Japanese",
                      "Chinese",
                      "German",
                      "French",
                      "Spanish",
                      "Korean",
                      "Other",
                    ],
                    description: "사용 가능한 언어 (단일 선택)",
                    example: "Korean",
                  },
                  desiredJob: {
                    type: "string",
                    enum: [
                      "0",
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "10",
                    ],
                    description: "ISCO-08 대분류 코드",
                    example: "2",
                  },
                  qualityOfLifeWeights: {
                    type: "object",
                    description:
                      "OECD Better Life Index 5가지 지표별 가중치 (합계 100)",
                    properties: {
                      income: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        example: 25,
                        description: "소득 가중치",
                      },
                      jobs: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        example: 20,
                        description: "일자리 가중치",
                      },
                      health: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        example: 30,
                        description: "건강 가중치",
                      },
                      lifeSatisfaction: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        example: 15,
                        description: "삶의 만족도 가중치",
                      },
                      safety: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        example: 10,
                        description: "안전 가중치",
                      },
                    },
                    required: [
                      "income",
                      "jobs",
                      "health",
                      "lifeSatisfaction",
                      "safety",
                    ],
                  },
                  weights: {
                    type: "object",
                    description: "전체 추천 카테고리별 가중치 (합계 100)",
                    properties: {
                      languageWeight: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        example: 30,
                        description: "언어 카테고리 가중치",
                      },
                      jobWeight: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        example: 30,
                        description: "직무 카테고리 가중치",
                      },
                      qualityOfLifeWeight: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        example: 40,
                        description: "삶의 질 카테고리 가중치",
                      },
                    },
                    required: [
                      "languageWeight",
                      "jobWeight",
                      "qualityOfLifeWeight",
                    ],
                  },
                },
                required: [
                  "language",
                  "desiredJob",
                  "qualityOfLifeWeights",
                  "weights",
                ],
              },
            },
          },
        },
        responses: {
          200: {
            description: "국가 추천 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "비회원 국가 추천이 완료되었습니다.",
                    },
                    data: {
                      type: "object",
                      properties: {
                        userProfile: {
                          type: "object",
                          description: "입력한 사용자 프로필",
                          properties: {
                            language: {
                              type: "string",
                              example: "Korean",
                            },
                            desiredJob: {
                              type: "string",
                              example: "2",
                            },
                            qualityOfLifeWeights: {
                              type: "object",
                              properties: {
                                income: { type: "number", example: 25 },
                                jobs: { type: "number", example: 20 },
                                health: { type: "number", example: 30 },
                                lifeSatisfaction: {
                                  type: "number",
                                  example: 15,
                                },
                                safety: { type: "number", example: 10 },
                              },
                            },
                            weights: {
                              type: "object",
                              properties: {
                                languageWeight: { type: "number", example: 30 },
                                jobWeight: { type: "number", example: 30 },
                                qualityOfLifeWeight: {
                                  type: "number",
                                  example: 40,
                                },
                              },
                            },
                          },
                        },
                        recommendations: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              country: {
                                type: "string",
                                example: "Canada",
                              },
                              countryKo: {
                                type: "string",
                                example: "캐나다",
                              },
                              totalScore: {
                                type: "number",
                                example: 85.5,
                              },
                              reasons: {
                                type: "array",
                                items: {
                                  type: "string",
                                },
                                example: [
                                  "언어 점수가 높음",
                                  "경제 지표가 우수함",
                                ],
                              },
                            },
                          },
                        },
                        appliedWeights: {
                          type: "object",
                          properties: {
                            languageWeight: {
                              type: "number",
                              example: 30,
                            },
                            jobWeight: {
                              type: "number",
                              example: 30,
                            },
                            qualityOfLifeWeight: {
                              type: "number",
                              example: 40,
                            },
                          },
                        },
                        timestamp: {
                          type: "string",
                          format: "date-time",
                          example: "2024-01-15T10:30:00.000Z",
                        },
                        note: {
                          type: "string",
                          example:
                            "비회원은 국가 추천까지만 제공됩니다. 시뮬레이션 기능을 이용하려면 회원가입이 필요합니다.",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "잘못된 요청 (입력 데이터 검증 실패)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    message: {
                      type: "string",
                      example: "삶의 질 지표별 가중치의 합이 100이어야 합니다.",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "서버 오류",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    message: {
                      type: "string",
                      example: "국가 추천 처리 중 서버 오류가 발생했습니다.",
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
};
