import type { ScenarioEvent } from "@/data/legendary-scenarios"
import playContent from "@/data/scenario-play-content.json"

const { game: GAME_CFG } = playContent

// ── 타입 ─────────────────────────────────────
export interface TurnData {
  phase: number
  event: ScenarioEvent
  startPrice: number
  endPrice: number
  change: number
  chartPoints: number[]
}

export type ActionType = "buy" | "sell" | "hold"

export interface TradeRecord {
  phase: number
  action: ActionType
  quantity: number
  price: number
  eventTitle: string
}

// ── 핵심 4턴 선별 ────────────────────────────
export function selectKeyEvents(events: ScenarioEvent[]): ScenarioEvent[] {
  const n = events.length
  if (n <= GAME_CFG.turnsPerScenario) return events.map((e, i) => ({ ...e, turn: i + 1 }))
  const picks = [0, Math.floor(n * 0.3), Math.floor(n * 0.55), n - 1]
  return picks.map((idx, phase) => ({ ...events[idx], turn: phase + 1 }))
}

// ── 세밀한 차트 데이터 생성 ──────────────────
// 턴 사이를 보간해서 자연스러운 곡선 생성
function interpolatePoints(
  startPrice: number,
  endPrice: number,
  count: number,
  volatility: number = 0.008,
): number[] {
  const pts: number[] = [startPrice]
  const diff = endPrice - startPrice
  for (let i = 1; i < count - 1; i++) {
    const progress = i / (count - 1)
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    const base = startPrice + diff * eased
    const noise = base * volatility * (Math.random() * 2 - 1)
    pts.push(Math.round(base + noise))
  }
  pts.push(endPrice)
  return pts
}

export function buildTurnData(events: ScenarioEvent[]): TurnData[] {
  const keyEvents = selectKeyEvents(events)
  let price = GAME_CFG.initialPrice
  const pointsPerTurn = GAME_CFG.chartPointsPerTurn

  return keyEvents.map((evt, idx) => {
    const changePercent = parseFloat(evt.priceChange.replace("%", "").replace("+", ""))
    const startPrice = price
    const endPrice = Math.round(price * (1 + changePercent / 100))
    const vol = Math.abs(changePercent) > 10 ? 0.015 : Math.abs(changePercent) > 5 ? 0.01 : 0.006
    const chartPoints = interpolatePoints(startPrice, endPrice, pointsPerTurn, vol)
    price = endPrice
    return {
      phase: idx,
      event: evt,
      startPrice,
      endPrice,
      change: changePercent,
      chartPoints,
    }
  })
}

// ── 전체 차트 포인트 병합 ────────────────────
export function getAllChartPoints(turns: TurnData[], upToPhase: number): number[] {
  const pts: number[] = []
  for (let i = 0; i <= upToPhase && i < turns.length; i++) {
    if (i === 0) {
      pts.push(...turns[i].chartPoints)
    } else {
      pts.push(...turns[i].chartPoints.slice(1))
    }
  }
  return pts
}

// ── 포트폴리오 계산 ─────────────────────────
export function calcPortfolioValue(cash: number, holdings: number, price: number): number {
  return cash + holdings * price
}

export function calcProfitRate(current: number, initial: number): number {
  return ((current - initial) / initial) * 100
}

// ── 이상적 행동 판단 ────────────────────────
export function getIdealAction(
  turns: TurnData[],
  currentPhase: number,
  hasHoldings: boolean,
): ActionType {
  const futureChanges = turns.slice(currentPhase + 1).map((t) => t.change)
  const futureSum = futureChanges.reduce((a, b) => a + b, 0)
  if (futureSum < -5) return hasHoldings ? "sell" : "hold"
  if (futureSum > 3) return "buy"
  return "hold"
}

// ── 피드백 스코어 ───────────────────────────
export function getFeedbackLevel(
  action: ActionType,
  idealAction: ActionType,
): "correct" | "good" | "bad" {
  if (action === idealAction) return "correct"
  if (action === "hold") return "good"
  return "bad"
}

// ── 등급 판정 ───────────────────────────────
export function getGrade(profitRate: number): string {
  const grades = playContent.grades
  for (const [key, cfg] of Object.entries(grades)) {
    if (profitRate >= cfg.minRate) return key
  }
  return "D"
}
