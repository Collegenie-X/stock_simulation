/**
 * 그라데이션 CTA 버튼 (웹: `<Button className="h-16 rounded-2xl font-black text-xl bg-gradient-to-r …">`)
 */
import React from "react"
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native"
import { Gradient, PressableScale } from "@/components/ui"

interface Props {
  colors: readonly string[]
  height?: number
  onPress: () => void
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

export function GradientCta({ colors, height = 64, onPress, style, children }: Props) {
  return (
    <PressableScale scaleTo={0.98} onPress={onPress} style={[styles.wrap, { height }, style]}>
      <Gradient dir="r" colors={colors} style={styles.inner}>
        {children}
      </Gradient>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 16, boxShadow: "0 10px 15px rgba(0,0,0,0.3)" },
  inner: { flex: 1, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
})
