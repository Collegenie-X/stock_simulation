import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { DonutChart } from "@/components/charts"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import labelsData from "@/data/profit-analysis-labels.json"
import { LABELS } from "@/features/practice-stock/config"
import type { TradeRecord } from "@/features/practice-stock/types"

interface TradePieChartProps {
  trades: TradeRecord[]
}

interface ProfitEntry {
  nameKey: string
  name: string
  profit: number
  absProfit: number
  sellCount: number
}

const CHART_SIZE = 130
const OUTER_RADIUS = 58
const INNER_RADIUS = 30

function formatProfit(profit: number): string {
  const abs = Math.abs(profit)
  let str: string
  if (abs >= 100_000_000) str = `${(abs / 100_000_000).toFixed(1)}억원`
  else if (abs >= 10_000) str = `${Math.round(abs / 10_000)}만원`
  else str = `${formatNumber(abs)}원`
  return profit >= 0 ? `+${str}` : `-${str}`
}

/** stockName 기준 매도 수익만 집계 */
function aggregateProfit(trades: TradeRecord[]): ProfitEntry[] {
  const byName: Record<string, { name: string; profit: number; sellCount: number }> = {}
  trades
    .filter((t) => t.action === "sell")
    .forEach((t) => {
      const key = t.stockName.trim()
      if (!byName[key]) byName[key] = { name: t.stockName, profit: 0, sellCount: 0 }
      byName[key].profit += t.profit ?? 0
      byName[key].sellCount += 1
    })
  return Object.entries(byName)
    .sort(([, a], [, b]) => b.profit - a.profit)
    .map(([nameKey, item]) => ({
      nameKey,
      name: item.name,
      profit: item.profit,
      absProfit: Math.abs(item.profit),
      sellCount: item.sellCount,
    }))
}

export const TradePieChart = ({ trades }: TradePieChartProps) => {
  const { colors } = labelsData.pieChart
  const labels = LABELS.profitAnalysis
  // 웹 recharts <Tooltip> 대체: 조각을 누르면 해당 종목 정보 표시
  const [activeKey, setActiveKey] = useState<string | null>(null)

  if (trades.length === 0) return null

  const allEntries = aggregateProfit(trades)
  const totalProfit = allEntries.reduce((s, e) => s + e.profit, 0)
  const totalSellCount = allEntries.reduce((s, e) => s + e.sellCount, 0)
  const totalAbsProfit = allEntries.reduce((s, e) => s + e.absProfit, 0)

  if (totalSellCount === 0 || totalProfit === 0) return null

  const colorOf = (entry: ProfitEntry, i: number) =>
    entry.profit >= 0 ? colors[i % colors.length] : alpha("#3b82f6", 0.5)

  // 조각 내부 퍼센트 라벨 (웹 renderLabel 대체) — DonutChart 와 같은 각도 규칙(12시 방향 시작, 시계 방향)
  const c = CHART_SIZE / 2
  const labelRadius = INNER_RADIUS + (OUTER_RADIUS - INNER_RADIUS) * 0.5
  let angle = 0
  const sliceLabels = allEntries
    .filter((e) => e.absProfit > 0)
    .map((e) => {
      const percent = totalAbsProfit > 0 ? e.absProfit / totalAbsProfit : 0
      const mid = angle + (percent * 360) / 2
      angle += percent * 360
      const rad = ((mid - 90) * Math.PI) / 180
      return { key: e.nameKey, percent, x: c + labelRadius * Math.cos(rad), y: c + labelRadius * Math.sin(rad) }
    })
    .filter((l) => l.percent >= 0.05)

  const active = activeKey ? allEntries.find((e) => e.nameKey === activeKey) : undefined

  return (
    <View style={styles.wrap}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>{labels.tradeRatioTitle}</Text>
        <Text style={[styles.total, { color: totalProfit >= 0 ? palette.red[400] : palette.blue[400] }]}>
          {formatProfit(totalProfit)}
        </Text>
      </View>
      <Text style={styles.caption}>매도 {totalSellCount}건 · {allEntries.length}개 종목</Text>

      <View style={styles.body}>
        {/* 도넛 차트 — absProfit(절댓값) 기준 비율 */}
        <View style={{ width: CHART_SIZE, height: CHART_SIZE, alignItems: "center", justifyContent: "center" }}>
          <DonutChart
            size={OUTER_RADIUS * 2}
            innerRadius={INNER_RADIUS}
            padAngle={1}
            data={allEntries.map((e, i) => ({ value: e.absProfit, color: colorOf(e, i), key: e.nameKey }))}
            onSlicePress={(slice) => setActiveKey((prev) => (prev === slice.key ? null : slice.key ?? null))}
          />
          {sliceLabels.map((l) => (
            <View key={l.key} pointerEvents="none" style={[styles.sliceLabelWrap, { left: l.x - 16, top: l.y - 7 }]}>
              <Text style={styles.sliceLabel}>{`${(l.percent * 100).toFixed(0)}%`}</Text>
            </View>
          ))}
        </View>

        {/* 범례: 종목명 + 비율 + 수익금 */}
        <View style={styles.legend}>
          {allEntries.slice(0, 7).map((item, i) => {
            const pct = totalAbsProfit > 0 ? (item.absProfit / totalAbsProfit) * 100 : 0
            const isProfit = item.profit >= 0
            return (
              <Pressable
                key={item.nameKey}
                style={styles.legendRow}
                onPress={() => setActiveKey((prev) => (prev === item.nameKey ? null : item.nameKey))}
              >
                <View style={[styles.legendDot, { backgroundColor: colorOf(item, i) }]} />
                <Text style={styles.legendName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.legendPct}>{pct.toFixed(0)}%</Text>
                <Text style={[styles.legendProfit, { color: isProfit ? palette.red[400] : palette.blue[400] }]}>
                  {formatProfit(item.profit)}
                </Text>
              </Pressable>
            )
          })}
          {allEntries.length > 7 && (
            <Text style={styles.more}>+{allEntries.length - 7}개 더</Text>
          )}
        </View>
      </View>

      {/* 툴팁 */}
      {active && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipName}>{active.name}</Text>
          <Text style={[styles.tooltipProfit, { color: active.profit >= 0 ? palette.red[400] : palette.blue[400] }]}>
            실현수익 {formatProfit(active.profit)}
          </Text>
          <Text style={styles.tooltipSub}>매도 {active.sellCount}건</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: palette.gray[800] },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  title: { fontSize: 14, fontWeight: "700", color: palette.gray[300] },
  total: { fontSize: 14, fontWeight: "700" },
  caption: { fontSize: 12, color: palette.gray[600], marginBottom: 12 },
  body: { flexDirection: "row", alignItems: "center", gap: 12 },
  sliceLabelWrap: { position: "absolute", width: 32, alignItems: "center" },
  sliceLabel: { fontSize: 11, fontWeight: "700", color: "#ffffff" },
  legend: { flex: 1, gap: 8, overflow: "hidden" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendName: { flex: 1, minWidth: 0, fontSize: 12, color: palette.gray[400] },
  legendPct: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  legendProfit: { fontSize: 12, fontWeight: "600" },
  more: { fontSize: 12, color: palette.gray[600] },
  tooltip: {
    alignSelf: "flex-start",
    marginTop: 12,
    backgroundColor: palette.gray[800],
    borderWidth: 1,
    borderColor: palette.gray[700],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tooltipName: { fontSize: 12, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  tooltipProfit: { fontSize: 12, fontWeight: "600" },
  tooltipSub: { fontSize: 12, color: palette.gray[500], marginTop: 2 },
})
