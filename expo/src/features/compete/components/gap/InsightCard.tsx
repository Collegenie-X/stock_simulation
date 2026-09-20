import { StyleSheet, Text, View } from "react-native"
import { Target } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import type { Insight } from "./types"

// ── 인사이트 카드 ──────────────────────────────────────────
export function InsightCard({ insight }: { insight: Insight }) {
  const isStrength = insight.type === "strength"

  const valueColor =
    insight.value.startsWith("+") && !insight.value.includes("%p")
      ? palette.red[400]
      : insight.value.startsWith("-")
        ? palette.blue[400]
        : palette.yellow[300]

  return (
    <View
      style={[
        styles.card,
        isStrength
          ? { backgroundColor: alpha(palette.green[500], 0.08), borderColor: alpha(palette.green[500], 0.2) }
          : { backgroundColor: "#1e1e1e", borderColor: alpha("#ffffff", 0.08) },
      ]}
    >
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <Text style={{ fontSize: 16, color: "#ffffff" }}>{insight.icon}</Text>
          <Text style={styles.title}>{insight.title}</Text>
        </View>
        <Text style={[styles.value, { color: valueColor }]}>{insight.value}</Text>
      </View>
      <Text style={styles.desc}>{insight.desc}</Text>
      <View style={styles.action}>
        <Target size={12} color={palette.cyan[400]} />
        <Text style={styles.actionText}>{insight.action}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 12, borderWidth: 1 },
  top: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  title: { fontSize: 12, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  value: { fontSize: 14, fontWeight: "900", flexShrink: 0 },
  desc: { fontSize: 11, lineHeight: 18, color: palette.gray[400], marginBottom: 6 },
  action: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: alpha("#ffffff", 0.05), borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  actionText: { flex: 1, fontSize: 10, color: palette.cyan[300], fontWeight: "600" },
})
