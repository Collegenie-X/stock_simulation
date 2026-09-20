import { StyleSheet, Text, View } from "react-native"
import { Package } from "lucide-react-native"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

interface HoldingsCardProps {
  holdings: number
  avgPrice: number
  price: number
  holdPnL: number
  holdPnLRate: number
  total: number
  totalInitial: number
  rate: number
  cash: number
}

export function HoldingsCard({ holdings, avgPrice, price, holdPnL, holdPnLRate, total, totalInitial, rate, cash }: HoldingsCardProps) {
  const pnlColor = holdPnL >= 0 ? palette.red[400] : palette.blue[400]
  const rateColor = rate >= 0 ? palette.red[400] : palette.blue[400]
  const holdingsText = formatNumber(holdings)
  const stockPct = total > 0 ? Math.round(((holdings * price) / total) * 100) : 0

  return (
    <View style={styles.card}>
      {/* Row 1: 보유 주식 수 + 주식 평가금액 + 손익 */}
      <View style={styles.row}>
        <Package size={20} color={palette.indigo[400]} />
        <View style={{ flex: 1, flexDirection: "row", alignItems: "baseline", gap: 4 }}>
          <Text style={[styles.holdings, holdingsText.length > 5 && { fontSize: 26, lineHeight: 32 }]}>{holdingsText}</Text>
          <Text style={{ fontSize: 20, color: palette.indigo[300], fontWeight: "700" }}>주</Text>
          {avgPrice > 0 && <Text numberOfLines={1} style={{ fontSize: 9, color: palette.gray[600], marginLeft: 2, flexShrink: 0 }}>평균 {formatNumber(Math.round(avgPrice))}원</Text>}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          {holdings > 0 ? (
            <>
              <Text style={styles.label}>주식 평가금액</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#ffffff" }}>{formatNumber(Math.round(holdings * price))}원</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: pnlColor }}>
                {holdPnL >= 0 ? "+" : ""}
                {formatNumber(Math.round(holdPnL))}원 ({holdPnLRate >= 0 ? "+" : ""}
                {holdPnLRate.toFixed(1)}%)
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: 10, color: palette.gray[600] }}>보유 주식 없음</Text>
          )}
        </View>
      </View>

      {/* 주식 vs 현금 비중 바 — 팔 수 있는 양이 한눈에 */}
      <View style={styles.mixRow}>
        <Text style={[styles.mixLabel, { color: palette.indigo[300] }]}>📦 주식 {stockPct}%</Text>
        <View style={styles.mixTrack}>
          <View style={{ width: `${stockPct}%`, height: "100%", backgroundColor: palette.indigo[400], borderRadius: 9999 }} />
        </View>
        <Text style={[styles.mixLabel, { color: palette.gray[400] }]}>💵 현금 {100 - stockPct}%</Text>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* Row 2: 총 자산 (크고 컬러) | 세로 구분선 | 원화 */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { marginBottom: 2 }]}>총 자산</Text>
          <Text style={{ fontSize: 20, fontWeight: "900", color: rateColor }}>{formatNumber(Math.round(total))}원</Text>
          <Text style={{ fontSize: 12, fontWeight: "700", color: alpha(rateColor, 0.7) }}>
            {rate >= 0 ? "+" : ""}
            {rate.toFixed(2)}%
            <Text style={{ color: palette.gray[600] }}>
              {" "}
              ({rate >= 0 ? "+" : ""}
              {formatNumber(Math.round(total - totalInitial))}원)
            </Text>
          </Text>
        </View>
        <View style={{ width: 1, height: 40, backgroundColor: alpha("#ffffff", 0.1) }} />
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.label, { marginBottom: 2 }]}>원화</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: palette.gray[200] }}>{formatNumber(Math.round(cash))}원</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 4, backgroundColor: "#151520", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  holdings: { fontSize: 40, fontWeight: "900", color: "#ffffff", lineHeight: 44, flexShrink: 1 },
  mixRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  mixTrack: { flex: 1, height: 6, borderRadius: 9999, backgroundColor: alpha("#ffffff", 0.08), overflow: "hidden" },
  mixLabel: { fontSize: 9, fontWeight: "700", fontVariant: ["tabular-nums"] },
  label: { fontSize: 9, color: palette.gray[500] },
  divider: { marginVertical: 10, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.1) },
})
