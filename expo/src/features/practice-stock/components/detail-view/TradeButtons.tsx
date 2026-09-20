import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Gradient } from "@/components/ui"
import { palette } from "@/theme"

interface TradeButtonsProps {
  canSell: boolean
  canBuy: boolean
  onSell: () => void
  onBuy: () => void
}

/** 하단 매매 버튼 */
export function TradeButtons({ canSell, canBuy, onSell, onBuy }: TradeButtonsProps) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(16, insets.bottom) }]}>
      <View style={styles.inner}>
        <TradeButton
          emoji="💰"
          label="판매"
          enabled={canSell}
          colors={[palette.blue[500], palette.blue[700]]}
          shadow="0 10px 15px rgba(30,58,138,0.4)"
          onPress={onSell}
        />
        <TradeButton
          emoji="🚀"
          label="구매"
          enabled={canBuy}
          colors={[palette.red[500], palette.red[700]]}
          shadow="0 10px 15px rgba(127,29,29,0.4)"
          onPress={onBuy}
        />
      </View>
    </View>
  )
}

function TradeButton({ emoji, label, enabled, colors, shadow, onPress }: { emoji: string; label: string; enabled: boolean; colors: string[]; shadow: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      style={({ pressed }) => [styles.btnWrap, enabled && { boxShadow: shadow }, pressed && { transform: [{ scale: 0.95 }] }]}
    >
      <Gradient dir="br" colors={enabled ? colors : [palette.gray[800], palette.gray[800]]} style={styles.btn}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, { color: enabled ? "#ffffff" : palette.gray[600] }]}>{label}</Text>
      </Gradient>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  bar: { backgroundColor: "#191919", borderTopWidth: 1, borderTopColor: palette.gray[800] },
  inner: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  btnWrap: { flex: 1, height: 56, borderRadius: 16 },
  btn: { flex: 1, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  emoji: { fontSize: 20, color: "#ffffff" },
  label: { fontSize: 18, fontWeight: "700" },
})
