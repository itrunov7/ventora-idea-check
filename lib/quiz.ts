/**
 * Quiz config for the Idea Finder (Phase F1).
 *
 * The whole quiz is data-driven: the engine in `components/quiz.tsx` renders
 * whatever lives in {@link QUIZ_QUESTIONS}, so reordering, cutting, or adding a
 * step is a config edit, not a component change. Keep it to <= 8 steps so the
 * run stays under ~90 seconds.
 */

/** Higher-level signal each question feeds. Used only for answer -> profile mapping. */
export type QuizSignal =
  | "unfairAdvantage"
  | "commitment"
  | "ambition"
  | "interests"
  | "audienceAccess"
  | "techComfort";

export type QuizOption = { value: string; label: string };

export type QuizQuestion = {
  id: string;
  kind: "single" | "multi" | "shorttext";
  prompt: string;
  /** Short sub-line under the prompt; optional. */
  subPrompt?: string;
  options?: QuizOption[];
  /** Cap for "multi"; ignored otherwise. */
  maxSelect?: number;
  /** Placeholder for "shorttext"; ignored otherwise. */
  placeholder?: string;
  /** "Personalization building" line shown after the step is answered. */
  hint?: string;
  /** Which signal(s) this question informs. Drives downstream mapping. */
  signals: QuizSignal[];
};

/** A single answer: one value for single/shorttext, many for multi. */
export type QuizAnswer = string | string[];

/** All collected answers, keyed by question id. Lives in client state only. */
export type QuizAnswers = Record<string, QuizAnswer>;

/**
 * 7 steps, ordered identity -> unfair-advantage -> constraints -> interests.
 * Every required signal is covered; only the final step asks for (optional)
 * typing, and never more than one short phrase.
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "role",
    kind: "single",
    prompt: "Which sounds most like you?",
    subPrompt: "Your starting point shapes everything that follows.",
    signals: ["unfairAdvantage", "techComfort"],
    options: [
      { value: "maker", label: "Maker / developer" },
      { value: "designer", label: "Designer" },
      { value: "marketer", label: "Marketer / creator" },
      { value: "sales", label: "Salesperson" },
      { value: "operator", label: "Operator / manager" },
      { value: "expert", label: "Domain expert" },
    ],
    hint: "Got it — we'll lean into ideas that play to that strength.",
  },
  {
    id: "advantage",
    kind: "multi",
    maxSelect: 3,
    prompt: "Where's your unfair advantage?",
    subPrompt: "Pick up to 3. The best ideas leverage what you already have.",
    signals: ["unfairAdvantage"],
    options: [
      { value: "industry", label: "Deep industry experience" },
      { value: "technical", label: "A specific technical skill" },
      { value: "design", label: "Design taste" },
      { value: "persuasion", label: "Sales & persuasion" },
      { value: "audience", label: "An existing audience" },
      { value: "insider", label: "Insider access to a niche" },
    ],
    hint: "That's a real edge — fitted ideas will build on it.",
  },
  {
    id: "audience",
    kind: "single",
    prompt: "Do you already reach a group of people?",
    subPrompt: "Distribution is gold — even a small, engaged one counts.",
    signals: ["audienceAccess"],
    options: [
      { value: "large", label: "Yes — 10k+ audience" },
      { value: "small", label: "A small but engaged following" },
      { value: "community", label: "I'm active in a niche community" },
      { value: "none", label: "Not yet" },
    ],
    hint: "Noted — we'll factor your reach into the fit.",
  },
  {
    id: "commitment",
    kind: "single",
    prompt: "What can you commit?",
    subPrompt: "Time and budget, honestly.",
    signals: ["commitment"],
    options: [
      { value: "nights", label: "Nights & weekends, no budget" },
      { value: "parttime", label: "Part-time + a small budget" },
      { value: "fulltime", label: "Full-time, ready to invest" },
      { value: "funded", label: "Full-time + funded" },
    ],
    hint: "Good — we'll size the idea to what you can put in.",
  },
  {
    id: "ambition",
    kind: "single",
    prompt: "What win are you after?",
    subPrompt: "There's no wrong answer here.",
    signals: ["ambition"],
    options: [
      { value: "side", label: "Steady side income" },
      { value: "replace", label: "Replace my job" },
      { value: "big", label: "Build something big" },
      { value: "sell", label: "Build it to sell" },
    ],
    hint: "Locked in — we'll aim the idea at that outcome.",
  },
  {
    id: "interests",
    kind: "multi",
    maxSelect: 3,
    prompt: "What domains pull you in?",
    subPrompt: "Pick up to 3 you'd happily work on for years.",
    signals: ["interests"],
    options: [
      { value: "health", label: "Health & fitness" },
      { value: "money", label: "Money & fintech" },
      { value: "productivity", label: "Productivity & work" },
      { value: "creators", label: "Creators & media" },
      { value: "ecommerce", label: "Ecommerce & retail" },
      { value: "education", label: "Education" },
      { value: "devtools", label: "Dev tools" },
      { value: "local", label: "Local services" },
      { value: "ai", label: "AI" },
      { value: "sustainability", label: "Sustainability" },
    ],
    hint: "Great — that points toward problems you'll care about.",
  },
  {
    id: "techComfort",
    kind: "single",
    prompt: "How hands-on do you want to be?",
    subPrompt: "This tunes how we frame the build.",
    signals: ["techComfort"],
    options: [
      { value: "code", label: "I'll build it myself" },
      { value: "nocode", label: "I'd use no-code tools" },
      { value: "delegate", label: "I want it built for me" },
      { value: "unsure", label: "Not sure yet" },
    ],
    hint: "Perfect — building your fitted idea now.",
  },
];

const QUESTIONS_BY_ID = new Map(QUIZ_QUESTIONS.map((q) => [q.id, q]));

/** Resolve an option value to its human label for a given question. */
function labelFor(questionId: string, value: string): string {
  const q = QUESTIONS_BY_ID.get(questionId);
  const opt = q?.options?.find((o) => o.value === value);
  return opt?.label ?? value;
}

