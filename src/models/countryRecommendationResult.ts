import mongoose from "mongoose";

const CountryRecommendationResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    recommendations: [
      {
        country: { type: String, required: true },
        score: { type: Number, required: true },
        rank: { type: Number, required: true },
        details: {
          economicScore: { type: Number, required: true },
          employmentScore: { type: Number, required: true },
          languageScore: { type: Number, required: true },
          salaryScore: { type: Number, required: true },
        },
        economicData: {
          gdpPerCapita: { type: Number },
          employmentRate: { type: Number },
          averageSalary: { type: Number },
        },
        countryInfo: {
          region: { type: String },
          languages: [{ type: String }],
          population: { type: Number },
        },
      },
    ],
    weights: {
      language: { type: Number, required: true },
      salary: { type: Number, required: true },
      job: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "CountryRecommendationResult",
  CountryRecommendationResultSchema
);
export interface CountryRecommendationResult {
  weights: {
    language: number;
    salary: number;
    job: number;
  };
}
