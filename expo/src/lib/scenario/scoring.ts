// ============================================================
// Sense Score & Grade
// 출처: docs/GAME_DESIGN.md 4번 보상 시스템
// ============================================================

import type {
  GameScenario,
  Grade,
  ScenarioEvent,
} from "@/data/game-scenarios/types"
import { getPriceAt } from "./loader"

// ============================================================
// 결정 로그
// ============================================================
export type ActionType = "buy" | "sell" | "hold" | "timeout"

export interface DecisionLog {
  turn: number
  stockId: string | null     // hold/timeout인 경우 null 가능
  action: ActionType
  quantity: number
  priceNative: number
  priceKrw: number
  decisionTimeMs: number     // 결정에 걸린 시간
  cashBefore: number
  cashAfter: number
}

// ============================================================
// 점수 가산/차감 규칙
// ============================================================
export const SCORE_RULES = {
  // 가산
  TREND_TOP_BUY: 50,         // 추세 시작점 매수 (저점 ±3% 이내)
  TREND_TOP_SELL: 50,        // 고점 매도 (고점 ±3% 이내)
  TRAP_AVOIDED: 30,          // 함정 회피
  STOP_LOSS_DISCIPLINE: 30,  // -5% 이내 손절
  TAKE_PROFIT: 30,           // +10% 이상 익절
  FAST_DECISION: 3,          // 30초 이내 결정
  DIVERSIFICATION: 5,        // 분산투자 유지 (3종목 이상)
  PRE_BLACKSWAN_CASH: 100,   // 블랙스완 직전 현금화

  // 차감
  TRAP_HIT: -50,             // 함정에 걸림
  HIGH_BUY: -40,             // 고점 매수
  LOW_SELL: -40,             // 저점 매도
  STOP_LOSS_FAIL: -50,       // 손절 미실행 후 -10%
  ALLIN_CRASH: -100,         // 올인 후 -20%
  TIMEOUT: -5,               // 타임아웃
  PASSIVE_5_TURNS: -20,      // 5턴 이상 무거래
}

// ============================================================
// 등급 산정
// ============================================================

export interface ScoringResult {
  grade: Grade
  senseScore: number
  profitRate: number          // 0.27 = +27%
  finalAssetKrw: number
  initialCapital: number
  badges: string[]
}

export function calculateGrade(
  senseScore: number,
  profitRate: number,
): Grade {
  // 게임오버
  if (profitRate <= -0.5) return "F"
  // S
  if (senseScore >= 800 && profitRate >= 0.2) return "S"
  // A
  if (senseScore >= 600 && profitRate >= 0.1) return "A"
  // B
  if (senseScore >= 400 && profitRate >= 0) return "B"
  // C
  if (senseScore >= 200 || profitRate >= -0.1) return "C"
  // D
  return "D"
}

// ============================================================
// 결정 평가 — 매 턴마다 호출
// ============================================================

export interface DecisionContext {
  scenario: GameScenario
  turn: number
  totalTurns: number
  decision: DecisionLog
  recentDecisions: DecisionLog[]
  holdings: Record<string, number>
  averagePrices: Record<string, number>
  totalAssetKrw: number
  initialCapital: number
}

export interface ScoreDelta {
  amount: number
  reasons: string[]
}

