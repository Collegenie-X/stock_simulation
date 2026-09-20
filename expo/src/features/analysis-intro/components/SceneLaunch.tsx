import { useEffect, useState, useRef } from "react"
import { Animated, Easing, StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { Float, Gradient, PressableScale, Pulse } from "@/components/ui"
import { playClickSound } from "@/lib/sound"
import { alpha, palette } from "@/theme"
import Reveal from "./Reveal"

interface SceneLaunchProps {
  visible: boolean
}

const TYPES = [
  { emoji: "🧠", name: "분석가", color: [alpha(palette.cyan[500], 0.3), alpha(palette.blue[600], 0.3)],      border: alpha(palette.cyan[500], 0.4),   glow: "rgba(34,211,238,0.3)",  desc: "데이터 중심" },
  { emoji: "🔥", name: "도전가", color: [alpha(palette.red[500], 0.3), alpha(palette.orange[500], 0.3)],     border: alpha(palette.red[500], 0.4),    glow: "rgba(249,115,22,0.3)",  desc: "공격적 투자" },
  { emoji: "🛡️", name: "안정형", color: [alpha(palette.green[500], 0.3), alpha(palette.emerald[500], 0.3)],  border: alpha(palette.green[500], 0.4),  glow: "rgba(52,211,153,0.3)",  desc: "리스크 최소" },
  { emoji: "💖", name: "감성형", color: [alpha(palette.pink[500], 0.3), alpha(palette.purple[500], 0.3)],    border: alpha(palette.pink[500], 0.4),   glow: "rgba(232,121,249,0.3)", desc: "직감 투자"  },
  { emoji: "⚙️", name: "전략가", color: [alpha(palette.yellow[500], 0.3), alpha(palette.amber[500], 0.3)],   border: alpha(palette.yellow[500], 0.4), glow: "rgba(251,191,36,0.3)",  desc: "시스템 매매" },
]

/* 카드 플립 컴포넌트 */
function TypeCard({ type, delay, visible }: {
  type: typeof TYPES[0]
  delay: number
  visible: boolean
}) {
  const [flipped, setFlipped] = useState(false)
  const v = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!visible) { setFlipped(false); return }
    const t = setTimeout(() => setFlipped(true), delay)
    return () => clearTimeout(t)
  }, [visible, delay])

  // rotateY(-90deg) → rotateY(0deg), 500ms ease-out
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: flipped ? 1 : 0, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [flipped, v])

  return (
    <Animated.View
      style={[
        styles.typeCol,
        {
          transform: [
            { perspective: 500 },
            { rotateY: v.interpolate({ inputRange: [0, 1], outputRange: ["-90deg", "0deg"] }) },
          ],
        },
      ]}
    >
      <Gradient
        dir="br"
        colors={type.color}
        style={[styles.typeCard, { borderColor: type.border }, flipped && { boxShadow: `0 0 20px ${type.glow}` }]}
      >
        <Float duration={2000} distance={4} style={styles.typeEmojiWrap}>
          <Text style={styles.typeEmoji}>{type.emoji}</Text>
        </Float>
        <Text style={styles.typeName}>{type.name}</Text>
        <Text style={styles.typeDesc}>{type.desc}</Text>
      </Gradient>
    </Animated.View>
  )
}

/* 심장박동 링 — pingSlower: opacity 0.3↔0, scale 1↔1.08 */
function SlowRing({ color, duration, delay = 0 }: { color: string; duration: number; delay?: number }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    )
    const t = setTimeout(() => anim.start(), delay)
    return () => { clearTimeout(t); anim.stop() }
  }, [v, duration, delay])
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.ring,
        {
          borderColor: color,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
        },
      ]}
    />
  )
}

/* 배경 shimmer — mysteryShimmer 2.5s linear infinite */
function Shimmer({ width }: { width: number }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.loop(Animated.timing(v, { toValue: 1, duration: 2500, easing: Easing.linear, useNativeDriver: true }))
    anim.start()
    return () => anim.stop()
  }, [v])
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width,
        transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [width, -width] }) }],
      }}
    >
      <Gradient
        dir="r"
        colors={["rgba(255,255,255,0)", "rgba(255,255,255,0)", "rgba(255,255,255,0.06)", "rgba(255,255,255,0)", "rgba(255,255,255,0)"]}
        locations={[0, 0.4, 0.5, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  )
}

/* 미스터리 카드 */
function MysteryCard({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(false)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!visible) { setShow(false); return }
    const t = setTimeout(() => setShow(true), 200)
    return () => clearTimeout(t)
  }, [visible])

  return (
    <Reveal show={show} duration={700} fromScale={0.75} style={styles.typeCol}>
      {/* 심장박동 링 */}
      {show && (
        <>
          <SlowRing color={alpha(palette.blue[400], 0.2)} duration={1800} />
          <SlowRing color={alpha(palette.purple[400], 0.1)} duration={2800} delay={500} />
        </>
      )}
      <View style={styles.mystery} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {/* 배경 shimmer */}
        <Gradient
          dir="br"
          colors={[alpha(palette.blue[500], 0.05), alpha(palette.purple[500], 0.05), alpha(palette.pink[500], 0.05)]}
          style={StyleSheet.absoluteFill}
        />
        {width > 0 && <Shimmer width={width} />}

        <View style={styles.mysteryBody}>
          <Pulse>
            <Text style={styles.mysteryEmoji}>❓</Text>
          </Pulse>
          <Text style={styles.mysteryTitle}>나의 유형</Text>
          <Text style={styles.mysterySub}>테스트 후 공개</Text>
        </View>
      </View>
    </Reveal>
  )
}

