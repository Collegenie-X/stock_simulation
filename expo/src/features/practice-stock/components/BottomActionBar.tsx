import { useEffect, useRef, useState } from "react"
import { Animated, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ChevronRight, Pause, Play } from "lucide-react-native"
import { FadeUp, Gradient, PressableScale, Pulse } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { DAY_PHASES } from "../config"

export interface LastTradeToast {
  isBuy: boolean
  stockName: string
  quantity: number
  profit?: number
  profitRate?: number
  totalAmount: number
}

interface BottomActionBarProps {
  decisionTimer: number
  totalDecisions: number
  remainingDecisions: number
  isTimerPaused: boolean
  currentPhaseInDay: number
  currentDayPhase: string
  currentDay: number
  isWaitingForDecision: boolean
  lastTrade?: LastTradeToast | null
  showDebugButtons?: boolean
  onTogglePause: () => void
  onSkip: () => void
  onPreviewMiniReport?: () => void
  onPreviewFinalReport?: () => void
}

export const BottomActionBar = ({
  decisionTimer,
  totalDecisions,
  remainingDecisions,
  isTimerPaused,
  currentPhaseInDay,
  currentDayPhase,
  currentDay,
  isWaitingForDecision,
  lastTrade,
  showDebugButtons = false,
  onTogglePause,
  onSkip,
  onPreviewMiniReport,
  onPreviewFinalReport,
}: BottomActionBarProps) => {
  const insets = useSafeAreaInsets()
  const timerProgress = decisionTimer / 30
  const isUrgent = decisionTimer <= 10
  const isCaution = decisionTimer <= 20

  // 거래 토스트 표시 상태 (3초 후 자동 사라짐)
  const [visibleTrade, setVisibleTrade] = useState<LastTradeToast | null>(null)

  useEffect(() => {
    if (!lastTrade) return
    setVisibleTrade(lastTrade)
    const t = setTimeout(() => setVisibleTrade(null), 3000)
    return () => clearTimeout(t)
  }, [lastTrade])

  // 타이머 프로그레스 바 (웹: transition-all duration-1000)
  const widthAnim = useRef(new Animated.Value(timerProgress)).current
  useEffect(() => {
    Animated.timing(widthAnim, { toValue: timerProgress, duration: 1000, useNativeDriver: false }).start()
  }, [timerProgress, widthAnim])

  // 카운트다운 숫자 pop (웹: animate-pop, 여유 구간에서만)
  const pop = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (isTimerPaused || isUrgent || isCaution) return
    pop.setValue(1.25)
    Animated.spring(pop, { toValue: 1, friction: 5, useNativeDriver: true }).start()
  }, [decisionTimer, isTimerPaused, isUrgent, isCaution, pop])

  if (!isWaitingForDecision) return null

  const hasProfit = !!visibleTrade && visibleTrade.profit !== undefined
  const isProfit = hasProfit && (visibleTrade?.profit ?? 0) >= 0

  const barColors = isUrgent
    ? [palette.red[600], palette.red[400]]
    : isCaution
      ? [palette.yellow[500], palette.orange[400]]
      : [palette.green[500], palette.emerald[400], palette.green[500]]

  const bar = <Gradient dir="r" colors={barColors} style={StyleSheet.absoluteFill} />

  return (
    <View style={[styles.root, { paddingBottom: Math.max(12, insets.bottom) }]}>
      {/* ── 타이머 프로그레스 바 ── */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"], extrapolate: "clamp" }) },
          ]}
        >
          {isUrgent ? (
            <Pulse duration={1000} style={StyleSheet.absoluteFill}>
              {bar}
            </Pulse>
          ) : (
            bar
          )}
        </Animated.View>
      </View>

      {/* ── 타이머 info 행 ── */}
      <View style={styles.infoRow}>
        {/* 왼쪽: 일시정지 + 페이즈 도트 + 일차 */}
        <View style={styles.infoLeft}>
          <PressableScale
            onPress={onTogglePause}
            scaleTo={0.95}
            style={[
              styles.pauseBtn,
              isTimerPaused
                ? { backgroundColor: alpha(palette.green[500], 0.25), borderColor: alpha(palette.green[500], 0.4) }
                : { backgroundColor: palette.gray[800], borderColor: palette.gray[700] },
            ]}
          >
            {isTimerPaused ? <Play size={12} color={palette.green[400]} /> : <Pause size={12} color={palette.gray[400]} />}
          </PressableScale>

          <View style={styles.dots}>
            {DAY_PHASES.map((phase, idx) => (
              <View
                key={phase}
                style={
                  idx < currentPhaseInDay
                    ? [styles.dot, { backgroundColor: palette.blue[500] }]
                    : idx === currentPhaseInDay
                      ? [styles.dotActive, { backgroundColor: palette.blue[400] }]
                      : [styles.dot, { backgroundColor: palette.gray[700] }]
                }
              />
            ))}
          </View>

          <Text style={styles.phaseText}>
            {currentDayPhase} D{currentDay}
          </Text>
        </View>

        {/* 오른쪽: 남은 횟수 + 카운트다운 */}
        <View style={styles.infoRight}>
          <Text style={styles.countText}>
            #{totalDecisions} · {remainingDecisions}🎯
          </Text>
          <View style={[styles.timerBox, isTimerPaused && { opacity: 0.5 }]}>
            <Animated.Text
              style={[
                styles.timerText,
                {
                  color: isTimerPaused
                    ? palette.gray[500]
                    : isUrgent
                      ? palette.red[400]
                      : isCaution
                        ? palette.yellow[400]
                        : palette.green[400],
                  transform: [{ scale: pop }],
                },
              ]}
            >
              {decisionTimer}
            </Animated.Text>
            <Text style={styles.timerUnit}>s</Text>
          </View>
        </View>
      </View>

      {/* ── 일시정지 알림 ── */}
      {isTimerPaused && (
        <View style={styles.pausedBanner}>
          <Text style={styles.pausedText}>⏸ PAUSED</Text>
        </View>
      )}

      {/* ── 거래 확인 토스트 (주식 리스트에서 표시) ── */}
      {!!visibleTrade && (
        <FadeUp duration={200} distance={8} style={styles.toastWrap}>
          <View
            style={[
              styles.toast,
              visibleTrade.isBuy
                ? { backgroundColor: alpha(palette.red[500], 0.1), borderColor: alpha(palette.red[500], 0.25) }
                : { backgroundColor: alpha(palette.blue[500], 0.1), borderColor: alpha(palette.blue[500], 0.25) },
            ]}
          >
            {/* 아이콘 */}
            <Text style={styles.toastIcon}>{visibleTrade.isBuy ? "📈" : "💰"}</Text>

            {/* 내용 */}
            <View style={styles.toastBody}>
              <View style={styles.toastLine}>
                <View style={[styles.toastBadge, { backgroundColor: visibleTrade.isBuy ? palette.red[500] : palette.blue[500] }]}>
                  <Text style={styles.toastBadgeText}>{visibleTrade.isBuy ? "매수" : "매도"}</Text>
                </View>
                <Text style={styles.toastName} numberOfLines={1}>
                  {visibleTrade.stockName}
                </Text>
                <Text style={[styles.toastQty, { color: visibleTrade.isBuy ? palette.red[400] : palette.blue[400] }]}>
                  {visibleTrade.isBuy ? "+" : "-"}
                  {visibleTrade.quantity}주
                </Text>
              </View>
              <View style={styles.toastLine2}>
                <Text style={styles.toastAmount}>{formatNumber(visibleTrade.totalAmount)}원</Text>
                {!visibleTrade.isBuy && hasProfit && (
                  <Text style={[styles.toastProfit, { color: isProfit ? palette.red[400] : palette.blue[400] }]}>
                    {isProfit ? "+" : ""}
                    {formatNumber(Math.round(visibleTrade.profit!))}원
                    {visibleTrade.profitRate !== undefined
                      ? ` (${isProfit ? "+" : ""}${visibleTrade.profitRate.toFixed(1)}%)`
                      : ""}
                  </Text>
                )}
              </View>
            </View>

            <Text style={styles.toastCheck}>✓</Text>
          </View>
        </FadeUp>
      )}

      {/* ── 버튼 영역 ── */}
      <View style={styles.buttons}>
        {/* 디버그 버튼 (DEBUG_BUTTONS = true 일 때만) */}
        {showDebugButtons && (
          <View style={styles.debugRow}>
            {!!onPreviewMiniReport && (
              <PressableScale
                onPress={onPreviewMiniReport}
                style={[styles.debugBtn, { backgroundColor: alpha(palette.indigo[500], 0.15), borderColor: alpha(palette.indigo[500], 0.3) }]}
              >
                <Text style={styles.debugEmoji}>📋</Text>
                <Text style={[styles.debugText, { color: palette.indigo[400] }]}>D{currentDay} 리포트</Text>
              </PressableScale>
            )}
            {!!onPreviewFinalReport && (
              <PressableScale
                onPress={onPreviewFinalReport}
                style={[styles.debugBtn, { backgroundColor: alpha(palette.yellow[500], 0.15), borderColor: alpha(palette.yellow[500], 0.3) }]}
              >
                <Text style={styles.debugEmoji}>🏆</Text>
                <Text style={[styles.debugText, { color: palette.yellow[400] }]}>최종 결과</Text>
              </PressableScale>
            )}
          </View>
        )}

        {/* 다음 시간으로 */}
        <PressableScale onPress={onSkip} scaleTo={0.98} style={styles.nextBtn}>
          <Text style={styles.nextEmoji}>⏭️</Text>
          <Text style={styles.nextText}>NEXT</Text>
          <ChevronRight size={14} color={palette.gray[500]} />
        </PressableScale>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    backgroundColor: "#191919",
    borderTopWidth: 1,
    borderTopColor: alpha(palette.gray[800], 0.8),
  },
  progressTrack: { height: 6, backgroundColor: palette.gray[800], overflow: "hidden" },
  progressFill: { position: "absolute", top: 0, bottom: 0, left: 0, borderTopRightRadius: 9999, borderBottomRightRadius: 9999, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 6 },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  pauseBtn: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dots: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 8, height: 8, borderRadius: 4, boxShadow: "0 0 6px rgba(96,165,250,0.8)" },
  phaseText: { fontSize: 10, fontWeight: "700", color: palette.blue[400] },
  infoRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  countText: { fontSize: 9, fontWeight: "500", color: palette.gray[600], fontVariant: ["tabular-nums"] },
  timerBox: { flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  timerText: { fontSize: 18, lineHeight: 20, fontWeight: "900", fontVariant: ["tabular-nums"] },
  timerUnit: { fontSize: 8, fontWeight: "700", color: palette.gray[600] },
  pausedBanner: {
    marginHorizontal: 16,
    marginBottom: 4,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: alpha(palette.yellow[500], 0.1),
    borderWidth: 1,
    borderColor: alpha(palette.yellow[500], 0.2),
  },
  pausedText: { fontSize: 9, fontWeight: "700", color: alpha(palette.yellow[400], 0.9), textAlign: "center" },
  toastWrap: { marginHorizontal: 16, marginBottom: 6 },
  toast: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  toastIcon: { fontSize: 16, color: "#ffffff" },
  toastBody: { flex: 1, minWidth: 0 },
  toastLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  toastBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 9999 },
  toastBadgeText: { fontSize: 9, fontWeight: "900", color: "#ffffff" },
  toastName: { fontSize: 12, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  toastQty: { fontSize: 12, fontWeight: "700" },
  toastLine2: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  toastAmount: { fontSize: 10, color: palette.gray[500] },
  toastProfit: { fontSize: 10, fontWeight: "700" },
  toastCheck: { fontSize: 12, color: palette.green[400] },
  buttons: { paddingHorizontal: 16, paddingBottom: 4, paddingTop: 2, gap: 6 },
  debugRow: { flexDirection: "row", gap: 8 },
  debugBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  debugEmoji: { fontSize: 14, color: "#ffffff" },
  debugText: { fontSize: 11, fontWeight: "700" },
  nextBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: alpha(palette.gray[800], 0.8),
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.6),
  },
  nextEmoji: { fontSize: 12, color: palette.gray[400] },
  nextText: { fontSize: 12, fontWeight: "700", color: palette.gray[400] },
})
