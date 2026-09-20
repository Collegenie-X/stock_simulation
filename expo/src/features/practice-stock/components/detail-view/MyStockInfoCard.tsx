import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { LABELS } from "@/features/practice-stock/config"

interface MyStockInfoCardProps {
  myAvg: number
  currentHoldings: number
  totalStockValue: number
  profitAmt: number
  myReturn: string
  isProfit: boolean
  estimatedTax: number
}

/** 내 주식 정보 카드 */
export function MyStockInfoCard({ myAvg, currentHoldings, totalStockValue, profitAmt, myReturn, isProfit, estimatedTax }: MyStockInfoCardProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{LABELS.stockDetail.myStockInfo}</Text>
          <Pressable style={styles.calcBtn}>
            <Text style={styles.calcText}>{LABELS.stockDetail.avgCalcButton}</Text>
          </Pressable>
        </View>

        <View style={styles.rows}>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.label}>{LABELS.stockDetail.avgPerShare}</Text>
            <Text style={styles.value}>{formatNumber(Math.round(myAvg))}원</Text>
          </View>

          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.label}>{LABELS.stockDetail.holdingQty}</Text>
            <Text style={styles.value}>{currentHoldings}주</Text>
          </View>

          <View style={[styles.row, styles.rowBorder]}>
            <View>
              <Text style={[styles.label, { marginBottom: 2 }]}>{LABELS.stockDetail.totalAmount}</Text>
              <View style={styles.feeRow}>
                <Text style={styles.feeText}>{LABELS.stockDetail.feeTaxIncluded}</Text>
                <View style={styles.check}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.totalValue}>{formatNumber(totalStockValue)}원</Text>
              <Text style={[styles.profit, { color: isProfit ? palette.red[500] : palette.blue[500] }]}>
                {isProfit ? "+" : ""}
                {formatNumber(profitAmt)}원 ({isProfit ? "+" : ""}
                {myReturn}%)
              </Text>
            </View>
          </View>

          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.feeLabelRow}>
              <Text style={styles.label}>{LABELS.stockDetail.tradingFee}</Text>
              <View style={styles.help}>
                <Text style={styles.helpText}>?</Text>
              </View>
            </View>
            <Text style={styles.subValue}>{LABELS.stockDetail.feeEstimate}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{LABELS.stockDetail.sellTax}</Text>
            <Text style={styles.subValue}>{formatNumber(estimatedTax)}원 예상</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginBottom: 24 },
  card: { backgroundColor: "#1e1e1e", borderRadius: 16, overflow: "hidden" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: alpha(palette.gray[800], 0.6),
  },
  title: { fontWeight: "700", color: "#ffffff", fontSize: 16 },
  calcBtn: { borderWidth: 1, borderColor: alpha(palette.blue[400], 0.4), paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 },
  calcText: { fontSize: 12, color: palette.blue[400] },
  rows: { paddingHorizontal: 20, paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: alpha(palette.gray[800], 0.4) },
  label: { fontSize: 14, color: palette.gray[400] },
  value: { fontSize: 14, fontWeight: "500", color: "#ffffff" },
  subValue: { fontSize: 14, color: palette.gray[300] },
  feeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  feeText: { fontSize: 12, color: palette.blue[400] },
  check: { width: 14, height: 14, borderRadius: 7, backgroundColor: palette.blue[500], alignItems: "center", justifyContent: "center" },
  checkText: { fontSize: 9, color: "#ffffff", fontWeight: "700", lineHeight: 12 },
  totalValue: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  profit: { fontSize: 12, fontWeight: "700" },
  feeLabelRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  help: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: palette.gray[600], alignItems: "center", justifyContent: "center" },
  helpText: { fontSize: 9, color: palette.gray[500], lineHeight: 12 },
})
