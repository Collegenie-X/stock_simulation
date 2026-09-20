import { useState } from "react"
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ChevronDown, ChevronRight, ChevronUp, Swords } from "lucide-react-native"
import { FadeUp, Gradient, Pop, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { LABELS } from "@/features/practice-stock/config"
import type { AIAction, InvestStyle, GapRecord, WaveAnalysis, StockCompareResult } from "@/features/practice-stock/hooks/useAICompetitor"
import { AIStrategyCard } from "./day-summary/AIStrategyCard"
import { GapAnalysisCard } from "./day-summary/GapAnalysisCard"
import { StockCompareCard } from "./day-summary/StockCompareCard"
import { VersusCard } from "./day-summary/VersusCard"
import { WaveAnalysisCard } from "./day-summary/WaveAnalysisCard"
import { generateBattleComment, generateTip, generateWaveComment } from "./day-summary/helpers"

// ── Props ─────────────────────────────────────────────────
export interface DaySummaryOverlayProps {
  isVisible: boolean
  currentDay: number
  currentDayName: string
  // 유저 데이터
  totalValue: number
  initialValue: number
  profitRate: number
  totalDecisions: number
  holdingsCount: number
  // 성향 유사 AI 대결 데이터
  aiName: string
  aiEmoji: string
  aiStyle: InvestStyle
  aiDescription: string
  aiMotto: string
  aiTotalValue: number
  aiProfitRate: number
  aiTodayActions: AIAction[]
  aiHoldingsCount: number
  aiTotalTrades: number
  // 최고 AI 데이터
  bestAIName: string
  bestAIEmoji: string
  bestAITotalValue: number
  bestAIProfitRate: number
  // 갭 분석 데이터
  gapHistory: GapRecord[]
  waveAnalysis?: WaveAnalysis
  // 종목별 3자 비교 (같은 종목, 다른 선택)
  stockCompareResults?: StockCompareResult[]
  // 이벤트
  onContinue: () => void
}

// ── 컴포넌트 ───────────────────────────────────────────────
export const DaySummaryOverlay = ({
  isVisible,
  currentDay,
  currentDayName,
  totalValue,
  initialValue,
  profitRate,
  totalDecisions,
  holdingsCount,
  aiName,
  aiEmoji,
  aiStyle,
  aiDescription,
  aiMotto,
  aiTotalValue,
  aiProfitRate,
  aiTodayActions,
  aiHoldingsCount,
  aiTotalTrades,
  bestAIName,
  bestAIEmoji,
  bestAITotalValue,
  bestAIProfitRate,
  gapHistory,
  waveAnalysis,
  stockCompareResults = [],
  onContinue,
}: DaySummaryOverlayProps) => {
  const [showStockCompare, setShowStockCompare] = useState(true)
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  if (!isVisible) return null

  const profitAmount = totalValue - initialValue
  const aiProfitAmount = aiTotalValue - initialValue
  const bestAIProfitAmount = bestAITotalValue - initialValue

  const battleComment = generateBattleComment(profitRate, aiProfitRate, aiName)
  const tip = generateTip(aiStyle, profitRate)

  const latestGap = gapHistory[gapHistory.length - 1]
  const waveComment = waveAnalysis ? generateWaveComment(waveAnalysis, latestGap?.gapToBest ?? 0) : null

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View style={[styles.backdrop, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Pop duration={500} style={[styles.container, { maxHeight: height * 0.9 }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
            {/* ── 헤더 ── */}
            <View style={styles.header}>
              <Gradient dir="br" colors={[palette.orange[400], palette.rose[500]]} style={styles.headerIcon}>
                <Text style={styles.headerEmoji}>🌅</Text>
              </Gradient>
              <Text style={styles.headerTitle}>
                {currentDay}{LABELS.daySummary.dayEnd}
              </Text>
              <Text style={styles.headerSub}>{currentDayName}</Text>
            </View>

            {/* ── 3-way 갭 분석 카드 ── */}
            <GapAnalysisCard
              profitRate={profitRate}
              profitAmount={profitAmount}
              aiName={aiName}
              aiEmoji={aiEmoji}
              aiProfitRate={aiProfitRate}
              aiProfitAmount={aiProfitAmount}
              bestAIEmoji={bestAIEmoji}
              bestAIProfitRate={bestAIProfitRate}
              bestAIProfitAmount={bestAIProfitAmount}
              gapHistory={gapHistory}
            />

            {/* ── 종목별 3자 비교 (같은 종목, 다른 선택) ── */}
            {stockCompareResults.length > 0 && (
              <View style={styles.compareCard}>
                <Pressable onPress={() => setShowStockCompare(!showStockCompare)} style={styles.compareToggle}>
                  <View style={styles.compareLeft}>
                    <Swords size={16} color={palette.cyan[400]} />
                    <Text style={styles.compareTitle}>같은 종목 — 다른 선택 비교</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{stockCompareResults.length}종목</Text>
                    </View>
                  </View>
                  {showStockCompare
                    ? <ChevronUp size={16} color={palette.gray[500]} />
                    : <ChevronDown size={16} color={palette.gray[500]} />}
                </Pressable>

                {showStockCompare && (
                  <FadeUp duration={200} distance={-8} style={styles.compareList}>
                    {stockCompareResults.map((r, i) => (
                      <StockCompareCard key={r.stockId + i} result={r} aiName={aiName} aiEmoji={aiEmoji} bestAIName={bestAIName} bestAIEmoji={bestAIEmoji} />
                    ))}
                  </FadeUp>
                )}
              </View>
            )}

            {/* ── 파도 흐름 분석 ── */}
            {waveAnalysis && <WaveAnalysisCard waveAnalysis={waveAnalysis} waveComment={waveComment} />}

            {/* ── VS 대결 카드 (유사 AI) ── */}
            <VersusCard
              profitRate={profitRate}
              totalValue={totalValue}
              profitAmount={profitAmount}
              holdingsCount={holdingsCount}
              totalDecisions={totalDecisions}
              aiName={aiName}
              aiEmoji={aiEmoji}
              aiProfitRate={aiProfitRate}
              aiTotalValue={aiTotalValue}
              aiProfitAmount={aiProfitAmount}
              aiHoldingsCount={aiHoldingsCount}
              aiTotalTrades={aiTotalTrades}
            />

            {/* ── AI 전략 & 오늘의 행동 ── */}
            <AIStrategyCard
              aiName={aiName}
              aiStyle={aiStyle}
              aiDescription={aiDescription}
              aiMotto={aiMotto}
              aiTodayActions={aiTodayActions}
            />

            {/* ── 분석 코멘트 ── */}
            <View style={styles.analysis}>
              <Text style={styles.analysisTitle}>{LABELS.daySummary.analysisTitle}</Text>
              <View style={{ gap: 8 }}>
                <View style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: palette.yellow[400] }]} />
                  <Text style={styles.bulletText}>{battleComment}</Text>
                </View>
                <View style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: palette.purple[400] }]} />
                  <Text style={styles.bulletText}>{tip}</Text>
                </View>
                {waveAnalysis && (
                  <View style={styles.bulletRow}>
                    <View style={[styles.bullet, { backgroundColor: palette.cyan[400] }]} />
                    <Text style={styles.bulletText}>
                      파도 읽기 정확도 {waveAnalysis.accuracy}% —{" "}
                      {waveAnalysis.accuracy >= 70
                        ? "파도의 흐름을 잘 읽고 있습니다! 계속 연습하세요."
                        : waveAnalysis.accuracy >= 50
                        ? "파도를 어느 정도 읽고 있습니다. 더 연습하면 좋아질 거예요."
                        : "파도 읽기 연습이 필요합니다. AI의 매매 패턴을 따라해 보세요."}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ── 다음 날 버튼 ── */}
            <PressableScale onPress={onContinue} scaleTo={0.98}>
              <Gradient dir="r" colors={[palette.gray[700], palette.gray[600]]} style={styles.continueButton}>
                <Text style={styles.continueText}>분석 확인 완료 - 다음 날 시작</Text>
                <ChevronRight size={20} color="#ffffff" />
              </Gradient>
            </PressableScale>
          </ScrollView>
        </Pop>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.92)", paddingHorizontal: 16 },
  container: { width: "100%", maxWidth: 448 },
  header: { alignItems: "center", marginBottom: 20 },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    boxShadow: "0 10px 15px rgba(249,115,22,0.3)",
  },
  headerEmoji: { fontSize: 24, color: "#ffffff" },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#ffffff", letterSpacing: -0.4 },
  headerSub: { fontSize: 14, color: palette.gray[400], marginTop: 2 },
  compareCard: {
    backgroundColor: alpha(palette.gray[800], 0.5),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
    overflow: "hidden",
    marginBottom: 12,
  },
  compareToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  compareLeft: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  compareTitle: { fontSize: 12, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  countBadge: { backgroundColor: alpha(palette.gray[700], 0.5), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  countText: { fontSize: 9, color: palette.gray[500] },
  compareList: { paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  analysis: {
    backgroundColor: alpha(palette.gray[800], 0.4),
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
    marginBottom: 16,
  },
  analysisTitle: { fontSize: 12, fontWeight: "700", color: palette.gray[400], marginBottom: 10 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bullet: { width: 4, height: 4, borderRadius: 2, marginTop: 8 },
  bulletText: { flex: 1, fontSize: 12, lineHeight: 19, color: palette.gray[300] },
  continueButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 10px 15px rgba(0,0,0,0.3)",
  },
  continueText: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
})
