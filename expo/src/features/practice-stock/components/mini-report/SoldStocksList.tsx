import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import type { MiniReportHoldingItem, TradeRecord } from "@/features/practice-stock/types"

/** 매도 완료 종목 (보유 없음) */
export function SoldStocksList({ tradeHistory, holdingItems }: { tradeHistory: TradeRecord[]; holdingItems: MiniReportHoldingItem[] }) {
  const tradedIds = new Set(tradeHistory.map((t) => t.stockId).filter(Boolean))
  const holdingIds = new Set(holdingItems.map((h) => h.stockId))
  const soldIds = [...tradedIds].filter((id) => !holdingIds.has(id!))
  const soldTrades = soldIds.map((id) => {
    const trades = tradeHistory.filter((t) => t.stockId === id)
    const name = trades[0]?.stockName ?? id ?? ""
    const profit = trades.filter((t) => t.action === "sell").reduce((s, t) => s + (t.profit ?? 0), 0)
    const profitRate = trades.filter((t) => t.action === "sell").reduce((s, t) => s + (t.profitRate ?? 0), 0)
    return { id, name, profit, profitRate, trades }
  })
  if (soldTrades.length === 0) return null

  return (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.title}>매도 완료 종목</Text>
      {soldTrades.map((s) => (
        <View key={s.id} style={styles.row}>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{s.name}</Text>
            <Text style={styles.sub}>{s.trades.length}건 거래 완료</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.profit, { color: s.profit >= 0 ? palette.red[400] : palette.blue[400] }]}>
              {s.profit >= 0 ? "+" : ""}{formatNumber(s.profit)}원
            </Text>
            <Text style={[styles.rate, { color: alpha(s.profitRate >= 0 ? palette.red[400] : palette.blue[400], 0.6) }]}>
              {s.profitRate >= 0 ? "+" : ""}{s.profitRate.toFixed(1)}%
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 10, fontWeight: "700", color: palette.gray[600], paddingHorizontal: 4, marginBottom: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: alpha(palette.gray[800], 0.3),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.2),
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  name: { fontSize: 11, fontWeight: "700", color: palette.gray[400] },
  sub: { fontSize: 9, color: palette.gray[600], marginTop: 2 },
  profit: { fontSize: 12, fontWeight: "800" },
  rate: { fontSize: 9 },
})
