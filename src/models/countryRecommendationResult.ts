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
          languageScore: { type: Number, required: true },
          jobScore: { type: Number, required: true },
          qualityOfLifeScore: { type: Number, required: true },
        },
        qualityOfLifeData: {
          income: { type: Number },
          jobs: { type: Number },
          health: { type: Number },
          lifeSatisfaction: { type: Number },
          safety: { type: Number },
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
      job: { type: Number, required: true },
      qualityOfLife: { type: Number, required: true },
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
    job: number;
    qualityOfLife: number;
  };
}