export default function SceneLaunch({ visible }: SceneLaunchProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [cardsVisible, setCardsVisible] = useState(false)

  useEffect(() => {
    if (!visible) return
    setStep(0); setCardsVisible(false)
    const timers = [
      setTimeout(() => setStep(1), 200),
      setTimeout(() => { setStep(2); setCardsVisible(true) }, 500),
      setTimeout(() => setStep(3), 1800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [visible])

  const handleLaunch = (mode: "quick" | "detailed") => {
    playClickSound()
    router.push(`/analysis?mode=${mode}`)
  }

  if (!visible) return null

  return (
    <View style={styles.root}>

      {/* 헤더 */}
      <Reveal show={step >= 1} duration={500} fromY={-24} style={styles.header}>
        <Text style={styles.kicker}>Investor DNA</Text>
        <Text style={styles.title}>당신의 유형은?</Text>
        <Text style={styles.subtitle}>5가지 투자자 유형 중 하나가 당신입니다</Text>
      </Reveal>

      {/* 타입 카드 그리드 */}
      <View style={styles.gridWrap}>
        {/* 상단 3개 */}
        <View style={[styles.gridRow, { marginBottom: 8 }]}>
          {TYPES.slice(0, 3).map((type, i) => (
            <TypeCard key={i} type={type} delay={i * 140} visible={cardsVisible} />
          ))}
        </View>
        {/* 하단: 2개 + 미스터리 카드 */}
        <View style={styles.gridRow}>
          {TYPES.slice(3).map((type, i) => (
            <TypeCard key={i} type={type} delay={(i + 3) * 140} visible={cardsVisible} />
          ))}
          <MysteryCard visible={cardsVisible} />
        </View>
      </View>

      {/* 모드 선택 버튼 */}
      <Reveal show={step >= 3} duration={700} fromY={32} style={styles.modes}>
        {/* 간략 측정 */}
        <PressableScale scaleTo={0.98} onPress={() => handleLaunch("quick")}>
          <Gradient dir="r" colors={[alpha(palette.emerald[600], 0.9), alpha(palette.cyan[600], 0.9)]} style={styles.modeBtn}>
            <View style={styles.modeLeft}>
              <Text style={styles.modeIcon}>⚡</Text>
              <View>
                <Text style={styles.modeTitle}>간략 측정</Text>
                <Text style={styles.modeDesc}>핵심 7문항 · 약 2분</Text>
              </View>
            </View>
            <View style={styles.modeRight}>
              <View style={styles.recommend}>
                <Text style={styles.recommendText}>추천</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </View>
          </Gradient>
        </PressableScale>

        {/* 세부 측정 */}
        <PressableScale scaleTo={0.98} onPress={() => handleLaunch("detailed")}>
          <Gradient dir="r" colors={[alpha(palette.blue[700], 0.9), alpha(palette.purple[700], 0.9)]} style={styles.modeBtn}>
            <View style={styles.modeLeft}>
              <Text style={styles.modeIcon}>🔬</Text>
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.modeTitle}>세부 측정</Text>
                <Text style={styles.modeDesc}>전체 21문항 · 약 7분 · 시나리오 포함</Text>
              </View>
            </View>
            <Text style={styles.arrow}>→</Text>
          </Gradient>
        </PressableScale>

        <Text style={styles.note}>간략 측정으로도 충분히 정확한 결과를 얻을 수 있어요!</Text>
      </Reveal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingBottom: 24, zIndex: 10 },
  header: { alignItems: "center", marginBottom: 24 },
  kicker: {
    fontSize: 11,
    fontWeight: "700",
    color: alpha(palette.blue[400], 0.8),
    letterSpacing: 2.75,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: { fontSize: 26, fontWeight: "900", color: "#ffffff", lineHeight: 33, marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 14, color: palette.gray[500], textAlign: "center" },

  gridWrap: { width: "100%", maxWidth: 384 },
  gridRow: { flexDirection: "row", gap: 8 },
  typeCol: { flex: 1 },
  typeCard: { borderRadius: 16, padding: 12, borderWidth: 1, alignItems: "center" },
  typeEmojiWrap: { marginBottom: 6 },
  typeEmoji: { fontSize: 30, color: "#ffffff" },
  typeName: { fontSize: 12, fontWeight: "900", color: "#ffffff", textAlign: "center" },
  typeDesc: { fontSize: 10, color: palette.gray[400], marginTop: 2, textAlign: "center" },

  ring: { borderRadius: 16, borderWidth: 1 },
  mystery: {
    flex: 1,
    minHeight: 90,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: alpha("#ffffff", 0.2),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  mysteryBody: { alignItems: "center", paddingVertical: 8 },
  mysteryEmoji: { fontSize: 30, marginBottom: 4, color: "#ffffff" },
  mysteryTitle: { fontSize: 11, fontWeight: "900", color: alpha("#ffffff", 0.7) },
  mysterySub: { fontSize: 9, color: palette.gray[600], marginTop: 2 },

  modes: { marginTop: 24, width: "100%", maxWidth: 384, gap: 10 },
  modeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 68,
    borderRadius: 14,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  modeLeft: { flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 1 },
  modeRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  modeIcon: { fontSize: 20, color: "#ffffff" },
  modeTitle: { fontWeight: "900", fontSize: 15, lineHeight: 19, color: "#ffffff" },
  modeDesc: { fontSize: 11, color: alpha("#ffffff", 0.65), fontWeight: "500", marginTop: 2 },
  recommend: { backgroundColor: alpha("#ffffff", 0.2), paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  recommendText: { fontSize: 10, fontWeight: "700", color: "#ffffff" },
  arrow: { fontSize: 16, color: "#ffffff", opacity: 0.7 },
  note: { textAlign: "center", fontSize: 11, color: palette.gray[600], marginTop: 2 },
})
