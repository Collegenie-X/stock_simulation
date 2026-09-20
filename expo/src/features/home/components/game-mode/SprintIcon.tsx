import { useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet, View } from "react-native"
import Svg, { Circle, Path } from "react-native-svg"

/** 스프린트 — 번개 (animate-flameJitter: scale 1↔1.1, rotate -2deg↔2deg, 0.6s) */
export function SprintIcon({ color }: { color: string }) {
  const v = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [v])

  return (
    <View style={styles.fill}>
      <Svg viewBox="0 0 48 48" width="100%" height="100%">
        <Circle cx={24} cy={24} r={22} fill={`${color}22`} stroke={`${color}55`} strokeWidth={1} />
      </Svg>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) },
              { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["-2deg", "2deg"] }) },
            ],
          },
        ]}
      >
        <Svg viewBox="0 0 48 48" width="100%" height="100%">
          {/* drop-shadow glow 대체 */}
          <Path d="M26 8 L13 27 H22 L20 40 L35 19 H26 L28 8 Z" fill={color} opacity={0.3} stroke={color} strokeWidth={4} strokeLinejoin="round" strokeOpacity={0.25} />
          <Path d="M26 8 L13 27 H22 L20 40 L35 19 H26 L28 8 Z" fill={color} />
        </Svg>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { width: "100%", height: "100%" },
})
