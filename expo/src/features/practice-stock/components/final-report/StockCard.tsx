import { StyleSheet, Text, View } from "react-native"
import { PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import type { StockDetailData } from "@/features/practice-stock/types"
import { AICompareMini } from "./AICompareMini"
import { ProfitRateBar } from "./ProfitRateBar"
import { rateColor } from "./colors"

// ── 종목 카드 (탭 목록) ───────────────────────────────────
export function StockCard({
  stock, aiSimilarName, aiSimilarEmoji, aiBestName, aiBestEmoji, onClick,
}: {
  stock: StockDetailData
  aiSimilarName: string; aiSimilarEmoji: string
  aiBestName: string; aiBestEmoji: string
  onClick: () => void
}) {
  const isProfit = stock.myTotalProfitRate >= 0
  const hasHolding = stock.currentHolding > 0
  const c = rateColor(stock.myTotalProfitRate)

  return (
    <PressableScale onPress={onClick} scaleTo={0.98} style={styles.card}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{stock.stockName}</Text>
            {!!stock.category && (
              <View style={styles.category}>
                <Text style={styles.categoryText}>{stock.category}</Text>
              </View>
            )}
            {hasHolding && (
              <View style={styles.holding}>
                <Text style={styles.holdingText}>보유중</Text>
              </View>
            )}
          </View>
          <Text style={styles.sub}>
            {stock.myTrades.length}건 거래 · {stock.myTrades.filter((t) => t.action === "buy").length}매수 {stock.myTrades.filter((t) => t.action === "sell").length}매도
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.rate, { color: c }]}>
            {isProfit ? "+" : ""}{stock.myTotalProfitRate.toFixed(1)}%
          </Text>
          <Text style={[styles.amount, { color: alpha(c, 0.6) }]}>
            {isProfit ? "+" : ""}{formatNumber(stock.myTotalProfit)}원
          </Text>
        </View>
      </View>

      {/* AI 비교 미니 바 */}
      <AICompareMini
        aiSimilarName={aiSimilarName} aiSimilarEmoji={aiSimilarEmoji} aiSimilarProfitRate={stock.aiSimilarProfitRate}
        aiBestName={aiBestName} aiBestEmoji={aiBestEmoji} aiBestProfitRate={stock.aiBestProfitRate}
      />

      {/* 미니 수익률 바 */}
      <ProfitRateBar percent={Math.min(100, Math.abs(stock.myTotalProfitRate) * 4 + 10)} isProfit={isProfit} />
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: alpha(palette.gray[800], 0.5),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
    padding: 16,
  },
  top: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  name: { fontSize: 14, fontWeight: "800", color: "#ffffff", flexShrink: 1 },
  category: { backgroundColor: alpha(palette.gray[700], 0.5), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  categoryText: { fontSize: 9, fontWeight: "700", color: palette.gray[500] },
  holding: {
    backgroundColor: alpha(palette.green[500], 0.1),
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: alpha(palette.green[500], 0.2),
  },
  holdingText: { fontSize: 9, fontWeight: "700", color: palette.green[400] },
  sub: { fontSize: 10, color: palette.gray[500], marginTop: 2 },
  rate: { fontSize: 16, fontWeight: "800" },
  amount: { fontSize: 10, fontWeight: "700" },
})
