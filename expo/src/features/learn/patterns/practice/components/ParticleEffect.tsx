import React, { useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet, Text, View } from "react-native"

const SPARKLE = ["✨", "💰", "⭐", "🎯", "💫", "🌟", "💎", "🔥"]
const SHAKE = ["💥", "😵", "❌", "💨", "😤", "🌀"]

/** 웹 @keyframes pf: 0%{opacity:1;scale .5} 50%{opacity:1;scale 1.2;y -20} 100%{opacity:0;scale .8;y -60} */
function Particle({ emoji, index }: { emoji: string; index: number }) {
  const v = useRef(new Animated.Value(0)).current
  const shown = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(index * 80),
      Animated.timing(shown, { toValue: 1, duration: 1, useNativeDriver: true }),
      Animated.timing(v, { toValue: 1, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ])
    anim.start()
    return () => anim.stop()
  }, [v, shown, index])

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: `${15 + ((index * 11) % 70)}%`,
          top: `${10 + ((index * 17) % 60)}%`,
          opacity: Animated.multiply(shown, v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1, 0] })),
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -20, -60] }) },
            { scale: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.2, 0.8] }) },
          ],
        },
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
    </Animated.View>
  )
}

export function ParticleEffect({ type }: { type: "sparkle" | "shake" }) {
  const emojis = type === "sparkle" ? SPARKLE : SHAKE
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}>
      {emojis.map((e, i) => (
        <Particle key={i} emoji={e} index={i} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  particle: { position: "absolute" },
  emoji: { fontSize: 30, color: "#ffffff" },
})
