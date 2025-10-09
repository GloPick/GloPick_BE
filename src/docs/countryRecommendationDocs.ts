// Country Recommendation
export const countryRecommendationSwaggerDocs = {
  paths: {
    "/api/country-recommendations/{profileId}": {
      post: {
        summary: "인증된 사용자의 특정 프로필 기반 국가 추천",
        description:
          "특정 프로필 ID로 국가 추천을 요청합니다. 중복 요청 시 기존 결과를 반환하며, 신규 추천 시 결과를 저장합니다.",
        tags: ["Country Recommendations"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "profileId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "추천을 받을 프로필 ID",
          },
        ],
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
                    example: "Korean",
                  },
                  expectedSalary: {
                    type: "number",
                    description: "희망 연봉 (USD)",
                    example: 80000,
                  },
                  jobField: {
                    type: "object",
                    properties: {
                      code: { type: "string", example: "2" },
                      nameKo: { type: "string", example: "전문가" },
                      nameEn: { type: "string", example: "Professionals" },
                    },
                    required: ["code", "nameKo", "nameEn"],
                  },
                  languageWeight: {
                    type: "integer",
                    description: "언어 가중치 (10 단위)",
                    example: 50,
                  },
                  salaryWeight: {
                    type: "integer",
                    description: "연봉 가중치 (10 단위)",
                    example: 30,
                  },
                  jobWeight: {
                    type: "integer",
                    description: "직무 가중치 (10 단위)",
                    example: 20,
                  },
                },
                required: [
                  "language",
                  "expectedSalary",
                  "jobField",
                  "languageWeight",
                  "salaryWeight",
                  "jobWeight",
                ],
              },
            },
          },
        },
        responses: {
          200: {
            description: "추천 완료 또는 기존 추천 결과 반환",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: {
                      type: "string",
                      example: "국가 추천이 완료되고 저장되었습니다.",
                    },
                    data: {
                      type: "object",
                      properties: {
                        isExisting: { type: "boolean", example: false },
                        recommendationId: {
                          type: "string",
                          example: "660f62c89abf1b001c66e678",
                        },
                        profileId: {
                          type: "string",
                          example: "660f62c89abf1b001c66e678",
                        },
                        recommendations: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              rank: { type: "number", example: 1 },
                              totalScore: { type: "number", example: 85.5 },
                              country: {
                                type: "object",
                                properties: {
                                  name: { type: "string", example: "싱가포르" },
                                  code: { type: "string", example: "SGP" },
                                },
                              },
                            },
                          },
                        },
                        timestamp: {
                          type: "string",
                          format: "date-time",
                          example: "2025-09-25T10:00:00Z",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "잘못된 요청 데이터" },
          401: { description: "인증 실패" },
          404: { description: "프로필을 찾을 수 없음" },
          500: { description: "서버 오류" },
        },
      },
    },
  },
};
