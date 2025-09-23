export interface GuestProfile {
  languages: Array<{
    language: string;
    level: string;
  }>;
  desiredSalary: string;
  desiredJob: {
    mainCategory: string;
    subCategory: string;
  };
  additionalNotes?: string;
}
