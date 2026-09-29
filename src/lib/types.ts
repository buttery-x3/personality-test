export type FrameworkId = 'big5' | 'jung' | 'enneagram' | 'disc' | 'riasec' | 'houses';
export type DimensionId =
  | 'big5.O'
  | 'big5.C'
  | 'big5.E'
  | 'big5.A'
  | 'big5.S'
  | 'jung.E'
  | 'jung.I'
  | 'jung.S'
  | 'jung.N'
  | 'jung.T'
  | 'jung.F'
  | 'jung.J'
  | 'jung.P'
  | 'enneagram.1'
  | 'enneagram.2'
  | 'enneagram.3'
  | 'enneagram.4'
  | 'enneagram.5'
  | 'enneagram.6'
  | 'enneagram.7'
  | 'enneagram.8'
  | 'enneagram.9'
  | 'disc.D'
  | 'disc.I'
  | 'disc.S'
  | 'disc.C'
  | 'riasec.R'
  | 'riasec.I'
  | 'riasec.A'
  | 'riasec.S'
  | 'riasec.E'
  | 'riasec.C'
  | 'houses.G'
  | 'houses.R'
  | 'houses.H'
  | 'houses.S';
export type Answer = -1 | -0.5 | 0 | 0.5 | 1;
export type Answers = Record<string, Answer>;

// Endpoint evidence: disagreeWeight is the actual contribution at answer = -1.
// Omission means the symmetric negative of agreeWeight.
export interface Mapping {
  dimension: DimensionId;
  agreeWeight: number;
  disagreeWeight?: number;
}
export interface Question {
  id: string;
  text: string;
  answerType: 'agreement' | 'interest';
  tags: string[];
  baseline?: boolean;
  rationale: string;
  mappings: Mapping[];
}
export interface Dimension {
  id: DimensionId;
  label: string;
  short: string;
  description: string;
}
export interface Framework {
  id: FrameworkId;
  name: string;
  eyebrow: string;
  color: string;
  description: string;
  dimensions: Dimension[];
}
export interface Contribution {
  questionId: string;
  answer: Answer | null;
  agreeWeight: number;
  disagreeWeight: number;
  contribution: number;
}
export interface DimensionScore {
  id: DimensionId;
  raw: number;
  positiveCapacity: number;
  negativeCapacity: number;
  normalized: number;
  mappedQuestions: number;
  answeredQuestions: number;
  contributions: Contribution[];
}
export interface BipolarScore {
  left: DimensionId;
  right: DimensionId;
  leftPercent: number;
  rightPercent: number;
  letter: string;
  tied: boolean;
}
export interface ScoringOutput {
  dimensions: Record<DimensionId, DimensionScore>;
  answeredCount: number;
  presentedCount: number;
  jung: { type: string; axes: BipolarScore[]; tentative: boolean };
  enneagram: {
    primary: string;
    wing: string | null;
    code: string;
    tied: boolean;
    ranking: DimensionId[];
  };
  disc: { code: string; ranking: DimensionId[]; tied: boolean };
  riasec: { code: string; ranking: DimensionId[]; tied: boolean };
  houses: { primary: DimensionId; ranking: DimensionId[]; tied: boolean };
}
export interface TimingVisit {
  activatedAt: string;
  endedAt: string | null;
  firstSelectedAt: string | null;
  submittedAt: string | null;
  activeMs: number;
  hiddenMs: number;
  firstResponseMs: number | null;
  valid: boolean;
  invalidReason?: string;
  returned: boolean;
}
export interface QuestionTiming {
  questionId: string;
  textLength: number;
  firstSelectedAt: string | null;
  firstResponseMs: number | null;
  finalSubmittedAt: string | null;
  totalActiveMs: number;
  answerChanged: boolean;
  changeCount: number;
  returned: boolean;
  visits: TimingVisit[];
}
export interface SurveySession {
  schemaVersion: 1;
  surveyVersion: string;
  startedAt: string;
  updatedAt: string;
  currentIndex: number;
  questionIds: string[];
  answers: Answers;
  timing: Record<string, QuestionTiming>;
}
export interface TimingObservation {
  questionId: string;
  firstResponseMs: number;
  relativeToMedian: number | null;
}
export interface TimingSummary {
  count: number;
  excludedCount: number;
  meanMs: number | null;
  medianMs: number | null;
  standardDeviationMs: number | null;
  varianceMsSquared: number | null;
  observations: TimingObservation[];
  fastest: TimingObservation[];
  slowest: TimingObservation[];
  unusuallyFast: TimingObservation[];
  unusuallySlow: TimingObservation[];
}
export interface CompletedResult {
  schemaVersion: 1;
  surveyVersion: string;
  scoringVersion: string;
  startedAt: string;
  completedAt: string;
  questionIds: string[];
  // Immutable definitions preserve interpretability after future bank changes.
  questions: Question[];
  answers: Answers;
  scoring: ScoringOutput;
  timing: Record<string, QuestionTiming>;
  timingSummary: TimingSummary;
}
