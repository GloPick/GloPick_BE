import express from "express";
import {
  getPopularCountries,
  getPopularCities,
} from "../controllers/rankingController";

const router = express.Router();

router.get("/countries", getPopularCountries);
router.get("/cities", getPopularCities);

export default router;
