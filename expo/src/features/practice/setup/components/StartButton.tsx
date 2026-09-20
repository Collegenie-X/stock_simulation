/**
 * 하단 고정 시작 버튼 (모드별 그라데이션 + shimmer)
 * 웹 @keyframes shimmer: translateX(-100%) → 60% 지점에 200% 도달, 이후 대기 (2.5s ease-in-out infinite)
 */
import { useEffect, useRef, useState } from "react"
import { Animated, Easing, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Play } from "lucide-react-native"
import { Gradient, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import type { SpeedMode } from "../config"

const MODE_BTN_GRADIENT: Record<SpeedMode, readonly string[]> = {
  sprint: [palette.orange[500], palette.orange[600], palette.red[500]],
  standard: [palette.blue[500], palette.blue[600], palette.cyan[500]],
  marathon: [palette.purple[500], palette.purple[600], palette.fuchsia[500]],
}

const MODE_BTN_SHADOW: Record<SpeedMode, string> = {
  sprint: `0 25px 50px ${alpha(palette.orange[900], 0.4)}`,
  standard: `0 25px 50px ${alpha(palette.blue[900], 0.4)}`,
  marathon: `0 25px 50px ${alpha(palette.purple[900], 0.4)}`,
}

interface StartButtonProps {
  mode: SpeedMode
  label: string
  onPress: () => void
}

export function StartButton({ mode, label, onPress }: StartButtonProps) {
  const insets = useSafeAreaInsets()
  const [width, setWidth] = useState(0)
  const v = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(1000),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [v])

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Gradient
        dir="t"
        colors={["#191919", "rgba(25,25,25,0.95)", "rgba(25,25,25,0)"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 4 + Math.max(20, insets.bottom) }}>
        <PressableScale scaleTo={0.98} pressedOpacity={1} onPress={onPress} style={[styles.button, { boxShadow: MODE_BTN_SHADOW[mode] }]}>
          <View style={styles.clip} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
            <Gradient dir="r" colors={MODE_BTN_GRADIENT[mode]} style={styles.inner}>
              {/* Shimmer */}
              {width > 0 && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    { transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-width, width * 2] }) }] },
                  ]}
                >
                  <Gradient dir="r" colors={[alpha("#ffffff", 0), alpha("#ffffff", 0.25), alpha("#ffffff", 0)]} style={StyleSheet.absoluteFill} />
                </Animated.View>
              )}
              <Play size={20} color="#ffffff" fill="#ffffff" />
              <Text style={styles.label}>{label}</Text>
            </Gradient>
          </View>
        </PressableScale>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 20 },
  button: { width: "100%", borderRadius: 16 },
  clip: { borderRadius: 16, overflow: "hidden", borderWidth: 2, borderColor: alpha("#ffffff", 0.1) },
  inner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  label: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})
