import { Request, Response } from "express";
import SimulationInput from "../models/simulationInput";

// 인기 국가 순위 조회
export const getPopularCountries = async (req: Request, res: Response) => {
  try {
    const countries = await SimulationInput.aggregate([
      { $match: { selectedCountry: { $ne: null } } },
      { $group: { _id: "$selectedCountry", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const result = countries.map((item) => ({
      name: item._id,
      count: item.count,
    }));

    res.status(200).json({
      code: 200,
      message: "인기 국가 순위 조회 성공",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: "서버 오류",
      data: null,
    });
  }
};

// 인기 도시 순위 조회
export const getPopularCities = async (req: Request, res: Response) => {
  try {
    const cities = await SimulationInput.aggregate([
      { $match: { selectedCity: { $ne: null } } },
      { $group: { _id: "$selectedCity", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const result = cities.map((item) => ({
      name: item._id,
      count: item.count,
    }));

    res.status(200).json({
      code: 200,
      message: "인기 도시 순위 조회 성공",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: "서버 오류",
      data: null,
    });
  }
};
