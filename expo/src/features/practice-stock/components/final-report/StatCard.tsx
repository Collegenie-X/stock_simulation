import { type ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"

// ── 통계 카드 ─────────────────────────────────────────────
export function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: "47%",
    backgroundColor: alpha(palette.gray[800], 0.4),
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.2),
  },
  header: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  label: { fontSize: 9, color: palette.gray[500] },
  value: { fontSize: 18, fontWeight: "800", color: "#ffffff" },
})
