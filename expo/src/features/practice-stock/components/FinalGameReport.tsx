import { useEffect, useMemo, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ChevronRight, Home } from "lucide-react-native"
import { BounceIn, Gradient, PressableScale, Pulse } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import { LABELS } from "@/features/practice-stock/config"
import { StockDetailPanel } from "./StockDetailPanel"
import type {
  FinalGameReportProps, StockDetailData, AssetHistoryPoint,
} from "@/features/practice-stock/types"
import { AssetFlowChart } from "./final-report/AssetFlowChart"
import { OverviewTab } from "./final-report/OverviewTab"
import { Reveal } from "./final-report/Reveal"
import { StockCard } from "./final-report/StockCard"
import { buildAchievements } from "./final-report/achievements"
import { rateColor } from "./final-report/colors"
import { FINAL_GRADE_CONFIG, calcFinalGrade } from "./final-report/grade"
import { CountUp } from "./report/CountUp"
import { Fold } from "./report/Fold"
import { RankRace } from "./report/RankRace"

// ── 메인 컴포넌트 ─────────────────────────────────────────
export const FinalGameReport = ({
  isVisible,
  lifeSlot,
  growSlot,
  totalDays,
  userProfitRate,
  userTotalValue,
  initialValue,
  holdings,
  tradeHistory,
  weeklyHistory,
  assetHistory,
  stockDetails,
  aiSimilarName,
  aiSimilarEmoji,
  aiSimilarProfitRate,
  aiSimilarTotalValue,
  aiBestName,
  aiBestEmoji,
  aiBestProfitRate,
  aiBestTotalValue,
  decisionTimeline = [],
  onGoHome,
  onPlayAgain,
}: FinalGameReportProps) => {
  const insets = useSafeAreaInsets()
  const [animStep, setAnimStep] = useState(0)
  const [selectedStock, setSelectedStock] = useState<StockDetailData | null>(null)

  useEffect(() => {
    if (!isVisible) { setAnimStep(0); setSelectedStock(null); return }
    const timers = [
      setTimeout(() => setAnimStep(1), 300),
      setTimeout(() => setAnimStep(2), 800),
      setTimeout(() => setAnimStep(3), 1300),
      setTimeout(() => setAnimStep(4), 1800),
      setTimeout(() => setAnimStep(5), 2300),
    ]
    return () => timers.forEach(clearTimeout)
  }, [isVisible])

  const stats = useMemo(() => {
    const profitAmount = userTotalValue - initialValue
    const gapToSimilar = Number((userProfitRate - aiSimilarProfitRate).toFixed(1))
    const gapToBest = Number((userProfitRate - aiBestProfitRate).toFixed(1))
    const buyTrades = tradeHistory.filter(t => t.action === "buy")
    const sellTrades = tradeHistory.filter(t => t.action === "sell")
    const profitTrades = sellTrades.filter(t => (t.profit ?? 0) > 0)
    const lossTrades = sellTrades.filter(t => (t.profit ?? 0) < 0)
    const winRate = sellTrades.length > 0 ? Math.round((profitTrades.length / sellTrades.length) * 100) : 0
    const totalRealizedProfit = sellTrades.reduce((sum, t) => sum + (t.profit ?? 0), 0)
    const bestTrade = sellTrades.length > 0 ? sellTrades.reduce((b, t) => (t.profit ?? 0) > (b.profit ?? 0) ? t : b, sellTrades[0]) : null
    const worstTrade = sellTrades.length > 0 ? sellTrades.reduce((w, t) => (t.profit ?? 0) < (w.profit ?? 0) ? t : w, sellTrades[0]) : null
    const holdingsCount = Object.keys(holdings).filter(k => holdings[k] > 0).length
    const grade = calcFinalGrade(userProfitRate, gapToBest, tradeHistory.length, totalDays)
    const achievements = buildAchievements(userProfitRate, tradeHistory.length, holdingsCount, gapToSimilar, gapToBest, totalDays, winRate)
    return { profitAmount, gapToSimilar, gapToBest, buyCount: buyTrades.length, sellCount: sellTrades.length, winRate, totalRealizedProfit, profitTradeCount: profitTrades.length, lossTradeCount: lossTrades.length, bestTrade, worstTrade, holdingsCount, grade, achievements }
  }, [userProfitRate, userTotalValue, initialValue, aiSimilarProfitRate, aiBestProfitRate, tradeHistory, holdings, totalDays])

  if (!isVisible) return null

  const gc = FINAL_GRADE_CONFIG[stats.grade]

  // 자산 차트 데이터 (AI 포함)
  const chartData: AssetHistoryPoint[] = assetHistory && assetHistory.length > 0
    ? assetHistory
    : weeklyHistory.map(w => ({ turn: w.turn, value: w.value }))

  const badge = (
    <Gradient dir="br" colors={gc.bg} style={[styles.badge, { borderColor: gc.border, boxShadow: `0 25px 50px ${gc.glow}` }]}>
      <Text style={styles.badgeEmoji}>{gc.emoji}</Text>
    </Gradient>
  )

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => { if (selectedStock) setSelectedStock(null) }}>
      {selectedStock ? (
        // 종목 상세 드릴다운 뷰
        <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <StockDetailPanel
            stock={selectedStock}
            aiSimilarName={aiSimilarName}
            aiSimilarEmoji={aiSimilarEmoji}
            aiBestName={aiBestName}
            aiBestEmoji={aiBestEmoji}
            onBack={() => setSelectedStock(null)}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.root}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 40 }]}
        >
          {/* ── 등급 ── */}
          <Reveal show={animStep >= 1} duration={1000} distance={32} style={styles.gradeSection}>
            <Text style={styles.gameComplete}>{LABELS.finalReport.gameComplete}</Text>
            {animStep >= 1 && <BounceIn>{stats.grade === "S+" ? <Pulse>{badge}</Pulse> : badge}</BounceIn>}
            <Text style={[styles.gradeText, { color: gc.color }]}>{stats.grade} {LABELS.finalReport.gradeLabel}</Text>
            <Text style={styles.gradeTitle}>{gc.title}</Text>
            <Text style={styles.gradeSubtitle}>{gc.subtitle}</Text>
          </Reveal>

          {/* ── 계절 결과: 집이 바뀌는 순간 ── */}
          {!!lifeSlot && (
            <Reveal show={animStep >= 2} style={{ marginBottom: 16 }}>
              {lifeSlot}
            </Reveal>
          )}

          {/* ── 최종 수익률 ── */}
          <Reveal show={animStep >= 2} style={{ marginBottom: 16 }}>
            <Gradient dir="b" colors={[alpha(palette.gray[800], 0.8), alpha(palette.gray[900], 0.8)]} style={styles.returnCard}>
              <View style={styles.returnHeader}>
                <View>
                  <Text style={styles.returnLabel}>{LABELS.finalReport.finalReturn}</Text>
                  <CountUp
                    value={userProfitRate}
                    start={animStep >= 2}
                    duration={1200}
                    format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}
                    style={[styles.returnRate, { color: rateColor(userProfitRate) }]}
                  />
                  <Text style={[styles.returnAmount, { color: alpha(rateColor(stats.profitAmount), 0.7) }]}>
                    {stats.profitAmount >= 0 ? "+" : ""}{formatNumber(stats.profitAmount)}원
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4, flexShrink: 1 }}>
                  <Text style={styles.returnMeta}>{formatNumber(initialValue)}원 → {formatNumber(userTotalValue)}원</Text>
                  <Text style={styles.returnMeta}>{totalDays}일 플레이</Text>
                </View>
              </View>

              {/* 자산 흐름 차트 (3선: 나 / 유사AI / 최고AI) */}
              {chartData.length > 2 && (
                <AssetFlowChart
                  data={chartData}
                  isProfit={userProfitRate >= 0}
                  height={128}
                  aiSimilarName={aiSimilarName}
                  aiBestName={aiBestName}
                  tooltip
                />
              )}

              {/* 순위 달리기 — 거래가 있을 때만 의미 있음 */}
              {tradeHistory.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  <RankRace
                    start={animStep >= 2}
                    racers={[
                      { emoji: "🙋", name: "나", rate: userProfitRate, mine: true },
                      { emoji: aiSimilarEmoji, name: aiSimilarName, rate: aiSimilarProfitRate },
                      { emoji: aiBestEmoji, name: aiBestName, rate: aiBestProfitRate },
                    ]}
                  />
                </View>
              ) : (
                <View style={styles.noTrade}>
                  <Text style={styles.noTradeText}>거래 기록이 없어 AI 비교를 생략했어요</Text>
                </View>
              )}
            </Gradient>
          </Reveal>

          {/* ── 삶 키우기: 번 돈으로 이사하고 꾸민다 ── */}
          {!!growSlot && (
            <Reveal show={animStep >= 3} style={{ marginBottom: 16 }}>
              {growSlot}
            </Reveal>
          )}

          {/* ── 상세: 전부 접어 둔다 ── */}
          <Reveal show={animStep >= 3} style={{ gap: 8, marginBottom: 24 }}>
            <Fold
              emoji="📊"
              title={LABELS.finalReport.foldOverview}
              badge={`${tradeHistory.length}번${stats.sellCount > 0 ? ` · ${LABELS.finalReport.winRate} ${stats.winRate}%` : ""}`}
            >
              <OverviewTab
                stats={stats}
                totalDays={totalDays}
                tradeCount={tradeHistory.length}
                decisionTimeline={decisionTimeline}
                userProfitRate={userProfitRate}
                userTotalValue={userTotalValue}
                initialValue={initialValue}
                aiSimilarName={aiSimilarName}
                aiSimilarEmoji={aiSimilarEmoji}
                aiSimilarProfitRate={aiSimilarProfitRate}
                aiSimilarTotalValue={aiSimilarTotalValue}
                aiBestName={aiBestName}
                aiBestEmoji={aiBestEmoji}
                aiBestProfitRate={aiBestProfitRate}
                aiBestTotalValue={aiBestTotalValue}
              />
            </Fold>

            <Fold emoji="📈" title={LABELS.finalReport.foldStocks} badge={`${stockDetails?.length ?? 0}개`}>
              <View style={{ gap: 8 }}>
                {(!stockDetails || stockDetails.length === 0) ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>📊</Text>
                    <Text style={styles.emptyText}>종목 상세 데이터가 없습니다</Text>
                  </View>
                ) : (
                  stockDetails.map(stock => (
                    <StockCard
                      key={stock.stockId}
                      stock={stock}
                      aiSimilarName={aiSimilarName}
                      aiSimilarEmoji={aiSimilarEmoji}
                      aiBestName={aiBestName}
                      aiBestEmoji={aiBestEmoji}
                      onClick={() => setSelectedStock(stock)}
                    />
                  ))
                )}
              </View>
            </Fold>
          </Reveal>

          {/* ── 액션 버튼 ── */}
          <Reveal show={animStep >= 5} distance={16} style={{ gap: 8 }}>
            <PressableScale onPress={onPlayAgain} scaleTo={0.98}>
              <Gradient dir="r" colors={[palette.blue[600], palette.blue[500]]} style={styles.playAgain}>
                <Text style={styles.playAgainText}>{LABELS.finalReport.playAgain}</Text>
                <ChevronRight size={20} color="#ffffff" />
              </Gradient>
            </PressableScale>
            <PressableScale onPress={onGoHome} scaleTo={0.98} style={styles.goHome}>
              <Home size={16} color={palette.gray[300]} />
              <Text style={styles.goHomeText}>{LABELS.finalReport.goHome}</Text>
            </PressableScale>
          </Reveal>
        </ScrollView>
      )}
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0d0d0d" },
  content: { width: "100%", maxWidth: 448, alignSelf: "center", paddingHorizontal: 16 },
  gradeSection: { alignItems: "center", marginBottom: 20 },
  gameComplete: { fontSize: 10, fontWeight: "700", color: palette.gray[500], marginBottom: 12 },
  badge: { width: 96, height: 96, borderRadius: 32, borderWidth: 2, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  badgeEmoji: { fontSize: 48, color: "#ffffff" },
  gradeText: { fontSize: 36, fontWeight: "900", letterSpacing: -0.4, marginBottom: 4 },
  gradeTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff", marginBottom: 2 },
  gradeSubtitle: { fontSize: 12, color: palette.gray[400] },
  returnCard: { borderRadius: 24, borderWidth: 1, borderColor: alpha(palette.gray[700], 0.5), padding: 16, overflow: "hidden" },
  returnHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 },
  returnLabel: { fontSize: 9, fontWeight: "700", color: palette.gray[500], marginBottom: 2 },
  returnRate: { fontSize: 36, fontWeight: "900", letterSpacing: -0.4 },
  returnAmount: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  returnMeta: { fontSize: 10, color: palette.gray[500], textAlign: "right" },
  noTrade: {
    marginTop: 12,
    alignItems: "center",
    backgroundColor: alpha(palette.gray[800], 0.4),
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
  },
  noTradeText: { fontSize: 10, color: palette.gray[500] },
  emptyCard: {
    backgroundColor: alpha(palette.gray[800], 0.5),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
    paddingHorizontal: 16,
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyIcon: { fontSize: 30, marginBottom: 12, color: "#ffffff" },
  emptyText: { fontSize: 14, color: palette.gray[500] },
  playAgain: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 10px 15px rgba(59,130,246,0.2)",
  },
  playAgainText: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  goHome: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: alpha(palette.gray[800], 0.6),
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
  },
  goHomeText: { fontSize: 14, fontWeight: "700", color: palette.gray[300] },
})
