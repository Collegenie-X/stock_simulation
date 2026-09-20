/**
 * 선택된 카드 왼쪽의 스캔 라인 (웹 .animate-scan: translateX -100% → 200%, 1.5s ease-in-out infinite)
 */
import { useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet } from "react-native"
import { Gradient } from "@/components/ui"
import { alpha } from "@/theme"

const WIDTH = 4

export function ScanLine() {
  const v = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    )
    anim.start()
    return () => anim.stop()
  }, [v])

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.line, { transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-WIDTH, WIDTH * 2] }) }] }]}
    >
      <Gradient dir="b" colors={[alpha("#ffffff", 0), alpha("#ffffff", 0.4), alpha("#ffffff", 0)]} style={StyleSheet.absoluteFill} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  line: { position: "absolute", top: 0, bottom: 0, left: 0, width: WIDTH },
})
