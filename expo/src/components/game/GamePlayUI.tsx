/**
 * 공통 게임 플레이 UI (웹 components/game-play-ui.tsx 포팅)
 * - 시나리오 플레이 (/learn/scenarios/[id]/play) 와
 *   패턴 연습 (/learn/patterns/[id]/practice) 에서 공유
 * - timerSec prop으로 시간 제한 구분 (시나리오: 15초, 패턴: 15초)
 */
import React, { useEffect, useRef } from "react"
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ArrowLeft, BadgeDollarSign, Eye, ShoppingCart, Timer } from "lucide-react-native"
import { Gradient } from "@/components/ui/Gradient"
import { Pulse } from "@/components/ui/animations"
import { formatNumber } from "@/lib/format"
import { alpha, layout, palette } from "@/theme"

export const RATIO_OPTIONS = [
  { ratio: 0.25, label: "조금", sub: "25%" },
  { ratio: 0.50, label: "반반", sub: "50%" },
  { ratio: 0.75, label: "많이", sub: "75%" },
  { ratio: 1.00, label: "전부", sub: "100%" },
]

interface GameActionBarProps {
  /** 현재 남은 시간(초) */
  timer: number
  /** 총 제한 시간(초) — 시나리오: 15, 패턴: 15 */
  timerSec: number
  /** 타이머 숫자 흔들림 여부 */
  shakeTimer?: boolean
  /** 피드백 표시 중 여부 (버튼 비활성) */
  hasFeedback: boolean
  /** 매수 가능 여부 */
  canBuy: boolean
  /** 매도 가능 여부 */
  canSell: boolean
  /** 매수 버튼 클릭 */
  onBuy: () => void
  /** 매도 버튼 클릭 */
  onSell: () => void
  /** 관망 버튼 클릭 */
  onHold: () => void
  /** 버튼 레이블 */
  labels?: { buy?: string; sell?: string; hold?: string }
  /** 버튼 아래 보조 문구 (예: 살 수 있는 수량 / 팔 수 있는 수량) */
  subLabels?: { buy?: string; sell?: string; hold?: string }
}

interface ActionButtonProps {
  label: string
  sub?: string
  icon: React.ReactNode
  disabledIcon: React.ReactNode
  colors: readonly string[]
  shadow?: string
  disabled: boolean
  onPress: () => void
}

function ActionButton({ label, sub, icon, disabledIcon, colors, shadow, disabled, onPress }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.actionWrap, !disabled && !!shadow && { boxShadow: shadow }, pressed && { transform: [{ scale: 0.95 }] }]}
    >
      <Gradient dir="b" colors={disabled ? [palette.gray[800], palette.gray[800]] : colors} style={styles.actionBtn}>
        {disabled ? disabledIcon : icon}
        <Text style={[styles.actionText, { color: disabled ? palette.gray[600] : "#ffffff" }]}>{label}</Text>
        {!!sub && (
          <Text numberOfLines={1} style={[styles.actionSub, { color: disabled ? palette.gray[600] : alpha("#ffffff", 0.75) }]}>
            {sub}
          </Text>
        )}
      </Gradient>
    </Pressable>
  )
}

