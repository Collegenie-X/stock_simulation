import { useEffect, useMemo, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ChevronRight } from "lucide-react-native"
import { LiveMiniChart, type MiniPoint } from "@/components/charts"
import { BounceIn, Gradient, Pop, PressableScale, Pulse } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import { LABELS } from "@/features/practice-stock/config"
import { StockDetailPanel } from "./StockDetailPanel"
import type { MiniGameReportProps, StockDetailData } from "@/features/practice-stock/types"
import { Reveal } from "./final-report/Reveal"
import { MiniStockCard } from "./mini-report/MiniStockCard"
import { MoneySummary, TradeSummary } from "./mini-report/OverviewTab"
import { SoldStocksList } from "./mini-report/SoldStocksList"
import { GRADE_CONFIG, NO_TRADE_GRADE, calcGrade, pickAchievements } from "./mini-report/grade"
import { holdingToStockDetail } from "./mini-report/holdingToStockDetail"
import { CountUp } from "./report/CountUp"
import { Fold } from "./report/Fold"
import { RankRace } from "./report/RankRace"

const CONTENT_MAX = 448

/** 자산 기록 → 스스로 그려지는 미니 차트 좌표 */
function toMiniPoints(history: { value: number }[]): MiniPoint[] {
  if (history.length < 2) return []
  const values = history.map((h) => h.value)
  const min = Math.min(...values)
  const span = Math.max(Math.max(...values) - min, 1)
  return values.map((v, i) => ({ x: i / (values.length - 1), y: 0.1 + ((v - min) / span) * 0.8 }))
}

