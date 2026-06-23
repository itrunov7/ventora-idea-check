export type Verdict = {
  score: number;
  verdict: "promising" | "mixed" | "risky";
  demand: string;
  marketSize: string;
  willingnessToPay: string;
  summary: string;
};

export type VerdictTone = "go" | "caution" | "no";
export type Confidence = "high" | "medium" | "low";
export type Level = "High" | "Medium" | "Low";

export type Signal = {
  text: string;
  tag: string;
};

export type EvaluationScores = {
  marketTiming: number;
  problemFit: number;
  demand: number;
  monetization: number;
  differentiation: number;
  competition: number;
};

export type MarketTier = {
  value: string;
  label: string;
};

export type EvaluationCompetitor = {
  name: string;
  initial: string;
  gap: string;
  reachScore: number;
};

export type EarningsScenario = {
  label: string;
  mrr: string;
  arr: string;
  basis: string;
};

export type EarningsProof = {
  name: string;
  figure: string;
  text: string;
};

export type Benefit = {
  title: string;
  text: string;
};

export type Earnings = {
  headline: string;
  summary: string;
  scenarios: EarningsScenario[];
  rampPoints: number[];
  rampCaption: string;
  proof: EarningsProof[];
  benefits: Benefit[];
};

export type Evaluation = {
  idea: string;
  viabilityScore: number;
  verdict: {
    label: string;
    tone: VerdictTone;
    confidence: Confidence;
  };
  synthesis: string;
  quickStats: {
    demand: Level;
    market: Level;
    willingToPay: "Yes" | "Maybe" | "No";
  };
  greenLights: Signal[];
  redFlags: Signal[];
  scores: EvaluationScores;
  market: {
    tam: MarketTier;
    sam: MarketTier;
    som: MarketTier;
  };
  demandTrend: {
    changePct: number;
    points: number[];
  };
  competitors: EvaluationCompetitor[];
  edge: string;
  pricing: {
    suggested: string;
    unit: string;
    rationale: string;
    rangeLowPct: number;
    rangeHighPct: number;
  };
  earnings: Earnings;
};

export type UnlockResponse = {
  evaluation: Evaluation;
  ideaHash: string;
};

/** Teaser scores shown on a candidate card; each 0-100, all estimates. */
export type CandidateTeaserScores = {
  fit: number;
  feasibility: number;
  profit: number;
};

/** A free, pre-gate fitted idea (Phase F2). */
export type Candidate = {
  id: string;
  name: string;
  oneLiner: string;
  fitsYou: string;
  buildableInVentora: string;
  teaserScores: CandidateTeaserScores;
};

export type CandidatesResponse = {
  candidates: Candidate[];
};

/** Direction the user nudges a picked idea while refining it (Phase F3). */
export type RefineDirection = "niche" | "broader" | "different";

/** The editable fields sent back to the model when refining (no id/scores). */
export type CandidateSeed = Pick<
  Candidate,
  "name" | "oneLiner" | "fitsYou" | "buildableInVentora"
>;

export type RefineResponse = {
  candidate: Candidate;
};
