import { StyleSheet, Text, View } from "react-native"
import { TrendingUp } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { CompareBar } from "./gap/CompareBar"
import { InsightCard } from "./gap/InsightCard"
import { StatRow } from "./gap/StatRow"
import { WeeklyGapMini } from "./gap/WeeklyGapMini"
import type { GapAnalysis } from "./gap/types"

interface GapAnalysisSectionProps {
  gapAnalysis: GapAnalysis
  /** Expandable 안에 들어갈 때: 자체 제목을 숨김 */
  embedded?: boolean
}

export function GapAnalysisSection({ gapAnalysis, embedded }: GapAnalysisSectionProps) {
  const { me, bestPlayer, similarAI, weeklyGap, insights } = gapAnalysis
  const maxProfit = Math.max(bestPlayer.profitRate, similarAI.profitRate, me.profitRate) + 5
  const gapToBest = (bestPlayer.profitRate - me.profitRate).toFixed(1)
  const gapToAI = (me.profitRate - similarAI.profitRate).toFixed(1)
  const isAheadOfAI = me.profitRate >= similarAI.profitRate
  const aiTone = isAheadOfAI ? palette.green : palette.cyan

  return (
    <View style={{ marginTop: embedded ? 12 : 24 }}>
      <View style={[{ marginBottom: 12 }, embedded && { display: "none" }]}>
        <Text style={styles.kicker}>▸ GAP ANALYSIS</Text>
        <View style={styles.titleRow}>
          <TrendingUp size={20} color={palette.cyan[400]} />
          <Text style={styles.title}>나의 투자 갭 분석</Text>
        </View>
        <Text style={styles.subtitle}>실전 시뮬레이션 기준 · 방향성 파악</Text>
      </View>

      {/* 수익률 비교 바 */}
      <View style={[styles.panel, { marginBottom: 12 }]}>
        <Text style={styles.panelLabel}>이번 주 수익률 비교</Text>
        <View style={{ gap: 10 }}>
          <CompareBar label="최고 투자자" value={bestPlayer.profitRate} maxValue={maxProfit} colors={[palette.yellow[400], palette.orange[400]]} />
          <CompareBar label={`${similarAI.name} AI`} value={similarAI.profitRate} maxValue={maxProfit} colors={[palette.cyan[400], palette.blue[400]]} />
          <CompareBar label="나" value={me.profitRate} maxValue={maxProfit} colors={[alpha("#ffffff", 0.6), alpha("#ffffff", 0.4)]} isMe />
        </View>

        {/* 갭 요약 */}
        <View style={styles.gapRow}>
          <View style={[styles.gapCell, { backgroundColor: alpha(palette.yellow[500], 0.08), borderColor: alpha(palette.yellow[500], 0.15) }]}>
            <Text style={[styles.gapLabel, { color: alpha(palette.yellow[400], 0.7) }]}>최고 투자자와 갭</Text>
            <Text style={[styles.gapValue, { color: palette.yellow[300] }]}>-{gapToBest}%p</Text>
            <Text style={styles.gapDesc}>{bestPlayer.keyDiff}</Text>
          </View>
          <View style={[styles.gapCell, { backgroundColor: alpha(aiTone[500], 0.08), borderColor: alpha(aiTone[500], 0.15) }]}>
            <Text style={[styles.gapLabel, { color: alpha(palette.cyan[400], 0.7) }]}>유사 AI와 갭</Text>
            <Text style={[styles.gapValue, { color: aiTone[300] }]}>
              {isAheadOfAI ? "+" : ""}
              {gapToAI}%p
            </Text>
            <Text style={styles.gapDesc}>
              {similarAI.label} · {similarAI.strategy}
            </Text>
          </View>
        </View>
      </View>

      {/* 주간 추이 차트 */}
      <WeeklyGapMini data={weeklyGap} />

      {/* 세부 스탯 비교 (나 vs 유사 AI) */}
      <View style={[styles.panel, { marginTop: 12 }]}>
        <View style={styles.statHeader}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#ffffff" }}>세부 스탯 비교</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 10, color: palette.gray[500] }}>나</Text>
            <Text style={{ fontSize: 10, color: palette.gray[600] }}>vs</Text>
            <Text style={{ fontSize: 10, color: palette.cyan[400] }}>
              {similarAI.emoji} {similarAI.name} AI
            </Text>
          </View>
        </View>
        <StatRow label="파도 정확도" me={me.waveAccuracy} other={similarAI.waveAccuracy} />
        <StatRow label="승률" me={me.winRate} other={similarAI.winRate} />
        <StatRow label="평균 보유일" me={me.avgHoldDays} other={similarAI.avgHoldDays} unit="일" last />
      </View>

      {/* 인사이트 & 방향성 */}
      <View style={{ marginTop: 12, gap: 8 }}>
        {insights.map((insight) => (
          <InsightCard key={insight.type} insight={insight} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  kicker: { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: palette.cyan[400], marginBottom: 2 },
  title: { fontSize: 18, fontWeight: "900", color: "#ffffff", letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: palette.gray[400], marginTop: 2 },
  panel: { backgroundColor: "#1a1a1a", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  panelLabel: { fontSize: 12, color: palette.gray[500], marginBottom: 12, fontWeight: "600" },
  gapRow: { flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },
  gapCell: { flex: 1, borderRadius: 12, padding: 10, borderWidth: 1 },
  gapLabel: { fontSize: 10, marginBottom: 2 },
  gapValue: { fontSize: 16, fontWeight: "900" },
  gapDesc: { fontSize: 10, color: palette.gray[500], marginTop: 2 },
  statHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
})
