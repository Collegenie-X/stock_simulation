import { useEffect, useMemo, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Award, ChevronRight } from "lucide-react-native"
import { Gradient, PressableScale, Pulse } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import { LABELS } from "@/features/practice-stock/config"
import { StockDetailPanel } from "./StockDetailPanel"
import type { MiniGameReportProps, StockDetailData } from "@/features/practice-stock/types"
import { AssetFlowChart } from "./final-report/AssetFlowChart"
import { RateCompareRow } from "./final-report/RateCompareRow"
import { ReportTabs } from "./final-report/ReportTabs"
import { Reveal } from "./final-report/Reveal"
import { MiniStockCard } from "./mini-report/MiniStockCard"
import { OverviewTab } from "./mini-report/OverviewTab"
import { SoldStocksList } from "./mini-report/SoldStocksList"
import { GRADE_CONFIG, calcGrade, pickAchievements } from "./mini-report/grade"
import { holdingToStockDetail } from "./mini-report/holdingToStockDetail"

type ReportTab = "overview" | "stocks"

// ── 메인 컴포넌트 ─────────────────────────────────────────
export const MiniGameReport = ({
  isVisible,
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
  const [animStep, setAnimStep] = useState(0)
  const [activeTab, setActiveTab] = useState<ReportTab>("overview")
  const [selectedStock, setSelectedStock] = useState<StockDetailData | null>(null)

  useEffect(() => {
    if (!isVisible) { setAnimStep(0); setActiveTab("overview"); setSelectedStock(null); return }
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

  const profitAmount = userTotalValue - initialValue
  const gapToSimilar = Number((userProfitRate - aiSimilarProfitRate).toFixed(1))
  const gapToBest = Number((userProfitRate - aiBestProfitRate).toFixed(1))
  const grade = calcGrade(userProfitRate, gapToBest)
  const gc = GRADE_CONFIG[grade]
  const achievements = pickAchievements(userProfitRate, tradeCount, holdingsCount, gapToSimilar)
  const rateColor = userProfitRate >= 0 ? palette.red[400] : palette.blue[400]
  const amountColor = profitAmount >= 0 ? palette.red[400] : palette.blue[400]

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
            {grade === "S" ? <Pulse>{badge}</Pulse> : badge}
            <Text style={[styles.gradeText, { color: gc.color }]}>{grade} 등급</Text>
            <Text style={styles.gradeLabel}>{gc.label}</Text>
            <View style={styles.periodChip}>
              <Award size={12} color={palette.yellow[400]} />
              <Text style={styles.periodText}>
                {LABELS.miniReport.periodTitle.replace("{day}", String(reportDay))}
              </Text>
            </View>
          </Reveal>

          {/* ── 수익률 + 자산 흐름 차트 ── */}
          <Reveal show={animStep >= 2} style={{ marginBottom: 16 }}>
            <Gradient dir="b" colors={[alpha(palette.gray[800], 0.8), alpha(palette.gray[900], 0.8)]} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View>
                  <Text style={styles.resultLabel}>{LABELS.miniReport.myResult}</Text>
                  <Text style={[styles.resultRate, { color: rateColor }]}>
                    {userProfitRate >= 0 ? "+" : ""}{userProfitRate}%
                  </Text>
                  <Text style={[styles.resultAmount, { color: alpha(amountColor, 0.7) }]}>
                    {profitAmount >= 0 ? "+" : ""}{formatNumber(profitAmount)}원
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", flexShrink: 1 }}>
                  <Text style={styles.resultMeta}>{formatNumber(initialValue)}원 → {formatNumber(userTotalValue)}원</Text>
                  <Text style={[styles.resultMeta, { marginTop: 2 }]}>{reportDay}일차 기준</Text>
                </View>
              </View>

              {/* 자산 흐름 미니 차트 */}
              {assetHistory.length > 2 && (
                <View style={{ marginBottom: 12 }}>
                  <AssetFlowChart data={assetHistory} isProfit={userProfitRate >= 0} height={80} strokeWidth={2} fillOpacity={0.3} />
                </View>
              )}

              {/* 3자 수익률 비교 */}
              <RateCompareRow
                valueSize={12}
                gap={6}
                userProfitRate={userProfitRate}
                aiSimilarName={aiSimilarName}
                aiSimilarEmoji={aiSimilarEmoji}
                aiSimilarProfitRate={aiSimilarProfitRate}
                aiBestName={aiBestName}
                aiBestEmoji={aiBestEmoji}
                aiBestProfitRate={aiBestProfitRate}
              />
            </Gradient>
          </Reveal>

          {/* ── 탭 ── */}
          <Reveal show={animStep >= 3} distance={0} style={{ marginBottom: 16 }}>
            <ReportTabs<ReportTab>
              tabs={[
                { key: "overview", label: LABELS.miniReport.tabSummary },
                { key: "stocks", label: "주식 상세" },
              ]}
              active={activeTab}
              onChange={setActiveTab}
            />
          </Reveal>

          {/* ── 탭 콘텐츠 ── */}
          <Reveal show={animStep >= 3} style={{ marginBottom: 24 }}>
            {/* 종합 탭 */}
            {activeTab === "overview" && (
              <OverviewTab
                stats={stats}
                tradeHistory={tradeHistory}
                achievements={achievements}
                cash={cash}
                userTotalValue={userTotalValue}
                holdingsCount={holdingsCount}
              />
            )}

            {/* 주식 상세 탭 */}
            {activeTab === "stocks" && (
              <View style={{ gap: 8 }}>
                {stockDetails.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.emptyText}>보유 종목이 없습니다</Text>
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
            )}
          </Reveal>

          {/* ── 다음 날 버튼 ── */}
          <Reveal show={animStep >= 4} distance={16}>
            <PressableScale onPress={onContinue} scaleTo={0.98}>
              <Gradient dir="r" colors={[palette.blue[600], palette.blue[500]]} style={styles.continueButton}>
                <Text style={styles.continueText}>{LABELS.miniReport.continueButton}</Text>
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
    marginTop: 8,
  },
  periodText: { fontSize: 10, fontWeight: "700", color: palette.gray[300] },
  resultCard: { borderRadius: 24, borderWidth: 1, borderColor: alpha(palette.gray[700], 0.5), padding: 16, overflow: "hidden" },
  resultHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 },
  resultLabel: { fontSize: 9, fontWeight: "700", color: palette.gray[500], marginBottom: 2 },
  resultRate: { fontSize: 30, fontWeight: "900", letterSpacing: -0.4 },
  resultAmount: { fontSize: 14, fontWeight: "700", marginTop: 2 },
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
