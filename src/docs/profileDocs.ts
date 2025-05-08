//Profile
export const profileSwaggerDocs = {
  paths: {
    "/api/profile": {
      post: {
        summary: "사용자 이력 등록",
        tags: ["Profile"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  education: { type: "string", example: "컴퓨터공학 학사" },
                  experience: { type: "string", example: "개발 3년" },
                  skills: {
                    type: "array",
                    items: { type: "string" },
                    example: ["React", "AWS", "정보처리기사"],
                  },
                  languages: {
                    type: "array",
                    items: { type: "string" },
                    example: ["영어", "한국어"],
                  },
                  desiredSalary: { type: "number", example: 5000 },
                  desiredJob: {
                    type: "string",
                    example: "프론트엔드 개발자",
                  },
                  additionalNotes: {
                    type: "string",
                    example: "원격 근무 원함",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "이력 등록 성공" },
          401: { description: "인증 실패" },
        },
      },
    },

    "/api/profile/{id}/gpt": {
      post: {
        summary: "사용자 이력을 기반으로 GPT 응답 생성",
        description:
          "사용자의 이력 정보(학력, 경험, 기술 스택 등)를 GPT API로 전송하고 응답을 받습니다.",
        tags: ["Profile"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "사용자 이력 ID",
          },
        ],
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "GPT 응답 생성 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    rankings: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          country: { type: "string", example: "캐나다" },
                          job: { type: "string", example: "프론트엔드 개발자" },
                          reason: {
                            type: "string",
                            example:
                              "React와 AWS에 대한 경험이 북미 시장에서 높은 수요를 보입니다.",
                          },
                        },
                      },
                    },
                  },
                  example: {
                    rankings: [
                      {
                        country: "미국",
                        job: "프론트엔드 개발자",
                        reason:
                          "프론트엔드 개발에 대한 수요가 높고, 연봉이 높음",
                      },
                      {
                        country: "캐나다",
                        job: "프론트엔드 개발자",
                        reason: "IT 산업이 발달하며 원격 근무 기회가 많음",
                      },
                      {
                        country: "호주",
                        job: "프론트엔드 개발자",
                        reason: "영어권 국가로서 원격 근무 가능한 기업이 많음",
                      },
                    ],
                  },
                },
              },
            },
          },

          400: {
            description: "이미 추천된 이력입니다.",
          },
          401: {
            description: "인증 실패",
          },
          404: {
            description: "사용자 이력 없음",
          },
          500: {
            description: "GPT 호출 실패",
          },
        },
      },
    },
  },
};
