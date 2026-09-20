import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"
import { GrowBar } from "../game/GrowBar"
import { twColor } from "../../utils/tw"

/** color: 웹과 동일하게 Tailwind 텍스트 클래스("text-cyan-400")를 받습니다 */
export function WaveStatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const barColor = color.includes("cyan") ? "#06b6d4" : color.includes("blue") ? "#3b82f6" : color.includes("purple") ? "#8b5cf6" : "#f59e0b"
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: twColor(color) }]}>{value}%</Text>
      </View>
      <GrowBar pct={value} colors={[barColor, barColor]} height={8} delay={150} trackColor={alpha("#ffffff", 0.1)} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 12, color: palette.gray[400] },
  value: { fontSize: 12, fontWeight: "700" },
})
