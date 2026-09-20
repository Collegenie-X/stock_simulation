import { StyleSheet, Text, View } from "react-native"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

interface Props {
  holdings: number
  price: number
  cash: number
  finalHoldingValue: number
  holdingPnL: number
  holdingPnLRate: number
}

/** 보유 현황 */
export function ResultHoldings({ holdings, price, cash, finalHoldingValue, holdingPnL, holdingPnLRate }: Props) {
  return (
    <View style={styles.wrap}>
      {holdings > 0 ? (
        <View style={[styles.card, { marginBottom: 12 }]}>
          <Text style={[styles.cardTitle, { marginBottom: 12 }]}>📦 보유 주식 현황</Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tiny}>최종 주식 수</Text>
              <Text style={{ fontSize: 18, fontWeight: "900", color: "#ffffff" }}>
                {holdings}
                <Text style={{ fontSize: 12, color: palette.gray[500] }}> 주</Text>
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tiny}>최종 주식가</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#ffffff" }}>{formatNumber(Math.round(price))}원</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tiny}>주식 수익률</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: holdingPnLRate >= 0 ? palette.red[400] : palette.blue[400] }}>
                {holdingPnLRate >= 0 ? "+" : ""}
                {holdingPnLRate.toFixed(1)}%
              </Text>
            </View>
          </View>
          <View style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) }}>
            <Text style={styles.tiny}>
              주식 평가금액
              <Text style={{ fontWeight: "700", color: holdingPnL >= 0 ? palette.red[400] : palette.blue[400] }}>
                {" "}
                ({holdingPnL >= 0 ? "+" : ""}
                {formatNumber(Math.round(holdingPnL))}원 손익)
              </Text>
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#ffffff" }}>{formatNumber(Math.round(finalHoldingValue))}원</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.card, { marginBottom: 12, alignItems: "center" }]}>
          <Text style={{ fontSize: 12, color: palette.gray[500] }}>📦 보유 주식 없음 · 전부 매도 완료</Text>
        </View>
      )}

      {/* 남은 원화 */}
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { marginBottom: 8 }]}>💰 남은 원화</Text>
        <Text style={{ fontSize: 24, fontWeight: "900", color: "#ffffff" }}>{formatNumber(Math.round(cash))}원</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#151515" },
  card: { backgroundColor: "#1a1a1a", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  cardTitle: { fontSize: 10, color: palette.gray[500], fontWeight: "700" },
  tiny: { fontSize: 9, color: palette.gray[500] },
})
