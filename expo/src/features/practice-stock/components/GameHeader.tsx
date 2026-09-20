import { useEffect, useRef, useState } from "react"
import { Animated, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ChevronRight } from "lucide-react-native"
import { Gradient } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import type { GameHeaderProps } from "../types"

export const GameHeader = ({
  currentDay,
  totalDays,
  totalValue,
  profitRate,
  aiEmoji,
  aiProfitRate,
  nextReportDay,
  bestAIProfitRate,
  onExitClick,
  onProfitClick,
}: GameHeaderProps) => {
  const insets = useSafeAreaInsets()
  const gapToBest = Number((profitRate - bestAIProfitRate).toFixed(1))
  const gapToSimilar = Number((profitRate - aiProfitRate).toFixed(1))
  const daysUntilReport = nextReportDay - currentDay

  // 자산 변동 시 펄스 애니메이션
  const prevAssetRef = useRef(totalValue)
  const [assetPulse, setAssetPulse] = useState<"up" | "down" | null>(null)
  const pulse = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (totalValue !== prevAssetRef.current) {
      setAssetPulse(totalValue > prevAssetRef.current ? "up" : "down")
      prevAssetRef.current = totalValue
      pulse.setValue(1.06)
      Animated.timing(pulse, { toValue: 1, duration: 400, useNativeDriver: true }).start()
      const t = setTimeout(() => setAssetPulse(null), 500)
      return () => clearTimeout(t)
    }
  }, [totalValue, pulse])

  const progress = totalDays > 0 ? Math.min((currentDay / totalDays) * 100, 100) : 0

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* 진행도 바 (최상단, 얇게) */}
      <View style={styles.progressTrack}>
        <Gradient
          dir="r"
          colors={[palette.blue[500], palette.cyan[400], palette.blue[500]]}
          style={[styles.progressFill, { width: `${progress}%` }]}
        />
      </View>

      <View style={styles.body}>
        {/* 1행: 총 자산 (크게 강조) + 종료 */}
        <View style={styles.topRow}>
          <Pressable onPress={onProfitClick} style={({ pressed }) => [styles.assetBtn, pressed && { opacity: 0.7 }]}>
            <View style={styles.assetLine}>
              <Text style={styles.moodEmoji}>
                {profitRate >= 10 ? "🤩" : profitRate >= 3 ? "😎" : profitRate >= 0 ? "😊" : profitRate >= -3 ? "😐" : profitRate >= -10 ? "😰" : "😱"}
              </Text>
              <Animated.View style={{ transform: [{ scale: assetPulse ? pulse : 1 }] }}>
                <Text style={styles.assetValue}>
                  {formatNumber(totalValue)}
                  <Text style={styles.assetUnit}>원</Text>
                </Text>
              </Animated.View>
              <Text style={[styles.profitRate, { color: profitRate >= 0 ? palette.red[400] : palette.blue[400] }]}>
                {profitRate >= 0 ? "+" : ""}
                {profitRate}%
              </Text>
            </View>
            <ChevronRight size={16} color={palette.gray[600]} style={{ marginTop: 4 }} />
          </Pressable>

          <Pressable onPress={onExitClick} style={({ pressed }) => [styles.exitBtn, pressed && { backgroundColor: palette.gray[700] }]}>
            <Text style={styles.exitText}>✕</Text>
          </Pressable>
        </View>

        {/* 2행: AI 비교 - 이모지 중심 카드 */}
        <View style={styles.aiRow}>
          {/* 유사 AI */}
          <View style={styles.aiCard}>
            <Text style={styles.aiEmoji}>{aiEmoji}</Text>
            <View style={styles.aiValues}>
              <Text style={[styles.aiRate, { color: aiProfitRate >= 0 ? palette.red[400] : palette.blue[400] }]}>
                {aiProfitRate >= 0 ? "+" : ""}
                {aiProfitRate.toFixed(1)}%
              </Text>
              <Text style={[styles.aiGap, { color: gapToSimilar >= 0 ? palette.green[400] : palette.purple[400] }]}>
                {gapToSimilar >= 0 ? "▲" : "▼"}
                {Math.abs(gapToSimilar)}
              </Text>
            </View>
          </View>

          {/* 최고 AI */}
          <View style={styles.aiCard}>
            <Text style={styles.aiEmoji}>👑</Text>
            <View style={styles.aiValues}>
              <Text style={[styles.aiRate, { color: bestAIProfitRate >= 0 ? palette.red[400] : palette.blue[400] }]}>
                {bestAIProfitRate >= 0 ? "+" : ""}
                {bestAIProfitRate.toFixed(1)}%
              </Text>
              <Text style={[styles.aiGap, { color: gapToBest >= 0 ? palette.green[400] : palette.orange[400] }]}>
                {gapToBest >= 0 ? "▲" : "▼"}
                {Math.abs(gapToBest)}
              </Text>
            </View>
          </View>
        </View>

        {/* 다음 분석 일정 (있을 때만, 작게) */}
        {daysUntilReport > 0 && (
          <View style={styles.reportRow}>
            <Text style={styles.reportText}>📊 D-{daysUntilReport}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "rgba(25,25,25,0.97)",
    borderBottomWidth: 1,
    borderBottomColor: alpha(palette.gray[800], 0.5),
    zIndex: 20,
  },
  progressTrack: { width: "100%", height: 3, backgroundColor: palette.gray[800], overflow: "hidden" },
  progressFill: { height: "100%", borderTopRightRadius: 9999, borderBottomRightRadius: 9999 },
  body: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  topRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 },
  assetBtn: { flexDirection: "row", alignItems: "baseline", gap: 8, flexShrink: 1 },
  assetLine: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 2 },
  moodEmoji: { fontSize: 18, color: "#ffffff" },
  assetValue: { fontSize: 24, fontWeight: "900", color: "#ffffff", letterSpacing: -0.4, fontVariant: ["tabular-nums"] },
  assetUnit: { fontSize: 14, fontWeight: "700", color: palette.gray[400] },
  profitRate: { fontSize: 14, fontWeight: "700" },
  exitBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: alpha(palette.gray[800], 0.8) },
  exitText: { fontSize: 11, fontWeight: "700", color: palette.gray[500] },
  aiRow: { flexDirection: "row", gap: 8 },
  aiCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: alpha(palette.gray[800], 0.5),
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
  },
  aiEmoji: { fontSize: 18, color: "#ffffff" },
  aiValues: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 4 },
  aiRate: { fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  aiGap: { fontSize: 10, fontWeight: "700", fontVariant: ["tabular-nums"] },
  reportRow: { marginTop: 8, alignItems: "center" },
  reportText: { fontSize: 9, fontWeight: "700", color: palette.gray[600], letterSpacing: 0.5, fontVariant: ["tabular-nums"] },
})
