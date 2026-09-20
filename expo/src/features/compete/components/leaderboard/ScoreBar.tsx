import { StyleSheet, Text, View } from "react-native"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"

export function ScoreBar({ score }: { score: number }) {
  const colors =
    score >= 90
      ? [palette.yellow[400], palette.orange[400]]
      : score >= 80
        ? [palette.green[400], palette.emerald[500]]
        : score >= 70
          ? [palette.blue[400], palette.indigo[500]]
          : [palette.gray[500], palette.gray[600]]
  return (
    <View style={styles.row}>
      <View style={styles.track}>
        <Gradient dir="r" colors={colors} style={{ height: "100%", borderRadius: 9999, width: `${Math.max(0, Math.min(100, score))}%` }} />
      </View>
      <Text style={styles.score}>{score}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  track: { flex: 1, height: 4, backgroundColor: alpha("#ffffff", 0.1), borderRadius: 9999, overflow: "hidden" },
  score: { fontSize: 10, fontWeight: "900", color: alpha("#ffffff", 0.7), width: 24, textAlign: "right", fontVariant: ["tabular-nums"] },
})
