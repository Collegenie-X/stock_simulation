/**
 * Reveal — 웹의 `transition-all duration-* ${cond ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`
 * 패턴을 대체하는 로컬 헬퍼. show 값에 따라 hidden ↔ shown 상태를 보간합니다.
 */
import React, { useEffect, useRef } from "react"
import { Animated, Easing, type StyleProp, type ViewStyle } from "react-native"

interface RevealProps {
  show: boolean
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  duration?: number
  delay?: number
  /** 숨김 상태의 값 */
  fromY?: number
  fromX?: number
  fromScale?: number
  pointerEvents?: "auto" | "none" | "box-none" | "box-only"
}

export default function Reveal({ show, children, style, duration = 500, delay = 0, fromY = 0, fromX = 0, fromScale = 1, pointerEvents }: RevealProps) {
  const v = useRef(new Animated.Value(show ? 1 : 0)).current

  useEffect(() => {
    const anim = Animated.timing(v, {
      toValue: show ? 1 : 0,
      duration,
      delay: show ? delay : 0,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    })
    anim.start()
    return () => anim.stop()
  }, [show, duration, delay, v])

  return (
    <Animated.View
      pointerEvents={pointerEvents}
      style={[
        style,
        {
          opacity: v,
          transform: [
            { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [fromX, 0] }) },
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [fromY, 0] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [fromScale, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}
