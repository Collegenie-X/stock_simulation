import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { RotateCcw } from "lucide-react-native"
import { Screen } from "@/components/layout"
import { PressableScale } from "@/components/ui"
import { getFinalResult, CANDLES_PER_TURN, INITIAL_CASH, INITIAL_REVEAL } from "@/data/pattern-practice"
import { alpha, palette } from "@/theme"
import type { RoundData } from "../types"
import { fmtPnl, gradeColors } from "../utils/format"
import { BottomFadeBar } from "./BottomFadeBar"
import { GradientCta } from "./GradientCta"
import { LineChart } from "./LineChart"
import { StarRating } from "./StarRating"
import { TradeHistoryList } from "./TradeHistoryList"

interface Props {
  totalScore: number
  totalRounds: number
  roundResults: RoundData[]
  isBasicStrategy: boolean
  introGradient: readonly string[]
  onReview: () => void
  onRetry: () => void
}

export function FinalResultView({ totalScore, totalRounds, roundResults, isBasicStrategy, introGradient, onReview, onRetry }: Props) {
  const result = getFinalResult(totalScore)
  const avgTurnScore = roundResults.length > 0 ? roundResults.reduce((s, r) => s + r.score.total, 0) / roundResults.length : 0

  return (
    <Screen
      bg="#000000"
      safeBottom={false}
      contentStyle={styles.content}
      fixed={
        <BottomFadeBar>
          <PressableScale onPress={onReview} style={styles.reviewBtn}>
            <Text style={styles.reviewText}>{isBasicStrategy ? "전략 복습" : "패턴 복습"}</Text>
          </PressableScale>
          <GradientCta colors={introGradient} height={56} onPress={onRetry} style={{ flex: 2 }}>
            <RotateCcw size={20} color="#ffffff" />
            <Text style={styles.retryText}>다시 도전</Text>
          </GradientCta>
        </BottomFadeBar>
      }
    >
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>{result.emoji}</Text>
        <Text style={styles.heroTitle}>{result.title}</Text>
        <Text style={styles.heroSub}>{result.sub}</Text>
      </View>
      <View style={{ marginTop: 24 }}>
        <StarRating stars={result.stars} />
      </View>

      {/* 총점 */}
      <View style={styles.total}>
        <Text style={styles.totalLabel}>최종 점수</Text>
        <Text style={styles.totalValue}>
          {totalScore}
          <Text style={styles.totalMax}>/{totalRounds * 20}</Text>
        </Text>
        <Text style={[styles.totalLabel, { marginTop: 8 }]}>라운드 평균 {avgTurnScore.toFixed(1)}/20점</Text>
      </View>

      {/* 라운드별 요약 + 턴별 채점 */}
      <View style={{ marginTop: 20, gap: 20 }}>
        <Text style={styles.sectionTitle}>라운드별 AI 채점 리포트</Text>
        {roundResults.map((rd, i) => {
          const rdBuyIdx = rd.trades
            .filter((t) => t.action === "buy")
            .map((t) => Math.min(INITIAL_REVEAL + (t.turn + 1) * CANDLES_PER_TURN - 1, rd.scenario.candles.length - 1))
          const rdSellIdx = rd.trades
            .filter((t) => t.action === "sell")
            .map((t) => Math.min(INITIAL_REVEAL + (t.turn + 1) * CANDLES_PER_TURN - 1, rd.scenario.candles.length - 1))
          const rdFp = rd.scenario.candles[rd.scenario.candles.length - 1].close
          const rdUnrealized = rd.finalAvgCost > 0 ? (rdFp - rd.finalAvgCost) * rd.finalShares : 0
          const rdRealized = rd.score.userPnl - rdUnrealized
          const rdReturnPct = (rd.score.userPnl / INITIAL_CASH) * 100
          const grade = gradeColors(rd.score.grade, 0.2)
          return (
            <View key={i} style={styles.round}>
              {/* 라운드 헤더 */}
              <View style={styles.roundHead}>
                <View style={styles.roundTop}>
                  <View style={styles.roundNo}>
                    <Text style={styles.roundNoText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.roundEmoji}>{rd.score.emoji}</Text>
                  <View style={[styles.grade, { backgroundColor: grade.bg }]}>
                    <Text style={[styles.gradeText, { color: grade.text }]}>{rd.score.grade}</Text>
                  </View>
                  <Text style={styles.roundScore}>{rd.score.total}점</Text>
                  <Text numberOfLines={1} style={[styles.roundPnl, { color: rd.score.userPnl >= 0 ? palette.green[400] : palette.red[400] }]}>
                    {fmtPnl(rd.score.userPnl)} ({rdReturnPct >= 0 ? "+" : ""}
                    {rdReturnPct.toFixed(1)}%)
                  </Text>
                </View>
                {/* 실현/평가 손익 분리 */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <View style={styles.splitCell}>
                    <Text style={styles.splitLabel}>✅ 실현 손익</Text>
                    <Text style={[styles.splitValue, { color: rdRealized >= 0 ? palette.green[400] : palette.red[400] }]}>{fmtPnl(rdRealized)}</Text>
                  </View>
                  <View style={styles.splitCell}>
                    <Text style={styles.splitLabel}>📊 평가 손익 ({rd.finalShares}주)</Text>
                    <Text style={[styles.splitValue, { color: rdUnrealized >= 0 ? palette.blue[400] : palette.red[400] }]}>
                      {rd.finalShares > 0 ? fmtPnl(rdUnrealized) : "보유 없음"}
                    </Text>
                  </View>
                </View>
              </View>
              {/* 차트 */}
              <View style={styles.roundChart}>
                <LineChart candles={rd.scenario.candles} visibleCount={rd.scenario.candles.length} buyTurns={rdBuyIdx} sellTurns={rdSellIdx} />
              </View>
              {/* 턴별 거래 기록 — 공통 TradeHistoryCard */}
              <View style={styles.roundList}>
                <TradeHistoryList trades={rd.trades} turnEvals={rd.score.turnEvals} scenario={rd.scenario} />
              </View>
            </View>
          )
        })}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 170 },
  hero: { alignItems: "center", marginTop: 48 },
  heroEmoji: { fontSize: 100, lineHeight: 116, color: "#ffffff", marginBottom: 16 },
  heroTitle: { fontSize: 30, fontWeight: "900", color: "#ffffff", textAlign: "center" },
  heroSub: { fontSize: 18, color: palette.gray[400], marginTop: 8, textAlign: "center" },

  total: { marginTop: 24, backgroundColor: "#111111", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), alignItems: "center" },
  totalLabel: { fontSize: 14, color: palette.gray[500] },
  totalValue: { fontSize: 60, lineHeight: 66, fontWeight: "900", color: "#ffffff", marginTop: 4 },
  totalMax: { fontSize: 20, fontWeight: "400", color: palette.gray[600] },

  sectionTitle: { fontSize: 14, fontWeight: "700", color: palette.gray[400] },
  round: { backgroundColor: "#111111", borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  roundHead: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: alpha("#ffffff", 0.05) },
  roundTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  roundNo: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#1a1a1a", alignItems: "center", justifyContent: "center" },
  roundNoText: { fontSize: 14, fontWeight: "900", color: palette.gray[400] },
  roundEmoji: { fontSize: 20, color: "#ffffff" },
  grade: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  gradeText: { fontSize: 14, fontWeight: "900" },
  roundScore: { fontSize: 16, fontWeight: "900", color: palette.yellow[400] },
  roundPnl: { flex: 1, fontSize: 14, fontWeight: "900", textAlign: "right" },
  splitCell: { flex: 1, backgroundColor: "#0a0a0a", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  splitLabel: { fontSize: 9, color: palette.gray[600] },
  splitValue: { fontSize: 12, fontWeight: "900" },
  roundChart: { height: 160, padding: 4 },
  roundList: { borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },

  reviewBtn: { flex: 1, height: 56, borderRadius: 16, backgroundColor: "#111111", borderWidth: 1, borderColor: alpha("#ffffff", 0.1), alignItems: "center", justifyContent: "center" },
  reviewText: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  retryText: { fontSize: 18, fontWeight: "900", color: "#ffffff" },
})
