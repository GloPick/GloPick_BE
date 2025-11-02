//auth
export const authSwaggerDocs = {
  paths: {
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
                    token: { type: "string", example: "token" },
                  },
                },
              },
            },
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
    "/api/auth/kakao": {
      get: {
        summary: "카카오 로그인 URL 생성 API",
        description:
          "카카오 인증을 위한 URL을 생성합니다.\n\n" +
          "사용 방법:\n" +
          "1. 이 API를 호출하여 authUrl을 받습니다\n" +
          "2. 받은 authUrl을 브라우저에서 엽니다\n" +
          "3. 카카오 로그인 완료 후 사용자 정보와 JWT 토큰이 포함된 응답을 받습니다\n" +
          "4. 받은 토큰을 Swagger의 Authorize 버튼에 입력하여 다른 API를 테스트할 수 있습니다\n\n",
        tags: ["Auth"],
        responses: {
          "200": {
            description: "카카오 인증 URL 생성 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "number", example: 200 },
                    message: {
                      type: "string",
                      example: "카카오 인증 URL 생성 성공",
                    },
                    data: {
                      type: "object",
                      properties: {
                        authUrl: {
                          type: "string",
                          example:
                            "https://kauth.kakao.com/oauth/authorize?client_id=xxx&redirect_uri=xxx&response_type=code",
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
  },
};
