// /docs/swaggerDocs.ts
import { authSwaggerDocs } from "./authDocs";
import { mypageSwaggerDocs } from "./mypageDocs";
import { profileSwaggerDocs } from "./profileDocs";
import { simulationSwaggerDocs } from "./simulationDocs";

export const swaggerDocs = {
  paths: {
    ...authSwaggerDocs.paths,
    ...profileSwaggerDocs.paths,
    ...simulationSwaggerDocs.paths,
    ...mypageSwaggerDocs.paths,
  },
};
