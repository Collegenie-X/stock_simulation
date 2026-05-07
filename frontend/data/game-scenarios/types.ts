// ============================================================
// Game Scenario Types
// 출처: docs/SCENARIO_WINTER_AI_2024.md
// ============================================================

export type Market = "KR" | "US"
export type Currency = "KRW" | "USD"
export type StockCharacter =
  | "bluechip"
  | "growth"
  | "volatile"
  | "trap"
  | "decline"
export type MarketCap = "XL" | "L" | "M" | "S"
export type Difficulty = "tutorial" | "standard" | "hard"

export type EventType = "major" | "minor" | "blackswan" | "noise"
export type EventCategory =
  | "macro-political"
  | "macro-economic"
  | "earnings"
  | "shareholder-return"
  | "contract"
  | "clinical"
  | "ma"
  | "incident"
  | "rumor"
  | "supply"
export type EventSeverity = "low" | "medium" | "high" | "extreme"

export type MarketStatus = "open" | "closed" | "us_closed" | "kr_closed"

// ============================================================
// Stock
// ============================================================
export interface ScenarioStock {
  id: string                   // "K01", "U05" 등
  ticker: string               // "005930", "NVDA"
  name: string                 // "삼성전자"
  market: Market
  exchange: string             // "KOSPI", "NASDAQ"
  currency: Currency
  sector: string
  character: StockCharacter
  marketCap: MarketCap
  startPrice: number
  endPrice: number
  totalReturn: number          // 0.0222 = +2.22%
  role: string                 // 게임 내 역할 설명
}

// ============================================================
// Calendar Day
// ============================================================
export interface CalendarDay {
  day: number                  // 1~30
  date: string                 // ISO "2024-11-04"
  weekday: string              // "월"
  isHoliday: boolean
  marketStatus: MarketStatus
  note?: string
}

// ============================================================
// Event
// ============================================================
export interface AffectedStock {
  id: string                   // "K01"
  magnitude: number            // -0.07 = -7%
  direction: "up" | "down"
  reason: string
  lag?: number                 // 시차 동조 (턴 단위)
}

export interface EventPreSignal {
  type: string                 // "exit_polls", "consensus_buildup" 등
  description: string
  visibleFromTurn: number      // 사전 신호가 보이기 시작하는 턴
}

export interface EventRecovery {
  startTurn: number
  magnitude: number
  description: string
}

export interface ScenarioEvent {
  id: string                   // "E1"
  turn: number                 // 1~60
  day: number                  // 1~30
  time: "09:00" | "14:00"
  type: EventType
  category: EventCategory
  severity: EventSeverity
  headline: string
  body: string
  source: string
  realCase: string             // 실제 역사 사건
  affectedStocks: AffectedStock[]
  fxImpact: number             // 환율 영향
  preSignal: EventPreSignal | null
  recovery?: EventRecovery
  learningTags: string[]
}

// ============================================================
// Noise News (회색 "이미 반영" 뉴스)
// ============================================================
export interface NoiseNewsTemplate {
  id: string                   // "N01"
  weight: number               // 추출 가중치 (0~1)
  category: "earnings_priced_in" | "neutral" | "rumor" | "fx"
  headline: string
  body: string
  badge: string                // "어제 발표 · 주가 이미 반영" 등
  marketImpact: number         // 0 (영향 없음)
}

export interface NoiseNewsConfig {
  probabilityPerTurn: number   // 매 턴 발생 확률 (0~1)
  maxPerTurn: number
  skipOnEventTurn: boolean     // 메이저/마이너 이벤트 턴엔 노이즈 X
}

// ============================================================
// Correlation (시차 상관관계)
// ============================================================
export interface Correlation {
  source: string               // "U05" (NVDA)
  target: string               // "K01" (삼전)
  lag: number                  // 1턴 시차
  strength: number             // 0~1
  description: string
}

// ============================================================
// FX Sensitivity
// ============================================================
export type FxSensitivity = Record<string, number>  // stockId → -1~1

