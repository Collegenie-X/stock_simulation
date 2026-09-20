import { StyleSheet, Text, View } from "react-native"
import { MoreHorizontal } from "lucide-react-native"
import { Gradient, Pop, PressableScale } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import Keypad from "./Keypad"

interface MarketOrderViewProps {
  isBuy: boolean
  stockName: string
  currentPrice: number
  /** 전 턴 대비 등락률 (소수 1자리 문자열) */
  change: string
  isUp: boolean
  cash: number
  myQty: number
  myAvg: number
  myReturn: string
  isProfit: boolean
  quantity: number
  inputValue: string
  onNumberInput: (val: string) => void
  onDelete: () => void
  onSelectPercent: (pct: number) => void
  onAction: () => void
}

/** 일반(시장가) 주문 화면 — 현재가, 보유 현황, 수량 입력, 키패드, 구매/판매 버튼 */
export default function MarketOrderView({
  isBuy,
  stockName,
  currentPrice,
  change,
  isUp,
  cash,
  myQty,
  myAvg,
  myReturn,
  isProfit,
  quantity,
  inputValue,
  onNumberInput,
  onDelete,
  onSelectPercent,
  onAction,
}: MarketOrderViewProps) {
  const totalAmount = quantity * currentPrice
  const disabled = quantity < 1 || (isBuy ? cash < currentPrice * quantity : myQty < quantity)
  const mainColor = isBuy ? palette.red[500] : palette.blue[500]

  return (
    <>
      {/* 현재가 + 종목명 */}
      <View style={{ marginBottom: 16 }}>
        <View style={styles.nameRow}>
          <Text style={styles.nameEmoji}>{isBuy ? "🛒" : "💸"}</Text>
          <Text numberOfLines={1} style={styles.name}>
            {stockName}
          </Text>
          <View style={[styles.changeBadge, { backgroundColor: alpha(isUp ? palette.red[500] : palette.blue[500], 0.1) }]}>
            <Text style={[styles.changeText, { color: isUp ? palette.red[500] : palette.blue[500] }]}>
              {isUp ? "▲" : "▼"} {Math.abs(Number(change))}%
            </Text>
          </View>
        </View>
        <Text style={styles.price}>{formatNumber(currentPrice)}원</Text>
      </View>

      {/* 보유 현황 요약 카드 */}
      <View style={styles.summary}>
        <View style={styles.summaryCell}>
          <Text style={styles.summaryLabel}>📦 보유</Text>
          <Text style={styles.summaryValue}>{formatNumber(myQty)}주</Text>
        </View>
        <View style={styles.summaryCell}>
          <Text style={styles.summaryLabel}>💎 평가금</Text>
          <Text style={styles.summaryValue}>{formatNumber(myQty * currentPrice)}원</Text>
        </View>
        <View style={styles.summaryCell}>
          <Text style={styles.summaryLabel}>💵 현금</Text>
          <Text style={styles.summaryValue}>{formatNumber(cash)}원</Text>
        </View>
        <View style={styles.summaryCell}>
          <Text style={styles.summaryLabel}>📊 손익</Text>
          {myQty > 0 && myAvg > 0 ? (
            <Text style={[styles.summaryValue, { color: isProfit ? palette.red[400] : palette.blue[400] }]}>
              {isProfit ? "+" : ""}
              {formatNumber(Math.round((currentPrice - myAvg) * myQty))}원<Text style={{ fontSize: 12 }}> ({myReturn}%)</Text>
            </Text>
          ) : (
            <Text style={[styles.summaryValue, { color: palette.gray[500] }]}>-</Text>
          )}
        </View>
      </View>

      <View style={styles.qtyCard}>
        <View style={styles.qtyTitleRow}>
          <Text style={styles.qtyTitle}>{isBuy ? "🎯" : "✂️"}</Text>
          <Text style={styles.qtyTitle}>수량</Text>
        </View>

        <View style={styles.qtyCenter}>
          {inputValue ? (
            <>
              <Pop key={inputValue} style={styles.qtyValueRow}>
                <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.qtyValue, { color: mainColor }]}>
                  {formatNumber(Number.parseInt(inputValue))}주
                </Text>
                <Text style={styles.qtyEmoji}>{isBuy ? "🚀" : "💰"}</Text>
              </Pop>
              <Text style={styles.total}>{formatNumber(totalAmount)}원</Text>
              {/* 거래 후 예상 현금 */}
              <Text style={styles.afterCash}>💵 → {isBuy ? formatNumber(cash - totalAmount) : formatNumber(cash + totalAmount)}원</Text>
            </>
          ) : (
            <View style={styles.emptyRow}>
              <Text style={styles.qtyEmoji}>🤔</Text>
              <Text style={styles.emptyText}>몇 주?</Text>
            </View>
          )}
          <Text style={styles.maxText}>✨ 최대 {isBuy ? Math.floor(cash / currentPrice) : myQty}주</Text>
        </View>

        <View style={styles.pctRow}>
          {[10, 25, 50, 100].map((pct) =>
            pct === 100 ? (
              <PressableScale key={pct} scaleTo={0.9} onPress={() => onSelectPercent(pct)} style={styles.pctAllWrap}>
                <Gradient dir="br" colors={[palette.orange[500], palette.red[600]]} style={styles.pctAll}>
                  <Text style={[styles.pctText, { color: "#ffffff" }]}>🔥 ALL</Text>
                </Gradient>
              </PressableScale>
            ) : (
              <PressableScale key={pct} scaleTo={0.9} onPress={() => onSelectPercent(pct)} style={styles.pctBtn}>
                <Text style={styles.pctText}>{pct}%</Text>
              </PressableScale>
            ),
          )}
        </View>
      </View>

      <View style={{ marginTop: "auto", paddingBottom: 16 }}>
        <Keypad onInput={onNumberInput} onDelete={onDelete} />

        <View style={styles.actionRow}>
          <PressableScale accessibilityLabel="호가" scaleTo={0.98} style={styles.moreBtn}>
            <MoreHorizontal size={24} color={palette.gray[300]} />
          </PressableScale>
          <PressableScale onPress={onAction} disabled={disabled} scaleTo={0.95} style={[styles.actionWrap, !disabled && { boxShadow: `0 10px 15px ${alpha(isBuy ? palette.red[900] : palette.blue[900], 0.5)}` }]}>
            <Gradient dir="br" colors={isBuy ? [palette.red[500], palette.red[700]] : [palette.blue[500], palette.blue[700]]} style={styles.action}>
              <Text style={styles.actionEmoji}>{isBuy ? "🚀" : "💰"}</Text>
              <Text style={styles.actionText}>{isBuy ? "구매" : "판매"}</Text>
            </Gradient>
          </PressableScale>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  nameEmoji: { fontSize: 16, color: "#ffffff" },
  name: { fontSize: 14, fontWeight: "700", color: palette.gray[400], flexShrink: 1 },
  changeBadge: { marginLeft: "auto", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  changeText: { fontSize: 14, fontWeight: "700" },
  price: { fontSize: 36, fontWeight: "700", color: "#ffffff" },

  summary: { backgroundColor: "#252525", borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: "row", flexWrap: "wrap", rowGap: 12 },
  summaryCell: { width: "50%", paddingRight: 8 },
  summaryLabel: { fontSize: 12, color: palette.gray[500], marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: "700", color: "#ffffff" },

  qtyCard: { backgroundColor: "#252525", borderRadius: 24, padding: 24, flexGrow: 1, marginBottom: 16 },
  qtyTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  qtyTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  qtyCenter: { flexGrow: 1, alignItems: "center", justifyContent: "center" },
  qtyValueRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8, maxWidth: "100%" },
  qtyValue: { fontSize: 72, fontWeight: "700", flexShrink: 1 },
  qtyEmoji: { fontSize: 30, color: "#ffffff" },
  total: { fontSize: 20, fontWeight: "500", color: "#ffffff", marginBottom: 4 },
  afterCash: { fontSize: 14, color: palette.gray[400] },
  emptyRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 },
  emptyText: { fontSize: 36, fontWeight: "700", color: palette.gray[600] },
  maxText: { fontSize: 14, color: palette.gray[500], textAlign: "center", marginTop: 8 },

  pctRow: { flexDirection: "row", gap: 12, marginTop: "auto", paddingTop: 24 },
  pctBtn: { flex: 1, paddingVertical: 12, borderRadius: 16, backgroundColor: "#333333", alignItems: "center", justifyContent: "center" },
  pctAllWrap: { flex: 1, borderRadius: 16, boxShadow: `0 4px 6px ${alpha(palette.red[900], 0.4)}` },
  pctAll: { paddingVertical: 12, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  pctText: { fontSize: 14, fontWeight: "700", color: palette.gray[300] },

  actionRow: { flexDirection: "row", gap: 12, marginTop: 16, paddingBottom: 8 },
  moreBtn: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: "#252525", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  actionWrap: { flex: 1, borderRadius: 16 },
  action: { height: 64, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  actionEmoji: { fontSize: 24, color: "#ffffff" },
  actionText: { fontSize: 20, fontWeight: "700", color: "#ffffff" },
})
