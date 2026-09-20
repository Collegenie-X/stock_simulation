import { StyleSheet, Text, View } from "react-native"
import { PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import type { StockDetailData } from "@/features/practice-stock/types"
import { AICompareMini } from "../final-report/AICompareMini"
import { ProfitRateBar } from "../final-report/ProfitRateBar"

// ── 종목 카드 (주식 상세 탭) ──────────────────────────────
export function MiniStockCard({
  stock, aiSimilarName, aiSimilarEmoji, aiBestName, aiBestEmoji, onClick,
}: {
  stock: StockDetailData
  aiSimilarName: string; aiSimilarEmoji: string
  aiBestName: string; aiBestEmoji: string
  onClick: () => void
}) {
  const isProfit = stock.unrealizedProfitRate >= 0
  const buyCount = stock.myTrades.filter((t) => t.action === "buy").length
  const sellCount = stock.myTrades.filter((t) => t.action === "sell").length
  const c = isProfit ? palette.red[400] : palette.blue[400]

  return (
    <PressableScale onPress={onClick} scaleTo={0.98} style={styles.card}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{stock.stockName}</Text>
            <View style={styles.holding}>
              <Text style={styles.holdingText}>{stock.currentHolding}주 보유</Text>
            </View>
          </View>
          <Text style={styles.sub}>
            {stock.myTrades.length}건 거래 · {buyCount}매수 {sellCount}매도
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.rate, { color: c }]}>
            {isProfit ? "+" : ""}{stock.unrealizedProfitRate.toFixed(1)}%
          </Text>
          <Text style={[styles.amount, { color: alpha(c, 0.6) }]}>
            {isProfit ? "+" : ""}{formatNumber(stock.unrealizedProfit)}원
          </Text>
        </View>
      </View>

      {/* 평균매수가 / 현재가 */}
      <View style={styles.priceRow}>
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>평균 매수가</Text>
          <Text style={[styles.priceValue, { color: palette.gray[300] }]}>{formatNumber(stock.avgBuyPrice)}원</Text>
        </View>
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>현재가</Text>
          <Text style={[styles.priceValue, { color: c }]}>{formatNumber(stock.currentPrice)}원</Text>
        </View>
      </View>

      {/* AI 비교 미니 */}
      <AICompareMini
        aiSimilarName={aiSimilarName} aiSimilarEmoji={aiSimilarEmoji} aiSimilarProfitRate={stock.aiSimilarProfitRate}
        aiBestName={aiBestName} aiBestEmoji={aiBestEmoji} aiBestProfitRate={stock.aiBestProfitRate}
      />

      {/* 수익률 바 */}
      <ProfitRateBar percent={Math.min(100, Math.abs(stock.unrealizedProfitRate) * 5 + 10)} isProfit={isProfit} />
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
  top: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  name: { fontSize: 14, fontWeight: "800", color: "#ffffff", flexShrink: 1 },
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
  priceRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  priceBox: { flex: 1, backgroundColor: alpha(palette.gray[900], 0.4), borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  priceLabel: { fontSize: 8, color: palette.gray[600], marginBottom: 2 },
  priceValue: { fontSize: 11, fontWeight: "700" },
})
