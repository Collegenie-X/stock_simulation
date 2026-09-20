import { Pressable, StyleSheet, Text, View } from "react-native"
import { Minus, Plus } from "lucide-react-native"
import { PressableScale } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { palette } from "@/theme"

type TradingMode = "price" | "percent"
type Setter = (updater: (prev: number | null) => number | null) => void

interface ConditionalOrderViewProps {
  isBuy: boolean
  currentPrice: number
  cash: number
  myQty: number
  myReturn: string
  isProfit: boolean
  quantity: number
  setQuantity: (qty: number) => void
  tradingMode: TradingMode
  onChangeMode: (mode: TradingMode) => void
  takeProfit: number | null
  stopLoss: number | null
  setTakeProfit: Setter
  setStopLoss: Setter
  onAction: () => void
}

/** 조건(익절/손절) 주문 화면 */
export default function ConditionalOrderView({
  isBuy,
  currentPrice,
  cash,
  myQty,
  myReturn,
  isProfit,
  quantity,
  setQuantity,
  tradingMode,
  onChangeMode,
  takeProfit,
  stopLoss,
  setTakeProfit,
  setStopLoss,
  onAction,
}: ConditionalOrderViewProps) {
  const effectiveCurrentPrice = currentPrice || 1
  const max = isBuy ? Math.floor(cash / currentPrice) : myQty
  const getDelta = () => (tradingMode === "percent" ? 0.1 : Math.round(effectiveCurrentPrice * 0.01))
  const disabled = takeProfit === null && stopLoss === null

  const getExpectedValue = (val: number | null, type: TradingMode) => {
    if (val === null) return "설정되지 않음"

    const targetPrice = type === "price" ? val : Math.round(currentPrice * (1 + val / 100))
    const diff = targetPrice - currentPrice
    const totalProfit = diff * quantity
    const profitText = `${totalProfit > 0 ? "+" : ""}${formatNumber(totalProfit)}원`

    if (type === "percent") {
      return `${formatNumber(targetPrice)}원 예상 (${profitText})`
    }
    const percent = (((targetPrice - currentPrice) / currentPrice) * 100).toFixed(1)
    return `${percent}% 예상 (${profitText})`
  }

  return (
    <>
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.heading}>
          내 수익률이 얼마일 때{"\n"}
          {isBuy ? "구매" : "판매"}를 시작할까요?
        </Text>
        <View style={styles.between}>
          <Text style={[styles.meta, { color: isProfit ? palette.red[500] : palette.blue[500] }]}>현재 수익률 {myReturn}%</Text>
          <Text style={[styles.meta, { color: palette.gray[400] }]}>
            현재가 <Text style={{ color: "#ffffff" }}> {formatNumber(currentPrice)}원</Text>
          </Text>
        </View>
      </View>

      <View style={styles.modeRow}>
        <View style={styles.modeBox}>
          <Pressable onPress={() => onChangeMode("price")} style={[styles.modeBtn, tradingMode === "price" && styles.modeBtnOn]}>
            <Text style={[styles.modeText, { color: tradingMode === "price" ? "#ffffff" : palette.gray[400] }]}>원</Text>
          </Pressable>
          <Pressable onPress={() => onChangeMode("percent")} style={[styles.modeBtn, tradingMode === "percent" && styles.modeBtnOn]}>
            <Text style={[styles.modeText, { color: tradingMode === "percent" ? "#ffffff" : palette.gray[400] }]}>%</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 12, marginBottom: 24 }}>
        {/* Quantity Input Card */}
        <View style={styles.card}>
          <View style={[styles.between, { marginBottom: 16 }]}>
            <Text style={styles.cardTitle}>수량</Text>
            <Text style={styles.maxText}>{isBuy ? `최대 ${Math.floor(cash / currentPrice)}주` : `최대 ${myQty}주`}</Text>
          </View>
          <View style={styles.between}>
            <PressableScale scaleTo={0.95} onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
              <Minus size={20} color="#ffffff" />
            </PressableScale>
            <Text style={styles.qtyText}>{quantity}주</Text>
            <PressableScale scaleTo={0.95} onPress={() => setQuantity(Math.min(max, quantity + 1))} style={styles.qtyBtn}>
              <Plus size={20} color="#ffffff" />
            </PressableScale>
          </View>
        </View>

        {/* 익절 */}
        <View style={styles.card}>
          <View style={[styles.betweenStart, { marginBottom: 8 }]}>
            <Text style={styles.cardTitle}>익절</Text>
            <Pressable onPress={() => setTakeProfit(() => null)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>삭제</Text>
            </Pressable>
          </View>
          <View style={styles.between}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bigValue, { color: palette.red[500] }]}>
                {takeProfit !== null
                  ? tradingMode === "percent"
                    ? `${takeProfit >= 0 ? "+" : ""}${takeProfit.toFixed(1)}%`
                    : `${formatNumber(takeProfit)}원`
                  : "-"}
              </Text>
              <Text style={styles.expected}>{getExpectedValue(takeProfit, tradingMode)}</Text>
            </View>
            <View style={styles.stepRow}>
              <Pressable
                onPress={() => {
                  const delta = getDelta()
                  setTakeProfit((prev) => {
                    const currentVal = prev === null ? 0 : prev
                    return Math.max(0, currentVal - delta)
                  })
                }}
                style={styles.stepBtn}
              >
                <Minus size={16} color={palette.gray[400]} />
              </Pressable>
              <Pressable
                onPress={() => {
                  const delta = getDelta()
                  setTakeProfit((prev) => {
                    const currentVal = prev === null ? 0 : prev
                    return tradingMode === "percent" ? Math.min(99.9, currentVal + delta) : currentVal + delta
                  })
                }}
                style={styles.stepBtn}
              >
                <Plus size={16} color={palette.gray[400]} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* 손절 */}
        <View style={styles.card}>
          <View style={[styles.betweenStart, { marginBottom: 8 }]}>
            <Text style={styles.cardTitle}>손절</Text>
            <Pressable onPress={() => setStopLoss(() => null)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>삭제</Text>
            </Pressable>
          </View>
          <View style={styles.between}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bigValue, { color: palette.blue[500] }]}>
                {stopLoss !== null ? (tradingMode === "percent" ? `${stopLoss.toFixed(1)}%` : `${formatNumber(stopLoss)}원`) : "-"}
              </Text>
              <Text style={styles.expected}>{getExpectedValue(stopLoss, tradingMode)}</Text>
            </View>
            <View style={styles.stepRow}>
              <Pressable
                onPress={() => {
                  const delta = getDelta()
                  setStopLoss((prev) => {
                    const currentVal = prev === null ? 0 : prev
                    return tradingMode === "percent" ? Math.max(-99.9, currentVal - delta) : Math.max(0, currentVal - delta)
                  })
                }}
                style={styles.stepBtn}
              >
                <Minus size={16} color={palette.gray[400]} />
              </Pressable>
              <Pressable
                onPress={() => {
                  const delta = getDelta()
                  setStopLoss((prev) => {
                    const currentVal = prev === null ? 0 : prev
                    return tradingMode === "percent" ? Math.min(0, currentVal + delta) : currentVal + delta
                  })
                }}
                style={styles.stepBtn}
              >
                <Plus size={16} color={palette.gray[400]} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <View style={{ marginTop: "auto", paddingBottom: 16 }}>
        <Pressable
          onPress={onAction}
          disabled={disabled}
          style={({ pressed }) => [styles.submit, disabled && { backgroundColor: palette.gray[800] }, pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }]}
        >
          <Text style={[styles.submitText, disabled && { color: palette.gray[600] }]}>설정하기</Text>
        </Pressable>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, lineHeight: 30, fontWeight: "700", color: "#ffffff", marginBottom: 8 },
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  betweenStart: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  meta: { fontSize: 14, fontWeight: "500" },
  modeRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 16 },
  modeBox: { flexDirection: "row", backgroundColor: palette.gray[800], borderRadius: 8, padding: 4 },
  modeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  modeBtnOn: { backgroundColor: palette.gray[600] },
  modeText: { fontSize: 12, fontWeight: "700" },
  card: { backgroundColor: "#252525", borderRadius: 16, padding: 20 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: palette.gray[200] },
  maxText: { fontSize: 12, color: palette.gray[500] },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.gray[800], alignItems: "center", justifyContent: "center" },
  qtyText: { fontSize: 24, fontWeight: "700", color: "#ffffff" },
  deleteBtn: { backgroundColor: palette.gray[800], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  deleteText: { fontSize: 12, color: palette.gray[400] },
  bigValue: { fontSize: 30, fontWeight: "700" },
  expected: { fontSize: 14, color: palette.gray[500], marginTop: 4 },
  stepRow: { flexDirection: "row", gap: 12 },
  stepBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: palette.gray[800], alignItems: "center", justifyContent: "center" },
  submit: { width: "100%", height: 56, borderRadius: 16, backgroundColor: palette.blue[600], alignItems: "center", justifyContent: "center" },
  submitText: { fontSize: 20, fontWeight: "700", color: "#ffffff" },
})