// ── 주간·월간 리포트 ─────────────────────────────────────
// 첫 화면엔 핵심(등급 · 이번 주 수익률 · 순위)만, 나머지는 전부 접어 둔다.
export const MiniGameReport = ({
  isVisible,
  kind = "week",
  periodNumber,
  periodProfitRate,
  lifeSlot,
  reportDay,
  userProfitRate,
  userTotalValue,
  initialValue,
  cash,
  tradeCount,
  holdingsCount,
  tradeHistory,
  holdingItems,
  assetHistory,
  aiSimilarProfitRate,
  aiSimilarName,
  aiSimilarEmoji,
  aiBestProfitRate,
  aiBestName,
  aiBestEmoji,
  onContinue,
}: MiniGameReportProps) => {
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()
  const [animStep, setAnimStep] = useState(0)
  const [selectedStock, setSelectedStock] = useState<StockDetailData | null>(null)

  useEffect(() => {
    if (!isVisible) { setAnimStep(0); setSelectedStock(null); return }
    const timers = [
      setTimeout(() => setAnimStep(1), 200),
      setTimeout(() => setAnimStep(2), 600),
      setTimeout(() => setAnimStep(3), 1000),
      setTimeout(() => setAnimStep(4), 1400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [isVisible])

  const stats = useMemo(() => {
    const buyTrades = tradeHistory.filter(t => t.action === "buy")
    const sellTrades = tradeHistory.filter(t => t.action === "sell")
    const profitTrades = sellTrades.filter(t => (t.profit ?? 0) > 0)
    const lossTrades = sellTrades.filter(t => (t.profit ?? 0) < 0)
    const winRate = sellTrades.length > 0 ? Math.round((profitTrades.length / sellTrades.length) * 100) : 0
    const totalRealizedProfit = sellTrades.reduce((sum, t) => sum + (t.profit ?? 0), 0)
    const totalBuyAmount = buyTrades.reduce((sum, t) => sum + t.totalAmount, 0)
    const totalSellAmount = sellTrades.reduce((sum, t) => sum + t.totalAmount, 0)
    const unrealizedProfit = holdingItems.reduce((sum, h) => sum + h.profitAmount, 0)
    const totalHoldingValue = holdingItems.reduce((sum, h) => sum + h.currentPrice * h.quantity, 0)
    return {
      buyCount: buyTrades.length, sellCount: sellTrades.length,
      winRate, totalRealizedProfit, totalBuyAmount, totalSellAmount,
      profitTradeCount: profitTrades.length, lossTradeCount: lossTrades.length,
      unrealizedProfit, totalHoldingValue,
    }
  }, [tradeHistory, holdingItems])

  // 주식 상세 데이터 (보유 종목 기반)
  const stockDetails = useMemo(() =>
    holdingItems.map(item =>
      holdingToStockDetail(item, tradeHistory, aiSimilarProfitRate, aiBestProfitRate)
    ),
    [holdingItems, tradeHistory, aiSimilarProfitRate, aiBestProfitRate],
  )

  if (!isVisible) return null

  const isMonth = kind === "month"
  const number = periodNumber ?? Math.max(1, Math.ceil(reportDay / 7))
  const periodRate = periodProfitRate ?? userProfitRate
  const profitAmount = userTotalValue - initialValue
  const gapToSimilar = Number((userProfitRate - aiSimilarProfitRate).toFixed(1))
  const gapToBest = Number((userProfitRate - aiBestProfitRate).toFixed(1))
  // 한 번도 안 샀으면 등급을 매기지 않는다 (0%로 A를 받는 일이 없게)
  const started = tradeHistory.length > 0
  const grade = calcGrade(userProfitRate, gapToBest)
  const gc = started ? GRADE_CONFIG[grade] : NO_TRADE_GRADE
  const achievements = started ? pickAchievements(userProfitRate, tradeCount, holdingsCount, gapToSimilar) : []
  const rateColor = periodRate >= 0 ? palette.red[400] : palette.blue[400]
  const signed = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`
  const chartWidth = Math.min(screenWidth, CONTENT_MAX) - 32 - 32
  const chartPoints = toMiniPoints(assetHistory)
  const cashPct = userTotalValue > 0 ? Math.round((cash / userTotalValue) * 100) : 0

  const badge = (
    <View style={[styles.badge, { backgroundColor: gc.bg, borderColor: gc.border, boxShadow: `0 20px 25px ${gc.glow}` }]}>
      <Text style={styles.badgeEmoji}>{gc.emoji}</Text>
    </View>
  )

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => { if (selectedStock) setSelectedStock(null) }}>
      {selectedStock ? (
        // 종목 드릴다운 뷰
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
          {/* ── 등급 배지 ── */}
          <Reveal show={animStep >= 1} distance={16} style={styles.gradeSection}>
            <View style={styles.periodChip}>
              <Text style={styles.periodText}>
                {isMonth ? "📅" : "🗓️"} {isMonth ? LABELS.miniReport.monthTitle(number) : LABELS.miniReport.weekTitle(number)}
              </Text>
            </View>
            {animStep >= 1 && <BounceIn>{started && grade === "S" ? <Pulse>{badge}</Pulse> : badge}</BounceIn>}
            <Text style={[styles.gradeText, { color: gc.color }]}>{started ? `${grade} 등급` : LABELS.miniReport.noTradeGrade}</Text>
            <Text style={styles.gradeLabel}>{started ? gc.label : LABELS.miniReport.noTradeHint}</Text>
          </Reveal>

          {/* ── 핵심: 이번 주 수익률 + 스스로 그려지는 자산 곡선 ── */}
          <Reveal show={animStep >= 2} style={{ marginBottom: 12 }}>
            <Gradient dir="b" colors={[alpha(palette.gray[800], 0.8), alpha(palette.gray[900], 0.8)]} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View>
                  <Text style={styles.resultLabel}>{isMonth ? LABELS.miniReport.thisMonth : LABELS.miniReport.thisWeek}</Text>
                  <CountUp value={periodRate} start={animStep >= 2} format={signed} style={[styles.resultRate, { color: rateColor }]} />
                </View>
                <View style={{ alignItems: "flex-end", flexShrink: 1 }}>
                  <Text style={styles.resultLabel}>{LABELS.miniReport.sinceStart}</Text>
                  <Text style={[styles.totalRate, { color: userProfitRate >= 0 ? palette.red[400] : palette.blue[400] }]}>{signed(userProfitRate)}</Text>
                  <Text style={styles.resultMeta}>
                    {profitAmount >= 0 ? "+" : ""}{formatNumber(profitAmount)}원
                  </Text>
                </View>
              </View>

              {chartPoints.length > 2 && animStep >= 2 && (
                <LiveMiniChart points={chartPoints} color={userProfitRate >= 0 ? "#ef4444" : "#3b82f6"} width={chartWidth} height={72} strokeWidth={2.5} />
              )}
            </Gradient>
          </Reveal>

          {/* ── 핵심: 순위 달리기 ── */}
          <Reveal show={animStep >= 3} style={{ marginBottom: 12 }}>
            <View style={styles.raceCard}>
              <Text style={styles.raceTitle}>{LABELS.miniReport.raceTitle}</Text>
              <RankRace
                start={animStep >= 3}
                racers={[
                  { emoji: "🙋", name: "나", rate: userProfitRate, mine: true },
                  { emoji: aiSimilarEmoji, name: aiSimilarName, rate: aiSimilarProfitRate },
                  { emoji: aiBestEmoji, name: aiBestName, rate: aiBestProfitRate },
                ]}
              />
            </View>

            {/* 이번에 딴 뱃지 */}
            {achievements.length > 0 && (
              <View style={styles.chips}>
                {achievements.map((a, i) => (
                  <Pop key={a.text} delay={1200 + i * 150}>
                    <View style={styles.chip}>
                      <a.Icon size={12} color={a.iconColor} />
                      <Text style={styles.chipText}>{a.text}</Text>
                    </View>
                  </Pop>
                ))}
              </View>
            )}
          </Reveal>

          {/* ── 월간: 삶 키우기 ── */}
          {!!lifeSlot && (
            <Reveal show={animStep >= 3} style={{ marginBottom: 12 }}>
              {lifeSlot}
            </Reveal>
          )}

          {/* ── 상세: 전부 접어 둔다 ── */}
          <Reveal show={animStep >= 4} style={{ gap: 8, marginBottom: 24 }}>
            <Fold
              emoji="📊"
              title={LABELS.miniReport.foldTrades}
              badge={`${tradeHistory.length}번${stats.sellCount > 0 ? ` · ${LABELS.miniReport.winRateLabel} ${stats.winRate}%` : ""}`}
            >
              <TradeSummary stats={stats} tradeHistory={tradeHistory} />
            </Fold>

            <Fold emoji="💰" title={LABELS.miniReport.foldMoney} badge={`${LABELS.miniReport.cashLabel} ${cashPct}%`}>
              <MoneySummary stats={stats} cash={cash} userTotalValue={userTotalValue} holdingsCount={holdingsCount} />
            </Fold>

            <Fold emoji="📈" title={LABELS.miniReport.foldStocks} badge={`${stockDetails.length}개`}>
              <View style={{ gap: 8 }}>
                {stockDetails.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.emptyText}>들고 있는 주식이 없어요</Text>
                  </View>
                ) : (
                  stockDetails.map(stock => (
                    <MiniStockCard
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

                {/* 매도 완료 종목 (보유 없음) */}
                <SoldStocksList tradeHistory={tradeHistory} holdingItems={holdingItems} />
              </View>
            </Fold>
          </Reveal>

          {/* ── 다음 주 버튼 ── */}
          <Reveal show={animStep >= 4} distance={16}>
            <PressableScale onPress={onContinue} scaleTo={0.98}>
              <Gradient dir="r" colors={[palette.blue[600], palette.blue[500]]} style={styles.continueButton}>
                <Text style={styles.continueText}>{LABELS.miniReport.nextWeek}</Text>
                <ChevronRight size={20} color="#ffffff" />
              </Gradient>
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
  gradeSection: { alignItems: "center", marginBottom: 16 },
  badge: { width: 80, height: 80, borderRadius: 24, borderWidth: 2, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  badgeEmoji: { fontSize: 36, color: "#ffffff" },
  gradeText: { fontSize: 24, fontWeight: "900", letterSpacing: -0.4, marginBottom: 2 },
  gradeLabel: { fontSize: 12, fontWeight: "500", color: palette.gray[400] },
  totalRate: { fontSize: 16, fontWeight: "900", fontVariant: ["tabular-nums"] },
  raceCard: {
    backgroundColor: alpha(palette.gray[800], 0.45),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
    padding: 12,
  },
  raceTitle: { fontSize: 12, fontWeight: "800", color: palette.gray[300], marginBottom: 8, marginLeft: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: alpha(palette.yellow[500], 0.1),
    borderWidth: 1,
    borderColor: alpha(palette.yellow[400], 0.25),
  },
  chipText: { fontSize: 11, fontWeight: "800", color: palette.yellow[200] },
  periodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: alpha(palette.gray[800], 0.6),
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.4),
    marginBottom: 12,
  },
  periodText: { fontSize: 12, fontWeight: "700", color: palette.gray[300] },
  resultCard: { borderRadius: 24, borderWidth: 1, borderColor: alpha(palette.gray[700], 0.5), padding: 16, overflow: "hidden" },
  resultHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 },
  resultLabel: { fontSize: 9, fontWeight: "700", color: palette.gray[500], marginBottom: 2 },
  resultRate: { fontSize: 40, fontWeight: "900", letterSpacing: -0.4 },
  resultMeta: { fontSize: 10, color: palette.gray[500], textAlign: "right" },
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
  continueButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 10px 15px rgba(59,130,246,0.2)",
  },
  continueText: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
})
