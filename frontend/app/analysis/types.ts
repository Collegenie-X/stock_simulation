export type AbilityKey =
  | "riskTolerance"
  | "analysis"
  | "emotionControl"
  | "coping"
  | "infoJudgment";

export type PersonalityType =
  | "analyst"
  | "challenger"
  | "conservative"
  | "emotional"
  | "systematic";

export interface TheoryOption {
  emoji: string;
  text: string;
  personalityType: PersonalityType;
  insight: string;
  abilities: Partial<Record<AbilityKey, number>>;
}

export interface ChartOption {
  emoji: string;
  text: string;
  emotion: string;
  personalityType: PersonalityType;
  insight: string;
  abilities: Partial<Record<AbilityKey, number>>;
}

export interface TheoryQuestion {
  id: number;
  chartVariant: number;
  chartAccent: string;
  category: string;
  question: string;
  options: TheoryOption[];
  scenarioGroup?: string;
  scenarioStep?: number;
  scenarioTotal?: number;
  scenarioTitle?: string;
}

export interface ChartQuestion {
  id: number;
  chartVariant: number;
  chartAccent: string;
  title: string;
  stock: string;
  sector: string;
  situation: string;
  currentPrice: number;
  change?: string;
  volume?: string;
  news?: string;
  aiWarning?: string;
  question: string;
  options: ChartOption[];
}

export type AnyQuestion = TheoryQuestion | ChartQuestion;

export type AbilityScores = Record<AbilityKey, number>;
export type PersonalityScores = Record<PersonalityType, number>;

export type AssessmentMode = "quick" | "detailed";

export interface AnsweredQuestion {
  questionId: number;
  optionIndex: number;
  personalityType: PersonalityType;
  insight: string;
  abilities: Partial<Record<AbilityKey, number>>;
}