export function GameActionBar({
  timer,
  timerSec,
  shakeTimer = false,
  hasFeedback,
  canBuy,
  canSell,
  onBuy,
  onSell,
  onHold,
  labels,
  subLabels,
}: GameActionBarProps) {
  const insets = useSafeAreaInsets()
  const timerPct = Math.max(0, Math.min(100, (timer / timerSec) * 100))
  const timerColor =
    timer <= 5 ? palette.red[500] :
    timer <= Math.floor(timerSec * 0.4) ? palette.yellow[500] :
    palette.green[500]
  const timerTextColor =
    timer <= 5 ? palette.red[400] :
    timer <= Math.floor(timerSec * 0.4) ? palette.yellow[400] :
    palette.green[400]

  // transition-all duration-1000 ease-linear
  const width = useRef(new Animated.Value(timerPct)).current
  useEffect(() => {
    const anim = Animated.timing(width, { toValue: timerPct, duration: 1000, easing: Easing.linear, useNativeDriver: false })
    anim.start()
    return () => anim.stop()
  }, [timerPct, width])

  const timerLabel = (
    <View style={styles.timerLabel}>
      <Timer size={16} color={timerTextColor} />
      <Text style={[styles.timerText, { color: timerTextColor }]}>{timer}초</Text>
    </View>
  )

  const buyDisabled = !canBuy || hasFeedback
  const sellDisabled = !canSell || hasFeedback
  const holdDisabled = hasFeedback

  return (
    <View style={styles.bar}>
      <View style={[styles.barInner, { paddingBottom: 20 + insets.bottom }]}>
        {/* 타이머 바 */}
        <View style={styles.timerRow}>
          <View style={styles.timerTrack}>
            <Animated.View
              style={[
                styles.timerFill,
                { backgroundColor: timerColor, width: width.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) },
              ]}
            />
          </View>
          {shakeTimer ? <Pulse duration={1000}>{timerLabel}</Pulse> : timerLabel}
        </View>

        {/* 액션 버튼 3개 */}
        <View style={styles.actions}>
          <ActionButton
            label={labels?.buy ?? "살래"}
            sub={subLabels?.buy}
            icon={<ShoppingCart size={16} color="#ffffff" />}
            disabledIcon={<ShoppingCart size={16} color={palette.gray[600]} />}
            colors={[palette.red[500], palette.red[600]]}
            shadow={`0 10px 15px ${alpha(palette.red[500], 0.2)}`}
            disabled={buyDisabled}
            onPress={onBuy}
          />
          <ActionButton
            label={labels?.sell ?? "팔래"}
            sub={subLabels?.sell}
            icon={<BadgeDollarSign size={16} color="#ffffff" />}
            disabledIcon={<BadgeDollarSign size={16} color={palette.gray[600]} />}
            colors={[palette.blue[500], palette.blue[600]]}
            shadow={`0 10px 15px ${alpha(palette.blue[500], 0.2)}`}
            disabled={sellDisabled}
            onPress={onSell}
          />
          <ActionButton
            label={labels?.hold ?? "기다릴게"}
            sub={subLabels?.hold}
            icon={<Eye size={16} color="#ffffff" />}
            disabledIcon={<Eye size={16} color={palette.gray[600]} />}
            colors={[palette.gray[600], palette.gray[700]]}
            disabled={holdDisabled}
            onPress={onHold}
          />
        </View>
      </View>
    </View>
  )
}

interface RatioModalProps {
  /** 'buy' | 'sell' | null */
  mode: "buy" | "sell" | null
  /** 현재 주가 */
  price: number
  /** 보유 현금 */
  cash: number
  /** 보유 주식 수 */
  holdings: number
  /** 평균 매수가 (매도 시 손익 계산용) */
  avgPrice?: number
  /** 종목명 */
  stockName?: string
  /** 힌트 텍스트 */
  hint?: string
  /** 비율 선택 시 콜백 */
  onSelect: (ratio: number, label: string) => void
  /** 닫기 */
  onClose: () => void
}

