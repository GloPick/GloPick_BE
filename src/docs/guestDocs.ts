export const guestDocs = {
  "/api/guest/recommend": {
    post: {
      tags: ["Guest"],
      summary: "비회원 국가 추천",
      description:
        "비회원이 이력 정보를 입력하면 GPT가 적합한 국가 3곳을 추천합니다.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                education: { type: "string", example: "컴퓨터공학 학사" },
                experience: { type: "string", example: "프론트엔드 개발 2년" },
                skills: {
                  type: "string[]",
                  example: ["React", "JavaScript", "HTML/CSS"],
                },
                languages: {
                  type: "string[]",
                  example: ["영어 중상", "한국어 원어민"],
                },
                desiredSalary: { type: "string", example: "연 4만 달러 이상" },
                desiredJob: { type: "string", example: "웹 개발자" },
                additionalNotes: {
                  type: "string",
                  example: "원격 근무 선호",
                },
              },
              required: [
                "education",
                "experience",
                "skills",
                "languages",
                "desiredSalary",
                "desiredJob",
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
                  code: { type: "integer", example: 200 },
                  message: { type: "string", example: "국가 추천 완료" },
                  data: {
                    type: "object",
                    properties: {
                      recommendedCountries: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            country: { type: "string", example: "캐나다" },
                            reason: {
                              type: "string",
                              example: "다문화 환경과 IT 산업 수요가 높습니다.",
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
        },
        500: {
          description: "GPT 추천 실패",
        },
      },
    },
  },
};
