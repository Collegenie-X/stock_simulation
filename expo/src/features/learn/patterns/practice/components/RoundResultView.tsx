import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown, ChevronRight, Package, Trophy, Waves, X } from "lucide-react-native"
import { Screen } from "@/components/layout"
import { Float, Gradient, PressableScale, Pulse } from "@/components/ui"
import { INITIAL_CASH, TOTAL_ROUNDS } from "@/data/pattern-practice"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import type { PatternPracticeGame } from "../hooks/usePatternPracticeGame"
import { fmtPnl, gradeColors } from "../utils/format"
import { BottomFadeBar } from "./BottomFadeBar"
import { ExitDialog } from "./ExitDialog"
import { GradientCta } from "./GradientCta"
import { LineChart } from "./LineChart"
import { TradeHistoryList } from "./TradeHistoryList"

interface Props {
  game: PatternPracticeGame
  introGradient: readonly string[]
  onConfirmExit: () => void
}

export function RoundResultView({ game, introGradient, onConfirmExit }: Props) {
  const {
    roundResults,
    scenario,
    currentRound,
    totalRounds,
    streak,
    totalScore,
    totalCandles,
    buyIndices,
    sellIndices,
    chartOpen,
    setChartOpen,
    showExitDialog,
    setShowExitDialog,
    handleNextRound,
  } = game

  const rd = roundResults[roundResults.length - 1]
  if (!rd || !scenario) return null
  const s = rd.score
  const rdFinalPrice = rd.scenario.candles[rd.scenario.candles.length - 1].close
  const rdFinalValue = rd.finalCash + rd.finalShares * rdFinalPrice
  // 평가 손익 (보유 주식 평균 단가 대비)
  const unrealizedPnl = rd.finalAvgCost > 0 ? (rdFinalPrice - rd.finalAvgCost) * rd.finalShares : 0
  const unrealizedPct = rd.finalAvgCost > 0 ? ((rdFinalPrice - rd.finalAvgCost) / rd.finalAvgCost) * 100 : 0
  // 실현 손익 = 총 손익 - 평가 손익
  const realizedPnl = s.userPnl - unrealizedPnl
  // 원금 대비 수익률
  const totalReturnPct = (s.userPnl / INITIAL_CASH) * 100
  // 패턴 기반 가상 AI 비교 데이터
  const rdOptimalReturnPct = (s.optimalPnl / INITIAL_CASH) * 100
  const rdPatternAIResults = [
    {
      name: "공격왕 박영희",
      emoji: "⚡",
      type: "공격형",
      returnRate: `${rdOptimalReturnPct >= 0 ? "+" : ""}${rdOptimalReturnPct.toFixed(1)}%`,
      returnNum: rdOptimalReturnPct,
      actions: [],
    },
    {
      name: "안정왕 김철수",
      emoji: "🛡️",
      type: "안정형",
      returnRate: `${rdOptimalReturnPct * 0.6 >= 0 ? "+" : ""}${(rdOptimalReturnPct * 0.6).toFixed(1)}%`,
      returnNum: rdOptimalReturnPct * 0.6,
      actions: [],
    },
  ]

  const grade = gradeColors(s.grade, 0.3)
  const pnlUp = s.userPnl >= 0
  const pnlColor = pnlUp ? palette.green[400] : palette.red[400]
  const pnlBase = pnlUp ? palette.green[500] : palette.red[500]

  return (
    <Screen
      bg="#000000"
      safeBottom={false}
      contentStyle={styles.content}
      fixed={
        <>
          <BottomFadeBar>
            <PressableScale onPress={() => setShowExitDialog(true)} accessibilityLabel="게임 종료" style={styles.exitBtn}>
              <X size={20} color="#ffffff" />
            </PressableScale>
            <GradientCta colors={introGradient} onPress={handleNextRound} style={{ flex: 1 }}>
              {currentRound + 1 < totalRounds ? (
                <>
                  <Text style={styles.ctaText}>다음 라운드</Text>
                  <ChevronRight size={24} color="#ffffff" />
                </>
              ) : (
                <>
                  <Trophy size={24} color="#ffffff" />
                  <Text style={styles.ctaText}>최종 결과</Text>
                </>
              )}
            </GradientCta>
          </BottomFadeBar>
          <ExitDialog visible={showExitDialog} onConfirm={onConfirmExit} onCancel={() => setShowExitDialog(false)} />
        </>
      }
    >
      <View style={styles.head}>
        <Text style={styles.roundLabel}>
          라운드 {currentRound + 1}/{TOTAL_ROUNDS}
        </Text>
        <Float duration={1000} distance={20} style={{ marginTop: 12, marginBottom: 8 }}>
          <Text style={styles.headEmoji}>{s.emoji}</Text>
        </Float>
        <Text style={styles.headTitle}>{s.message}</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreValue}>{s.total}</Text>
          <Text style={styles.scoreMax}>/20점</Text>
          <View style={[styles.grade, { backgroundColor: grade.bg }]}>
            <Text style={[styles.gradeText, { color: grade.text }]}>{s.grade}</Text>
          </View>
        </View>
        {streak >= 2 && (
          <Pulse style={{ marginTop: 8 }}>
            <Text style={styles.streak}>🔥 {streak}연승!</Text>
          </Pulse>
        )}
      </View>

      {/* ── 손익 요약 ── */}
      <View style={{ marginTop: 16, gap: 8 }}>
        {/* 총 손익 (메인) */}
        <View style={[styles.pnlCard, { backgroundColor: alpha(pnlBase, 0.12), borderColor: alpha(pnlBase, 0.3) }]}>
          <View style={styles.pnlTop}>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.pnlLabel}>💰 총 손익 (원금 대비)</Text>
              <Text style={[styles.pnlValue, { color: pnlColor }]}>{fmtPnl(s.userPnl)}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.assetLabel}>최종 자산</Text>
              <Text style={styles.assetValue}>{formatNumber(rdFinalValue)}원</Text>
              <Text style={[styles.assetPct, { color: pnlColor }]}>
                {totalReturnPct >= 0 ? "+" : ""}
                {totalReturnPct.toFixed(2)}%
              </Text>
            </View>
          </View>
          {/* 실현 손익 vs 평가 손익 분리 */}
          <View style={styles.split}>
            <View style={styles.splitCell}>
              <Text style={styles.splitTitle}>✅ 실현 손익</Text>
              <Text style={styles.splitSub}>매도 완료된 수익</Text>
              <Text style={[styles.splitValue, { color: realizedPnl >= 0 ? palette.green[400] : palette.red[400] }]}>{fmtPnl(realizedPnl)}</Text>
            </View>
            <View style={styles.splitCell}>
              <Text style={styles.splitTitle}>📊 평가 손익</Text>
              <Text style={styles.splitSub}>보유 주식 현재 평가</Text>
              {rd.finalShares > 0 ? (
                <Text style={[styles.splitValue, { color: unrealizedPnl >= 0 ? palette.blue[400] : palette.red[400] }]}>{fmtPnl(unrealizedPnl)}</Text>
              ) : (
                <Text style={[styles.splitValue, { color: palette.gray[600] }]}>보유 없음</Text>
              )}
            </View>
          </View>
        </View>

        {/* 보유 주식 상세 (있을 때만) */}
        {rd.finalShares > 0 && (
          <View style={styles.holdings}>
            <View style={styles.holdingsHead}>
              <Package size={16} color={palette.indigo[400]} />
              <Text style={styles.holdingsTitle}>보유 주식</Text>
              <Text style={styles.holdingsCount}>{rd.finalShares}주</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.holdingsCell}>
                <Text style={styles.holdingsLabel}>평균 단가</Text>
                <Text style={[styles.holdingsValue, { color: palette.gray[300] }]}>{formatNumber(Math.round(rd.finalAvgCost))}원</Text>
              </View>
              <View style={[styles.holdingsCell, styles.cellDivider]}>
                <Text style={styles.holdingsLabel}>종가</Text>
                <Text style={[styles.holdingsValue, { color: "#ffffff" }]}>{formatNumber(rdFinalPrice)}원</Text>
              </View>
              <View style={[styles.holdingsCell, styles.cellDivider]}>
                <Text style={styles.holdingsLabel}>평가 손익</Text>
                <Text style={[styles.holdingsValue, { color: unrealizedPnl >= 0 ? palette.blue[400] : palette.red[400] }]}>
                  {unrealizedPct >= 0 ? "+" : ""}
                  {unrealizedPct.toFixed(1)}%
                </Text>
                <Text style={[styles.holdingsSub, { color: unrealizedPnl >= 0 ? palette.blue[500] : palette.red[500] }]}>{fmtPnl(unrealizedPnl)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* 현금 잔고 + 최적 매매 수익 */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={[styles.miniCard, { borderColor: alpha("#ffffff", 0.1) }]}>
            <Text style={[styles.miniLabel, { color: palette.gray[500] }]}>💵 현금 잔고</Text>
            <Text style={[styles.miniValue, { color: "#ffffff" }]}>{formatNumber(rd.finalCash)}원</Text>
          </View>
          <View style={[styles.miniCard, { borderColor: alpha(palette.yellow[500], 0.2) }]}>
            <Text style={[styles.miniLabel, { color: palette.yellow[600] }]}>🎯 완벽 전략 수익</Text>
            <Text style={[styles.miniValue, { color: palette.yellow[400] }]}>{fmtPnl(s.optimalPnl)}</Text>
            <Text style={styles.miniSub}>최적 타이밍 매매 시</Text>
          </View>
        </View>
      </View>

      {/* ── 차트 + 거래 기록 (펼치기/닫기) ── */}
      <View style={styles.analysis}>
        <Pressable onPress={() => setChartOpen((v) => !v)} style={({ pressed }) => [styles.analysisHead, pressed && { backgroundColor: alpha("#ffffff", 0.05) }]}>
          <View style={styles.analysisLeft}>
            <Gradient dir="br" colors={[palette.cyan[500], palette.blue[600]]} style={styles.analysisIcon}>
              <Waves size={14} color="#ffffff" />
            </Gradient>
            <Text style={styles.analysisTitle}>{rd.trades.length}턴 파도 분석</Text>
            <View style={styles.analysisPill}>
              <Text style={styles.analysisPillText}>탭하여 AI 갭 비교</Text>
            </View>
          </View>
          <View style={chartOpen ? { transform: [{ rotate: "180deg" }] } : undefined}>
            <ChevronDown size={20} color={palette.gray[500]} />
          </View>
        </Pressable>
        {chartOpen && (
          <>
            <View style={styles.analysisChart}>
              <LineChart candles={scenario.candles} visibleCount={totalCandles} buyTurns={buyIndices} sellTurns={sellIndices} />
            </View>
            <View style={styles.analysisList}>
              <TradeHistoryList
                trades={rd.trades}
                turnEvals={rd.score.turnEvals}
                scenario={rd.scenario}
                aiResults={rdPatternAIResults}
                initTotal={INITIAL_CASH}
                userRate={totalReturnPct}
              />
            </View>
          </>
        )}
      </View>

      {/* Cumulative score */}
      <View style={styles.cumulative}>
        <Text style={styles.cumulativeLabel}>누적 점수</Text>
        <Text style={styles.cumulativeValue}>
          {totalScore} <Text style={styles.cumulativeMax}>/ {totalRounds * 20}</Text>
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 170 },
  head: { alignItems: "center", marginTop: 24 },
  roundLabel: { fontSize: 14, fontWeight: "700", color: palette.gray[500] },
  headEmoji: { fontSize: 96, lineHeight: 112, color: "#ffffff" },
  headTitle: { fontSize: 30, fontWeight: "900", color: "#ffffff", textAlign: "center" },
  scoreRow: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  scoreValue: { fontSize: 36, fontWeight: "900", color: palette.yellow[400] },
  scoreMax: { fontSize: 18, color: palette.gray[600] },
  grade: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  gradeText: { fontSize: 20, fontWeight: "900" },
  streak: { fontSize: 20, fontWeight: "900", color: palette.orange[400] },

  pnlCard: { borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, borderWidth: 1 },
  pnlTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 },
  pnlLabel: { fontSize: 12, fontWeight: "700", color: palette.gray[400] },
  pnlValue: { fontSize: 30, fontWeight: "900", marginTop: 2 },
  assetLabel: { fontSize: 12, color: palette.gray[500] },
  assetValue: { fontSize: 16, fontWeight: "900", color: "#ffffff" },
  assetPct: { fontSize: 14, fontWeight: "900", marginTop: 2 },
  split: { flexDirection: "row", gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.1) },
  splitCell: { flex: 1, backgroundColor: alpha("#000000", 0.3), borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  splitTitle: { fontSize: 10, fontWeight: "700", color: palette.gray[500], marginBottom: 4 },
  splitSub: { fontSize: 10, color: palette.gray[600], marginBottom: 4 },
  splitValue: { fontSize: 16, fontWeight: "900" },

  holdings: { backgroundColor: "#111111", borderRadius: 16, borderWidth: 1, borderColor: alpha(palette.indigo[500], 0.2), overflow: "hidden" },
  holdingsHead: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: alpha("#ffffff", 0.05) },
  holdingsTitle: { fontSize: 14, fontWeight: "900", color: palette.indigo[300] },
  holdingsCount: { fontSize: 14, fontWeight: "900", color: "#ffffff", marginLeft: "auto" },
  holdingsCell: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, alignItems: "center" },
  cellDivider: { borderLeftWidth: 1, borderLeftColor: alpha("#ffffff", 0.05) },
  holdingsLabel: { fontSize: 10, color: palette.gray[500], marginBottom: 4 },
  holdingsValue: { fontSize: 12, fontWeight: "900" },
  holdingsSub: { fontSize: 9, fontWeight: "700" },

  miniCard: { flex: 1, backgroundColor: "#111111", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1 },
  miniLabel: { fontSize: 10, fontWeight: "700", marginBottom: 4 },
  miniValue: { fontSize: 14, fontWeight: "900" },
  miniSub: { fontSize: 9, color: palette.gray[600] },

  analysis: { marginTop: 12, backgroundColor: "#0f0f0f", borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  analysisHead: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  analysisLeft: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  analysisIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  analysisTitle: { fontSize: 14, fontWeight: "900", color: "#ffffff" },
  analysisPill: { backgroundColor: alpha("#ffffff", 0.05), paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  analysisPillText: { fontSize: 10, color: palette.gray[500] },
  analysisChart: { height: 224, paddingHorizontal: 8, paddingBottom: 8 },
  analysisList: { borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },

  cumulative: { marginTop: 12, backgroundColor: "#111111", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cumulativeLabel: { fontSize: 16, fontWeight: "700", color: palette.gray[400] },
  cumulativeValue: { fontSize: 24, fontWeight: "900", color: palette.yellow[400] },
  cumulativeMax: { fontSize: 14, fontWeight: "400", color: palette.gray[600] },

  exitBtn: { width: 64, height: 64, borderRadius: 16, backgroundColor: "#111111", borderWidth: 1, borderColor: alpha("#ffffff", 0.1), alignItems: "center", justifyContent: "center" },
  ctaText: { fontSize: 20, fontWeight: "900", color: "#ffffff" },
})
