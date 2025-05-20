import { JobAccessibilityScore, MigrationFactors } from "../types/simulation";

export function calculateEmploymentProbability(
  score: JobAccessibilityScore
): number {
  const { jobDemand, foreignAcceptance, specPreparation } = score;
  const weighted =
    jobDemand * 0.3 + foreignAcceptance * 0.3 + specPreparation * 0.4;
  return Math.round(weighted * 100);
}

export function calculateMigrationSuitability(
  factors: MigrationFactors
): number {
  const {
    languageLevel,
    visaScore,
    budgetScore,
    withFamily,
    koreanCommunityScore,
    employmentProbability,
  } = factors;

  const score =
    languageLevel * 0.2 +
    visaScore * 0.2 +
    budgetScore * 0.2 +
    (withFamily ? 0.1 : 0) +
    koreanCommunityScore * 0.1 +
    (employmentProbability / 100) * 0.2;

  return Math.round(score * 100);
}
