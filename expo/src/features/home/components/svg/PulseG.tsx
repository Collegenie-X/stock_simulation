/**
 * PulseG — SVG 요소에 걸린 `.animate-pulse` (opacity 1 ↔ 0.5) 대체
 */
import React, { useEffect, useRef } from "react"
import { Animated, Easing } from "react-native"
import { G } from "react-native-svg"

const AnimatedG = Animated.createAnimatedComponent(G)

export function PulseG({ children, base = 1, min = 0.5, duration = 2000 }: { children?: React.ReactNode; base?: number; min?: number; duration?: number }) {
  const v = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [v, duration])

  return <AnimatedG opacity={v.interpolate({ inputRange: [0, 1], outputRange: [base, base * min] })}>{children}</AnimatedG>
}
