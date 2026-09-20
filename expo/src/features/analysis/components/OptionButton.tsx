import { useEffect, useRef } from "react"
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native"
import { alpha } from "@/theme"
import { playClickSound } from "@/lib/sound"
import type { PersonalityType } from "../types"
import { PERSONALITY_META, PERSONALITY_COLORS } from "../config"

interface OptionButtonProps {
  emoji: string
  text: string
  subLabel?: string
  personalityType?: PersonalityType
  isSelected: boolean
  showFeedback: boolean
  onClick: () => void
  delay?: number
}

export default function OptionButton({
  emoji,
  text,
  subLabel,
  personalityType,
  isSelected,
  showFeedback,
  onClick,
  delay = 0,
}: OptionButtonProps) {
  const meta = personalityType ? PERSONALITY_META[personalityType] : null
  const c = personalityType ? PERSONALITY_COLORS[personalityType] : null
  const selectedWithMeta = showFeedback && isSelected && !!meta && !!c

  // animate-glowPulse (선택 전)
  const glow = useRef(new Animated.Value(0)).current
  // 선택 결과: 선택됨 → bounceIn, 나머지 → opacity 0.25 / scale 0.97 (500ms)
  const state = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (showFeedback) return
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    )
    const t = setTimeout(() => anim.start(), delay)
    return () => {
      clearTimeout(t)
      anim.stop()
    }
  }, [showFeedback, delay, glow])

  useEffect(() => {
    if (!showFeedback) {
      state.setValue(0)
      return
    }
    state.setValue(0)
    const anim = Animated.timing(state, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [showFeedback, isSelected, state])

  // 주의: 네이티브 드라이버 스타일을 조건부로 떼어내면 마지막 값(opacity 0 등)이 네이티브 뷰에 남는다.
  // → 항상 같은 Animated 스타일을 유지하고, 보간 범위만 상태에 따라 바꾼다.
  const animatedStyle = selectedWithMeta
    ? {
        opacity: state.interpolate({ inputRange: [0, 0.01, 0.5, 1], outputRange: [1, 0, 1, 1] }),
        transform: [{ scale: state.interpolate({ inputRange: [0, 0.01, 0.5, 0.7, 1], outputRange: [1, 0.3, 1.08, 0.95, 1] }) }],
      }
    : {
        opacity: state.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] }),
        transform: [{ scale: state.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] }) }],
      }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        disabled={showFeedback}
        onPress={() => {
          playClickSound()
          onClick()
        }}
        style={({ pressed }) => [
          styles.container,
          showFeedback
            ? selectedWithMeta
              ? { borderColor: c!.border, backgroundColor: c!.bg, boxShadow: c!.glow }
              : { borderColor: alpha("#ffffff", 0.05), backgroundColor: "transparent" }
            : { borderColor: alpha("#ffffff", 0.1), backgroundColor: alpha("#ffffff", 0.04) },
          !showFeedback && pressed && { transform: [{ scale: 0.97 }], borderColor: alpha("#ffffff", 0.25), backgroundColor: alpha("#ffffff", 0.08) },
        ]}
      >
        {!showFeedback && (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.glow,
              { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
            ]}
          />
        )}

        <Text style={styles.emoji}>{emoji}</Text>

        <View style={styles.body}>
          <Text style={[styles.text, { color: selectedWithMeta ? c!.text : alpha("#ffffff", 0.9) }]}>{text}</Text>
          {!!subLabel && !showFeedback && <Text style={styles.subLabel}>{subLabel}</Text>}
          {selectedWithMeta && (
            <Text style={[styles.typeLabel, { color: c!.text }]}>
              {meta!.emoji} {meta!.label}
            </Text>
          )}
        </View>

        {!showFeedback && <Text style={styles.chevron}>›</Text>}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  glow: { borderRadius: 16, boxShadow: "0 0 20px rgba(255,255,255,0.2)" },
  emoji: { fontSize: 24, width: 40, textAlign: "center", color: "#ffffff" },
  body: { flex: 1, minWidth: 0 },
  text: { fontSize: 14, fontWeight: "600", lineHeight: 19 },
  subLabel: { fontSize: 11, color: alpha("#ffffff", 0.4), marginTop: 2 },
  typeLabel: { fontSize: 11, marginTop: 2, fontWeight: "700", opacity: 0.9 },
  chevron: { color: alpha("#ffffff", 0.15), fontSize: 18 },
})