export function RatioModal({
  mode,
  price,
  cash,
  holdings,
  avgPrice = 0,
  stockName = "",
  hint,
  onSelect,
  onClose,
}: RatioModalProps) {
  const insets = useSafeAreaInsets()
  if (!mode) return null

  const isBuy = mode === "buy"
  const maxBuy = price > 0 ? Math.floor(cash / price) : 0
  const accent = isBuy ? palette.red[400] : palette.blue[400]
  const accentBase = isBuy ? palette.red[500] : palette.blue[500]

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: 32 + insets.bottom }]}>
          {/* 핸들 */}
          <View style={styles.handle} />

          {/* 헤더 */}
          <Text style={[styles.sheetTitle, { color: accent }]}>
            {stockName} {isBuy ? "얼마나 살까?" : "얼마나 팔까?"}
          </Text>
          <Text style={styles.sheetSub}>
            {isBuy
              ? `현금: ${formatNumber(Math.round(cash))}원 · 살 수 있는 주식: ${formatNumber(maxBuy)}주`
              : `갖고 있는 주식: ${formatNumber(holdings)}주 · 지금 가치: ${formatNumber(Math.round(holdings * price))}원`}
          </Text>

          {/* 비율 버튼 4개 */}
          <View style={styles.ratioRow}>
            {RATIO_OPTIONS.map(({ ratio, label, sub }) => {
              const qty = isBuy
                ? Math.max(1, Math.floor(maxBuy * ratio))
                : Math.max(1, Math.ceil(holdings * ratio))
              const profit = !isBuy && avgPrice > 0 ? (price - avgPrice) * qty : null
              const disabled = isBuy ? qty === 0 : holdings === 0

              return (
                <Pressable
                  key={ratio}
                  accessibilityRole="button"
                  onPress={() => onSelect(ratio, label)}
                  disabled={disabled}
                  style={({ pressed }) => [
                    styles.ratioBtn,
                    { backgroundColor: alpha(accentBase, pressed ? 0.2 : 0.1), borderColor: alpha(accentBase, 0.2) },
                    pressed && { transform: [{ scale: 0.95 }] },
                    disabled && { opacity: 0.2 },
                  ]}
                >
                  <Text style={[styles.ratioLabel, { color: accent }]}>{label}</Text>
                  {/* 비율 게이지 */}
                  <View style={styles.ratioGauge}>
                    <View style={{ width: `${ratio * 100}%`, height: "100%", borderRadius: 9999, backgroundColor: accentBase }} />
                  </View>
                  <Text style={styles.ratioQty}>{formatNumber(qty)}주</Text>
                  <Text style={styles.ratioAmount}>{formatNumber(Math.round(qty * price))}원</Text>
                  {profit !== null ? (
                    <Text style={[styles.ratioProfit, { color: profit >= 0 ? palette.green[400] : palette.red[400] }]}>
                      {profit >= 0 ? "+" : ""}{formatNumber(Math.round(profit))}원
                    </Text>
                  ) : (
                    <Text style={styles.ratioSub}>{sub}</Text>
                  )}
                </Pressable>
              )
            })}
          </View>

          {/* 힌트 */}
          {!!hint && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>💡 {hint}</Text>
            </View>
          )}

          {/* 뒤로 */}
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.backBtn}>
            {({ pressed }) => (
              <>
                <ArrowLeft size={12} color={pressed ? palette.gray[300] : palette.gray[500]} />
                <Text style={[styles.backText, { color: pressed ? palette.gray[300] : palette.gray[500] }]}>다시 선택</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  bar: { width: "100%", backgroundColor: "#0d0d0d", borderTopWidth: 1, borderTopColor: alpha(palette.gray[800], 0.4) },
  barInner: { width: "100%", maxWidth: layout.maxWidth, alignSelf: "center", paddingHorizontal: 16, paddingTop: 8 },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  timerTrack: { flex: 1, height: 12, backgroundColor: palette.gray[800], borderRadius: 9999, overflow: "hidden" },
  timerFill: { height: "100%", borderRadius: 9999 },
  timerLabel: { flexDirection: "row", alignItems: "center", gap: 2, minWidth: 44 },
  timerText: { fontSize: 14, fontWeight: "900", fontVariant: ["tabular-nums"] },
  actions: { flexDirection: "row", gap: 8 },
  actionWrap: { flex: 1, height: 62, borderRadius: 16 },
  actionBtn: { flex: 1, borderRadius: 16, alignItems: "center", justifyContent: "center", gap: 2 },
  actionText: { fontSize: 14, fontWeight: "700" },
  actionSub: { fontSize: 9, fontWeight: "700", fontVariant: ["tabular-nums"] },

  modalRoot: { flex: 1, justifyContent: "flex-end", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    width: "100%",
    maxWidth: layout.maxWidth,
    backgroundColor: "#1e1e1e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  handle: { width: 40, height: 4, backgroundColor: palette.gray[700], borderRadius: 9999, alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  sheetSub: { fontSize: 10, color: palette.gray[500], marginBottom: 16 },
  ratioRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  ratioBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  ratioLabel: { fontSize: 14, fontWeight: "700" },
  ratioGauge: { width: "70%", height: 4, borderRadius: 9999, backgroundColor: alpha("#ffffff", 0.08), overflow: "hidden", marginTop: 6 },
  ratioQty: { fontSize: 15, fontWeight: "900", color: "#ffffff", marginTop: 6, fontVariant: ["tabular-nums"] },
  ratioAmount: { fontSize: 9, color: palette.gray[400], marginTop: 1, fontVariant: ["tabular-nums"] },
  ratioProfit: { fontSize: 9, fontWeight: "700", marginTop: 2 },
  ratioSub: { fontSize: 9, color: palette.gray[600] },
  hintBox: {
    backgroundColor: alpha(palette.yellow[500], 0.05),
    borderWidth: 1,
    borderColor: alpha(palette.yellow[500], 0.15),
    borderRadius: 8,
    padding: 10,
  },
  hintText: { fontSize: 10, color: alpha(palette.yellow[500], 0.8), lineHeight: 16 },
  backBtn: { marginTop: 12, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, height: 36, borderRadius: 12 },
  backText: { fontSize: 12, fontWeight: "700" },
})