/** Join the labels for an answer (single or multi) into a readable phrase. */
function answerLabels(answers: QuizAnswers, questionId: string): string {
  const raw = answers[questionId];
  if (!raw) return "";
  const values = Array.isArray(raw) ? raw : [raw];
  return values
    .map((v) => labelFor(questionId, v))
    .filter(Boolean)
    .join(", ");
}

export type FinderProfileInput = {
  skills: string;
  interests: string;
  constraints?: string;
};

/**
 * Collapse the rich quiz signal into the three fields the existing
 * `/api/find` endpoint accepts, keeping each comfortably under its 400-char
 * limit. No backend change needed.
 */
export function quizAnswersToProfile(answers: QuizAnswers): FinderProfileInput {
  const role = answerLabels(answers, "role");
  const advantage = answerLabels(answers, "advantage");
  const techComfort = answerLabels(answers, "techComfort");
  const interests = answerLabels(answers, "interests");
  const commitment = answerLabels(answers, "commitment");
  const ambition = answerLabels(answers, "ambition");
  const audience = answerLabels(answers, "audience");

  const skills = [
    role && `Background: ${role}`,
    advantage && `Unfair advantage: ${advantage}`,
    techComfort && `Build comfort: ${techComfort}`,
  ]
    .filter(Boolean)
    .join(". ");

  const constraints = [
    commitment && `Commitment: ${commitment}`,
    ambition && `Goal: ${ambition}`,
    audience && `Audience: ${audience}`,
  ]
    .filter(Boolean)
    .join(". ");

  return {
    skills: skills.slice(0, 400),
    interests: interests.slice(0, 400),
    constraints: constraints ? constraints.slice(0, 400) : undefined,
  };
}

/**
 * Build a labeled, human-readable summary of every answered quiz step. Unlike
 * {@link quizAnswersToProfile} (which collapses answers to fit `/api/find`),
 * this keeps each signal explicit so the model can ground a candidate's
 * "why it fits you" in the user's ACTUAL selections — skill, audience,
 * interests — instead of generic flattery.
 */
export function quizAnswersToSummary(answers: QuizAnswers): string {
  return QUIZ_QUESTIONS.map((q) => {
    const value = answerLabels(answers, q.id);
    if (!value) return null;
    return `${q.prompt} -> ${value}`;
  })
    .filter(Boolean)
    .join("\n");
}
