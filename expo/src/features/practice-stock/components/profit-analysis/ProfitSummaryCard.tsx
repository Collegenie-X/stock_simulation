import { StyleSheet, Text, View } from "react-native"
import { palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import { LABELS } from "@/features/practice-stock/config"

interface ProfitSummaryCardProps {
  totalProfit: number
  totalProfitRate: number
  buyCount: number
  sellCount: number
}

export const ProfitSummaryCard = ({
  totalProfit,
  totalProfitRate,
  buyCount,
  sellCount,
}: ProfitSummaryCardProps) => {
  const isPositive = totalProfit >= 0
  const labels = LABELS.profitAnalysis

  return (
    <View style={styles.wrap}>
      <View style={{ alignItems: "center" }}>
        <Text style={styles.caption}>{labels.realizedProfit}</Text>
        <Text style={[styles.amount, { color: isPositive ? palette.red[500] : palette.blue[500] }]}>
          {isPositive ? "+" : ""}
          {formatNumber(totalProfit)}원
        </Text>
        <Text style={[styles.rate, { color: isPositive ? palette.red[400] : palette.blue[400] }]}>
          ({isPositive ? "+" : ""}
          {totalProfitRate.toFixed(1)}%)
        </Text>
      </View>

      {/* 매수/매도 카운트 */}
      <View style={styles.counts}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.countLabel}>{labels.buyCount}</Text>
          <Text style={[styles.countValue, { color: palette.red[400] }]}>{buyCount}건</Text>
        </View>
        <View style={styles.divider} />
        <View style={{ alignItems: "center" }}>
          <Text style={styles.countLabel}>{labels.sellCount}</Text>
          <Text style={[styles.countValue, { color: palette.blue[400] }]}>{sellCount}건</Text>
        </View>
        <View style={styles.divider} />
        <View style={{ alignItems: "center" }}>
          <Text style={styles.countLabel}>{labels.totalTrades}</Text>
          <Text style={[styles.countValue, { color: "#ffffff" }]}>{buyCount + sellCount}건</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: palette.gray[800] },
  caption: { fontSize: 14, color: palette.gray[400], marginBottom: 8 },
  amount: { fontSize: 36, fontWeight: "700", marginBottom: 4 },
  rate: { fontSize: 14 },
  counts: { flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 16 },
  countLabel: { fontSize: 12, color: palette.gray[500], marginBottom: 4 },
  countValue: { fontSize: 18, fontWeight: "700" },
  divider: { width: 1, backgroundColor: palette.gray[700] },
})
