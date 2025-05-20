// src/types/simulation.ts

export interface SimulationInputWithCity {
  selectedCountry: string;
  selectedCity: string;
  budget: number;
  period: number;
  language: string;
  hasLicense: boolean;
  jobPreference: string;
  accommodation: string;
  withFamily: boolean;
  visaStatus: string;
  extraWishes?: string;
}

export interface CitySimulation {
  recommendedCity: string;
  localInfo: {
    publicTransport: string;
    safetyLevel: string;
    climateSummary: string;
    essentialFacilities: string[];
  };
  initialSetup: {
    shortTermHousingOptions: string[];
    longTermHousingPlatforms: string[];
  };
  jobReality: {
    commonJobs: string[];
    jobSearchPlatforms: string[];
  };
  culturalIntegration: {
    koreanResourcesLinks: string[];
    culturalIntegrationPrograms: string[];
  };
}

export interface JobAccessibilityScore {
  jobDemand: number;
  foreignAcceptance: number;
  specPreparation: number;
}

export interface MigrationFactors {
  languageLevel: number;
  visaScore: number;
  budgetScore: number;
  withFamily: boolean;
  koreanCommunityScore: number;
  employmentProbability: number;
}

export type SimulationResult = CitySimulation & {
  employmentProbability: number;
  migrationSuitability: number;
};