export function evaluateDecision(ctx: DecisionContext): ScoreDelta {
  const { scenario, turn, decision, recentDecisions, holdings } = ctx
  const reasons: string[] = []
  let total = 0

  // 1) 빠른 결정 보너스
  if (decision.action !== "timeout" && decision.decisionTimeMs <= 30000) {
    total += SCORE_RULES.FAST_DECISION
    reasons.push(`30초 내 결정 +${SCORE_RULES.FAST_DECISION}`)
  }

  // 2) 타임아웃 페널티
  if (decision.action === "timeout") {
    total += SCORE_RULES.TIMEOUT
    reasons.push(`타임아웃 ${SCORE_RULES.TIMEOUT}`)
  }

  // 3) 매수 평가
  if (decision.action === "buy" && decision.stockId) {
    const series = scenario.priceSeries[decision.stockId]
    if (series && series.length > 0) {
      const min = Math.min(...series)
      const max = Math.max(...series)
      const price = decision.priceNative

      // 저점 ±3% 이내 매수
      if (price <= min * 1.03) {
        total += SCORE_RULES.TREND_TOP_BUY
        reasons.push(`저점 매수 +${SCORE_RULES.TREND_TOP_BUY}`)
      }
      // 고점 ±3% 이내 매수 (감점)
      if (price >= max * 0.97) {
        total += SCORE_RULES.HIGH_BUY
        reasons.push(`고점 매수 ${SCORE_RULES.HIGH_BUY}`)
      }
    }
  }

  // 4) 매도 평가
  if (decision.action === "sell" && decision.stockId) {
    const series = scenario.priceSeries[decision.stockId]
    if (series && series.length > 0) {
      const min = Math.min(...series)
      const max = Math.max(...series)
      const price = decision.priceNative

      if (price >= max * 0.97) {
        total += SCORE_RULES.TREND_TOP_SELL
        reasons.push(`고점 매도 +${SCORE_RULES.TREND_TOP_SELL}`)
      }
      if (price <= min * 1.03) {
        total += SCORE_RULES.LOW_SELL
        reasons.push(`저점 매도 ${SCORE_RULES.LOW_SELL}`)
      }

      // 손절/익절 평가
      const avg = ctx.averagePrices[decision.stockId]
      if (avg && avg > 0) {
        const pnlPct = (price - avg) / avg
        if (pnlPct >= 0.1) {
          total += SCORE_RULES.TAKE_PROFIT
          reasons.push(`익절 +${SCORE_RULES.TAKE_PROFIT}`)
        }
        if (pnlPct <= -0.05 && pnlPct >= -0.07) {
          total += SCORE_RULES.STOP_LOSS_DISCIPLINE
          reasons.push(`손절 규율 +${SCORE_RULES.STOP_LOSS_DISCIPLINE}`)
        }
      }
    }
  }

  // 5) 분산 보너스
  const heldCount = Object.values(holdings).filter((q) => q > 0).length
  if (heldCount >= 3) {
    total += SCORE_RULES.DIVERSIFICATION
    reasons.push(`분산 +${SCORE_RULES.DIVERSIFICATION}`)
  }

  // 6) 블랙스완 직전 현금화 보너스
  const upcomingBlackswan = scenario.events.find(
    (e) =>
      e.type === "blackswan" && e.turn >= turn + 1 && e.turn <= turn + 3,
  )
  if (
    upcomingBlackswan &&
    decision.action === "sell" &&
    decision.stockId
  ) {
    total += SCORE_RULES.PRE_BLACKSWAN_CASH
    reasons.push(`블랙스완 직전 현금화 +${SCORE_RULES.PRE_BLACKSWAN_CASH}`)
  }

  // 7) 함정 회피/적중 — 다음 N턴 가격 변동을 보고 사후 평가
  if (decision.action === "buy" && decision.stockId) {
    const series = scenario.priceSeries[decision.stockId]
    if (series && turn + 3 < series.length) {
      const future = series[turn + 2] // 2턴 후
      const change = (future - decision.priceNative) / decision.priceNative
      if (change <= -0.1) {
        total += SCORE_RULES.TRAP_HIT
        reasons.push(`함정 적중 (2턴 후 -${(Math.abs(change) * 100).toFixed(1)}%) ${SCORE_RULES.TRAP_HIT}`)
      }
    }
  }

  // 8) 5턴 무거래 페널티
  const last5 = recentDecisions.slice(-5)
  if (
    last5.length >= 5 &&
    last5.every((d) => d.action === "hold" || d.action === "timeout")
  ) {
    total += SCORE_RULES.PASSIVE_5_TURNS
    reasons.push(`5턴 무거래 ${SCORE_RULES.PASSIVE_5_TURNS}`)
  }

  return { amount: total, reasons }
}

// ============================================================
// 배지 평가 (게임 종료 시)
// ============================================================

export interface BadgeRule {
  id: string
  name: string
  emoji: string
  test: (ctx: FinalContext) => boolean
  description: string
}

export interface FinalContext {
  scenario: GameScenario
  decisions: DecisionLog[]
  finalAssetKrw: number
  initialCapital: number
  senseScore: number
  trapsAvoided: number
  trapsHit: number
  blackswanResponse: "panic_sell" | "hold" | "buy_dip" | null
}

