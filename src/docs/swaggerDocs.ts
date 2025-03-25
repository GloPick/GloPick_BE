export const authSwaggerDocs = {
  paths: {
    // Auth
    "/api/auth/register": {
      post: {
        summary: "회원가입 API",
        description: "새로운 사용자 등록.",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "user1" },
                  email: { type: "string", example: "user1@1111" },
                  password: { type: "string", example: "1111" },
                  passwordConfirm: { type: "string", example: "1111" },
                  birth: { type: "string", example: "2001-01-01" },
                  phone: { type: "string", example: "010-1111-1111" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "회원가입 성공",
          },
          "400": {
            description: "이미 존재하는 사용자",
          },
          "500": {
            description: "서버 오류",
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "로그인 API",
        description: "사용자가 이메일과 비밀번호로 로그인",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "user1@1111" },
                  password: { type: "string", example: "1111" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "로그인 성공",
          },
          "401": {
            description: "잘못된 이메일 또는 비밀번호",
          },
          "500": {
            description: "서버 오류",
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "사용자 정보 조회 API",
        description: "로그인된 사용자의 정보를 반환 (토큰 필요)",
        tags: ["Auth"],
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
        summary: "사용자 정보 수정 API",
        description: "사용자의 이름, 이메일, 비밀번호를 수정",
        tags: ["Auth"],
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
        summary: "회원 탈퇴 API",
        description: "현재 로그인된 사용자를 삭제",
        tags: ["Auth"],
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
    //Profile
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
      get: {
        summary: "사용자 이력 조회",
        tags: ["Profile"],
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
                      education: { type: "string" },
                      experience: { type: "string" },
                      skills: { type: "array", items: { type: "string" } },
                      languages: { type: "array", items: { type: "string" } },
                      desiredSalary: { type: "number" },
                      desiredJob: { type: "string" },
                      additionalNotes: { type: "string" },
                      user: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          email: { type: "string" },
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
    "/api/profile/{id}": {
      put: {
        summary: "사용자 이력 수정",
        tags: ["Profile"],
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
                  education: { type: "string" },
                  experience: { type: "string" },
                  skills: { type: "array", items: { type: "string" } },
                  languages: { type: "array", items: { type: "string" } },
                  desiredSalary: { type: "number" },
                  desiredJob: { type: "string" },
                  additionalNotes: { type: "string" },
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
        tags: ["Profile"],
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
  },
};
