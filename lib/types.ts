export type Verdict = {
  score: number;
  verdict: "promising" | "mixed" | "risky";
  demand: string;
  marketSize: string;
  willingnessToPay: string;
  summary: string;
};

export type BuildFeature = {
  name: string;
  why: string;
};

export type Competitor = {
  name: string;
  note: string;
};

export type AdvancedReport = {
  firstFiveFeatures: BuildFeature[];
  landingHeadline: string;
  landingSubhead: string;
  validation: {
    marketSize: string;
    competitors: Competitor[];
    suggestedPrice: string;
    closestFailurePattern: string;
  };
  pathToFirstSale: {
    visitors: number;
    conversionRate: number;
    days: number;
    narrative: string;
  };
};

export type UnlockResponse = {
  report: AdvancedReport;
  ideaHash: string;
};
