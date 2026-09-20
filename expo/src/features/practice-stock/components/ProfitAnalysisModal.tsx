import { useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ArrowLeft, Bot } from "lucide-react-native"
import { FullScreenModal } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import { LABELS } from "@/features/practice-stock/config"
import {
  PeriodNav,
  ProfitSummaryCard,
  TradePieChart,
  CompanySummaryList,
  useTradeAnalysis,
} from "./profit-analysis"
import { TradeDetailCard } from "./profit-analysis/TradeDetailCard"
import { AICompareTab } from "./profit-analysis/AICompareTab"
import { STYLE_LABELS } from "./profit-analysis/styleLabels"
import labelsData from "@/data/profit-analysis-labels.json"
import type { AIAction, InvestStyle } from "@/features/practice-stock/hooks/useAICompetitor"

interface ProfitAnalysisModalProps {
  scenarioId: string
  currentDay: number
  currentPrices?: Record<string, number>
  holdings?: Record<string, number>
  averagePrices?: Record<string, number>
  // AI 비교 데이터
  aiName?: string
  aiEmoji?: string
  aiStyle?: InvestStyle
  aiMotto?: string
  aiTotalValue?: number
  aiProfitRate?: number
  aiHoldings?: Record<string, number>
  aiAvgPrices?: Record<string, number>
  aiTodayActions?: AIAction[]
  aiTotalTrades?: number
  userTotalValue?: number
  userProfitRate?: number
  initialValue?: number
  // AI 전체 행동 로그
  allStockNames?: Record<string, string>
  onClose: () => void
}

type ContentTab = "거래내역" | "기업별분석" | "AI 비교"
type TradeFilter = "전체" | "매수" | "매도"

const CONTENT_TABS: ContentTab[] = ["거래내역", "기업별분석", "AI 비교"]
const TRADE_FILTERS: TradeFilter[] = ["전체", "매수", "매도"]

