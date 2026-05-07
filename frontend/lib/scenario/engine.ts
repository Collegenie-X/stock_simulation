// ============================================================
// Scenario Engine — 게임 상태 + 턴 진행 + 결정 처리
// ============================================================

import type {
  GameScenario,
  ScenarioStock,
} from "@/data/game-scenarios/types"
import { getPriceAt, getEventsAtTurn } from "./loader"
import {
  evaluateDecision,
  finalScore,
  type DecisionLog,
  type ScoringResult,
} from "./scoring"
import {
  newsForTurn,
  preSignalsForTurn,
  inferMarketMood,
  type DisplayNews,
  type PreSignal,
  type MarketMood,
} from "./news"

// ============================================================
// 게임 상태
// ============================================================

export interface GameState {
  scenarioId: string
  rngSeed: number
  currentTurn: number              // 1~totalTurns
  isFinished: boolean

  // 자산
  cash: number                     // KRW
  holdings: Record<string, number> // stockId → 수량
  averagePrices: Record<string, number> // stockId → 평단 (native currency)

  // 점수
  senseScore: number
  decisions: DecisionLog[]

  // 통계
  totalAssetKrw: number
  initialCapital: number

  // 종료 결과
  result: ScoringResult | null
}

// ============================================================
// 턴 정보 (UI 렌더링용 한 묶음)
// ============================================================

export interface TurnSnapshot {
  turn: number
  day: number
  time: "09:00" | "14:00"
  date: string
  weekday: string
  weekTheme: string
  act: 1 | 2 | 3
  fxRate: number
  prices: Record<string, { native: number; krw: number }>
  news: DisplayNews[]
  preSignals: PreSignal[]
  mood: MarketMood
  totalAssetKrw: number
  cash: number
  holdings: Record<string, number>
  unrealizedPnL: Record<string, number>  // stockId → 평가손익 (native)
}

// ============================================================
// 초기화
// ============================================================

export function initGame(
  scenario: GameScenario,
  rngSeed: number = Date.now() & 0xffffffff,
): GameState {
  return {
    scenarioId: scenario.id,
    rngSeed,
    currentTurn: 1,
    isFinished: false,
    cash: scenario.initialCapital,
    holdings: {},
    averagePrices: {},
    senseScore: 0,
    decisions: [],
    totalAssetKrw: scenario.initialCapital,
    initialCapital: scenario.initialCapital,
    result: null,
  }
}

// ============================================================
// 결정 처리 — buy / sell / hold / timeout
// ============================================================

export interface DecisionInput {
  stockId: string | null   // hold/timeout인 경우 null
  action: "buy" | "sell" | "hold" | "timeout"
  quantity: number         // 매수/매도 수량
  decisionTimeMs: number
}

export interface DecisionResult {
  success: boolean
  error?: string
  log?: DecisionLog
  scoreDelta?: number
  scoreReasons?: string[]
}

