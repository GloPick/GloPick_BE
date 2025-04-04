import mongoose from "mongoose";

const GptRecommendationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    rankings: [
      {
        country: { type: String, required: true },
        job: { type: String, required: true },
        reason: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("GptRecommendation", GptRecommendationSchema);
