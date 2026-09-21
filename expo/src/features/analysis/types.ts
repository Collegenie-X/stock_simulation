export type AbilityKey =
  | "riskTolerance"
  | "analysis"
  | "emotionControl"
  | "coping"
  | "infoJudgment"
  | "moneyManagement";

export type PersonalityType =
  | "analyst"
  | "challenger"
  | "conservative"
  | "emotional"
  | "systematic";

/** 돈을 다루는 습관 — 주식을 "제2의 자산"으로 대하는 방식 */
export type MoneyTag = "separated" | "wallet" | "allin" | "leverage";

/** 매매 습관 — 설계 문서 12장의 습관 태그와 같은 이름 */
export type HabitTag =
  | "chase"
  | "panicSell"
  | "earlyProfit"
  | "averagingDown"
  | "tailFollow"
  | "blindWait"
  | "breakeven"
  | "overtrade";

export interface TheoryOption {
  emoji: string;
  text: string;
  personalityType: PersonalityType;
  insight: string;
  abilities: Partial<Record<AbilityKey, number>>;
  moneyTag?: MoneyTag;
  habitTag?: HabitTag;
}

export interface ChartOption {
  emoji: string;
  text: string;
  emotion: string;
  personalityType: PersonalityType;
  insight: string;
  abilities: Partial<Record<AbilityKey, number>>;
  moneyTag?: MoneyTag;
  habitTag?: HabitTag;
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
export type MoneyScores = Record<MoneyTag, number>;
export type HabitCounts = Record<HabitTag, number>;

export type AssessmentMode = "quick" | "detailed";

export interface AnsweredQuestion {
  questionId: number;
  optionIndex: number;
  personalityType: PersonalityType;
  insight: string;
  abilities: Partial<Record<AbilityKey, number>>;
}
