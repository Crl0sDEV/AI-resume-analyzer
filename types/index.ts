export interface AnalysisResult {
    score: number;
    matchLevel: string;
    candidateLevel: string;
    estimatedSalaryRange: string;
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
  
  export interface InterviewQuestion {
    question: string;
    tip: string;
  }