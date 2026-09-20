import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Eye, EyeOff, Waves } from "lucide-react-native"
import { FadeUp, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { LABELS } from "../config"
import type { AIGapFeedbackProps } from "../types"

// ── AI 갭 피드백 배너 (매수/매도 직후 화면 하단에 표시) ──
export const AIGapFeedback = ({
  isVisible,
  userProfitRate,
  bestAIProfitRate,
  similarAIProfitRate,
  bestAIName,
  waveAccuracy,
}: AIGapFeedbackProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const insets = useSafeAreaInsets()
  // 웹: bottom-24 — 앱에서는 하단 고정 바(BottomActionBar) 위에 오도록 safe area 를 더해 배치
  const bottom = 150 + Math.max(12, insets.bottom)

  if (!isVisible) return null

  const gapToBest = Number((userProfitRate - bestAIProfitRate).toFixed(1))
  const gapToSimilar = Number((userProfitRate - similarAIProfitRate).toFixed(1))

  if (collapsed) {
    return (
      <View style={[styles.collapsedWrap, { bottom }]}>
        <PressableScale onPress={() => setCollapsed(false)} scaleTo={0.95} style={styles.collapsedBtn}>
          <Eye size={12} color={palette.cyan[400]} />
          <Text style={styles.collapsedText}>{LABELS.aiGapFeedback.showLabel}</Text>
        </PressableScale>
      </View>
    )
  }

  const accuracyColor = waveAccuracy >= 70 ? palette.green[400] : waveAccuracy >= 50 ? palette.yellow[400] : palette.red[400]

  return (
    <FadeUp duration={300} distance={8} style={[styles.wrap, { bottom }]}>
      <View style={styles.card}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Waves size={14} color={palette.cyan[400]} />
            <Text style={styles.title}>{LABELS.aiGapFeedback.title}</Text>
          </View>
          <Pressable onPress={() => setCollapsed(true)} hitSlop={8} style={styles.hideBtn}>
            <EyeOff size={12} color={palette.gray[500]} />
            <Text style={styles.hideText}>{LABELS.aiGapFeedback.hideLabel}</Text>
          </Pressable>
        </View>

        {/* 갭 수치 */}
        <View style={styles.grid}>
          {/* 나 */}
          <View style={[styles.cell, { backgroundColor: alpha(palette.blue[500], 0.1), borderColor: alpha(palette.blue[500], 0.2) }]}>
            <Text style={styles.cellLabel}>나</Text>
            <Text style={[styles.cellValue, { color: userProfitRate >= 0 ? palette.red[400] : palette.blue[400] }]}>
              {userProfitRate >= 0 ? "+" : ""}
              {userProfitRate.toFixed(1)}%
            </Text>
          </View>

          {/* 유사 AI 갭 */}
          <View style={[styles.cell, { backgroundColor: alpha(palette.purple[500], 0.1), borderColor: alpha(palette.purple[500], 0.2) }]}>
            <Text style={styles.cellLabel} numberOfLines={1}>
              {LABELS.aiGapFeedback.similarAIGap}
            </Text>
            <Text style={[styles.cellValue, { color: gapToSimilar >= 0 ? palette.green[400] : palette.orange[400] }]}>
              {gapToSimilar >= 0 ? "+" : ""}
              {gapToSimilar}%p
            </Text>
          </View>

          {/* 최고 AI 갭 */}
          <View style={[styles.cell, { backgroundColor: alpha(palette.yellow[500], 0.1), borderColor: alpha(palette.yellow[500], 0.2) }]}>
            <Text style={styles.cellLabel} numberOfLines={1}>
              {LABELS.aiGapFeedback.bestAIGap}
            </Text>
            <Text style={[styles.cellValue, { color: gapToBest >= 0 ? palette.green[400] : palette.red[400] }]}>
              {gapToBest >= 0 ? "+" : ""}
              {gapToBest}%p
            </Text>
          </View>
        </View>

        {/* 파도 읽기 정확도 */}
        {waveAccuracy > 0 && (
          <View style={styles.accuracyRow}>
            <Text style={styles.accuracyLabel}>{LABELS.aiGapFeedback.waveAccuracy}</Text>
            <View style={styles.accuracyTrack}>
              <View style={[styles.accuracyFill, { width: `${Math.min(waveAccuracy, 100)}%`, backgroundColor: accuracyColor }]} />
            </View>
            <Text style={[styles.accuracyValue, { color: accuracyColor }]}>{waveAccuracy}%</Text>
          </View>
        )}

        {/* 따라하기 팁 */}
        <Text style={styles.tip}>
          {gapToBest < -5
            ? `💡 ${bestAIName}의 매매 패턴을 따라해 보세요`
            : gapToBest >= 0
              ? "🎉 최고 AI를 앞서고 있습니다!"
              : `📈 ${Math.abs(gapToBest).toFixed(1)}%p 차이 — 조금만 더!`}
        </Text>
      </View>
    </FadeUp>
  )
}

const styles = StyleSheet.create({
  collapsedWrap: { position: "absolute", bottom: 96, right: 16, zIndex: 30 },
  collapsedBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: alpha(palette.gray[800], 0.95),
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.5),
    borderRadius: 9999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  collapsedText: { fontSize: 10, fontWeight: "700", color: palette.gray[300] },
  wrap: { position: "absolute", bottom: 96, left: 16, right: 16, zIndex: 30 },
  card: {
    backgroundColor: alpha(palette.gray[900], 0.97),
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.6),
    borderRadius: 16,
    padding: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 11, fontWeight: "700", color: "#ffffff" },
  hideBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  hideText: { fontSize: 9, color: palette.gray[500] },
  grid: { flexDirection: "row", gap: 8 },
  cell: { flex: 1, borderRadius: 12, padding: 8, alignItems: "center", borderWidth: 1 },
  cellLabel: { fontSize: 8, color: palette.gray[500], marginBottom: 2 },
  cellValue: { fontSize: 14, fontWeight: "800" },
  accuracyRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  accuracyLabel: { fontSize: 9, color: palette.gray[500] },
  accuracyTrack: { flex: 1, height: 4, borderRadius: 9999, backgroundColor: palette.gray[700], overflow: "hidden" },
  accuracyFill: { height: 4, borderRadius: 9999 },
  accuracyValue: { fontSize: 9, fontWeight: "700" },
  tip: { marginTop: 8, fontSize: 9, color: palette.gray[500], textAlign: "center" },
})
