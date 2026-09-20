import { StyleSheet, Text, View } from "react-native"
import { BadgeDollarSign, ShoppingCart } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import type { TradeRecord } from "@/features/practice-stock/types"

// ── 거래 내역 행 ──────────────────────────────────────────
export function TradeRow({ trade, isFirst = false }: { trade: TradeRecord; isFirst?: boolean }) {
  const isBuy = trade.action === "buy"
  const profit = trade.profit ?? 0
  const profitRate = trade.profitRate ?? 0
  const base = isBuy ? palette.red[500] : palette.blue[500]
  const actionColor = isBuy ? palette.red[400] : palette.blue[400]
  const profitColor = profit >= 0 ? palette.red[400] : palette.blue[400]
  const profitRateColor = profitRate >= 0 ? palette.red[400] : palette.blue[400]

  return (
    <View style={[styles.row, !isFirst && styles.divider]}>
      <View style={[styles.icon, { backgroundColor: alpha(base, 0.1), borderColor: alpha(base, 0.2) }]}>
        {isBuy
          ? <ShoppingCart size={14} color={actionColor} />
          : <BadgeDollarSign size={14} color={actionColor} />}
        <Text style={[styles.iconText, { color: actionColor }]}>{isBuy ? "매수" : "매도"}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{trade.stockName}</Text>
          {!!trade.day && <Text style={styles.day}>{trade.day}일차</Text>}
        </View>
        <Text style={styles.sub} numberOfLines={1}>
          {trade.quantity}주 × {formatNumber(trade.price)}원 = {formatNumber(trade.totalAmount)}원
        </Text>
      </View>
      {!isBuy && (
        <View style={{ alignItems: "flex-end", flexShrink: 0 }}>
          <Text style={[styles.profit, { color: profitColor }]}>
            {profit >= 0 ? "+" : ""}{formatNumber(profit)}원
          </Text>
          <Text style={[styles.profitRate, { color: alpha(profitRateColor, 0.7) }]}>
            {profitRate >= 0 ? "+" : ""}{profitRate.toFixed(1)}%
          </Text>
        </View>
      )}
      {isBuy && (
        <View style={{ alignItems: "flex-end", flexShrink: 0 }}>
          <Text style={styles.buyAmount}>{formatNumber(trade.totalAmount)}원</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  divider: { borderTopWidth: 1, borderTopColor: alpha(palette.gray[800], 0.3) },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  iconText: { fontSize: 8, fontWeight: "700", marginTop: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 11, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  day: { fontSize: 8, color: palette.gray[600] },
  sub: { fontSize: 9, color: palette.gray[500], marginTop: 2 },
  profit: { fontSize: 11, fontWeight: "800" },
  profitRate: { fontSize: 9, fontWeight: "700" },
  buyAmount: { fontSize: 11, fontWeight: "700", color: palette.gray[300] },
})
