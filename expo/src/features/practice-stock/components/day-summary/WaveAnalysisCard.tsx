import { StyleSheet, Text, View } from "react-native"
import { Waves } from "lucide-react-native"
import { ProgressBar } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { LABELS } from "@/features/practice-stock/config"
import type { WaveAnalysis } from "@/features/practice-stock/hooks/useAICompetitor"

// ── 파도 흐름 분석 ──
export function WaveAnalysisCard({ waveAnalysis, waveComment }: { waveAnalysis: WaveAnalysis; waveComment: string | null }) {
  const trendColor = waveAnalysis.trend === "상승" ? palette.red[400] : waveAnalysis.trend === "하락" ? palette.blue[400] : palette.gray[400]
  const accuracyColor = waveAnalysis.accuracy >= 70 ? palette.green[400] : waveAnalysis.accuracy >= 50 ? palette.yellow[400] : palette.red[400]

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Waves size={16} color={palette.cyan[400]} />
        <Text style={styles.title}>{LABELS.daySummary.waveAnalysisTitle}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.box}>
          <Text style={styles.boxLabel}>파도 방향</Text>
          <Text style={[styles.boxValue, { color: trendColor }]}>
            {waveAnalysis.trend === "상승" ? "↑" : waveAnalysis.trend === "하락" ? "↓" : "→"} {waveAnalysis.trend}
          </Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxLabel}>파도 강도</Text>
          <Text style={[styles.boxValue, { color: palette.yellow[400] }]}>{waveAnalysis.strength}%</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxLabel}>읽기 정확도</Text>
          <Text style={[styles.boxValue, { color: accuracyColor }]}>{waveAnalysis.accuracy}%</Text>
        </View>
      </View>

      {/* 정확도 프로그레스 바 */}
      <ProgressBar value={waveAnalysis.accuracy} height={6} color={accuracyColor} trackColor={palette.gray[700]} style={{ marginBottom: 10 }} />

      <Text style={styles.comment}>{waveAnalysis.comment}</Text>
      {!!waveComment && <Text style={styles.subComment}>{waveComment}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: alpha(palette.gray[800], 0.5),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
    padding: 16,
    marginBottom: 12,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  title: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  grid: { flexDirection: "row", gap: 8, marginBottom: 12 },
  box: { flex: 1, backgroundColor: alpha(palette.gray[900], 0.5), borderRadius: 12, padding: 8, alignItems: "center" },
  boxLabel: { fontSize: 9, color: palette.gray[500], marginBottom: 4 },
  boxValue: { fontSize: 12, fontWeight: "800" },
  comment: { fontSize: 11, lineHeight: 18, color: palette.gray[300] },
  subComment: { fontSize: 10, lineHeight: 16, color: palette.gray[500], marginTop: 4 },
})
