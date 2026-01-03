export interface AnalysisResult {
    score: number;
    matchLevel: string;
    breakdown: {
      skillsMatch: number;
      experienceMatch: number;
      formatting: number;
    };
    missingKeywords: {
      hardSkills: string[];
      softSkills: string[];
    };
    redFlags: string[];
    actionPlan: string[];
    summaryProfile: string;
  }