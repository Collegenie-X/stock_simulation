import { StyleSheet, Text, View } from "react-native"
import { GrowBar } from "../game/GrowBar"
import { palette } from "@/theme"

interface CompareBarProps {
  label: string
  value: number
  maxValue: number
  /** 웹의 `bg-gradient-to-r from-* to-*` */
  colors: readonly string[]
  isMe?: boolean
}

// ── 수익률 바 비교 ─────────────────────────────────────────
export function CompareBar({ label, value, maxValue, colors, isMe }: CompareBarProps) {
  const pct = Math.max(0, Math.min(100, (value / maxValue) * 100))
  const isNeg = value < 0

  return (
    <View style={styles.row}>
      <Text numberOfLines={1} style={[styles.label, { color: isMe ? "#ffffff" : palette.gray[400] }]}>
        {label}
      </Text>
      <GrowBar pct={pct} colors={colors} height={8} delay={150} style={{ flex: 1 }} />
      <Text style={[styles.value, { color: isNeg ? palette.blue[400] : isMe ? "#ffffff" : palette.gray[300] }]}>
        {value > 0 ? "+" : ""}
        {value}%
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 10, width: 56, flexShrink: 0, fontWeight: "700" },
  value: { fontSize: 12, fontWeight: "900", width: 48, textAlign: "right", flexShrink: 0, fontVariant: ["tabular-nums"] },
})
