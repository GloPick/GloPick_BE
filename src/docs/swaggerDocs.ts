// /docs/swaggerDocs.ts
import { authSwaggerDocs } from "./authDocs";
import { mypageSwaggerDocs } from "./mypageDocs";
import { profileSwaggerDocs } from "./profileDocs";
import { simulationSwaggerDocs } from "./simulationDocs";
import { rankingSwaggerDocs } from "./rankingDocs";

export const swaggerDocs = {
  paths: {
    ...authSwaggerDocs.paths,
    ...profileSwaggerDocs.paths,
    ...simulationSwaggerDocs.paths,
    ...mypageSwaggerDocs.paths,
    ...rankingSwaggerDocs.paths,
  },
};
