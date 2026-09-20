import React, { useMemo } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { ArrowLeft, BadgeDollarSign, Bot, Lightbulb, ShoppingCart, Waves } from "lucide-react-native"
import { SeriesChart, type ChartReferenceDot } from "@/components/charts"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import type { StockDetailData, FinalGameReportTradeRecord, StockAITrade } from "@/features/practice-stock/types"

interface StockDetailPanelProps {
  stock: StockDetailData
  aiSimilarName: string
  aiSimilarEmoji: string
  aiBestName: string
  aiBestEmoji: string
  onBack: () => void
}

const upDown = (isUp: boolean, opacity = 1) => alpha(isUp ? palette.red[400] : palette.blue[400], opacity)

// ── 차트 데이터 빌드 ─────────────────────────────────────
function buildChartData(
  stock: StockDetailData,
): { turn: number; price: number; date: string; myAction?: "buy" | "sell"; aiBestAction?: "buy" | "sell" }[] {
  const myTradeMap = new Map<number, "buy" | "sell">()
  stock.myTrades.forEach(t => { if (t.turn !== undefined) myTradeMap.set(t.turn, t.action) })

  const aiBestMap = new Map<number, "buy" | "sell">()
  stock.aiBestTrades.forEach(t => {
    if (t.action !== "hold") aiBestMap.set(t.turn, t.action as "buy" | "sell")
  })

  return stock.priceHistory.map(p => ({
    turn: p.turn,
    price: p.price,
    date: p.date,
    myAction: myTradeMap.get(p.turn),
    aiBestAction: aiBestMap.get(p.turn),
  }))
}

