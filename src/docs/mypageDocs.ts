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
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      education: { type: "string", example: "컴퓨터공학 학사" },
                      experience: {
                        type: "string",
                        example: "백엔드 개발 3년",
                      },
                      skills: {
                        type: "array",
                        items: { type: "string" },
                        example: ["Node.js", "MongoDB", "정보처리기사"],
                      },
                      languages: {
                        type: "array",
                        items: { type: "string" },
                        example: ["영어", "한국어"],
                      },
                      desiredSalary: { type: "number", example: 5000 },
                      desiredJob: { type: "string", example: "백엔드 개발자" },
                      additionalNotes: {
                        type: "string",
                        example: "정규직 희망, 재택 근무 가능",
                      },
                      user: {
                        type: "object",
                        properties: {
                          name: { type: "string", example: "user1" },
                          email: { type: "string", example: "user1@1111" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "인증 실패" },
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
                  education: { type: "string", example: "컴퓨터공학 학사" },
                  experience: { type: "string", example: "백엔드 개발 3년" },
                  skills: {
                    type: "array",
                    items: { type: "string" },
                    example: ["Node.js", "MongoDB", "정보처리기사"],
                  },
                  languages: {
                    type: "array",
                    items: { type: "string" },
                    example: ["일본어", "한국어"],
                  },
                  desiredSalary: { type: "number", example: 5000 },
                  desiredJob: { type: "string", example: "백엔드 개발자" },
                  additionalNotes: {
                    type: "string",
                    example: "정규직 희망, 재택 근무 가능",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "수정 성공" },
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
        summary: "GPT 추천 결과 목록 조회",
        description: "사용자가 저장한 GPT 추천 결과 리스트 반환",
        tags: ["Mypage"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "추천 결과 조회 성공",
            content: {
              "application/json": {
                schema: {
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
                          education: {
                            type: "string",
                            example: "대학교 응용수학과 학사",
                          },
                          experience: {
                            type: "string",
                            example: "학원 수학 선생님 아르바이트 3년",
                          },
                          skills: {
                            type: "array",
                            items: { type: "string" },
                            example: [
                              "초,중,고등 수학 지도 가능",
                              "토익 800점 이상",
                              "학점 4.0이상",
                            ],
                          },
                          languages: {
                            type: "array",
                            items: { type: "string" },
                            example: ["한국어", "일본어"],
                          },
                          desiredSalary: { type: "number", example: 5000 },
                          desiredJob: {
                            type: "string",
                            example: "없음",
                          },
                          additionalNotes: {
                            type: "string",
                            example: "아시아 국가 희망",
                          },
                        },
                      },
                      rankings: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            country: { type: "string" },
                            job: { type: "string" },
                            reason: { type: "string" },
                          },
                        },
                        example: [
                          {
                            country: "일본",
                            job: "수학 교사",
                            reason:
                              "일본어 구사 가능하며, 학원에서의 수학 지도 경험이 있음",
                          },
                          {
                            country: "싱가포르",
                            job: "수학 튜터",
                            reason:
                              "싱가포르는 교육열이 높아 수학 튜터에 대한 수요가 많음",
                          },
                          {
                            country: "중국",
                            job: "국제학교 수학 선생님",
                            reason:
                              "중국의 국제학교에서는 외국인 선생님을 선호하며, 토익 점수와 학점이 높아 유리함",
                          },
                        ],
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
          401: { description: "인증 실패 (토큰 없음 또는 유효하지 않음)" },
          404: { description: "저장된 추천 결과가 없습니다." },
          500: { description: "서버 오류" },
        },
      },
    },

    "/api/mypage/simulations": {
      get: {
        summary: "시뮬레이션 결과 목록 조회",
        description: "사용자가 생성한 이주 시뮬레이션 결과들을 반환합니다.",
        tags: ["Mypage"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "시뮬레이션 결과 조회 성공",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "6641abc123...",
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
                          estimatedMonthlyCost: {
                            type: "object",
                            properties: {
                              housing: {
                                type: "string",
                                example: "100",
                              },
                              food: {
                                type: "string",
                                example: "50",
                              },
                              transportation: {
                                type: "string",
                                example: "20",
                              },
                              etc: {
                                type: "string",
                                example: "30",
                              },
                              total: {
                                type: "string",
                                example: "200",
                              },
                            },
                          },
                          jobOpportunity: {
                            type: "string",
                            example: "IT 관련 직종에 취업 기회가 많음",
                          },
                          culturalTips: {
                            type: "string",
                            example: "대중교통이 잘 되어 있고 영어 사용 필수",
                          },
                          warnings: {
                            type: "string",
                            example: "겨울에 눈이 많이 오므로 대비 필요",
                          },
                          nearestAirport: {
                            type: "object",
                            properties: {
                              name: {
                                type: "string",
                                example: "밴쿠버 국제공항",
                              },
                              city: { type: "string", example: "밴쿠버" },
                              code: { type: "string", example: "YVR" },
                            },
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
          401: { description: "인증 실패 (토큰 없음 또는 유효하지 않음)" },
          404: { description: "시뮬레이션 결과가 없습니다." },
          500: { description: "서버 오류" },
        },
      },
    },

    "/api/mypage/simulations/inputs": {
      get: {
        summary: "사용자 입력 시뮬레이션 조건 조회",
        description:
          "로그인한 사용자가 이전에 입력한 시뮬레이션 조건 목록을 반환합니다.",
        tags: ["Mypage"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "조건 목록 반환 성공",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      _id: { type: "string", example: "665abc..." },
                      selectedCountry: { type: "string", example: "캐나다" },
                      budget: { type: "number", example: 1000 },
                      duration: { type: "string", example: "6개월" },
                      languageLevel: { type: "string", example: "능숙" },
                      jobTypes: {
                        type: "array",
                        items: { type: "string" },
                        example: ["정규직", "프리랜서"],
                      },
                      createdAt: {
                        type: "string",
                        format: "date-time",
                        example: "2025-05-09T14:23:00Z",
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: "입력 기록 없음" },
          500: { description: "서버 오류" },
        },
      },
    },

    "/api/mypage/recommendations/by-profile/{profileId}": {
      get: {
        summary: "특정 이력의 GPT 추천 결과 조회",
        description: "해당 이력(profileId)에 대한 GPT 추천 결과 반환",
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
                    _id: { type: "string", example: "663fa12345abcd..." },
                    profile: {
                      type: "object",
                      properties: {
                        education: { type: "string" },
                        experience: { type: "string" },
                        skills: { type: "array", items: { type: "string" } },
                        languages: { type: "array", items: { type: "string" } },
                      },
                    },
                    rankings: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          country: { type: "string" },
                          job: { type: "string" },
                          reason: { type: "string" },
                        },
                      },
                    },
                    createdAt: { type: "string", format: "date-time" },
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
        summary: "특정 이력의 시뮬레이션 결과 조회",
        description: "해당 이력(profileId)에 대해 실행된 시뮬레이션 결과 반환",
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
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      _id: { type: "string", example: "664abc..." },
                      country: { type: "string", example: "호주" },
                      result: {
                        type: "object",
                        properties: {
                          recommendedCity: {
                            type: "string",
                            example: "시드니",
                          },
                          estimatedMonthlyCost: {
                            type: "object",
                            properties: {
                              housing: { type: "string" },
                              food: { type: "string" },
                              transportation: { type: "string" },
                              etc: { type: "string" },
                              total: { type: "string" },
                            },
                          },
                          jobOpportunity: { type: "string" },
                          culturalTips: { type: "string" },
                          warnings: { type: "string" },
                          nearestAirport: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              city: { type: "string" },
                              code: { type: "string" },
                            },
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
          404: { description: "해당 이력에 대한 시뮬레이션 결과 없음" },
          500: { description: "서버 오류" },
        },
      },
    },
  },
};
