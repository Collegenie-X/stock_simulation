import { Pressable, StyleSheet, Text, View } from "react-native"
import { ArrowRight, Lock, Target } from "lucide-react-native"
import { BottomSheet } from "@/components/ui"
import { alpha, palette } from "@/theme"

interface OrderTypeSheetProps {
  visible: boolean
  orderType: "market" | "conditional"
  canUseConditional: boolean
  onClose: () => void
  onSelectMarket: () => void
  onSelectConditional: () => void
}

/** 주문 방법 선택 바텀시트 */
export default function OrderTypeSheet({ visible, orderType, canUseConditional, onClose, onSelectMarket, onSelectConditional }: OrderTypeSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} backdropColor="rgba(0,0,0,0.6)" showHandle={false} style={styles.sheet}>
      <View style={styles.handle} />

      <Pressable onPress={onSelectMarket} style={({ pressed }) => [styles.option, { marginBottom: 8 }, pressed && styles.pressed]}>
        <View style={styles.left}>
          <View style={[styles.iconCircle, { backgroundColor: alpha(palette.green[500], 0.2) }]}>
            <ArrowRight size={20} color={palette.green[500]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>일반 주문</Text>
            <Text style={styles.desc}>현재 가격으로 바로 주문</Text>
          </View>
        </View>
        {orderType === "market" ? <Text style={styles.check}>✓</Text> : null}
      </Pressable>

      <Pressable
        onPress={onSelectConditional}
        disabled={!canUseConditional}
        style={({ pressed }) => [styles.option, !canUseConditional && { opacity: 0.5 }, pressed && styles.pressed]}
      >
        <View style={styles.left}>
          <View style={[styles.iconCircle, { backgroundColor: alpha(palette.blue[500], 0.2) }]}>
            <Target size={20} color={palette.blue[500]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>조건 주문</Text>
            <Text style={styles.desc}>가격, 수익률과 주문 기간을 설정하면 자동 주문</Text>
          </View>
        </View>
        {orderType === "conditional" ? <Text style={styles.check}>✓</Text> : null}
        {!canUseConditional ? <Lock size={16} color={palette.gray[500]} /> : null}
      </Pressable>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: "#252525", paddingTop: 24, paddingHorizontal: 24 },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: palette.gray[700], marginBottom: 24 },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, padding: 16, borderRadius: 16 },
  pressed: { backgroundColor: palette.gray[800] },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  desc: { fontSize: 14, color: palette.gray[500] },
  check: { fontSize: 16, color: palette.blue[500] },
})
