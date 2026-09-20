/** 0 → pct% 로 차오르는 게이지 바 (단색 또는 그라데이션) */
import { useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { alpha } from "@/theme"

interface GrowBarProps {
  /** 0~100 */
  pct: number
  colors: readonly string[]
  height?: number
  delay?: number
  duration?: number
  trackColor?: string
  style?: StyleProp<ViewStyle>
}

export function GrowBar({ pct, colors, height = 8, delay = 0, duration = 900, trackColor = alpha("#ffffff", 0.08), style }: GrowBarProps) {
  const v = useRef(new Animated.Value(0)).current
  const target = Math.max(0, Math.min(100, pct))

  useEffect(() => {
    const anim = Animated.timing(v, { toValue: target, duration, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false })
    anim.start()
    return () => anim.stop()
  }, [v, target, duration, delay])

  const c = (colors.length >= 2 ? colors : [colors[0], colors[0]]) as unknown as readonly [string, string, ...string[]]

  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: trackColor, overflow: "hidden" }, style]}>
      <Animated.View style={{ height: "100%", borderRadius: height / 2, overflow: "hidden", width: v.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) }}>
        <LinearGradient colors={c} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  )
}
