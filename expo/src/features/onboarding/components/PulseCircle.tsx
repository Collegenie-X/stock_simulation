/**
 * PulseCircle — SVG `<animate attributeName="r|opacity">` / `.animate-ping-slow` 대체
 * r 과 opacity 를 from→to 로 반복 애니메이션합니다. (yoyo=false 면 ping 처럼 한 방향 반복)
 */
import { useEffect, useRef } from "react"
import { Animated, Easing } from "react-native"
import { Circle } from "react-native-svg"

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface PulseCircleProps {
  cx?: number
  cy?: number
  r: [number, number]
  opacity: [number, number]
  fill?: string
  stroke?: string
  strokeWidth?: number
  duration?: number
  yoyo?: boolean
}

export function PulseCircle({ cx = 0, cy = 0, r, opacity, fill = "none", stroke, strokeWidth, duration = 2000, yoyo = true }: PulseCircleProps) {
  const v = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const seq = yoyo
      ? Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ])
      : Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: duration * 0.75, easing: Easing.out(Easing.ease), useNativeDriver: false }),
          Animated.delay(duration * 0.25),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: false }),
        ])
    const anim = Animated.loop(seq)
    anim.start()
    return () => anim.stop()
  }, [v, duration, yoyo])

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={v.interpolate({ inputRange: [0, 1], outputRange: r })}
      opacity={v.interpolate({ inputRange: [0, 1], outputRange: opacity })}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  )
}