export function StockDetailPanel({
  stock,
  aiSimilarName,
  aiSimilarEmoji,
  aiBestName,
  aiBestEmoji,
  onBack,
}: StockDetailPanelProps) {
  const chartData = useMemo(() => buildChartData(stock), [stock])
  const isMyProfit = stock.myTotalProfit >= 0
  const firstPrice = stock.priceHistory[0]?.price ?? 0
  const lastPrice = stock.priceHistory[stock.priceHistory.length - 1]?.price ?? 0
  const stockTotalChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice * 100).toFixed(1) : "0.0"
  const isStockUp = Number(stockTotalChange) >= 0

  // 내 매수 평균가 레퍼런스 라인
  const avgBuyRef = stock.avgBuyPrice > 0 ? stock.avgBuyPrice : null

  // 매수/매도 마커 (웹 TradeDot) + 최고 AI 마커 (웹 AIBestDot)
  const referenceDots = useMemo(() => {
    const dots: ChartReferenceDot[] = []
    chartData.forEach((d, index) => {
      if (d.myAction) {
        const c = d.myAction === "buy" ? "#ef4444" : "#3b82f6"
        dots.push({ index, y: d.price, r: 6, color: c, stroke: "#1f2937", label: d.myAction === "buy" ? "매수" : "매도", labelColor: c })
      }
    })
    chartData.forEach((d, index) => {
      if (d.aiBestAction) {
        dots.push({ index, y: d.price, r: 5, color: d.aiBestAction === "buy" ? "#f59e0b" : "#a78bfa", stroke: "#1f2937" })
      }
    })
    return dots
  }, [chartData])

  return (
    <View style={styles.root}>
      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
          <ArrowLeft size={16} color={palette.gray[400]} />
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={styles.rowGap2}>
            <Text style={styles.stockName} numberOfLines={1}>{stock.stockName}</Text>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{stock.category}</Text>
            </View>
          </View>
          <View style={[styles.rowGap2, { marginTop: 2 }]}>
            <Text style={styles.lastPrice}>{formatNumber(lastPrice)}원</Text>
            <Text style={[styles.totalChange, { color: upDown(isStockUp) }]}>
              {isStockUp ? "+" : ""}{stockTotalChange}% (기간 전체)
            </Text>
          </View>
        </View>
        {/* 내 수익 요약 */}
        <View style={styles.headerRight}>
          <Text style={[styles.headerRate, { color: upDown(isMyProfit) }]}>
            {isMyProfit ? "+" : ""}{stock.myTotalProfitRate.toFixed(1)}%
          </Text>
          <Text style={[styles.headerProfit, { color: upDown(isMyProfit, 0.6) }]}>
            {isMyProfit ? "+" : ""}{formatNumber(stock.myTotalProfit)}원
          </Text>
        </View>
      </View>

      {/* ── 스크롤 영역 ── */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── 가격 차트 ── */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>가격 흐름 + 거래 마커</Text>
            <View style={styles.legendRow}>
              <LegendItem color={palette.red[400]} label="내 매수" />
              <LegendItem color={palette.blue[400]} label="내 매도" />
              <LegendItem color={palette.yellow[400]} label="최고AI" />
            </View>
          </View>

          <SeriesChart
            data={chartData}
            height={176}
            xKey="turn"
            series={[{ key: "price", type: "area", color: isStockUp ? "#ef4444" : "#3b82f6", strokeWidth: 2, fillOpacity: 0.2 }]}
            margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
            showGrid
            gridColor={alpha("#374151", 0.3)}
            showXAxis
            showYAxis
            yAxisWidth={32}
            axisColor="#6b7280"
            xTickCount={6}
            xTickFormatter={(v) => `${v}턴`}
            yTickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            referenceLines={avgBuyRef ? [{ y: avgBuyRef, color: "#f59e0b", strokeWidth: 1.5, label: "평균매수" }] : []}
            referenceDots={referenceDots}
            tooltip
            tooltipLabelFormatter={(d) => `턴 ${d?.turn}`}
            tooltipFormatter={(v) => `${formatNumber(v)}원`}
          />
        </View>

        {/* ── 내 거래 vs AI 비교 카드 ── */}
        <View style={styles.compareRow}>
          <CompareCard
            title="나"
            color={palette.blue[500]}
            rate={stock.myTotalProfitRate}
            profit={stock.myTotalProfit}
            isUp={isMyProfit}
          />
          <CompareCard
            title={`${aiSimilarEmoji} ${aiSimilarName}`}
            color={palette.purple[500]}
            rate={stock.aiSimilarProfitRate}
            profit={stock.aiSimilarProfit}
            isUp={stock.aiSimilarProfitRate >= 0}
          />
          <CompareCard
            title={`${aiBestEmoji} ${aiBestName}`}
            color={palette.yellow[500]}
            rate={stock.aiBestProfitRate}
            profit={stock.aiBestProfit}
            isUp={stock.aiBestProfitRate >= 0}
          />
        </View>

        {/* ── 내 거래 내역 ── */}
        <View style={styles.tradesCard}>
          <View style={styles.tradesHeader}>
            <Text style={styles.cardTitle}>내 거래 내역</Text>
          </View>
          {stock.myTrades.length === 0 ? (
            <Text style={styles.emptyTrades}>거래 내역 없음</Text>
          ) : (
            <View>
              {stock.myTrades.map((t, i) => (
                <View key={t.id || i} style={i > 0 && styles.tradeDivider}>
                  <MyTradeRow trade={t} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── AI 거래 비교 ── */}
        <View style={{ gap: 8 }}>
          {/* 유사 AI */}
          <AITradeSection
            name={aiSimilarName}
            emoji={aiSimilarEmoji}
            trades={stock.aiSimilarTrades}
            profit={stock.aiSimilarProfit}
            profitRate={stock.aiSimilarProfitRate}
            colorClass="purple"
          />
          {/* 최고 AI */}
          <AITradeSection
            name={aiBestName}
            emoji={aiBestEmoji}
            trades={stock.aiBestTrades}
            profit={stock.aiBestProfit}
            profitRate={stock.aiBestProfitRate}
            colorClass="yellow"
          />
        </View>

        {/* ── 파도 분석 코멘트 ── */}
        {!!stock.waveComment && (
          <View style={styles.waveCard}>
            <View style={styles.tipHeader}>
              <Waves size={16} color={palette.cyan[400]} />
              <Text style={[styles.tipTitle, { color: palette.cyan[400] }]}>파도 분석</Text>
            </View>
            <Text style={styles.tipBody}>{stock.waveComment}</Text>
          </View>
        )}

        {/* ── 개선 포인트 ── */}
        <ImprovementCard stock={stock} />

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  )
}

function CompareCard({ title, color, rate, profit, isUp }: { title: string; color: string; rate: number; profit: number; isUp: boolean }) {
  return (
    <View style={[styles.compareCard, { backgroundColor: alpha(color, 0.08), borderColor: alpha(color, 0.2) }]}>
      <Text style={styles.compareTitle} numberOfLines={1}>{title}</Text>
      <Text style={[styles.compareRate, { color: upDown(isUp) }]}>
        {isUp ? "+" : ""}{rate.toFixed(1)}%
      </Text>
      <Text style={[styles.compareProfit, { color: upDown(isUp, 0.6) }]}>
        {isUp ? "+" : ""}{formatNumber(profit)}원
      </Text>
    </View>
  )
}

// ── 내 거래 행 ────────────────────────────────────────────
function MyTradeRow({ trade }: { trade: FinalGameReportTradeRecord }) {
  const isBuy = trade.action === "buy"
  const profit = trade.profit ?? 0
  const profitRate = trade.profitRate ?? 0
  const c = isBuy ? palette.red : palette.blue

  return (
    <View style={styles.tradeRow}>
      <View style={[styles.tradeIcon, { backgroundColor: alpha(c[500], 0.1), borderColor: alpha(c[500], 0.2) }]}>
        {isBuy
          ? <ShoppingCart size={14} color={palette.red[400]} />
          : <BadgeDollarSign size={14} color={palette.blue[400]} />
        }
        <Text style={[styles.tradeIconText, { color: c[400] }]}>{isBuy ? "매수" : "매도"}</Text>
      </View>
      <View style={styles.tradeInfo}>
        <View style={styles.rowGap15}>
          <Text style={styles.tradeDay}>{trade.day}일차</Text>
          <Text style={styles.tradeDate}>{trade.date}</Text>
        </View>
        <Text style={[styles.tradeDate, { marginTop: 2 }]}>
          {trade.quantity}주 × {formatNumber(trade.price)}원 = {formatNumber(trade.totalAmount)}원
        </Text>
        {!isBuy && !!trade.avgBuyPrice && (
          <Text style={styles.tradeAvg}>평균매수가 {formatNumber(trade.avgBuyPrice)}원</Text>
        )}
      </View>
      {!isBuy && (
        <View style={styles.tradeRight}>
          <Text style={[styles.tradeProfit, { color: upDown(profit >= 0) }]}>
            {profit >= 0 ? "+" : ""}{formatNumber(profit)}원
          </Text>
          <Text style={[styles.tradeProfitRate, { color: upDown(profitRate >= 0, 0.7) }]}>
            {profitRate >= 0 ? "+" : ""}{profitRate.toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  )
}

// ── AI 거래 섹션 ──────────────────────────────────────────
function AITradeSection({
  name, emoji, trades, profit, profitRate, colorClass,
}: {
  name: string; emoji: string; trades: StockAITrade[]
  profit: number; profitRate: number; colorClass: "purple" | "yellow"
}) {
  const isProfit = profitRate >= 0
  const colors = {
    purple: { bg: alpha(palette.purple[500], 0.08), border: alpha(palette.purple[500], 0.2), text: palette.purple[400] },
    yellow: { bg: alpha(palette.yellow[500], 0.08), border: alpha(palette.yellow[500], 0.2), text: palette.yellow[400] },
  }[colorClass]

  return (
    <View style={[styles.aiSection, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.aiSectionHeader}>
        <View style={[styles.rowGap2, { flex: 1 }]}>
          <Bot size={14} color={colors.text} />
          <Text style={styles.cardTitle} numberOfLines={1}>{emoji} {name}</Text>
        </View>
        <Text style={[styles.aiRate, { color: upDown(isProfit) }]}>
          {isProfit ? "+" : ""}{profitRate.toFixed(1)}%
          <Text style={[styles.aiProfit, { color: upDown(isProfit, 0.6) }]}>
            {"  "}({isProfit ? "+" : ""}{formatNumber(profit)}원)
          </Text>
        </Text>
      </View>
      <View>
        {trades.length === 0 ? (
          <Text style={styles.aiEmpty}>거래 없음 (관망)</Text>
        ) : (
          trades.map((t, i) => {
            const isBuy = t.action === "buy"
            const isHold = t.action === "hold"
            return (
              <View key={i} style={[styles.aiTradeRow, i > 0 && styles.aiTradeDivider]}>
                <View
                  style={[
                    styles.actionTag,
                    { backgroundColor: isBuy ? alpha(palette.red[500], 0.15) : isHold ? alpha(palette.gray[700], 0.4) : alpha(palette.blue[500], 0.15) },
                  ]}
                >
                  <Text style={[styles.actionTagText, { color: isBuy ? palette.red[400] : isHold ? palette.gray[500] : palette.blue[400] }]}>
                    {isBuy ? "매수" : isHold ? "관망" : "매도"}
                  </Text>
                </View>
                <View style={styles.tradeInfo}>
                  {!isHold && (
                    <Text style={styles.aiTradeTitle}>
                      {t.day}일차 · {t.quantity}주 × {formatNumber(t.price)}원
                    </Text>
                  )}
                  <Text style={styles.aiTradeReason}>{t.reason}</Text>
                </View>
              </View>
            )
          })
        )}
      </View>
    </View>
  )
}

// ── 개선 포인트 카드 ──────────────────────────────────────
function ImprovementCard({ stock }: { stock: StockDetailData }) {
  const myRate = stock.myTotalProfitRate
  const bestRate = stock.aiBestProfitRate
  const similarRate = stock.aiSimilarProfitRate
  const diff = bestRate - myRate

  let tip = ""
  if (diff > 5) {
    tip = `최고 AI보다 ${diff.toFixed(1)}%p 낮습니다. 매수 타이밍을 더 일찍 잡거나, 홀딩 기간을 늘려보세요.`
  } else if (diff > 0) {
    tip = `최고 AI와 ${diff.toFixed(1)}%p 차이입니다. 파도 전환점을 조금 더 주의 깊게 살펴보세요.`
  } else if (myRate > bestRate) {
    tip = `최고 AI를 ${Math.abs(diff).toFixed(1)}%p 앞섰습니다! 이 종목 파도 읽기가 탁월합니다.`
  } else {
    tip = "이 종목에서 AI와 비슷한 성과를 냈습니다."
  }

  if (myRate < 0 && similarRate >= 0) {
    tip = `유사 AI는 관망을 선택했습니다. 하락 파도 중 매수는 리스크가 높습니다.`
  }

  return (
    <View style={styles.improveCard}>
      <View style={styles.tipHeader}>
        <Lightbulb size={16} color={palette.yellow[400]} />
        <Text style={[styles.tipTitle, { color: palette.yellow[400] }]}>개선 포인트</Text>
      </View>
      <Text style={styles.tipBody}>{tip}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  rowGap2: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowGap15: { flexDirection: "row", alignItems: "center", gap: 6 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: alpha(palette.gray[800], 0.5),
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: alpha(palette.gray[800], 0.6),
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: { flex: 1, minWidth: 0 },
  stockName: { fontSize: 14, fontWeight: "800", color: "#ffffff", flexShrink: 1 },
  categoryPill: { backgroundColor: alpha(palette.gray[800], 0.6), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  categoryText: { fontSize: 9, fontWeight: "700", color: palette.gray[500] },
  lastPrice: { fontSize: 10, color: palette.gray[500] },
  totalChange: { fontSize: 10, fontWeight: "700" },
  headerRight: { alignItems: "flex-end", flexShrink: 0 },
  headerRate: { fontSize: 14, fontWeight: "800" },
  headerProfit: { fontSize: 9, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 16 },
  chartCard: {
    backgroundColor: alpha(palette.gray[800], 0.4),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
    padding: 12,
  },
  chartHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  cardTitle: { fontSize: 11, fontWeight: "700", color: palette.gray[300], flexShrink: 1 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 9, color: palette.gray[500] },
  compareRow: { flexDirection: "row", gap: 8 },
  compareCard: { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1, alignItems: "center" },
  compareTitle: { fontSize: 9, color: palette.gray[500], marginBottom: 4, fontWeight: "700" },
  compareRate: { fontSize: 16, fontWeight: "800" },
  compareProfit: { fontSize: 9, marginTop: 2 },
  tradesCard: {
    backgroundColor: alpha(palette.gray[800], 0.5),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
    overflow: "hidden",
  },
  tradesHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: alpha(palette.gray[700], 0.3),
  },
  emptyTrades: { paddingHorizontal: 12, paddingVertical: 20, textAlign: "center", fontSize: 11, color: palette.gray[600] },
  tradeDivider: { borderTopWidth: 1, borderTopColor: alpha(palette.gray[800], 0.3) },
  tradeRow: { paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  tradeIcon: { flexShrink: 0, width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  tradeIconText: { fontSize: 8, fontWeight: "700", marginTop: 2 },
  tradeInfo: { flex: 1, minWidth: 0 },
  tradeDay: { fontSize: 11, fontWeight: "700", color: "#ffffff" },
  tradeDate: { fontSize: 9, color: palette.gray[500] },
  tradeAvg: { fontSize: 9, color: palette.gray[600], marginTop: 2 },
  tradeRight: { flexShrink: 0, alignItems: "flex-end" },
  tradeProfit: { fontSize: 12, fontWeight: "800" },
  tradeProfitRate: { fontSize: 10, fontWeight: "700" },
  aiSection: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  aiSectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: alpha(palette.gray[700], 0.2),
  },
  aiRate: { fontSize: 12, fontWeight: "800" },
  aiProfit: { fontSize: 9, fontWeight: "400" },
  aiEmpty: { paddingHorizontal: 12, paddingVertical: 12, fontSize: 10, color: palette.gray[600], textAlign: "center" },
  aiTradeRow: { paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  aiTradeDivider: { borderTopWidth: 1, borderTopColor: alpha(palette.gray[800], 0.2) },
  actionTag: { flexShrink: 0, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
  actionTagText: { fontSize: 8, fontWeight: "700" },
  aiTradeTitle: { fontSize: 10, color: palette.gray[300], fontWeight: "700" },
  aiTradeReason: { fontSize: 9, color: palette.gray[500], marginTop: 2, lineHeight: 14 },
  waveCard: {
    backgroundColor: alpha(palette.cyan[500], 0.05),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.cyan[500], 0.2),
    padding: 16,
  },
  improveCard: {
    backgroundColor: alpha(palette.yellow[500], 0.05),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.yellow[500], 0.15),
    padding: 16,
  },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  tipTitle: { fontSize: 11, fontWeight: "700" },
  tipBody: { fontSize: 11, color: palette.gray[300], lineHeight: 18 },
})
