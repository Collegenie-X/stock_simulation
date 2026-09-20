import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"
import labelsData from "@/data/profit-analysis-labels.json"
import { formatNumber } from "@/lib/format"
import { LABELS } from "@/features/practice-stock/config"
import type { TradeRecord } from "@/features/practice-stock/types"
import { TradeHistoryItem } from "./TradeHistoryItem"

interface TradeHistoryListProps {
  trades: TradeRecord[]
  groupedByDate: { dateKey: string; dateLabel: string; trades: TradeRecord[] }[]
}

export const TradeHistoryList = ({ trades, groupedByDate }: TradeHistoryListProps) => {
  const labels = LABELS.profitAnalysis

  if (trades.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>{labelsData.emptyState.icon}</Text>
        <Text style={styles.emptyMessage}>{labelsData.emptyState.message}</Text>
        <Text style={styles.emptySub}>{labelsData.emptyState.subMessage}</Text>
      </View>
    )
  }

  return (
    <View>
      <Text style={styles.title}>{labels.tradeHistoryTitle}</Text>
      {groupedByDate.map(({ dateKey, dateLabel, trades: dateTrades }) => {
        const dayBuys = dateTrades.filter((t) => t.action === "buy")
        const daySells = dateTrades.filter((t) => t.action === "sell")
        const dayProfit = daySells.reduce((sum, t) => sum + (t.profit || 0), 0)

        return (
          <View key={dateKey} style={{ marginBottom: 8 }}>
            {/* 날짜 헤더 */}
            <View style={styles.dateHeader}>
              <Text style={styles.dateLabel}>{dateLabel}</Text>
              <View style={styles.dateStats}>
                {dayBuys.length > 0 && (
                  <Text style={[styles.stat, { color: palette.red[400] }]}>매수 {dayBuys.length}건</Text>
                )}
                {daySells.length > 0 && (
                  <Text style={[styles.stat, { color: palette.blue[400] }]}>매도 {daySells.length}건</Text>
                )}
                {dayProfit !== 0 && (
                  <Text style={[styles.stat, { color: dayProfit >= 0 ? palette.red[400] : palette.blue[400] }]}>
                    {dayProfit >= 0 ? "+" : ""}
                    {formatNumber(dayProfit)}원
                  </Text>
                )}
              </View>
            </View>

            {/* 거래 아이템 목록 */}
            <View style={{ paddingHorizontal: 20 }}>
              {dateTrades.map((trade, i) => (
                <TradeHistoryItem key={trade.id} trade={trade} isLast={i === dateTrades.length - 1} />
              ))}
            </View>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 64 },
  emptyIcon: { fontSize: 36, marginBottom: 12, color: "#ffffff" },
  emptyMessage: { fontSize: 16, fontWeight: "500", color: palette.gray[400], textAlign: "center" },
  emptySub: { fontSize: 14, color: palette.gray[600], marginTop: 4, textAlign: "center" },
  title: { fontSize: 14, fontWeight: "700", color: palette.gray[300], paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
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
})
