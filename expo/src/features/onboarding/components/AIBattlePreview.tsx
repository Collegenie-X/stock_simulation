import { StyleSheet, Text, View } from "react-native"
import { SeriesChart } from "@/components/charts"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import onboardingData from "../data.json"

const RANK = [
  { emoji: "👑", label: "최고 수익", who: "topPerformer", color: palette.yellow[400], bg: [alpha(palette.yellow[500], 0.2), alpha(palette.amber[500], 0.05)], border: alpha(palette.yellow[500], 0.3) },
  { emoji: "🤖", label: "유사 AI", who: "similarAI", color: palette.indigo[400], bg: [alpha(palette.indigo[500], 0.2), alpha(palette.purple[500], 0.05)], border: alpha(palette.indigo[500], 0.3) },
  { emoji: "🧑", label: "나", who: "user", color: palette.green[400], bg: [alpha(palette.green[500], 0.2), alpha(palette.emerald[500], 0.05)], border: alpha(palette.green[500], 0.3) },
] as const

export function AIBattlePreview() {
  const { data, finalReturns, insight } = onboardingData.comparisonChart

  return (
    <Gradient dir="b" colors={["#0a0a0a", "#050505"]} style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>⚔️</Text>
          <Text style={styles.headerTitle}>8-TURN BATTLE</Text>
        </View>
        <Text style={styles.headerFinal}>FINAL</Text>
      </View>

      {/* 차트 */}
      <View style={styles.chart}>
        <SeriesChart
          data={data}
          height={126}
          xKey="turn"
          yDomain={[95, 140]}
          showGrid
          showXAxis
          showYAxis
          yAxisWidth={26}
          xTickCount={8}
          yTickCount={4}
          margin={{ top: 4, right: 6, bottom: 0, left: 0 }}
          gridColor={alpha("#ffffff", 0.03)}
          axisColor={palette.gray[500]}
          xTickFormatter={(v) => `${v}턴`}
          yTickFormatter={(v) => `${v}%`}
          tooltip
          tooltipFormatter={(v) => `${v}%`}
          tooltipLabelFormatter={(d) => `${d.turn}턴`}
          series={[
            { key: "topPerformer", type: "line", color: "#eab308", strokeWidth: 2.2, dots: true },
            { key: "similarAI", type: "line", color: "#6366f1", strokeWidth: 2, dots: true, dashed: true },
            { key: "user", type: "line", color: "#22c55e", strokeWidth: 2.4, dots: true },
          ]}
        />
      </View>

      {/* 랭킹 카드 */}
      <View style={styles.body}>
        <View style={styles.rankRow}>
          {RANK.map((r, i) => (
            <View key={r.who} style={styles.rankCell}>
              <Gradient dir="b" colors={r.bg} style={[styles.rankCard, { borderColor: r.border }]}>
                <Text style={styles.rankEmoji}>{r.emoji}</Text>
                <Text style={styles.rankLabel}>{r.label}</Text>
                <Text style={[styles.rankValue, { color: r.color }]}>{finalReturns[r.who as keyof typeof finalReturns]}</Text>
              </Gradient>
              <View style={styles.rankNo}>
                <Text style={styles.rankNoText}>{i + 1}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* AI 코멘트 */}
        <View style={styles.comment}>
          <Text style={styles.commentEmoji}>💬</Text>
          <Text style={styles.commentText}>{insight}</Text>
        </View>
      </View>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  root: { borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: alpha("#ffffff", 0.05),
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerEmoji: { fontSize: 12, color: "#ffffff" },
  headerTitle: { fontSize: 9, fontWeight: "900", color: palette.indigo[300], letterSpacing: 0.45 },
  headerFinal: { fontSize: 8, color: palette.gray[500] },
  chart: { height: 130, paddingHorizontal: 8, paddingTop: 4 },
  body: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 8 },
  rankRow: { flexDirection: "row", gap: 6 },
  rankCell: { flex: 1 },
  rankCard: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 4, paddingVertical: 6, alignItems: "center" },
  rankNo: {
    position: "absolute",
    top: -4,
    left: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.1),
    alignItems: "center",
    justifyContent: "center",
  },
  rankNoText: { fontSize: 7, fontWeight: "900", color: palette.gray[400] },
  rankEmoji: { fontSize: 14, lineHeight: 16, marginBottom: 2, color: "#ffffff" },
  rankLabel: { fontSize: 8, fontWeight: "700", color: palette.gray[400] },
  rankValue: { fontSize: 11, lineHeight: 12, fontWeight: "900", marginTop: 2, fontVariant: ["tabular-nums"] },
  comment: {
    marginTop: 8,
    backgroundColor: alpha(palette.indigo[500], 0.1),
    borderWidth: 1,
    borderColor: alpha(palette.indigo[500], 0.2),
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    gap: 6,
  },
  commentEmoji: { fontSize: 12, lineHeight: 13, color: "#ffffff" },
  commentText: { flex: 1, fontSize: 9, lineHeight: 12.5, color: palette.indigo[200] },
})
