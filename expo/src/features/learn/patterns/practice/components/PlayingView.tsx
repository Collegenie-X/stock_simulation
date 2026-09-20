import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Package, X } from "lucide-react-native"
import { Screen } from "@/components/layout"
import { Pulse } from "@/components/ui"
import { GameActionBar, RatioModal } from "@/components/game/GamePlayUI"
import { formatNumber } from "@/lib/format"
import { alpha, layout, palette } from "@/theme"
import type { PatternPracticeGame } from "../hooks/usePatternPracticeGame"
import { fmtPnl } from "../utils/format"
import { ExitDialog } from "./ExitDialog"
import { FeedbackOverlay } from "./FeedbackOverlay"
import { InGameHistory } from "./InGameHistory"
import { LineChart } from "./LineChart"

interface Props {
  game: PatternPracticeGame
  displayEmoji: string
  displayName: string
  onConfirmExit: () => void
}

export function PlayingView({ game, displayEmoji, displayName, onConfirmExit }: Props) {
  const insets = useSafeAreaInsets()
  const {
    scenario,
    gamePhase,
    currentRound,
    currentTurn,
    turnsPerRound,
    decisionTimers,
    isBasicStrategy,
    streak,
    totalScore,
    visibleCount,
    buyIndices,
    sellIndices,
    pnl,
    totalValue,
    cashRemaining,
    sharesHeld,
    avgCostBasis,
    currentPrice,
    turnHistory,
    feedback,
    timer,
    timerExpired,
    pendingAction,
    setPendingAction,
    handleDecision,
    showExitDialog,
    setShowExitDialog,
  } = game

  if (!scenario) return null
  const decSecs = decisionTimers[currentRound] ?? 15
  const isDeciding = gamePhase === "deciding"
  const isFeedback = gamePhase === "feedback"
  const isRevealing = gamePhase === "revealing"
  const isClosing = gamePhase === "closing"
  const pnlColor = pnl > 0 ? palette.green[400] : pnl < 0 ? palette.red[400] : palette.gray[400]
  const accent = isBasicStrategy ? palette.emerald : palette.indigo
  const maxBuyQty = currentPrice > 0 ? Math.floor(cashRemaining / currentPrice) : 0
  const stockPct = totalValue > 0 ? Math.round(((sharesHeld * currentPrice) / totalValue) * 100) : 0

  const portfolioTint =
    pnl > 0
      ? { backgroundColor: alpha(palette.green[500], 0.08), borderColor: alpha(palette.green[500], 0.2) }
      : pnl < 0
        ? { backgroundColor: alpha(palette.red[500], 0.08), borderColor: alpha(palette.red[500], 0.2) }
        : { backgroundColor: "#111111", borderColor: alpha("#ffffff", 0.05) }

  return (
    <Screen
      bg="#000000"
      withHeader
      safeBottom={false}
      contentStyle={{ paddingHorizontal: 16, paddingBottom: 200 + insets.bottom }}
      fixed={
        <>
          {/* Game Header */}
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Pressable
                  onPress={() => setShowExitDialog(true)}
                  accessibilityLabel="게임 종료"
                  hitSlop={6}
                  style={({ pressed }) => [styles.closeBtn, pressed && { backgroundColor: alpha(palette.red[500], 0.3) }]}
                >
                  <X size={16} color={palette.gray[400]} />
                </Pressable>
                <Text style={styles.headerEmoji}>{displayEmoji}</Text>
                <Text style={styles.headerTitle}>
                  R{currentRound + 1} · 턴 {currentTurn + 1}/{turnsPerRound}
                </Text>
              </View>
              <View style={styles.headerRight}>
                {streak >= 2 && (
                  <Pulse>
                    <Text style={styles.streak}>🔥{streak}</Text>
                  </Pulse>
                )}
                <View style={styles.scorePill}>
                  <Text style={styles.scoreText}>{totalScore}점</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 하단 컨트롤 - 공통 GameActionBar + RatioModal (패턴: 15초) */}
          {(isDeciding || isRevealing || isClosing) && (
            <View style={styles.bottom}>
              {isRevealing && (
                <View style={[styles.status, { paddingBottom: 8 + insets.bottom }]}>
                  <Pulse>
                    <Text style={[styles.statusText, { color: palette.gray[500] }]}>📈 차트 그리는 중...</Text>
                  </Pulse>
                </View>
              )}
              {isClosing && (
                <View style={[styles.status, { paddingBottom: 8 + insets.bottom }]}>
                  <Pulse>
                    <Text style={[styles.statusText, { color: palette.purple[400] }]}>⚡ 결과 집계 중...</Text>
                  </Pulse>
                </View>
              )}
              {isDeciding && timerExpired && (
                <View style={styles.expired}>
                  <Pulse>
                    <Text style={styles.expiredText}>⏰ 시간 초과! 선택해주세요!</Text>
                  </Pulse>
                </View>
              )}
              {isDeciding && (
                <>
                  {/* 비율 선택 모달 - 공통 컴포넌트 */}
                  <RatioModal
                    mode={pendingAction}
                    price={currentPrice}
                    cash={cashRemaining}
                    holdings={sharesHeld}
                    avgPrice={avgCostBasis}
                    stockName={displayName}
                    hint={scenario?.hint}
                    onSelect={(ratio) => {
                      handleDecision(pendingAction === "buy" ? "buy" : "sell", ratio)
                      setPendingAction(null)
                    }}
                    onClose={() => setPendingAction(null)}
                  />
                  {/* 타이머 + 액션 버튼 - 공통 컴포넌트 (패턴: 15초) */}
                  <GameActionBar
                    timer={timer}
                    timerSec={decSecs}
                    hasFeedback={isFeedback}
                    canBuy={cashRemaining >= currentPrice}
                    canSell={sharesHeld > 0}
                    onBuy={() => setPendingAction("buy")}
                    onSell={() => setPendingAction("sell")}
                    onHold={() => handleDecision("skip", 0)}
                    labels={{ buy: "🛒 살래", sell: "💸 팔래", hold: "⏸️ 기다릴게" }}
                    subLabels={{
                      buy: maxBuyQty > 0 ? `최대 ${formatNumber(maxBuyQty)}주` : "현금 부족",
                      sell: sharesHeld > 0 ? `보유 ${formatNumber(sharesHeld)}주` : "보유 없음",
                      hold: "이번 턴 패스",
                    }}
                  />
                </>
              )}
            </View>
          )}

          {/* Feedback overlay */}
          {isFeedback && !!feedback && <FeedbackOverlay feedback={feedback} />}

          <ExitDialog visible={showExitDialog} onConfirm={onConfirmExit} onCancel={() => setShowExitDialog(false)} />
        </>
      }
    >
      {/* Turn progress */}
      <View style={styles.progress}>
        {Array.from({ length: turnsPerRound }).map((_, i) => {
          const isCurrent = i === currentTurn
          const color = i < currentTurn ? accent[500] : isCurrent ? (isDeciding ? palette.yellow[400] : accent[400]) : "#1a1a1a"
          const bar = <View style={[styles.progressBar, { backgroundColor: color }]} />
          return isCurrent && isDeciding ? (
            <Pulse key={i} style={{ flex: 1 }}>
              {bar}
            </Pulse>
          ) : (
            <View key={i} style={{ flex: 1 }}>
              {bar}
            </View>
          )
        })}
      </View>

      {/* Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartInner}>
          <LineChart candles={scenario.candles} visibleCount={visibleCount} buyTurns={buyIndices} sellTurns={sellIndices} />
        </View>
      </View>

      {/* ── Portfolio Card ── */}
      <View style={[styles.portfolio, portfolioTint]}>
        {/* 총 자산 + 손익 */}
        <View style={styles.portfolioTop}>
          <View>
            <Text style={styles.tinyLabel}>총 자산</Text>
            <Text style={styles.bigValue}>{formatNumber(totalValue)}원</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.tinyLabel}>손익</Text>
            <Text style={[styles.bigValue, { color: pnlColor }]}>{fmtPnl(pnl)}</Text>
          </View>
        </View>
        {/* 주식 vs 현금 비중 — 팔 수 있는 양이 한눈에 */}
        <View style={styles.mixRow}>
          <Text style={[styles.mixLabel, { color: palette.indigo[300] }]}>📦 주식 {stockPct}%</Text>
          <View style={styles.mixTrack}>
            <View style={{ width: `${stockPct}%`, height: "100%", backgroundColor: palette.indigo[400], borderRadius: 9999 }} />
          </View>
          <Text style={[styles.mixLabel, { color: palette.gray[400] }]}>💵 현금 {100 - stockPct}%</Text>
        </View>

        {/* 현금 + 주식 + 현재가 */}
        <View style={styles.portfolioGrid}>
          <View style={styles.cell}>
            <Text style={[styles.cellLabel, { marginBottom: 2 }]}>💵 현금</Text>
            <Text style={styles.cellValue}>{formatNumber(cashRemaining)}원</Text>
          </View>
          <View style={[styles.cell, styles.cellDivider]}>
            <View style={styles.cellLabelRow}>
              <Package size={10} color={palette.indigo[400]} />
              <Text style={styles.cellLabel}>보유 주식</Text>
            </View>
            <Text style={[styles.sharesValue, sharesHeld >= 10000 && { fontSize: 24, lineHeight: 28 }]}>
              {formatNumber(sharesHeld)}
              <Text style={styles.sharesUnit}>주</Text>
            </Text>
            {sharesHeld > 0 && avgCostBasis > 0 && <Text style={styles.avgCost}>평균 {formatNumber(Math.round(avgCostBasis))}원</Text>}
          </View>
          <View style={[styles.cell, styles.cellDivider]}>
            <Text style={[styles.cellLabel, { marginBottom: 2 }]}>현재가</Text>
            <Text style={styles.cellValue}>{formatNumber(currentPrice)}원</Text>
          </View>
        </View>
      </View>

      {/* Hint */}
      <View style={styles.hint}>
        <Text style={styles.hintEmoji}>💡</Text>
        <Text style={styles.hintText}>{scenario.hint}</Text>
      </View>

      {/* In-game turn history */}
      <InGameHistory history={turnHistory} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    backgroundColor: "rgba(0,0,0,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: alpha("#ffffff", 0.05),
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: layout.headerHeight, paddingHorizontal: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: alpha("#ffffff", 0.1), alignItems: "center", justifyContent: "center" },
  headerEmoji: { fontSize: 24, color: "#ffffff" },
  headerTitle: { fontSize: 14, fontWeight: "900", color: "#ffffff" },
  streak: { fontSize: 16, fontWeight: "900", color: palette.orange[400] },
  scorePill: { backgroundColor: alpha(palette.yellow[500], 0.2), paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999, borderWidth: 1, borderColor: alpha(palette.yellow[500], 0.3) },
  scoreText: { fontSize: 14, fontWeight: "900", color: palette.yellow[400] },

  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 30 },
  status: { alignItems: "center", paddingTop: 8, backgroundColor: "rgba(0,0,0,0.9)" },
  statusText: { fontSize: 14 },
  expired: { alignItems: "center", paddingVertical: 6, backgroundColor: alpha(palette.red[500], 0.2), borderTopWidth: 1, borderTopColor: alpha(palette.red[500], 0.3) },
  expiredText: { fontSize: 14, fontWeight: "900", color: palette.red[400] },

  progress: { marginTop: 8, flexDirection: "row", gap: 8 },
  progressBar: { height: 10, borderRadius: 9999 },

  chartCard: { marginTop: 12, backgroundColor: "#0a0a0a", borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  chartInner: { height: 256, padding: 8 },

  portfolio: { marginTop: 12, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  portfolioTop: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tinyLabel: { fontSize: 10, fontWeight: "700", color: palette.gray[500] },
  bigValue: { fontSize: 20, lineHeight: 25, fontWeight: "900", color: "#ffffff" },
  mixRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  mixTrack: { flex: 1, height: 6, borderRadius: 9999, backgroundColor: alpha("#ffffff", 0.08), overflow: "hidden" },
  mixLabel: { fontSize: 9, fontWeight: "700", fontVariant: ["tabular-nums"] },
  portfolioGrid: { flexDirection: "row", borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },
  cell: { flex: 1, paddingHorizontal: 8, paddingVertical: 8, alignItems: "center" },
  cellDivider: { borderLeftWidth: 1, borderLeftColor: alpha("#ffffff", 0.05) },
  cellLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2, marginBottom: 2 },
  cellLabel: { fontSize: 9, fontWeight: "700", color: palette.gray[500] },
  cellValue: { fontSize: 11, fontWeight: "900", color: "#ffffff" },
  sharesValue: { fontSize: 36, lineHeight: 40, fontWeight: "900", color: "#ffffff" },
  sharesUnit: { fontSize: 16, fontWeight: "700", color: palette.gray[400] },
  avgCost: { fontSize: 9, color: palette.gray[600], marginTop: 2 },

  hint: { marginTop: 8, backgroundColor: "#111111", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: alpha(palette.yellow[500], 0.2), flexDirection: "row", alignItems: "center", gap: 8 },
  hintEmoji: { fontSize: 20, color: "#ffffff" },
  hintText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: "500", color: alpha(palette.yellow[200], 0.7) },
})
