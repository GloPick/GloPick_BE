// /docs/swaggerDocs.ts
import { authSwaggerDocs } from "./authDocs";
import { mypageSwaggerDocs } from "./mypageDocs";
import { profileSwaggerDocs } from "./profileDocs";
import { simulationSwaggerDocs } from "./simulationDocs";
import { rankingSwaggerDocs } from "./rankingDocs";
import { guestSwaggerDocs } from "./guestDocs";
import { countryRecommendationSwaggerDocs } from "./countryRecommendationDocs";

export const swaggerDocs = {
  paths: {
    ...authSwaggerDocs.paths,
    ...profileSwaggerDocs.paths,
    ...countryRecommendationSwaggerDocs.paths,
    ...simulationSwaggerDocs.paths,
    ...mypageSwaggerDocs.paths,
    ...rankingSwaggerDocs.paths,
    ...guestSwaggerDocs.paths,
  },
};
