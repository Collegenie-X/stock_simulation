import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"

// ── 미니 통계 카드 ────────────────────────────────────────
export function MiniStatCard({ label, value, valueColor = "#ffffff" }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: alpha(palette.gray[800], 0.4),
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.2),
  },
  label: { fontSize: 8, color: palette.gray[500], marginBottom: 2 },
  value: { fontSize: 16, fontWeight: "800" },
})
