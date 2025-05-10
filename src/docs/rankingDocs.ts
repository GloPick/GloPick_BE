export const rankingSwaggerDocs = {
  paths: {
    "/api/ranking/countries": {
      get: {
        summary: "인기 국가 순위 조회",
        description:
          "사용자들이 선택한 국가 중 가장 많이 선택된 국가들을 순위별로 반환합니다.",
        tags: ["Ranking"],
        responses: {
          200: {
            description: "인기 국가 순위 조회 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "인기 국가 순위 조회 성공",
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", example: "캐나다" },
                          count: { type: "number", example: 42 },
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

    "/api/ranking/cities": {
      get: {
        summary: "인기 도시 순위 조회",
        description:
          "사용자들이 선택한 도시 중 가장 많이 선택된 도시들을 순위별로 반환합니다.",
        tags: ["Ranking"],
        responses: {
          200: {
            description: "인기 도시 순위 조회 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "인기 도시 순위 조회 성공",
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", example: "밴쿠버" },
                          count: { type: "number", example: 28 },
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
  },
};
