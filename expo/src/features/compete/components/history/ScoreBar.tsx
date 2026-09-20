import { StyleSheet, Text, View } from "react-native"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"

export function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = (score / max) * 100
  const colors =
    pct >= 85
      ? [palette.yellow[400], palette.orange[400]]
      : pct >= 70
        ? [palette.green[400], palette.emerald[500]]
        : pct >= 55
          ? [palette.blue[400], palette.indigo[500]]
          : [palette.gray[500], palette.gray[600]]
  return (
    <View style={styles.row}>
      <View style={styles.track}>
        <Gradient dir="r" colors={colors} style={{ height: "100%", borderRadius: 9999, width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </View>
      <Text style={styles.score}>
        {score}
        <Text style={{ color: palette.gray[600] }}>/{max}</Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  track: { flex: 1, height: 6, backgroundColor: alpha("#ffffff", 0.1), borderRadius: 9999, overflow: "hidden" },
  score: { fontSize: 12, fontWeight: "700", color: "#ffffff", fontVariant: ["tabular-nums"] },
})
