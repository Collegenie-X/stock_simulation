import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"

interface StatRowProps {
  label: string
  me: number
  other: number
  unit?: string
  higherIsBetter?: boolean
  /** 마지막 행은 구분선 없음 (웹 last:border-0) */
  last?: boolean
}

// ── 스탯 비교 행 ───────────────────────────────────────────
export function StatRow({ label, me, other, unit = "%", higherIsBetter = true, last }: StatRowProps) {
  const diff = me - other
  const isBetter = higherIsBetter ? diff >= 0 : diff <= 0

  return (
    <View style={[styles.row, !last && styles.border]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        <Text style={styles.me}>
          {me}
          {unit}
        </Text>
        <Text style={styles.vs}>vs</Text>
        <Text style={styles.other}>
          {other}
          {unit}
        </Text>
        <View style={[styles.diffBox, { backgroundColor: alpha(isBetter ? palette.green[500] : palette.red[500], 0.15) }]}>
          <Text style={[styles.diff, { color: isBetter ? palette.green[400] : palette.red[400] }]}>
            {diff > 0 ? "+" : ""}
            {diff.toFixed(1)}
            {unit}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 5 },
  border: { borderBottomWidth: 1, borderBottomColor: alpha("#ffffff", 0.05) },
  label: { fontSize: 12, color: palette.gray[400], width: 80, flexShrink: 0 },
  right: { flexDirection: "row", alignItems: "center", gap: 12 },
  me: { fontSize: 12, fontWeight: "700", color: "#ffffff", fontVariant: ["tabular-nums"] },
  vs: { fontSize: 10, color: palette.gray[600] },
  other: { fontSize: 12, color: palette.gray[400], fontVariant: ["tabular-nums"] },
  diffBox: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  diff: { fontSize: 10, fontWeight: "900", fontVariant: ["tabular-nums"] },
})