// ============================================================
// Learning Goal
// ============================================================
export interface LearningGoal {
  id: string                   // "L1"
  title: string
  description: string
  relevantTurns: number[]
}

// ============================================================
// Expected Outcome (등급별)
// ============================================================
export type Grade = "S" | "A" | "B" | "C" | "D" | "F"

export interface OutcomeRange {
  label: string
  profitRange: [number, number]
  senseRange: [number, number]
  description: string
}

export type ExpectedOutcome = Record<Grade, OutcomeRange>

// ============================================================
// UI Hints
// ============================================================
export interface ActBoundary {
  act: 1 | 2 | 3
  startTurn: number
  endTurn: number
  title: string
}

export interface WeekBoundary {
  week: number
  startDay: number
  endDay: number
  theme: string
}

export interface UiHints {
  actBoundaries: ActBoundary[]
  weekBoundaries: WeekBoundary[]
  climaxTurn: number
}

// ============================================================
// Scenario (Top Level)
// ============================================================
export interface GameScenario {
  id: string
  version: number
  title: string
  subtitle: string
  era: string
  period: { start: string; end: string }
  totalDays: number
  totalTurns: number
  turnsPerDay: number
  turnTimes: string[]          // ["09:00", "14:00"]
  initialCapital: number
  initialFxRate: number
  currency: Currency
  difficulty: Difficulty
  estimatedPlayTimeMin: number

  stocks: ScenarioStock[]
  calendar: CalendarDay[]
  priceSeries: Record<string, number[]>  // stockId → 60 prices
  fxSeries: number[]                     // 60 entries

  events: ScenarioEvent[]
  noiseNewsTemplates: NoiseNewsTemplate[]
  noiseNewsConfig: NoiseNewsConfig

  correlations: Correlation[]
  fxSensitivity: FxSensitivity

  learningGoals: LearningGoal[]
  expectedOutcome: ExpectedOutcome
  uiHints: UiHints

  metadata: {
    createdAt: string
    author: string
    schemaVersion: string
    sourceDoc: string
    tags: string[]
  }
}

// ============================================================
// Scenario Index
// ============================================================
export interface ScenarioIndexEntry {
  id: string
  title: string
  subtitle?: string
  era: string
  period: string
  difficulty?: Difficulty
  estimatedPlayTimeMin?: number
  totalDays?: number
  totalTurns?: number
  stockCount?: number
  blackswanCount?: number
  majorEventCount?: number
  tags: string[]
  thumbnail?: string
  file?: string
  available?: boolean
  highlights?: string[]
}

export interface ScenarioIndex {
  schemaVersion: string
  scenarios: ScenarioIndexEntry[]
  comingSoon: ScenarioIndexEntry[]
}

// ============================================================
// 헬퍼 — 턴↔날짜 변환
// ============================================================

/**
 * 턴 번호 → { day, time }
 * @example turnToDayTime(45) → { day: 23, time: "09:00" }
 */
export function turnToDayTime(turn: number): { day: number; time: "09:00" | "14:00" } {
  const day = Math.floor((turn - 1) / 2) + 1
  const time = (turn - 1) % 2 === 0 ? "09:00" : "14:00"
  return { day, time }
}

/**
 * { day, time } → 턴 번호
 */
export function dayTimeToTurn(day: number, time: "09:00" | "14:00"): number {
  return (day - 1) * 2 + (time === "09:00" ? 1 : 2)
}

/**
 * 환율을 고려한 종목 평가액 (KRW)
 */
export function evaluateHolding(
  stock: ScenarioStock,
  qty: number,
  priceAtTurn: number,
  fxAtTurn: number,
  fxStartRate: number,
): number {
  if (stock.currency === "KRW") {
    return Math.round(priceAtTurn * qty)
  }
  // USD → KRW (시작 환율 대비 현재 환율로 환산)
  return Math.round(priceAtTurn * qty * fxAtTurn)
}
