import { StyleSheet, Text, View } from "react-native"
import { Brain } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { fmtPnl } from "../../utils/format"
import { gradeStyle } from "../../utils/gradeStyles"

interface RoundResult {
  round: number
  score: number
  grade: string
  pnl: number
  emoji: string
}

interface RoundResultListProps {
  variant: "stock" | "wave"
  roundResults: RoundResult[]
  bestRound: number
  totalScore: number
  maxScore: number
}

/** 라운드별 결과 — 한종목(보라) / 파도(청록) 테마 */
export function RoundResultList({ variant, roundResults, bestRound, totalScore, maxScore }: RoundResultListProps) {
  const isWave = variant === "wave"
  const divider = isWave ? alpha("#ffffff", 0.05) : alpha(palette.purple[500], 0.1)
  const accent = isWave ? palette.cyan : palette.purple

  const barColor = (rPct: number) =>
    isWave
      ? rPct >= 80
        ? palette.cyan[500]
        : rPct >= 60
          ? palette.blue[500]
          : rPct >= 40
            ? palette.yellow[500]
            : palette.red[500]
      : rPct >= 80
        ? palette.green[500]
        : rPct >= 60
          ? palette.yellow[500]
          : rPct >= 40
            ? palette.blue[500]
            : palette.red[500]

  return (
    <View style={[styles.wrap, { borderColor: isWave ? alpha("#ffffff", 0.05) : alpha(palette.purple[500], 0.2) }]}>
      <View style={[styles.head, { borderBottomColor: divider }]}>
        <Brain size={20} color={accent[400]} />
        <Text style={{ fontSize: 14, fontWeight: "900", color: accent[300] }}>라운드별 결과</Text>
      </View>

      {roundResults.map((r, idx) => {
        const rPct = (r.score / 20) * 100
        const g = gradeStyle(r.grade)
        return (
          <View key={r.round} style={[styles.item, idx > 0 && { borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) }]}>
            <View style={styles.itemTop}>
              <View style={styles.roundNum}>
                <Text style={{ fontSize: 14, fontWeight: "900", color: palette.gray[400] }}>{r.round}</Text>
              </View>
              <Text style={{ fontSize: 24, color: "#ffffff" }}>{r.emoji}</Text>
              <View style={[styles.gradeBox, { backgroundColor: g.bg, borderColor: g.border }]}>
                <Text style={{ fontSize: 14, fontWeight: "900", color: g.text }}>{r.grade}</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: "900", color: palette.yellow[400] }}>{r.score}점</Text>
              <Text style={{ fontSize: 14, fontWeight: "900", marginLeft: "auto", color: r.pnl >= 0 ? palette.green[400] : palette.red[400] }}>{fmtPnl(r.pnl)}</Text>
            </View>
            <View style={styles.barRow}>
              <View style={{ width: 32 }} />
              <View style={styles.track}>
                <View style={{ height: "100%", borderRadius: 9999, backgroundColor: barColor(rPct), width: `${Math.max(0, Math.min(100, rPct))}%` }} />
              </View>
              <Text style={styles.pct}>{rPct.toFixed(0)}%</Text>
            </View>
            {r.round === bestRound && (
              <Text style={[styles.best, { color: isWave ? palette.cyan[400] : palette.yellow[400] }]}>{isWave ? "🌊 베스트 라운드" : "⭐ 베스트 라운드"}</Text>
            )}
          </View>
        )
      })}

      {/* 총합 */}
      <View style={[styles.total, { borderTopColor: divider, backgroundColor: isWave ? "#0a0a0f" : "#0a0a15" }]}>
        <Text style={{ fontSize: 12, color: palette.gray[500] }}>3라운드 합계</Text>
        <Text style={{ fontSize: 16, fontWeight: "900", color: isWave ? palette.cyan[400] : palette.yellow[400] }}>
          {totalScore}
          <Text style={{ color: palette.gray[600], fontSize: 12 }}>/{maxScore}</Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: "#0f0f0f", borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  head: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  item: { paddingHorizontal: 16, paddingVertical: 16 },
  itemTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  roundNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#1a1a1a", alignItems: "center", justifyContent: "center" },
  gradeBox: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  track: { flex: 1, height: 8, backgroundColor: "#1a1a1a", borderRadius: 9999, overflow: "hidden" },
  pct: { fontSize: 12, color: palette.gray[500], width: 48, textAlign: "right" },
  best: { fontSize: 12, marginTop: 6, marginLeft: 40, fontWeight: "700" },
  total: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
})
