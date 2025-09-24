// Guest Service
export const guestSwaggerDocs = {
  paths: {
    "/api/guest/recommend": {
      post: {
        summary: "비회원 국가 추천",
        description:
          "비회원이 언어, 연봉, 직무, 우선순위를 입력하여 API 기반으로 국가 추천을 받습니다. 회원과 동일한 추천 알고리즘을 사용하지만 데이터베이스에 저장하지 않으며 시뮬레이션 기능은 제공하지 않습니다.",
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
                  expectedSalary: {
                    type: "number",
                    description: "희망 연봉 (USD)",
                    minimum: 10000,
                    maximum: 500000,
                    example: 50000,
                  },
                  jobField: {
                    type: "object",
                    properties: {
                      code: {
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
                        ],
                        description: "ISCO-08 대분류 코드",
                        example: "2",
                      },
                      nameKo: {
                        type: "string",
                        description: "한국어 직무명",
                        example: "전문가",
                      },
                    },
                    required: ["code", "nameKo"],
                  },
                  priorities: {
                    type: "object",
                    properties: {
                      first: {
                        type: "string",
                        enum: ["language", "salary", "job"],
                        description: "1순위 우선사항 (가중치 0.5)",
                        example: "salary",
                      },
                      second: {
                        type: "string",
                        enum: ["language", "salary", "job"],
                        description: "2순위 우선사항 (가중치 0.3)",
                        example: "language",
                      },
                      third: {
                        type: "string",
                        enum: ["language", "salary", "job"],
                        description: "3순위 우선사항 (가중치 0.2)",
                        example: "job",
                      },
                    },
                    required: ["first", "second", "third"],
                  },
                },
                required: [
                  "language",
                  "expectedSalary",
                  "jobField",
                  "priorities",
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
                            first: {
                              type: "number",
                              example: 0.5,
                            },
                            second: {
                              type: "number",
                              example: 0.3,
                            },
                            third: {
                              type: "number",
                              example: 0.2,
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
                      example: "사용 가능한 언어를 1개 이상 입력해주세요.",
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
