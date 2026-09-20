import type { PatternScenario, RoundScore, TradeLog } from "@/data/pattern-practice"

export type GamePhase = "intro" | "countdown" | "revealing" | "deciding" | "feedback" | "closing" | "round-result" | "final-result"

export interface RoundData {
  score: RoundScore
  trades: TradeLog[]
  finalCash: number
  finalShares: number
  finalAvgCost: number // 최종 보유 주식 평균 단가
  startingShares: number
  scenario: PatternScenario
}

/** In-game Turn History (live during play) */
export interface TurnHistoryEntry {
  turn: number
  action: "buy" | "sell" | "skip" | "timeout"
  price: number
  shares: number // 거래 주수
  amount: number // 거래 금액
  sharesHeld: number // 거래 후 보유 주수
  profit?: number // 매도 시 실현 손익
}
