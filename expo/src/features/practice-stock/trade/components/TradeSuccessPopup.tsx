import { useEffect } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Pop } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { palette } from "@/theme"

// ─── 거래 완료 인라인 토스트 ──────────────────────────────────
export interface TradeSuccessPopupProps {
  isBuy: boolean
  stockName: string
  quantity: number
  profit?: number
  profitRate?: number
  onDone: () => void
}

export default function TradeSuccessPopup({ isBuy, stockName, quantity, profit, profitRate, onDone }: TradeSuccessPopupProps) {
  const insets = useSafeAreaInsets()
  const hasProfit = profit !== undefined && profit !== null
  const isProfit = hasProfit && (profit as number) >= 0

  // 자동 닫기 (1.2초 후 페이지 이동)
  useEffect(() => {
    const t = setTimeout(onDone, 1200)
    return () => clearTimeout(t)
  }, [onDone])

  // backdrop-blur 대체: 불투명도를 높인 배경색
  const tone = isBuy
    ? { bg: "#3a1f22", border: "rgba(239,68,68,0.4)", icon: "rgba(239,68,68,0.3)" }
    : isProfit
      ? { bg: "#1c3526", border: "rgba(34,197,94,0.4)", icon: "rgba(34,197,94,0.3)" }
      : { bg: "#1e2a3f", border: "rgba(59,130,246,0.4)", icon: "rgba(59,130,246,0.3)" }

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 16 }]}>
      <Pop>
        <View style={[styles.toast, { backgroundColor: tone.bg, borderColor: tone.border }]}>
          {/* 아이콘 */}
          <Pop style={[styles.icon, { backgroundColor: tone.icon }]}>
            <Text style={styles.iconEmoji}>{isBuy ? "🚀" : isProfit ? "🎉" : "💧"}</Text>
          </Pop>

          {/* 텍스트 */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.titleRow}>
              <View style={[styles.badge, { backgroundColor: isBuy ? palette.red[500] : palette.blue[500] }]}>
                <Text style={styles.badgeText}>{isBuy ? "매수" : "매도"}</Text>
              </View>
              <Text numberOfLines={1} style={styles.stockName}>
                {stockName}
              </Text>
            </View>
            <View style={styles.subRow}>
              <Text style={[styles.sub, { color: isBuy ? palette.red[400] : palette.blue[400] }]}>
                {isBuy ? "+" : "-"}
                {quantity}주
              </Text>
              {!isBuy && hasProfit ? (
                <Text style={[styles.sub, { color: isProfit ? palette.red[400] : palette.blue[400] }]}>
                  {isProfit ? "+" : ""}
                  {formatNumber(Math.round(profit as number))}원
                  {profitRate !== undefined ? ` (${isProfit ? "+" : ""}${profitRate.toFixed(1)}%)` : ""}
                </Text>
              ) : null}
            </View>
          </View>

          {/* 체크 */}
          <Text style={styles.check}>✓</Text>
        </View>
      </Pop>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, zIndex: 90 },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  iconEmoji: { fontSize: 18, color: "#ffffff" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  badgeText: { fontSize: 10, fontWeight: "900", color: "#ffffff" },
  stockName: { fontSize: 14, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  sub: { fontSize: 12, fontWeight: "700" },
  check: { fontSize: 14, color: palette.green[400], flexShrink: 0 },
})