export const BADGES: BadgeRule[] = [
  {
    id: "first_profit",
    name: "첫 익절",
    emoji: "🥇",
    description: "첫 +수익 매도",
    test: (ctx) =>
      ctx.decisions.some((d) => {
        if (d.action !== "sell" || !d.stockId) return false
        const series = ctx.scenario.priceSeries[d.stockId]
        return series ? d.priceNative > series[0] * 1.05 : false
      }),
  },
  {
    id: "stop_loss_master",
    name: "손절왕",
    emoji: "🛡️",
    description: "-5% 이내 컷 3회 이상",
    test: (ctx) => {
      const cuts = ctx.decisions.filter((d) => d.action === "sell").length
      return cuts >= 3
    },
  },
  {
    id: "speedrun",
    name: "스피드런",
    emoji: "⚡",
    description: "결정 평균 15초 이하",
    test: (ctx) => {
      const decided = ctx.decisions.filter((d) => d.action !== "timeout")
      if (decided.length === 0) return false
      const avg =
        decided.reduce((s, d) => s + d.decisionTimeMs, 0) / decided.length
      return avg <= 15000
    },
  },
  {
    id: "blackswan_survivor",
    name: "블랙스완 생존",
    emoji: "🌪️",
    description: "블랙스완에서 매수 또는 보유",
    test: (ctx) => ctx.blackswanResponse === "buy_dip" || ctx.blackswanResponse === "hold",
  },
  {
    id: "trap_dodger",
    name: "함정 회피왕",
    emoji: "🎖️",
    description: "함정 0회 적중",
    test: (ctx) => ctx.trapsHit === 0 && ctx.decisions.length >= 10,
  },
  {
    id: "diamond_hands",
    name: "다이아 핸드",
    emoji: "💎",
    description: "최종 +20% 이상",
    test: (ctx) =>
      ctx.finalAssetKrw / ctx.initialCapital >= 1.2,
  },
  {
    id: "trend_rider",
    name: "추세 추종",
    emoji: "🏄",
    description: "한 종목 +50% 이상 익절",
    test: (ctx) => {
      // 매도 가격이 매수 평단의 1.5배 이상인 경우
      const sells = ctx.decisions.filter((d) => d.action === "sell")
      return sells.some((d) => {
        const buys = ctx.decisions.filter(
          (b) => b.action === "buy" && b.stockId === d.stockId && b.turn < d.turn,
        )
        if (buys.length === 0) return false
        const avgBuy =
          buys.reduce((s, b) => s + b.priceNative * b.quantity, 0) /
          buys.reduce((s, b) => s + b.quantity, 0)
        return d.priceNative >= avgBuy * 1.5
      })
    },
  },
]

export function evaluateBadges(ctx: FinalContext): string[] {
  return BADGES.filter((b) => b.test(ctx)).map((b) => b.id)
}

// ============================================================
// 최종 채점
// ============================================================

export function finalScore(
  scenario: GameScenario,
  decisions: DecisionLog[],
  finalAssetKrw: number,
  senseScore: number,
): ScoringResult {
  const profitRate = (finalAssetKrw - scenario.initialCapital) / scenario.initialCapital
  const grade = calculateGrade(senseScore, profitRate)

  const trapsHit = countTrapsHit(scenario, decisions)
  const trapsAvoided = countTrapsAvoided(scenario, decisions)
  const blackswanResponse = analyzeBlackswanResponse(scenario, decisions)

  const badges = evaluateBadges({
    scenario,
    decisions,
    finalAssetKrw,
    initialCapital: scenario.initialCapital,
    senseScore,
    trapsAvoided,
    trapsHit,
    blackswanResponse,
  })

  return {
    grade,
    senseScore,
    profitRate,
    finalAssetKrw,
    initialCapital: scenario.initialCapital,
    badges,
  }
}

function countTrapsHit(
  scenario: GameScenario,
  decisions: DecisionLog[],
): number {
  // 함정 적중 = 매수 후 2턴 내 -10% 이상 손실
  let count = 0
  for (const d of decisions) {
    if (d.action !== "buy" || !d.stockId) continue
    const series = scenario.priceSeries[d.stockId]
    if (!series || d.turn + 2 > series.length) continue
    const future = series[d.turn + 1]
    const change = (future - d.priceNative) / d.priceNative
    if (change <= -0.1) count++
  }
  return count
}

function countTrapsAvoided(
  scenario: GameScenario,
  decisions: DecisionLog[],
): number {
  // 단순 추정: 작전 캐릭터 종목을 한 번도 안 산 경우 회피
  const trapStocks = scenario.stocks.filter((s) => s.character === "trap")
  return trapStocks.filter(
    (ts) => !decisions.some((d) => d.stockId === ts.id && d.action === "buy"),
  ).length
}

function analyzeBlackswanResponse(
  scenario: GameScenario,
  decisions: DecisionLog[],
): "panic_sell" | "hold" | "buy_dip" | null {
  const blackswan = scenario.events.find((e) => e.type === "blackswan")
  if (!blackswan) return null

  // 블랙스완 턴부터 +2턴 사이의 결정
  const window = decisions.filter(
    (d) => d.turn >= blackswan.turn && d.turn <= blackswan.turn + 2,
  )

  const hasBuy = window.some((d) => d.action === "buy")
  const hasSell = window.some((d) => d.action === "sell")

  if (hasBuy) return "buy_dip"
  if (hasSell) return "panic_sell"
  return "hold"
}
