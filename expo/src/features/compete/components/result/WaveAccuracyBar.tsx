import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"

const barColors: Record<string, string> = {
  cyan: palette.cyan[500],
  blue: palette.blue[500],
  purple: palette.purple[500],
  yellow: palette.yellow[500],
}
const textColors: Record<string, string> = {
  cyan: palette.cyan[400],
  blue: palette.blue[400],
  purple: palette.purple[400],
  yellow: palette.yellow[400],
}

export function WaveAccuracyBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: textColors[color] ?? "#ffffff" }]}>{value}%</Text>
      </View>
      <View style={styles.track}>
        <View style={{ height: "100%", borderRadius: 9999, backgroundColor: barColors[color] ?? "#ffffff", width: `${Math.max(0, Math.min(100, value))}%` }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 12, color: palette.gray[400] },
  value: { fontSize: 12, fontWeight: "700" },
  track: { height: 8, backgroundColor: alpha("#ffffff", 0.1), borderRadius: 9999, overflow: "hidden" },
})
