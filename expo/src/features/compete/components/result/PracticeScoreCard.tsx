import { StyleSheet, Text, View } from "react-native"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { gradeStyle } from "../../utils/gradeStyles"

interface PracticeScoreCardProps {
  variant: "stock" | "wave"
  totalScore: number
  maxScore: number
  grade: string
  avgTurn: string
  highlight: string
}

/** 최종 점수 카드 — 한종목(#111 단색) / 파도(청록 그라데이션 + 🌊) */
export function PracticeScoreCard({ variant, totalScore, maxScore, grade, avgTurn, highlight }: PracticeScoreCardProps) {
  const isWave = variant === "wave"
  const pct = (totalScore / maxScore) * 100
  const g = gradeStyle(grade)
  const barColors =
    pct >= 85
      ? isWave
        ? [palette.cyan[400], palette.blue[400]]
        : [palette.yellow[400], palette.orange[400]]
      : pct >= 70
        ? [palette.green[400], palette.emerald[500]]
        : pct >= 55
          ? [palette.blue[400], palette.indigo[500]]
          : [palette.gray[500], palette.gray[600]]

  return (
    <Gradient
      dir="br"
      colors={isWave ? ["#0a1319", "#0d1a22"] : ["#111111", "#111111"]}
      style={[styles.card, { borderColor: isWave ? alpha(palette.cyan[500], 0.2) : alpha("#ffffff", 0.05) }]}
    >
      {isWave && <Text style={styles.bgEmoji}>🌊</Text>}
      <Text style={styles.label}>최종 점수</Text>
      <Text style={styles.score}>
        {totalScore}
        <Text style={styles.max}>/{maxScore}</Text>
      </Text>
      <View style={styles.track}>
        <Gradient dir="r" colors={barColors} style={{ height: "100%", borderRadius: 9999, width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </View>
      <View style={styles.gradeRow}>
        <View style={[styles.gradeBox, { backgroundColor: g.bg, borderColor: g.border }]}>
          <Text style={{ fontSize: 20, fontWeight: "900", color: g.text }}>{grade}</Text>
        </View>
        <Text style={{ color: palette.gray[400], fontSize: 14 }}>턴 평균 {avgTurn}점</Text>
      </View>
      <Text style={[styles.highlight, { color: isWave ? palette.cyan[300] : palette.gray[300] }]}>{highlight}</Text>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 24, borderWidth: 1, alignItems: "center", marginBottom: 16, overflow: "hidden" },
  bgEmoji: { position: "absolute", top: -16, right: -16, fontSize: 96, opacity: 0.05, color: "#ffffff" },
  label: { fontSize: 14, color: palette.gray[500], marginBottom: 4 },
  score: { fontSize: 60, lineHeight: 66, fontWeight: "900", color: "#ffffff" },
  max: { fontSize: 20, color: palette.gray[600] },
  track: { marginTop: 12, height: 12, alignSelf: "stretch", marginHorizontal: 16, backgroundColor: alpha("#ffffff", 0.1), borderRadius: 9999, overflow: "hidden" },
  gradeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 },
  gradeBox: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  highlight: { fontSize: 14, marginTop: 12, fontWeight: "600", textAlign: "center" },
})
