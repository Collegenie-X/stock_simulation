import { useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet, View } from "react-native"
import Svg, { Circle, Line } from "react-native-svg"

function useSpin(duration: number) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }))
    anim.start()
    return () => anim.stop()
  }, [v, duration])
  return v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] })
}

/** 스탠다드 — 시계 (animateTransform rotate: 분침 6s, 초침 2s) */
export function StandardIcon({ color }: { color: string }) {
  const slow = useSpin(6000)
  const fast = useSpin(2000)

  return (
    <View style={styles.fill}>
      <Svg viewBox="0 0 48 48" width="100%" height="100%">
        <Circle cx={24} cy={24} r={22} fill={`${color}22`} stroke={`${color}55`} strokeWidth={1} />
        <Circle cx={24} cy={24} r={14} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.6} />
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: slow }] }]}>
        <Svg viewBox="0 0 48 48" width="100%" height="100%">
          <Line x1={24} y1={24} x2={24} y2={13} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: fast }] }]}>
        <Svg viewBox="0 0 48 48" width="100%" height="100%">
          <Line x1={24} y1={24} x2={32} y2={24} stroke={color} strokeWidth={2} strokeLinecap="round" strokeOpacity={0.7} />
        </Svg>
      </Animated.View>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg viewBox="0 0 48 48" width="100%" height="100%">
          <Circle cx={24} cy={24} r={2.5} fill={color} />
        </Svg>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { width: "100%", height: "100%" },
})
