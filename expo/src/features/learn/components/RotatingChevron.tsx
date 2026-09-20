/**
 * 웹의 `<ChevronDown className="transition-transform duration-200 rotate-180" />` 대체
 */
import React, { useEffect, useRef } from "react"
import { Animated, Easing } from "react-native"
import { ChevronDown } from "lucide-react-native"

interface Props {
  /** true 일 때 회전 */
  rotated: boolean
  /** 회전 각도 (기본 180, 접힘 표시는 -90) */
  degrees?: number
  size?: number
  color?: string
  opacity?: number
}

export function RotatingChevron({ rotated, degrees = 180, size = 16, color = "#ffffff", opacity = 1 }: Props) {
  const v = useRef(new Animated.Value(rotated ? 1 : 0)).current
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: rotated ? 1 : 0, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [rotated, v])
  return (
    <Animated.View style={{ opacity, transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${degrees}deg`] }) }] }}>
      <ChevronDown size={size} color={color} />
    </Animated.View>
  )
}
