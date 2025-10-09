//Profile
export const profileSwaggerDocs = {
  paths: {
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
                  desiredSalary: {
                    type: "string",
                    enum: [
                      "2천만 이하",
                      "2천만 ~ 3천만",
                      "3천만 ~ 5천만",
                      "5천만 ~ 7천만",
                      "7천만 ~ 1억",
                      "1억 이상",
                      "기타 (직접 입력)",
                    ],
                    example: "3천만 ~ 5천만",
                  },
                  desiredJob: {
                    type: "object",
                    properties: {
                      mainCategory: { type: "string", example: "IT / 개발" },
                      subCategory: {
                        type: "string",
                        example: "프론트엔드 개발자",
                      },
                    },
                  },
                  languageWeight: {
                    type: "integer",
                    description: "언어 가중치 (10 단위)",
                    example: 40,
                  },
                  salaryWeight: {
                    type: "integer",
                    description: "연봉 가중치 (10 단위)",
                    example: 30,
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
                  "desiredSalary",
                  "desiredJob",
                  "languageWeight",
                  "salaryWeight",
                  "jobWeight",
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
