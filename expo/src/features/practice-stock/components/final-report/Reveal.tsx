import { useEffect, useRef, type ReactNode } from "react"
import { Animated, Easing, type StyleProp, type ViewStyle } from "react-native"

interface RevealProps {
  /** true 가 되면 나타남 (웹의 animStep 기반 `opacity-0 translate-y-N → opacity-100 translate-y-0` 전환) */
  show: boolean
  duration?: number
  /** 시작 Y 오프셋(px). 0 이면 페이드만 */
  distance?: number
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}

export function Reveal({ show, duration = 700, distance = 24, style, children }: RevealProps) {
  const v = useRef(new Animated.Value(show ? 1 : 0)).current

  useEffect(() => {
    const anim = Animated.timing(v, {
      toValue: show ? 1 : 0,
      duration: show ? duration : 0,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    })
    anim.start()
    return () => anim.stop()
  }, [show, duration, v])

  return (
    <Animated.View
      pointerEvents={show ? "auto" : "none"}
      style={[
        style,
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  )
}