export function makeDecision(
  scenario: GameScenario,
  state: GameState,
  input: DecisionInput,
): DecisionResult {
  if (state.isFinished) {
    return { success: false, error: "게임이 이미 종료됨" }
  }

  const turn = state.currentTurn
  const cashBefore = state.cash

  // hold / timeout 처리
  if (input.action === "hold" || input.action === "timeout") {
    const log: DecisionLog = {
      turn,
      stockId: null,
      action: input.action,
      quantity: 0,
      priceNative: 0,
      priceKrw: 0,
      decisionTimeMs: input.decisionTimeMs,
      cashBefore,
      cashAfter: cashBefore,
    }
    return applyDecision(scenario, state, log)
  }

  // 매수/매도 — stockId 필수
  if (!input.stockId) {
    return { success: false, error: "stockId required for buy/sell" }
  }

  const stock = scenario.stocks.find((s) => s.id === input.stockId)
  if (!stock) {
    return { success: false, error: `Unknown stock ${input.stockId}` }
  }

  const priceInfo = getPriceAt(scenario, input.stockId, turn)

  // 매수
  if (input.action === "buy") {
    const totalCost = priceInfo.krw * input.quantity
    if (totalCost > state.cash) {
      return {
        success: false,
        error: `현금 부족: 필요 ${totalCost.toLocaleString()}, 보유 ${state.cash.toLocaleString()}`,
      }
    }
    if (input.quantity <= 0) {
      return { success: false, error: "수량은 1주 이상" }
    }

    const log: DecisionLog = {
      turn,
      stockId: input.stockId,
      action: "buy",
      quantity: input.quantity,
      priceNative: priceInfo.native,
      priceKrw: priceInfo.krw,
      decisionTimeMs: input.decisionTimeMs,
      cashBefore,
      cashAfter: cashBefore - totalCost,
    }
    return applyDecision(scenario, state, log)
  }

  // 매도
  if (input.action === "sell") {
    const held = state.holdings[input.stockId] || 0
    if (input.quantity > held) {
      return {
        success: false,
        error: `보유 부족: 매도 ${input.quantity}주, 보유 ${held}주`,
      }
    }
    if (input.quantity <= 0) {
      return { success: false, error: "수량은 1주 이상" }
    }

    const totalRevenue = priceInfo.krw * input.quantity
    const log: DecisionLog = {
      turn,
      stockId: input.stockId,
      action: "sell",
      quantity: input.quantity,
      priceNative: priceInfo.native,
      priceKrw: priceInfo.krw,
      decisionTimeMs: input.decisionTimeMs,
      cashBefore,
      cashAfter: cashBefore + totalRevenue,
    }
    return applyDecision(scenario, state, log)
  }

  return { success: false, error: "Unknown action" }
}

function applyDecision(
  scenario: GameScenario,
  state: GameState,
  log: DecisionLog,
): DecisionResult {
  // 1) 잔고/보유 갱신
  state.cash = log.cashAfter

  if (log.action === "buy" && log.stockId) {
    const oldQty = state.holdings[log.stockId] || 0
    const oldAvg = state.averagePrices[log.stockId] || 0
    const newQty = oldQty + log.quantity
    const newAvg =
      oldQty > 0
        ? (oldQty * oldAvg + log.quantity * log.priceNative) / newQty
        : log.priceNative
    state.holdings[log.stockId] = newQty
    state.averagePrices[log.stockId] = newAvg
  }

  if (log.action === "sell" && log.stockId) {
    const oldQty = state.holdings[log.stockId] || 0
    const newQty = oldQty - log.quantity
    state.holdings[log.stockId] = newQty
    if (newQty <= 0) {
      delete state.holdings[log.stockId]
      delete state.averagePrices[log.stockId]
    }
  }

  // 2) 결정 로그 추가
  state.decisions.push(log)

  // 3) 점수 평가
  const totalAssetKrw = recomputeTotalAsset(scenario, state)
  state.totalAssetKrw = totalAssetKrw

  const delta = evaluateDecision({
    scenario,
    turn: state.currentTurn,
    totalTurns: scenario.totalTurns,
    decision: log,
    recentDecisions: state.decisions.slice(-10),
    holdings: state.holdings,
    averagePrices: state.averagePrices,
    totalAssetKrw,
    initialCapital: state.initialCapital,
  })
  state.senseScore += delta.amount

  return {
    success: true,
    log,
    scoreDelta: delta.amount,
    scoreReasons: delta.reasons,
  }
}

// ============================================================
// 턴 진행
// ============================================================

export function advanceTurn(scenario: GameScenario, state: GameState): boolean {
  if (state.isFinished) return false
  if (state.currentTurn >= scenario.totalTurns) {
    finishGame(scenario, state)
    return false
  }
  state.currentTurn++
  // 자산 재계산 (가격 변동 반영)
  state.totalAssetKrw = recomputeTotalAsset(scenario, state)

  // 즉시 게임오버 체크
  if (state.totalAssetKrw <= state.initialCapital * 0.5) {
    finishGame(scenario, state)
    return false
  }

  return true
}

function finishGame(scenario: GameScenario, state: GameState): void {
  state.isFinished = true
  // 종료 시점 가격으로 보유 종목 모두 평가
  state.totalAssetKrw = recomputeTotalAsset(scenario, state)
  state.result = finalScore(
    scenario,
    state.decisions,
    state.totalAssetKrw,
    state.senseScore,
  )
}

// ============================================================
// 자산 평가
// ============================================================

