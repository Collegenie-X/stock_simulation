/**
 * FadeInPath — SVG `<animate attributeName="opacity" from="0" to="1" fill="freeze">` 대체
 */
import { useEffect, useRef } from "react"
import { Animated, Easing } from "react-native"
import { Path, type PathProps } from "react-native-svg"

const AnimatedPath = Animated.createAnimatedComponent(Path)

export function FadeInPath({ duration, ...rest }: PathProps & { duration: number }) {
  const v = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: false })
    anim.start()
    return () => anim.stop()
  }, [v, duration])

  return <AnimatedPath {...rest} opacity={v} />
}
