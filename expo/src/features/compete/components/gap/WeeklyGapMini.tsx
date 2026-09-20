import { StyleSheet, Text, View } from "react-native"
import Svg, { Circle, Line, Polyline } from "react-native-svg"
import { alpha, palette } from "@/theme"
import type { WeeklyGapItem } from "./types"

// ── 주간 갭 미니 차트 ──────────────────────────────────────
export function WeeklyGapMini({ data }: { data: WeeklyGapItem[] }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.bestPlayer, d.me, d.similarAI]))
  const minVal = Math.min(...data.flatMap((d) => [d.me]))
  const range = maxVal - Math.min(minVal, 0) || 1

  const toY = (v: number) => {
    const pct = (v - Math.min(minVal, 0)) / range
    return 44 - pct * 40
  }
  const toX = (i: number) => (data.length <= 1 ? 100 : (i / (data.length - 1)) * 200)

  const points = (key: "me" | "bestPlayer" | "similarAI") => data.map((d, i) => `${toX(i)},${toY(d[key])}`).join(" ")

  return (
    <View style={styles.box}>
      <Text style={styles.title}>주간 수익률 비교 (실전 시뮬레이션)</Text>
      <Svg viewBox="0 0 200 48" width="100%" height={40} preserveAspectRatio="none">
        {/* 0선 */}
        <Line x1={0} y1={toY(0)} x2={200} y2={toY(0)} stroke="#ffffff" strokeOpacity={0.06} strokeWidth={1} />
        {/* 최고 투자자 */}
        <Polyline points={points("bestPlayer")} fill="none" stroke="#eab308" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="3 2" />
        {/* 유사 AI */}
        <Polyline points={points("similarAI")} fill="none" stroke="#06b6d4" strokeWidth={1.5} strokeOpacity={0.6} />
        {/* 나 */}
        <Polyline points={points("me")} fill="none" stroke="#ffffff" strokeWidth={2} />
        {/* 나 점 */}
        {data.map((d, i) => (
          <Circle key={i} cx={toX(i)} cy={toY(d.me)} r={2.5} fill="#ffffff" />
        ))}
      </Svg>
      <View style={styles.legendRow}>
        <View style={styles.legend}>
          <View style={[styles.legendLine, { backgroundColor: "#ffffff" }]} />
          <Text style={styles.legendText}>나</Text>
        </View>
        <View style={styles.legend}>
          <View style={[styles.legendLine, { backgroundColor: palette.cyan[400] }]} />
          <Text style={styles.legendText}>유사 AI</Text>
        </View>
        <View style={styles.legend}>
          <View style={[styles.legendLine, { backgroundColor: palette.yellow[400], opacity: 0.6 }]} />
          <Text style={styles.legendText}>최고 투자자</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { backgroundColor: "#111111", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  title: { fontSize: 10, color: palette.gray[500], marginBottom: 8, fontWeight: "600" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 },
  legend: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendLine: { width: 12, height: 2, borderRadius: 2 },
  legendText: { fontSize: 9, color: palette.gray[400] },
})