export const ProfitAnalysisModal = ({
  scenarioId,
  currentDay,
  currentPrices = {},
  holdings = {},
  averagePrices = {},
  aiName = "AI",
  aiStyle = "balanced",
  aiMotto = "",
  aiTotalValue = 0,
  aiProfitRate = 0,
  aiHoldings = {},
  aiAvgPrices = {},
  aiTodayActions = [],
  aiTotalTrades = 0,
  userTotalValue = 0,
  userProfitRate = 0,
  initialValue = 1000000,
  allStockNames = {},
  onClose,
}: ProfitAnalysisModalProps) => {
  const insets = useSafeAreaInsets()
  const [contentTab, setContentTab] = useState<ContentTab>("거래내역")
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>("전체")

  const {
    activePeriod,
    periodLabel,
    filteredTrades,
    groupedByDate,
    summary,
    allTrades,
    companyProfiles,
    canGoPrev,
    canGoNext,
    showEmptyAlert,
    dismissEmptyAlert,
    handleChangePeriod,
    handlePrev,
    handleNext,
  } = useTradeAnalysis({ scenarioId, currentDay, currentPrices, holdings, averagePrices })

  const displayTrades = useMemo(() => {
    if (tradeFilter === "전체") return filteredTrades
    return filteredTrades.filter((t) =>
      tradeFilter === "매수" ? t.action === "buy" : t.action === "sell",
    )
  }, [filteredTrades, tradeFilter])

  const displayGrouped = useMemo(() => {
    if (tradeFilter === "전체") return groupedByDate
    return groupedByDate
      .map(({ dateKey, dateLabel, trades }) => ({
        dateKey,
        dateLabel,
        trades: trades.filter((t) =>
          tradeFilter === "매수" ? t.action === "buy" : t.action === "sell",
        ),
      }))
      .filter((g) => g.trades.length > 0)
  }, [groupedByDate, tradeFilter])

  // AI 보유 종목 리스트 (이름 매핑)
  const aiHoldingsList = useMemo(() => {
    return Object.entries(aiHoldings)
      .filter(([, qty]) => qty > 0)
      .map(([sid, qty]) => {
        const name = allStockNames[sid] || sid
        const price = currentPrices[sid] || 0
        const avg = aiAvgPrices[sid] || price
        const profitPct = avg > 0 ? ((price - avg) / avg) * 100 : 0
        return { id: sid, name, qty, price, avg, profitPct, evalAmount: price * qty }
      })
      .sort((a, b) => b.evalAmount - a.evalAmount)
  }, [aiHoldings, allStockNames, currentPrices, aiAvgPrices])

  const styleInfo = STYLE_LABELS[aiStyle] || STYLE_LABELS.balanced

  const filterCount = (f: TradeFilter): number | null => {
    if (f === "전체") return filteredTrades.length > 0 ? filteredTrades.length : null
    if (f === "매수") return filteredTrades.filter((t) => t.action === "buy").length
    return filteredTrades.filter((t) => t.action === "sell").length
  }

  const filterColors = (f: TradeFilter, active: boolean): { bg: string; fg: string } => {
    if (!active) return { bg: alpha(palette.gray[800], 0.6), fg: palette.gray[500] }
    if (f === "매수") return { bg: alpha(palette.red[500], 0.3), fg: palette.red[400] }
    if (f === "매도") return { bg: alpha(palette.blue[500], 0.3), fg: palette.blue[400] }
    return { bg: palette.gray[600], fg: "#ffffff" }
  }

  return (
    <FullScreenModal visible onClose={onClose} style={styles.root}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* ── 헤더 ─────────────────────────────── */}
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8} style={styles.back}>
            <ArrowLeft size={24} color="#fafafa" />
          </Pressable>
          <Text style={styles.headerTitle}>{LABELS.profitAnalysis.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── 콘텐츠 탭 ─── */}
        <View style={styles.tabs}>
          {CONTENT_TABS.map((tab) => {
            const active = contentTab === tab
            const isAI = tab === "AI 비교"
            const color = active ? (isAI ? palette.purple[400] : "#ffffff") : palette.gray[500]
            return (
              <Pressable
                key={tab}
                onPress={() => setContentTab(tab)}
                style={[styles.tab, active && { borderBottomColor: color }]}
              >
                {isAI && <Bot size={14} color={color} />}
                <Text style={[styles.tabText, { color }]}>{tab}</Text>
              </Pressable>
            )
          })}
        </View>

        {/* ── 스크롤 영역 ───────────────────────── */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom }} showsVerticalScrollIndicator={false}>
          {/* ══ 탭 1: 거래내역 ══════════════════════ */}
          {contentTab === "거래내역" && (
            <>
              <PeriodNav
                activePeriod={activePeriod}
                periodIndex={0}
                periodLabel={periodLabel}
                onChangePeriod={handleChangePeriod}
                onPrev={handlePrev}
                onNext={handleNext}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
              />
              <ProfitSummaryCard
                totalProfit={summary.totalProfit}
                totalProfitRate={summary.totalProfitRate}
                buyCount={summary.buyCount}
                sellCount={summary.sellCount}
              />

              <TradePieChart trades={filteredTrades.length > 0 ? filteredTrades : allTrades} />

              <View style={styles.filters}>
                {TRADE_FILTERS.map((f) => {
                  const active = tradeFilter === f
                  const { bg, fg } = filterColors(f, active)
                  const count = filterCount(f)
                  return (
                    <Pressable key={f} onPress={() => setTradeFilter(f)} style={[styles.filter, { backgroundColor: bg }]}>
                      <Text style={[styles.filterText, { color: fg }]}>
                        {f}
                        {count !== null ? <Text style={{ color: alpha(fg, 0.7) }}> {count}</Text> : null}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>

              {displayTrades.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyIcon}>{labelsData.emptyState.icon}</Text>
                  <Text style={styles.emptyMessage}>
                    {tradeFilter === "전체"
                      ? labelsData.emptyState.message
                      : `${tradeFilter} 내역이 없습니다`}
                  </Text>
                  <Text style={styles.emptySub}>{labelsData.emptyState.subMessage}</Text>
                </View>
              ) : (
                <View style={{ paddingBottom: 24 }}>
                  {displayGrouped.map(({ dateKey, dateLabel, trades }) => {
                    const dayProfit = trades
                      .filter((t) => t.action === "sell")
                      .reduce((sum, t) => sum + (t.profit ?? 0), 0)
                    const dayBuys = trades.filter((t) => t.action === "buy")
                    const daySells = trades.filter((t) => t.action === "sell")
                    return (
                      <View key={dateKey} style={{ marginBottom: 8 }}>
                        <View style={styles.dateHeader}>
                          <Text style={styles.dateLabel}>{dateLabel}</Text>
                          <View style={styles.dateStats}>
                            {dayBuys.length > 0 && <Text style={[styles.stat, { color: palette.red[400] }]}>매수 {dayBuys.length}건</Text>}
                            {daySells.length > 0 && <Text style={[styles.stat, { color: palette.blue[400] }]}>매도 {daySells.length}건</Text>}
                            {dayProfit !== 0 && (
                              <Text style={[styles.stat, { color: dayProfit >= 0 ? palette.red[400] : palette.blue[400] }]}>
                                {dayProfit >= 0 ? "+" : ""}{formatNumber(dayProfit)}원
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                          {trades.map((trade) => (
                            <TradeDetailCard
                              key={trade.id}
                              trade={trade}
                              profile={companyProfiles[trade.stockId]}
                            />
                          ))}
                        </View>
                      </View>
                    )
                  })}
                </View>
              )}
            </>
          )}

          {/* ══ 탭 2: 기업별 분석 ════════════════════ */}
          {contentTab === "기업별분석" && (
            <CompanySummaryList
              trades={allTrades}
              profiles={companyProfiles}
              currentPrices={currentPrices}
              currentHoldings={holdings}
              avgPrices={averagePrices}
            />
          )}

          {/* ══ 탭 3: AI 비교 ════════════════════════ */}
          {contentTab === "AI 비교" && (
            <AICompareTab
              aiName={aiName}
              aiMotto={aiMotto}
              aiTotalValue={aiTotalValue}
              aiProfitRate={aiProfitRate}
              aiTodayActions={aiTodayActions}
              aiTotalTrades={aiTotalTrades}
              aiHoldingsList={aiHoldingsList}
              userTotalValue={userTotalValue}
              userProfitRate={userProfitRate}
              initialValue={initialValue}
              styleInfo={styleInfo}
            />
          )}
        </ScrollView>

        {/* ── 거래 없음 다이얼로그 ──────────────── */}
        {showEmptyAlert && (
          <View style={styles.alertBackdrop}>
            <View style={styles.alertBox}>
              <Text style={styles.alertIcon}>📭</Text>
              <Text style={styles.alertTitle}>{periodLabel}</Text>
              <Text style={styles.alertMessage}>해당 기간에 거래 내역이 없습니다.</Text>
              <Pressable
                onPress={dismissEmptyAlert}
                style={({ pressed }) => [styles.alertButton, pressed && { backgroundColor: palette.gray[600] }]}
              >
                <Text style={styles.alertButtonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </FullScreenModal>
  )
}

const styles = StyleSheet.create({
  root: { backgroundColor: "#191919" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[800],
  },
  back: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fafafa" },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: palette.gray[800] },
  tab: {
    flex: 1,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 14, fontWeight: "700" },
  filters: { flexDirection: "row", gap: 4, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  filter: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 9999 },
  filterText: { fontSize: 12, fontWeight: "700" },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 64 },
  emptyIcon: { fontSize: 36, marginBottom: 12, color: "#ffffff" },
  emptyMessage: { fontSize: 16, fontWeight: "500", color: palette.gray[400], textAlign: "center" },
  emptySub: { fontSize: 14, color: palette.gray[600], marginTop: 4, textAlign: "center" },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: alpha(palette.gray[800], 0.3),
  },
  dateLabel: { fontSize: 12, fontWeight: "600", color: palette.gray[400] },
  dateStats: { flexDirection: "row", alignItems: "center", gap: 12 },
  stat: { fontSize: 12 },
  alertBackdrop: {
    position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 32,
  },
  alertBox: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#252525",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  },
  alertIcon: { fontSize: 30, marginBottom: 12, color: "#ffffff" },
  alertTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  alertMessage: { fontSize: 14, color: palette.gray[400], marginBottom: 20, textAlign: "center" },
  alertButton: { width: "100%", paddingVertical: 12, backgroundColor: palette.gray[700], borderRadius: 12, alignItems: "center" },
  alertButtonText: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
})
