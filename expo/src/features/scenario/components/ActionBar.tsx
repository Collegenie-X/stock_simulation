import { StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { PressableScale } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

/** 액션 바 */
export function ActionBar({ held, cash, canBuy, onSell, onHold, onBuy }: { held: number; cash: number; canBuy: boolean; onSell: () => void; onHold: () => void; onBuy: () => void }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.bar, { paddingBottom: 12 + insets.bottom }]}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <PressableScale onPress={onSell} disabled={held <= 0} style={[styles.btn, { backgroundColor: alpha(palette.blue[500], 0.2) }, held <= 0 && { opacity: 0.4 }]}>
          <Text style={[styles.btnText, { color: palette.blue[400] }]}>매도 (보유 {held})</Text>
        </PressableScale>
        <PressableScale onPress={onHold} style={[styles.btn, { backgroundColor: alpha(palette.gray[700], 0.4) }]}>
          <Text style={[styles.btnText, { color: palette.gray[300] }]}>관망</Text>
        </PressableScale>
        <PressableScale onPress={onBuy} disabled={!canBuy} style={[styles.btn, { backgroundColor: alpha(palette.red[500], 0.2) }, !canBuy && { opacity: 0.4 }]}>
          <Text style={[styles.btnText, { color: palette.red[400] }]}>매수</Text>
        </PressableScale>
      </View>
      <Text style={styles.cash}>현금 {formatNumber(cash)}원</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: { backgroundColor: "#000000", borderTopWidth: 1, borderTopColor: palette.gray[800], paddingHorizontal: 16, paddingTop: 12 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnText: { fontWeight: "700", fontSize: 14 },
  cash: { fontSize: 10, color: palette.gray[500], textAlign: "center", marginTop: 6 },
})
