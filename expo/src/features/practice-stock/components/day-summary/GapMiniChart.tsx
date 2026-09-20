import { StyleSheet, View } from "react-native"
import { alpha, palette } from "@/theme"
import type { GapRecord } from "@/features/practice-stock/hooks/useAICompetitor"

// ── 갭 미니 차트 ───────────────────────────────────────────
export function GapMiniChart({ history }: { history: GapRecord[] }) {
  if (history.length < 2) return null
  const recent = history.slice(-7)
  const maxAbs = Math.max(...recent.map((r) => Math.max(Math.abs(r.gapToBest), Math.abs(r.gapToSimilar))), 1)

  return (
    <View style={styles.row}>
      {recent.map((r, i) => (
        <View key={i} style={styles.col}>
          <View
            style={{
              width: "100%",
              borderRadius: 2,
              backgroundColor: r.gapToBest >= 0 ? alpha(palette.yellow[400], 0.6) : alpha(palette.red[400], 0.4),
              height: Math.max(2, (Math.abs(r.gapToBest) / maxAbs) * 36),
            }}
          />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 40 },
  col: { flex: 1, alignItems: "center" },
})
