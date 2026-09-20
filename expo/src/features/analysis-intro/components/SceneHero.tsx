import { useEffect, useRef, useState } from "react"
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native"
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg"
import { Gradient, Pulse, GlowOrb } from "@/components/ui"
import { playClickSound } from "@/lib/sound"
import { alpha, palette } from "@/theme"
import Reveal from "./Reveal"

interface SceneHeroProps {
  visible: boolean
  onComplete: () => void
}

const STATS = [
  { label: "문항", value: "7~21", icon: "🎮" },
  { label: "유형", value: "5", icon: "🧬" },
  { label: "능력", value: "5", icon: "⚡" },
]

const SCAN_WIDTH = 192

/** animate-scan: translateX -100% → 200%, 1.5s ease-in-out infinite */
function ScanLine() {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    )
    anim.start()
    return () => anim.stop()
  }, [v])
  return (
    <Animated.View
      style={{
        width: SCAN_WIDTH,
        height: "100%",
        transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-SCAN_WIDTH, SCAN_WIDTH * 2] }) }],
      }}
    >
      <Gradient dir="r" colors={[alpha(palette.blue[400], 0), palette.blue[400], alpha(palette.blue[400], 0)]} style={StyleSheet.absoluteFill} />
    </Animated.View>
  )
}

export default function SceneHero({ visible, onComplete }: SceneHeroProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!visible) return
    setStep(0)
    const timers = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 800),
      setTimeout(() => setStep(3), 1400),
      setTimeout(() => setStep(4), 2200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [visible])

  if (!visible) return null

  return (
    <View style={styles.root}>
      {/* Glitch title */}
      <Reveal show={step >= 1} duration={700} fromScale={1.5}>
        <View style={styles.dnaWrap}>
          {step >= 1 && (
            <Pulse style={styles.dnaGlow}>
              <GlowOrb color={palette.blue[500]} size={260} opacity={0.35} style={{ left: -30, top: -10 }} />
              <GlowOrb color={palette.pink[500]} size={260} opacity={0.3} style={{ right: -30, top: -10 }} />
              <GlowOrb color={palette.purple[500]} size={300} opacity={0.35} style={{ alignSelf: "center", top: -30 }} />
            </Pulse>
          )}
          {/* text-transparent bg-clip-text bg-gradient-to-r → SVG 그라데이션 텍스트 */}
          <Svg width={220} height={84}>
            <Defs>
              <LinearGradient id="dnaTitleGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={palette.blue[400]} />
                <Stop offset="0.5" stopColor={palette.purple[400]} />
                <Stop offset="1" stopColor={palette.pink[400]} />
              </LinearGradient>
            </Defs>
            <SvgText
              x={110}
              y={66}
              textAnchor="middle"
              fontSize={72}
              fontWeight="900"
              letterSpacing={-1.8}
              fill="url(#dnaTitleGradient)"
            >
              DNA
            </SvgText>
          </Svg>
        </View>
      </Reveal>

      <Reveal show={step >= 2} duration={500} delay={100} fromY={32}>
        <Text style={styles.title}>투자 성향 분석</Text>
        <Text style={styles.subtitle}>Investor DNA Analysis</Text>
      </Reveal>

      {/* Animated scanning line */}
      <Reveal show={step >= 3} duration={500} style={styles.scanBox}>
        <ScanLine />
      </Reveal>

      {/* Stats preview */}
      <Reveal show={step >= 3} duration={500} fromY={24} style={styles.stats}>
        {STATS.map((stat, i) => (
          <View key={i} style={styles.stat}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </Reveal>

      {/* Tap prompt */}
      <Reveal show={step >= 4} duration={500} style={styles.tapWrap} pointerEvents="box-none">
        <Pressable
          onPress={() => {
            playClickSound()
            onComplete()
          }}
          style={styles.tapArea}
        >
          <View style={styles.tapPill}>
            <Pulse>
              <View style={styles.tapDot} />
            </Pulse>
            <Text style={styles.tapText}>탭하여 계속</Text>
          </View>
        </Pressable>
      </Reveal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, zIndex: 10 },
  dnaWrap: { marginBottom: 8, alignItems: "center", justifyContent: "center" },
  dnaGlow: { position: "absolute", top: -80, left: -60, right: -60, height: 240 },
  dnaGlowFill: { flex: 1, borderRadius: 9999, opacity: 0.6 },
  title: { fontSize: 24, fontWeight: "700", color: "#ffffff", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 14, color: palette.gray[400], textAlign: "center", letterSpacing: 1.4, textTransform: "uppercase" },
  scanBox: { width: SCAN_WIDTH, height: 2, marginVertical: 32, overflow: "hidden", borderRadius: 4 },
  stats: { flexDirection: "row", gap: 24 },
  stat: { alignItems: "center" },
  statIcon: { fontSize: 24, marginBottom: 4, color: "#ffffff" },
  statValue: { fontSize: 20, fontWeight: "900", color: "#ffffff" },
  statLabel: { fontSize: 10, color: palette.gray[500], textTransform: "uppercase", letterSpacing: 0.5 },
  tapWrap: { position: "absolute", bottom: 128, left: 0, right: 0 },
  tapArea: { alignItems: "center" },
  tapPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.1),
    backgroundColor: "rgba(30,30,38,0.9)",
  },
  tapDot: { width: 8, height: 8, backgroundColor: palette.blue[400], borderRadius: 4 },
  tapText: { fontSize: 14, color: palette.gray[300] },
})
