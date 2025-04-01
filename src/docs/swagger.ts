import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { authSwaggerDocs } from "../docs/swaggerDocs";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GloPick API",
      version: "1.0.0",
      description: "해외 이주 및 취업 시뮬레이터 웹 사이트 API 문서",
    },
    servers: [
      {
        url: "http://localhost:5001",
        description: "개발 서버",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    paths: {
      ...authSwaggerDocs.paths,
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger 문서 http://localhost:5001/api-docs 에서 실행 중");
};
