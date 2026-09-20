import { useState, type ReactNode } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown, ChevronUp, Target, User } from "lucide-react-native"
import { FadeUp, Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import { LABELS } from "@/features/practice-stock/config"
import type { GapRecord } from "@/features/practice-stock/hooks/useAICompetitor"
import { GapMiniChart } from "./GapMiniChart"
import { rateColor } from "./helpers"

interface GapAnalysisCardProps {
  profitRate: number
  profitAmount: number
  aiName: string
  aiEmoji: string
  aiProfitRate: number
  aiProfitAmount: number
  bestAIEmoji: string
  bestAIProfitRate: number
  bestAIProfitAmount: number
  gapHistory: GapRecord[]
}

function Column({ bg, border, avatarColor, avatar, title, titleColor, rate, rateText, amount }: {
  bg: string; border: string; avatarColor: string; avatar: ReactNode
  title: string; titleColor: string; rate: number; rateText: string; amount: number
}) {
  return (
    <View style={[styles.col, { backgroundColor: bg, borderColor: border }]}>
      <View style={[styles.avatar, { backgroundColor: alpha(avatarColor, 0.2), borderColor: alpha(avatarColor, 0.3) }]}>{avatar}</View>
      <Text style={[styles.colTitle, { color: titleColor }]} numberOfLines={1}>{title}</Text>
      <Text style={[styles.colRate, { color: rateColor(rate >= 0) }]}>{rateText}</Text>
      <Text style={styles.colAmount}>{formatNumber(amount)}원</Text>
    </View>
  )
}

// ── 3-way 갭 분석 카드 ──
export function GapAnalysisCard({
  profitRate, profitAmount, aiName, aiEmoji, aiProfitRate, aiProfitAmount,
  bestAIEmoji, bestAIProfitRate, bestAIProfitAmount, gapHistory,
}: GapAnalysisCardProps) {
  const [showGapDetail, setShowGapDetail] = useState(true)

  const isProfit = profitRate >= 0
  const isAiProfit = aiProfitRate >= 0
  const isBestAiProfit = bestAIProfitRate >= 0
  const userWinningSimilar = profitRate >= aiProfitRate
  const userWinningBest = profitRate >= bestAIProfitRate
  const diffSimilar = Math.abs(profitRate - aiProfitRate).toFixed(1)
  const diffBest = Math.abs(profitRate - bestAIProfitRate).toFixed(1)
  const neutralBg = alpha(palette.gray[700], 0.3)
  const neutralBorder = alpha(palette.gray[600], 0.3)

  return (
    <Gradient dir="b" colors={[alpha(palette.gray[800], 0.8), alpha(palette.gray[900], 0.8)]} style={styles.card}>
      <Pressable onPress={() => setShowGapDetail(!showGapDetail)} style={styles.toggle}>
        <View style={styles.toggleLeft}>
          <Target size={16} color={palette.yellow[400]} />
          <Text style={styles.toggleTitle}>{LABELS.daySummary.gapAnalysisTitle}</Text>
        </View>
        {showGapDetail ? <ChevronUp size={16} color={palette.gray[500]} /> : <ChevronDown size={16} color={palette.gray[500]} />}
      </Pressable>

      {showGapDetail && (
        <FadeUp duration={200} distance={-8} style={styles.detail}>
          {/* 3열 비교 */}
          <View style={styles.grid}>
            <Column
              bg={alpha(palette.blue[500], 0.1)} border={alpha(palette.blue[500], 0.2)}
              avatarColor={palette.blue[500]} avatar={<User size={16} color={palette.blue[400]} />}
              title="나" titleColor={palette.blue[400]}
              rate={profitRate} rateText={`${isProfit ? "+" : ""}${profitRate}%`} amount={profitAmount}
            />
            <Column
              bg={userWinningSimilar ? neutralBg : alpha(palette.purple[500], 0.1)}
              border={userWinningSimilar ? neutralBorder : alpha(palette.purple[500], 0.2)}
              avatarColor={palette.purple[500]} avatar={<Text style={styles.avatarEmoji}>{aiEmoji}</Text>}
              title={aiName} titleColor={palette.purple[400]}
              rate={aiProfitRate} rateText={`${isAiProfit ? "+" : ""}${aiProfitRate.toFixed(1)}%`} amount={aiProfitAmount}
            />
            <Column
              bg={userWinningBest ? neutralBg : alpha(palette.yellow[500], 0.1)}
              border={userWinningBest ? neutralBorder : alpha(palette.yellow[500], 0.2)}
              avatarColor={palette.yellow[500]} avatar={<Text style={styles.avatarEmoji}>{bestAIEmoji}</Text>}
              title={LABELS.daySummary.bestAILabel} titleColor={palette.yellow[400]}
              rate={bestAIProfitRate} rateText={`${isBestAiProfit ? "+" : ""}${bestAIProfitRate.toFixed(1)}%`} amount={bestAIProfitAmount}
            />
          </View>

          {/* 갭 차이 요약 */}
          <View style={styles.grid}>
            <View style={styles.gapBox}>
              <Text style={styles.gapLabel}>{LABELS.daySummary.gapToSimilarLabel}</Text>
              <Text style={[styles.gapValue, { color: userWinningSimilar ? palette.green[400] : palette.red[400] }]}>
                {userWinningSimilar ? "+" : "-"}{diffSimilar}%p
              </Text>
              <Text style={styles.gapSub}>{userWinningSimilar ? "앞서는 중" : "뒤처지는 중"}</Text>
            </View>
            <View style={styles.gapBox}>
              <Text style={styles.gapLabel}>{LABELS.daySummary.gapToBestLabel}</Text>
              <Text style={[styles.gapValue, { color: userWinningBest ? palette.green[400] : palette.orange[400] }]}>
                {userWinningBest ? "+" : "-"}{diffBest}%p
              </Text>
              <Text style={styles.gapSub}>{userWinningBest ? "최고 AI 초과!" : "따라잡기 도전"}</Text>
            </View>
          </View>

          {/* 갭 히스토리 미니 차트 */}
          {gapHistory.length >= 2 && (
            <View>
              <Text style={[styles.gapLabel, { marginBottom: 6 }]}>{LABELS.daySummary.gapTrendLabel}</Text>
              <GapMiniChart history={gapHistory} />
              <View style={styles.axis}>
                <Text style={styles.axisText}>과거</Text>
                <Text style={styles.axisText}>현재</Text>
              </View>
            </View>
          )}
        </FadeUp>
      )}
    </Gradient>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, borderColor: alpha(palette.gray[700], 0.5), overflow: "hidden", marginBottom: 12 },
  toggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  toggleTitle: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  detail: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  grid: { flexDirection: "row", gap: 8 },
  col: { flex: 1, borderRadius: 16, padding: 12, borderWidth: 1, alignItems: "center" },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 6, borderWidth: 1 },
  avatarEmoji: { fontSize: 14, color: "#ffffff" },
  colTitle: { fontSize: 9, fontWeight: "700", marginBottom: 4 },
  colRate: { fontSize: 18, lineHeight: 20, fontWeight: "800" },
  colAmount: { fontSize: 9, color: palette.gray[500], marginTop: 4 },
  gapBox: { flex: 1, backgroundColor: alpha(palette.gray[900], 0.5), borderRadius: 12, padding: 10 },
  gapLabel: { fontSize: 9, color: palette.gray[500], marginBottom: 4 },
  gapValue: { fontSize: 14, fontWeight: "800" },
  gapSub: { fontSize: 9, color: palette.gray[600], marginTop: 2 },
  axis: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  axisText: { fontSize: 8, color: palette.gray[600] },
})
