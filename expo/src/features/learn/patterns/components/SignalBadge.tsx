import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { SIGNAL_COLORS, type ChartPattern } from "@/data/chart-patterns"
import { twColor } from "../../utils/tw"

interface Props {
  signal: ChartPattern["signal"]
}

export function SignalBadge({ signal }: Props) {
  const config = SIGNAL_COLORS[signal]
  return (
    <View style={[styles.badge, { backgroundColor: twColor(config.bg, "bg"), borderColor: twColor(config.border, "border") }]}>
      <Text style={[styles.text, { color: twColor(config.color, "text") }]}>
        {signal === "매수" ? "↑ 매수 신호" : signal === "매도" ? "↓ 매도 신호" : "↕ 양방향 신호"}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  text: { fontSize: 12, fontWeight: "700" },
})
