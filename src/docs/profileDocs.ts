//Profile
export const profileSwaggerDocs = {
  paths: {
    "/api/profile/options": {
      get: {
        summary: "프로필 생성을 위한 드롭다운 옵션 조회",
        description:
          "언어, 직무 분류, 연봉 범위 등 프로필 생성에 필요한 드롭다운 옵션들을 반환합니다.",
        tags: ["Profile"],
        responses: {
          200: {
            description: "드롭다운 옵션 조회 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "드롭다운 옵션 조회 성공",
                    },
                    data: {
                      type: "object",
                      properties: {
                        languages: {
                          type: "array",
                          items: { type: "string" },
                          example: ["Korean", "English", "Chinese"],
                        },
                        jobFields: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              code: { type: "string", example: "2" },
                              nameKo: { type: "string", example: "전문가" },
                              nameEn: {
                                type: "string",
                                example: "Professionals",
                              },
                              description: {
                                type: "string",
                                example: "과학, 공학, 의학, 교육 등 전문 분야",
                              },
                            },
                          },
                        },
                        salaryRanges: {
                          type: "array",
                          items: { type: "string" },
                          example: [
                            "2천만 이하",
                            "2천만 ~ 3천만",
                            "3천만 ~ 5천만",
                          ],
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
    "/api/profile": {
      post: {
        summary: "사용자 이력 등록",
        description:
          "사용자의 언어 능력, 희망 연봉, 직무, 가중치, 추가 메모 등을 등록합니다. 동일한 내용의 이력은 중복 등록이 불가합니다.",
        tags: ["Profile"],
        security: [{ bearerAuth: [] }],
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
                    example: "English",
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
                        example: 20,
                      },
                      jobs: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        example: 20,
                      },
                      health: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        example: 20,
                      },
                      lifeSatisfaction: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        example: 20,
                      },
                      safety: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        example: 20,
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
                  desiredJob: {
                    type: "string",
                    enum: [
                      "0", // 군인
                      "1", // 관리자
                      "2", // 전문가
                      "3", // 기술자 및 준전문가
                      "4", // 사무종사자
                      "5", // 서비스 및 판매 종사자
                      "6", // 농림어업 숙련 종사자
                      "7", // 기능원 및 관련 기능 종사자
                      "8", // 설비·기계 조작 및 조립 종사자
                      "9", // 단순노무 종사자
                    ],
                    description: "ISCO-08 대분류 직업군 코드",
                    example: "2",
                  },
                  languageWeight: {
                    type: "integer",
                    description: "언어 가중치 (10 단위)",
                    example: 40,
                  },
                  qualityOfLifeWeight: {
                    type: "integer",
                    description: "삶의 질 가중치 (10 단위)",
                    example: 40,
                  },
                  jobWeight: {
                    type: "integer",
                    description: "직무 가중치 (10 단위)",
                    example: 30,
                  },
                  additionalNotes: {
                    type: "string",
                    example: "원격 근무 원함",
                  },
                },
                required: [
                  "language",
                  "desiredJob",
                  "qualityOfLifeWeights",
                  "languageWeight",
                  "jobWeight",
                  "qualityOfLifeWeight",
                ],
              },
            },
          },
        },
        responses: {
          201: {
            description: "이력 등록 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "number", example: 201 },
                    message: {
                      type: "string",
                      example: "이력이 정상적으로 등록되었습니다.",
                    },
                    data: { type: "null", example: null },
                  },
                },
              },
            },
          },
          400: {
            description: "중복된 이력 등록 시도",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "number", example: 400 },
                    message: {
                      type: "string",
                      example:
                        "이전 이력과 내용이 동일합니다. 등록이 불가합니다.",
                    },
                    data: {
                      type: "object",
                      properties: {
                        profileId: {
                          type: "string",
                          example: "681f6035615bf...",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "인증 실패",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "number", example: 401 },
                    message: { type: "string", example: "인증이 필요합니다." },
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
