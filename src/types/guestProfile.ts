export interface GuestProfile {
  languages: Array<{
    language: string;
    level: string;
  }>;
  desiredSalary: string;
  desiredJob: string; // ISCO-08 대분류 코드 ("0"-"9")
  additionalNotes?: string;
}
