import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import labelsData from "@/data/profit-analysis-labels.json"
import type { TradeRecord } from "@/features/practice-stock/types"

interface TradeHistoryItemProps {
  trade: TradeRecord
  /** 목록의 마지막 항목이면 하단 구분선 제거 (웹의 last:border-0) */
  isLast?: boolean
}

export const TradeHistoryItem = ({ trade, isLast = false }: TradeHistoryItemProps) => {
  const isBuy = trade.action === "buy"
  const actionLabel = isBuy
    ? labelsData.actionLabels.buy
    : labelsData.actionLabels.sell
  const actionColor = isBuy ? palette.red[400] : palette.blue[400]

  return (
    <View style={[styles.row, isLast && { borderBottomWidth: 0 }]}>
      <View style={styles.left}>
        {/* 액션 배지 */}
        <View style={[styles.badge, { backgroundColor: alpha(isBuy ? palette.red[500] : palette.blue[500], 0.2) }]}>
          <Text style={[styles.badgeText, { color: actionColor }]}>{actionLabel}</Text>
        </View>

        {/* 종목 정보 */}
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{trade.stockName}</Text>
          <Text style={styles.sub}>
            {trade.quantity}주 × {formatNumber(trade.price)}원
          </Text>
        </View>
      </View>

      {/* 금액 정보 */}
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.amount, { color: actionColor }]}>
          {isBuy ? "-" : "+"}{formatNumber(trade.totalAmount)}원
        </Text>
        {!isBuy && trade.profit !== undefined && (
          <Text style={[styles.profit, { color: trade.profit >= 0 ? palette.red[400] : palette.blue[400] }]}>
            {trade.profit >= 0 ? "+" : ""}
            {formatNumber(trade.profit)}원
            {trade.profitRate !== undefined
              ? ` (${trade.profitRate >= 0 ? "+" : ""}${trade.profitRate.toFixed(1)}%)`
              : ""}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: alpha(palette.gray[800], 0.5),
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 1 },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 12, fontWeight: "700" },
  name: { fontSize: 14, fontWeight: "600", color: "#ffffff" },
  sub: { fontSize: 12, color: palette.gray[500] },
  amount: { fontSize: 14, fontWeight: "700" },
  profit: { fontSize: 12 },
})
