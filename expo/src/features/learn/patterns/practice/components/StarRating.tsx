import React, { useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet, View } from "react-native"
import { Star } from "lucide-react-native"
import { palette } from "@/theme"

/** 웹: transition-all duration-700 + transitionDelay i*300ms, 켜진 별은 scale-110 */
function AnimatedStar({ active, index }: { active: boolean; index: number }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!active) return
    const anim = Animated.timing(v, { toValue: 1, duration: 700, delay: index * 300, easing: Easing.out(Easing.ease), useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [active, index, v])

  return (
    <View style={styles.star}>
      <Star size={48} color={palette.gray[800]} />
      {active && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }] }]}>
          <Star size={48} color={palette.yellow[400]} fill={palette.yellow[400]} />
        </Animated.View>
      )}
    </View>
  )
}

export function StarRating({ stars }: { stars: number }) {
  return (
    <View style={styles.row}>
      {[0, 1, 2].map((i) => (
        <AnimatedStar key={i} index={i} active={i < stars} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, justifyContent: "center" },
  star: { width: 48, height: 48 },
})
