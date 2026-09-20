/**
 * DrawPath — SVG `<animate attributeName="stroke-dashoffset" from=N to=0>` (선이 그려지는 효과) 대체
 */
import { useEffect, useRef } from "react"
import { Animated, Easing } from "react-native"
import { Path, type PathProps } from "react-native-svg"

const AnimatedPath = Animated.createAnimatedComponent(Path)

export function DrawPath({ length, duration, ...rest }: PathProps & { length: number; duration: number }) {
  const v = useRef(new Animated.Value(length)).current

  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 0, duration, easing: Easing.linear, useNativeDriver: false })
    anim.start()
    return () => anim.stop()
  }, [v, duration])

  return <AnimatedPath {...rest} strokeDasharray={[length, length]} strokeDashoffset={v} />
}
