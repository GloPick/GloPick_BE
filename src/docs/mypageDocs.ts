// 사용자 정보 관리
export const mypageSwaggerDocs = {
  paths: {
    "/api/mypage/account": {
      get: {
        summary: "사용자 정보 조회",
        description: "로그인된 사용자의 정보를 반환 (토큰 필요)",
        tags: ["Mypage"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "사용자 정보 조회 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    _id: {
                      type: "string",
                      example: "60c72b2f9b1d8c001c8a4b53",
                    },
                    name: { type: "string", example: "user1" },
                    email: { type: "string", example: "user1@1111" },
                    birth: { type: "string", example: "2001-03-19" },
                    phone: { type: "string", example: "010-1111-1111" },
                  },
                },
              },
            },
          },
          "401": {
            description: "인증 실패 (토큰 없음 또는 잘못된 토큰)",
          },
          "500": {
            description: "서버 오류",
          },
        },
      },
      put: {
        summary: "사용자 정보 수정",
        description: "사용자의 이름, 이메일, 비밀번호를 수정",
        tags: ["Mypage"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "newname" },
                  email: { type: "string", example: "newemail@example.com" },
                  password: { type: "string", example: "newpassword123" },
                  birth: { type: "string", example: "2002-02-02" },
                  phone: { type: "string", example: "010-1111-2222" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "사용자 정보 수정 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    _id: { type: "string", example: "abc123" },
                    name: { type: "string", example: "newname" },
                    email: { type: "string", example: "newemail@example.com" },
                    birth: { type: "string", example: "2002-02-02" },
                    phone: { type: "string", example: "010-1111-2222" },
                  },
                },
              },
            },
          },
          "401": { description: "인증 실패" },
          "404": { description: "사용자 없음" },
          "500": { description: "서버 오류" },
        },
      },
      delete: {
        summary: "회원 탈퇴",
        description: "현재 로그인된 사용자를 삭제",
        tags: ["Mypage"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "회원 탈퇴 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "회원 탈퇴 완료",
                    },
                  },
                },
              },
            },
          },
          "401": { description: "인증 실패" },
          "404": { description: "사용자 없음" },
          "500": { description: "서버 오류" },
        },
      },
    },

    "/api/mypage/profiles": {
      get: {
        summary: "사용자 이력 조회",
        tags: ["Mypage"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "이력 리스트 반환",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "number", example: 200 },
                    message: { type: "string", example: "이력 정보 조회 성공" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          profileId: {
                            type: "string",
                            example: "60c72b2f9b1d8c001c8a4b53",
                          },
                          language: {
                            type: "string",
                            example: "English",
                            description: "사용 가능한 언어",
                          },
                          desiredJob: {
                            type: "string",
                            example: "2",
                            description: "희망 직무 (ISCO-08 대분류 코드)",
                          },
                          qualityOfLifeWeights: {
                            type: "object",
                            properties: {
                              income: {
                                type: "number",
                                example: 25,
                                description: "소득 가중치",
                              },
                              jobs: {
                                type: "number",
                                example: 20,
                                description: "직업 가중치",
                              },
                              health: {
                                type: "number",
                                example: 20,
                                description: "건강 가중치",
                              },
                              lifeSatisfaction: {
                                type: "number",
                                example: 20,
                                description: "삶의 만족도 가중치",
                              },
                              safety: {
                                type: "number",
                                example: 15,
                                description: "안전 가중치",
                              },
                            },
                          },
                          weights: {
                            type: "object",
                            properties: {
                              languageWeight: {
                                type: "number",
                                example: 30,
                                description: "언어 가중치",
                              },
                              jobWeight: {
                                type: "number",
                                example: 30,
                                description: "직무 가중치",
                              },
                              qualityOfLifeWeight: {
                                type: "number",
                                example: 40,
                                description: "삶의 질 가중치",
                              },
                            },
                          },
                          additionalNotes: {
                            type: "string",
                            example: "원격 근무 가능한 환경 선호",
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2025-04-04T05:34:21.201Z",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "인증 실패" },
          404: { description: "이력 정보가 없습니다." },
        },
      },
    },

    "/api/mypage/profiles/{id}": {
      put: {
        summary: "사용자 이력 수정",
        tags: ["Mypage"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "이력 ID",
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
                    example: "English",
                    description: "사용 가능한 언어",
                  },
                  desiredJob: {
                    type: "string",
                    example: "2",
                    description: "희망 직무 (ISCO-08 대분류 코드)",
                  },
                  qualityOfLifeWeights: {
                    type: "object",
                    properties: {
                      income: { type: "number", example: 25 },
                      jobs: { type: "number", example: 20 },
                      health: { type: "number", example: 20 },
                      lifeSatisfaction: { type: "number", example: 20 },
                      safety: { type: "number", example: 15 },
                    },
                  },
                  weights: {
                    type: "object",
                    properties: {
                      languageWeight: { type: "number", example: 30 },
                      jobWeight: { type: "number", example: 30 },
                      qualityOfLifeWeight: { type: "number", example: 40 },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "수정 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "number", example: 200 },
                    message: { type: "string", example: "이력 정보 수정 성공" },
                    data: {
                      type: "object",
                      properties: {
                        profileId: { type: "string" },
                        languages: { type: "string", example: "English" },
                        desiredJob: { type: "string", example: "2" },
                        qualityOfLifeWeights: {
                          type: "object",
                          properties: {
                            income: { type: "number" },
                            jobs: { type: "number" },
                            health: { type: "number" },
                            lifeSatisfaction: { type: "number" },
                            safety: { type: "number" },
                          },
                        },
                        weights: {
                          type: "object",
                          properties: {
                            languageWeight: { type: "number" },
                            jobWeight: { type: "number" },
                            qualityOfLifeWeight: { type: "number" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: "이력 없음" },
        },
      },
      delete: {
        summary: "사용자 이력 삭제",
        tags: ["Mypage"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "이력 ID",
          },
        ],
        responses: {
          200: {
            description: "삭제 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "이력 삭제 완료" },
                  },
                },
              },
            },
          },
          404: { description: "이력 없음" },
        },
      },
    },

    "/api/mypage/recommendations": {
      get: {
        summary: "API 기반 국가 추천 결과 목록 조회",
        description: "사용자가 저장한 API 기반 국가 추천 결과 리스트 반환",
        tags: ["Mypage"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "추천 결과 조회 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "number", example: 200 },
                    message: { type: "string", example: "추천 결과 조회 성공" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          _id: {
                            type: "string",
                            example: "660f62c89abf1b001c66e678",
                          },
                          profile: {
                            type: "object",
                            properties: {
                              language: {
                                type: "string",
                                example: "English",
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
                                  health: { type: "number", example: 20 },
                                  lifeSatisfaction: {
                                    type: "number",
                                    example: 20,
                                  },
                                  safety: { type: "number", example: 15 },
                                },
                              },
                              weights: {
                                type: "object",
                                properties: {
                                  languageWeight: {
                                    type: "number",
                                    example: 30,
                                  },
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
                                  example: "싱가포르",
                                },
                                score: { type: "number", example: 85.5 },
                                rank: { type: "number", example: 1 },
                                details: {
                                  type: "object",
                                  properties: {
                                    economicScore: {
                                      type: "number",
                                      example: 90,
                                    },
                                    employmentScore: {
                                      type: "number",
                                      example: 85,
                                    },
                                    languageScore: {
                                      type: "number",
                                      example: 95,
                                    },
                                    salaryScore: {
                                      type: "number",
                                      example: 80,
                                    },
                                  },
                                },
                                economicData: {
                                  type: "object",
                                  properties: {
                                    gdpPerCapita: {
                                      type: "number",
                                      example: 65000,
                                    },
                                    unemploymentRate: {
                                      type: "number",
                                      example: 3.2,
                                    },
                                    averageSalary: {
                                      type: "number",
                                      example: 55000,
                                    },
                                  },
                                },
                                countryInfo: {
                                  type: "object",
                                  properties: {
                                    region: { type: "string", example: "Asia" },
                                    languages: {
                                      type: "array",
                                      items: { type: "string" },
                                      example: ["English", "Chinese", "Malay"],
                                    },
                                    population: {
                                      type: "number",
                                      example: 5900000,
                                    },
                                  },
                                },
                              },
                            },
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2025-04-04T05:34:21.201Z",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "인증 실패 (토큰 없음 또는 유효하지 않음)" },
          404: { description: "저장된 추천 결과가 없습니다." },
          500: { description: "서버 오류" },
        },
      },
    },

    "/api/mypage/simulations": {
      get: {
        summary: "시뮬레이션 결과 목록 조회 (입력 정보 포함)",
        description:
          "사용자가 생성한 이주 시뮬레이션 결과와 해당 시뮬레이션의 입력 정보를 함께 반환합니다.",
        tags: ["Mypage"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "시뮬레이션 결과 조회 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "시뮬레이션 결과 조회 성공",
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          _id: {
                            type: "string",
                            example: "6641abc123...",
                          },
                          input: {
                            type: "object",
                            properties: {
                              inputId: { type: "string", example: "665def..." },
                              selectedCountry: {
                                type: "string",
                                example: "캐나다",
                              },
                              selectedCity: {
                                type: "string",
                                example: "밴쿠버",
                              },
                              initialBudget: {
                                type: "string",
                                example: "500만~800만원",
                              },
                              requiredFacilities: {
                                type: "array",
                                items: { type: "string" },
                                example: [
                                  "hospital",
                                  "subway_station",
                                  "supermarket",
                                ],
                              },
                              departureAirport: {
                                type: "string",
                                example: "인천국제공항",
                              },
                              recommendedCities: {
                                type: "array",
                                items: { type: "string" },
                                example: ["밴쿠버", "토론토", "몬트리올"],
                              },
                            },
                          },
                          country: {
                            type: "string",
                            example: "캐나다",
                          },
                          result: {
                            type: "object",
                            properties: {
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
                                description:
                                  "Google Maps로 조회한 편의시설 위치",
                              },
                            },
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2025-05-08T12:00:00.000Z",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "인증 실패 (토큰 없음 또는 유효하지 않음)" },
          404: { description: "시뮬레이션 결과가 없습니다." },
          500: { description: "서버 오류" },
        },
      },
    },

    "/api/mypage/recommendations/by-profile/{profileId}": {
      get: {
        summary: "특정 이력의 API 기반 국가 추천 결과 조회",
        description: "해당 이력(profileId)에 대한 API 기반 국가 추천 결과 반환",
        tags: ["Mypage"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "profileId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "이력 ID(profileId)",
          },
        ],
        responses: {
          200: {
            description: "추천 결과 조회 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "number", example: 200 },
                    message: { type: "string", example: "추천 결과 조회 성공" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          _id: { type: "string", example: "663fa12345abcd..." },
                          profile: {
                            type: "object",
                            properties: {
                              language: {
                                type: "string",
                                example: "English",
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
                                  health: { type: "number", example: 20 },
                                  lifeSatisfaction: {
                                    type: "number",
                                    example: 20,
                                  },
                                  safety: { type: "number", example: 15 },
                                },
                              },
                              weights: {
                                type: "object",
                                properties: {
                                  languageWeight: {
                                    type: "number",
                                    example: 30,
                                  },
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
                                  example: "싱가포르",
                                },
                                score: { type: "number", example: 85.5 },
                                rank: { type: "number", example: 1 },
                                details: {
                                  type: "object",
                                  properties: {
                                    economicScore: {
                                      type: "number",
                                      example: 90,
                                    },
                                    employmentScore: {
                                      type: "number",
                                      example: 85,
                                    },
                                    languageScore: {
                                      type: "number",
                                      example: 95,
                                    },
                                    salaryScore: {
                                      type: "number",
                                      example: 80,
                                    },
                                  },
                                },
                                economicData: {
                                  type: "object",
                                  properties: {
                                    gdpPerCapita: {
                                      type: "number",
                                      example: 65000,
                                    },
                                    unemploymentRate: {
                                      type: "number",
                                      example: 3.2,
                                    },
                                    averageSalary: {
                                      type: "number",
                                      example: 55000,
                                    },
                                  },
                                },
                                countryInfo: {
                                  type: "object",
                                  properties: {
                                    region: { type: "string", example: "Asia" },
                                    languages: {
                                      type: "array",
                                      items: { type: "string" },
                                      example: ["English", "Chinese", "Malay"],
                                    },
                                    population: {
                                      type: "number",
                                      example: 5900000,
                                    },
                                  },
                                },
                              },
                            },
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2025-04-04T05:34:21.201Z",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: "해당 이력에 대한 추천 결과 없음" },
          500: { description: "서버 오류" },
        },
      },
    },

    "/api/mypage/simulations/by-profile/{profileId}": {
      get: {
        summary: "특정 이력의 시뮬레이션 결과 조회 (입력 정보 포함)",
        description:
          "해당 이력(profileId)에 대해 실행된 시뮬레이션 결과와 입력 정보를 함께 반환합니다.",
        tags: ["Mypage"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "profileId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "이력 ID(profileId)",
          },
        ],
        responses: {
          200: {
            description: "시뮬레이션 결과 조회 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "시뮬레이션 결과 조회 성공",
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          _id: { type: "string", example: "664abc..." },
                          input: {
                            type: "object",
                            properties: {
                              inputId: {
                                type: "string",
                                example: "665def...",
                              },
                              selectedCountry: {
                                type: "string",
                                example: "호주",
                              },
                              selectedCity: {
                                type: "string",
                                example: "시드니",
                              },
                              initialBudget: {
                                type: "string",
                                example: "800만~1200만원",
                              },
                              requiredFacilities: {
                                type: "array",
                                items: { type: "string" },
                                example: ["hospital", "park", "bank"],
                              },
                              departureAirport: {
                                type: "string",
                                example: "인천국제공항",
                              },
                              recommendedCities: {
                                type: "array",
                                items: { type: "string" },
                                example: ["시드니", "멜버른", "브리즈번"],
                              },
                            },
                          },
                          country: { type: "string", example: "호주" },
                          result: {
                            type: "object",
                            properties: {
                              recommendedCity: {
                                type: "string",
                                example: "시드니",
                              },
                              localInfo: { type: "object" },
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
                              facilityLocations: { type: "object" },
                            },
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2025-05-08T12:00:00.000Z",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: "해당 이력에 대한 시뮬레이션 결과 없음" },
          500: { description: "서버 오류" },
        },
      },
    },

    "/api/mypage/simulations/list": {
      get: {
        summary: "시뮬레이션 요약 리스트 조회",
        description: "사용자가 생성한 시뮬레이션 요약 정보를 조회합니다.",
        tags: ["Mypage"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "시뮬레이션 요약 리스트 조회 성공",
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
                      example: "시뮬레이션 요약 조회 성공",
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          _id: {
                            type: "string",
                            example: "663fe59a5230fdd9c41a67af",
                          },
                          job: {
                            type: "string",
                            example: "전문가",
                          },
                          country: {
                            type: "string",
                            example: "캐나다",
                          },
                          city: {
                            type: "string",
                            example: "밴쿠버",
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-01T00:00:00.000Z",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "인증 실패 (토큰 없음 또는 만료)",
          },
          500: {
            description: "서버 오류",
          },
        },
      },
    },
  },
};