export function recomputeTotalAsset(
  scenario: GameScenario,
  state: GameState,
): number {
  let total = state.cash
  for (const [sid, qty] of Object.entries(state.holdings)) {
    if (qty <= 0) continue
    const price = getPriceAt(scenario, sid, state.currentTurn)
    total += price.krw * qty
  }
  return Math.round(total)
}

// ============================================================
// UI 스냅샷 — 현재 턴의 모든 표시용 정보
// ============================================================

export function snapshotTurn(
  scenario: GameScenario,
  state: GameState,
): TurnSnapshot {
  const turn = state.currentTurn
  const day = Math.floor((turn - 1) / scenario.turnsPerDay) + 1
  const timeIdx = (turn - 1) % scenario.turnsPerDay
  const time = scenario.turnTimes[timeIdx] as "09:00" | "14:00"

  const cal = scenario.calendar.find((c) => c.day === day)
  const week = scenario.uiHints.weekBoundaries.find(
    (w) => day >= w.startDay && day <= w.endDay,
  )
  const act = scenario.uiHints.actBoundaries.find(
    (a) => turn >= a.startTurn && turn <= a.endTurn,
  )

  // 가격
  const prices: TurnSnapshot["prices"] = {}
  for (const stock of scenario.stocks) {
    const p = getPriceAt(scenario, stock.id, turn)
    prices[stock.id] = { native: p.native, krw: p.krw }
  }

  // 평가손익 (보유분, native 기준)
  const unrealizedPnL: Record<string, number> = {}
  for (const [sid, qty] of Object.entries(state.holdings)) {
    if (qty <= 0) continue
    const p = getPriceAt(scenario, sid, turn)
    const avg = state.averagePrices[sid] || 0
    unrealizedPnL[sid] = (p.native - avg) * qty
  }

  return {
    turn,
    day,
    time,
    date: cal?.date || "",
    weekday: cal?.weekday || "",
    weekTheme: week?.theme || "",
    act: (act?.act || 1) as 1 | 2 | 3,
    fxRate: scenario.fxSeries[turn - 1],
    prices,
    news: newsForTurn(scenario, turn, state.rngSeed),
    preSignals: preSignalsForTurn(scenario, turn),
    mood: inferMarketMood(scenario, turn),
    totalAssetKrw: state.totalAssetKrw,
    cash: state.cash,
    holdings: { ...state.holdings },
    unrealizedPnL,
  }
}

// ============================================================
// 직렬화 (localStorage용)
// ============================================================

export interface SerializedState {
  v: 1                       // 스키마 버전
  scenarioId: string
  rngSeed: number
  currentTurn: number
  isFinished: boolean
  cash: number
  holdings: Record<string, number>
  averagePrices: Record<string, number>
  senseScore: number
  decisions: DecisionLog[]
}

export function serialize(state: GameState): SerializedState {
  return {
    v: 1,
    scenarioId: state.scenarioId,
    rngSeed: state.rngSeed,
    currentTurn: state.currentTurn,
    isFinished: state.isFinished,
    cash: state.cash,
    holdings: state.holdings,
    averagePrices: state.averagePrices,
    senseScore: state.senseScore,
    decisions: state.decisions,
  }
}

export function deserialize(
  scenario: GameScenario,
  saved: SerializedState,
): GameState {
  if (saved.v !== 1) {
    throw new Error(`Unsupported saved state version: ${saved.v}`)
  }
  if (saved.scenarioId !== scenario.id) {
    throw new Error(
      `Saved state for ${saved.scenarioId} but scenario is ${scenario.id}`,
    )
  }
  const state: GameState = {
    scenarioId: saved.scenarioId,
    rngSeed: saved.rngSeed,
    currentTurn: saved.currentTurn,
    isFinished: saved.isFinished,
    cash: saved.cash,
    holdings: { ...saved.holdings },
    averagePrices: { ...saved.averagePrices },
    senseScore: saved.senseScore,
    decisions: [...saved.decisions],
    totalAssetKrw: 0,
    initialCapital: scenario.initialCapital,
    result: null,
  }
  state.totalAssetKrw = recomputeTotalAsset(scenario, state)
  if (state.isFinished) {
    state.result = finalScore(
      scenario,
      state.decisions,
      state.totalAssetKrw,
      state.senseScore,
    )
  }
  return state
}
