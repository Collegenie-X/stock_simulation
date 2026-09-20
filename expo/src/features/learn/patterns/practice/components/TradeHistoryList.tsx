import React from "react"
import { StyleSheet, Text, View } from "react-native"
import {
  TURNS_PER_ROUND,
  CANDLES_PER_TURN,
  INITIAL_REVEAL,
  type PatternScenario,
  type TradeLog,
  type TurnEval,
} from "@/data/pattern-practice"
import { TradeHistoryCard, type AIResult } from "@/features/learn/scenarios/play/components/TradeHistoryCard"
import { palette } from "@/theme"

interface Props {
  trades: TradeLog[]
  turnEvals?: TurnEval[]
  scenario?: PatternScenario
  aiResults?: AIResult[]
  initTotal?: number
  userRate?: number
}

/** Round Result Trade History — 공통 TradeHistoryCard 사용 */
export function TradeHistoryList({ trades, turnEvals, scenario, aiResults, initTotal, userRate }: Props) {
  if (trades.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>이번 라운드에 거래가 없었어요</Text>
      </View>
    )
  }

  // 전체 8턴 (거래 없는 관망 턴 포함)
  const allTurns = Array.from({ length: TURNS_PER_ROUND }, (_, i) => i)

  return (
    <View style={styles.list}>
      {allTurns.map((turnIdx) => {
        const t = trades.find((tr) => tr.turn === turnIdx)
        const ev = turnEvals?.find((e) => e.turn === turnIdx)
        const candles = scenario?.candles ?? []
        const currentCandleIdx = INITIAL_REVEAL + (turnIdx + 1) * CANDLES_PER_TURN - 1
        const nextCandleIdx = currentCandleIdx + CANDLES_PER_TURN
        const currentClose = candles[Math.min(currentCandleIdx, candles.length - 1)]?.close ?? 0
        const nextClose = candles[Math.min(nextCandleIdx, candles.length - 1)]?.close ?? 0
        const nextTurnChange = currentClose > 0 ? ((nextClose - currentClose) / currentClose) * 100 : undefined
        const turnPrice = candles[Math.min(currentCandleIdx, candles.length - 1)]?.close ?? 0

        return (
          <TradeHistoryCard
            key={turnIdx}
            mode="pattern"
            index={turnIdx}
            trade={{
              turn: turnIdx,
              action: t?.action ?? "skip",
              shares: t?.shares ?? 0,
              price: t?.price ?? turnPrice,
              amount: t?.amount ?? 0,
              turnPnl: ev?.turnPnl,
              score: ev?.score,
              verdict: ev?.verdict,
            }}
            nextTurnChange={nextTurnChange !== undefined && nextCandleIdx < candles.length ? nextTurnChange : undefined}
            showScore={!!ev}
            aiResults={aiResults}
            initTotal={initTotal}
            userRate={userRate}
            currentPrice={turnPrice}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  empty: { paddingHorizontal: 16, paddingVertical: 12, alignItems: "center" },
  emptyText: { fontSize: 14, color: palette.gray[500] },
  list: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
})
