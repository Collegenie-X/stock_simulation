import { useEffect, useState, useCallback, useRef } from "react"
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from "react-native"
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg"
import { Gradient, Ping, Pulse } from "@/components/ui"
import { playClickSound } from "@/lib/sound"
import { alpha, palette } from "@/theme"
import Reveal from "./Reveal"

interface SceneAbilitiesProps {
  visible: boolean
  onComplete: () => void
}

const ABILITIES = [
  { icon: "🎲", label: "리스크 감수도", value: 78, color: ["#ef4444", "#fb923c"], bar: "#f97316", delay: 0   },
  { icon: "📊", label: "분석력",         value: 85, color: ["#3b82f6", "#22d3ee"], bar: "#22d3ee", delay: 220 },
  { icon: "🧘", label: "감정 통제",      value: 62, color: ["#a855f7", "#f472b6"], bar: "#e879f9", delay: 440 },
  { icon: "⚡", label: "대처 능력",      value: 91, color: ["#facc15", "#fbbf24"], bar: "#fbbf24", delay: 660 },
  { icon: "🔍", label: "정보 판별",      value: 73, color: ["#22c55e", "#34d399"], bar: "#34d399", delay: 880 },
] as const

const MONO = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" })

/* 슬롯머신 스타일 숫자 카운터 */
function SlotNumber({ target, active }: { target: number; active: boolean }) {
  const [display, setDisplay] = useState("--")
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active) { setDisplay("--"); return }
    const start = Date.now()
    const spin = () => {
      const elapsed = Date.now() - start
      if (elapsed < 500) {
        // 빠르게 랜덤 숫자 spin
        setDisplay(String(Math.floor(Math.random() * 99 + 1)).padStart(2, "0"))
        rafRef.current = requestAnimationFrame(spin)
      } else {
        // 슬로우 다운 후 정착
        const t = Math.min((elapsed - 500) / 400, 1)
        const ease = 1 - Math.pow(1 - t, 2)
        const cur = Math.round(ease * target)
        setDisplay(String(cur))
        if (t < 1) rafRef.current = requestAnimationFrame(spin)
        else setDisplay(String(target))
      }
    }
    rafRef.current = requestAnimationFrame(spin)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, target])

  return (
    <Text style={[styles.slot, { color: active || display !== "--" ? "#ffffff" : palette.gray[700] }]}>
      {display}
    </Text>
  )
}

/* 스캔 중 가로 광선 — scanBeam 0.9s ease-in-out infinite (top 0% → 100%) */
function ScanBeam({ color, height }: { color: string; height: number }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    )
    anim.start()
    return () => anim.stop()
  }, [v])
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 1,
        opacity: v.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }),
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, height] }) }],
      }}
    >
      <Gradient dir="r" colors={[alpha(color, 0), color, alpha(color, 0)]} style={StyleSheet.absoluteFill} />
    </Animated.View>
  )
}

/* 개별 능력 바 */
function AbilityBar({
  ability, barWidth, active, scanned, idx,
}: {
  ability: typeof ABILITIES[number]
  barWidth: number
  active: boolean
  scanned: boolean
  idx: number
}) {
  const [height, setHeight] = useState(0)
  const scale = useRef(new Animated.Value(1)).current
  const width = useRef(new Animated.Value(0)).current

  // scale-[1.02] transition (400ms)
  useEffect(() => {
    const anim = Animated.timing(scale, { toValue: active ? 1.02 : 1, duration: 400, delay: idx * 30, useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [active, idx, scale])

  // transition-all duration-700 ease-out
  useEffect(() => {
    const anim = Animated.timing(width, { toValue: barWidth, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: false })
    anim.start()
    return () => anim.stop()
  }, [barWidth, width])

  return (
    <Animated.View
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      style={[
        styles.bar,
        active
          ? { backgroundColor: alpha("#ffffff", 0.08), borderColor: alpha(palette.blue[400], 0.6) }
          : scanned
            ? { backgroundColor: alpha("#ffffff", 0.05), borderColor: alpha("#ffffff", 0.1) }
            : { backgroundColor: alpha("#ffffff", 0.03), borderColor: alpha("#ffffff", 0.05) },
        { transform: [{ scale }] },
      ]}
    >
      {/* 스캔 중 가로 광선 */}
      {active && height > 0 && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.beamClip]}>
          <ScanBeam color={ability.bar} height={height} />
        </View>
      )}

      <View style={styles.barHead}>
        <Text style={styles.barIcon}>{ability.icon}</Text>
        <Text style={styles.barLabel}>{ability.label}</Text>
        <SlotNumber target={ability.value} active={active || scanned} />
      </View>

      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { width: width.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) }]}
        >
          <Gradient dir="r" colors={ability.color} style={StyleSheet.absoluteFill} />
          {/* 바 끝 반짝임 */}
          {(active || scanned) && barWidth > 0 && (
            <Gradient
              dir="r"
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.4)", "rgba(255,255,255,0.1)"]}
              style={styles.sparkle}
            />
          )}
        </Animated.View>
      </View>
    </Animated.View>
  )
}

export default function SceneAbilities({ visible, onComplete }: SceneAbilitiesProps) {
  const [step, setStep] = useState(0)
  const [scanIndex, setScanIndex] = useState(-1)
  const [barWidths, setBarWidths] = useState<number[]>(new Array(5).fill(0))
  const [done, setDone] = useState(false)
  const [flashDone, setFlashDone] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const animateBars = useCallback(() => {
    const later = (fn: () => void, ms: number) => {
      timersRef.current.push(setTimeout(fn, ms))
    }
    ABILITIES.forEach((ability, i) => {
      later(() => {
        setScanIndex(i)
        setBarWidths(prev => {
          const next = [...prev]
          next[i] = ability.value
          return next
        })
      }, ability.delay)
    })
    const last = ABILITIES[ABILITIES.length - 1].delay + 1100
    later(() => {
      setScanIndex(ABILITIES.length) // 모두 완료
      setDone(true)
      setFlashDone(true)
      later(() => setFlashDone(false), 600)
      later(() => setStep(3), 700)
    }, last)
  }, [])

  useEffect(() => {
    if (!visible) return
    setStep(0); setScanIndex(-1)
    setBarWidths(new Array(5).fill(0))
    setDone(false); setFlashDone(false)

    const t1 = setTimeout(() => setStep(1), 200)
    const t2 = setTimeout(() => { setStep(2); animateBars() }, 700)
    return () => {
      clearTimeout(t1); clearTimeout(t2)
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [visible, animateBars])

  if (!visible) return null

  return (
    <View style={styles.root}>

      {/* 헤더 */}
      <Reveal show={step >= 1} duration={500} fromY={-24} style={styles.header}>
        <View
          style={[
            styles.statusPill,
            done
              ? { backgroundColor: alpha(palette.green[500], 0.15), borderColor: alpha(palette.green[500], 0.4), boxShadow: "0 0 20px rgba(74,222,128,0.2)" }
              : { backgroundColor: alpha(palette.blue[500], 0.15), borderColor: alpha(palette.blue[500], 0.3) },
          ]}
        >
          {done ? (
            <Text style={styles.check}>✓</Text>
          ) : step >= 2 ? (
            <View style={styles.dotBox}>
              <Ping duration={1000} style={[styles.dot, styles.dotAbs, { backgroundColor: palette.blue[400] }]} />
            </View>
          ) : (
            <Pulse>
              <View style={[styles.dot, { backgroundColor: palette.yellow[400] }]} />
            </Pulse>
          )}
          <Text style={[styles.statusText, { color: done ? palette.green[300] : palette.blue[300] }]}>
            {done ? "Analysis Complete" : step >= 2 ? "Scanning DNA..." : "Initializing"}
          </Text>
        </View>
        <Text style={styles.title}>5대 투자 능력</Text>
        <Text style={styles.subtitle}>분석 후 당신의 실제 수치를 확인하세요</Text>
      </Reveal>

      {/* 능력 바 목록 */}
      <View style={styles.list}>
        {ABILITIES.map((ability, i) => (
          <Reveal key={i} show={step >= 2} duration={500} delay={i * 80} fromX={-20}>
            <AbilityBar
              ability={ability}
              barWidth={barWidths[i]}
              active={scanIndex === i}
              scanned={scanIndex > i}
              idx={i}
            />
          </Reveal>
        ))}
      </View>

      {/* 완료 메시지 */}
      <Reveal show={done} duration={600} fromY={12} fromScale={0.95} style={styles.doneWrap}>
        <View style={styles.doneBox}>
          <Text style={styles.doneIcon}>🔒</Text>
          <Text style={styles.doneText}>실제 수치는 테스트 완료 후 공개됩니다</Text>
        </View>
      </Reveal>

      {/* 탭 버튼 */}
      <Reveal show={step >= 3} duration={500} fromY={24} style={styles.tapWrap} pointerEvents="box-none">
        <Pressable
          onPress={() => {
            playClickSound()
            onComplete()
          }}
          style={({ pressed }) => [styles.tapArea, pressed && { transform: [{ scale: 0.95 }] }]}
        >
          <View style={styles.tapPill}>
            <Pulse>
              <View style={[styles.dot, { backgroundColor: palette.blue[400] }]} />
            </Pulse>
            <Text style={styles.tapText}>탭하여 계속</Text>
          </View>
        </Pressable>
      </Reveal>

      {/* 완료 플래시 오버레이 */}
      <Reveal show={flashDone} duration={300} pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash]}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="abilitiesDoneFlash" cx="50%" cy="50%" rx="70%" ry="70%">
              <Stop offset="0" stopColor="rgb(59,130,246)" stopOpacity={0.18} />
              <Stop offset="1" stopColor="rgb(59,130,246)" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#abilitiesDoneFlash)" />
        </Svg>
      </Reveal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, zIndex: 10 },
  flash: { zIndex: 50 },
  header: { alignItems: "center", marginBottom: 24 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    marginBottom: 16,
  },
  check: { color: palette.green[400], fontSize: 12 },
  dotBox: { width: 8, height: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotAbs: { position: "absolute", top: 0, left: 0 },
  statusText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" },
  title: { fontSize: 24, fontWeight: "900", color: "#ffffff", marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 14, color: palette.gray[500], textAlign: "center" },
  list: { width: "100%", maxWidth: 384, gap: 10 },
  bar: { borderRadius: 16, padding: 14, borderWidth: 1 },
  beamClip: { borderRadius: 16, overflow: "hidden" },
  barHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  barIcon: { fontSize: 20, color: "#ffffff" },
  barLabel: { flex: 1, fontSize: 14, fontWeight: "700", color: "#ffffff" },
  slot: { fontSize: 14, fontFamily: MONO, fontWeight: "900", fontVariant: ["tabular-nums"], width: 32, textAlign: "right" },
  track: { height: 8, backgroundColor: alpha("#ffffff", 0.08), borderRadius: 9999, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 9999, overflow: "hidden" },
  sparkle: { position: "absolute", right: 0, top: 0, bottom: 0, width: 16 },
  doneWrap: { marginTop: 20 },
  doneBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: alpha(palette.green[500], 0.1),
    borderWidth: 1,
    borderColor: alpha(palette.green[500], 0.25),
  },
  doneIcon: { color: palette.green[400], fontSize: 14 },
  doneText: { fontSize: 12, color: palette.green[300], fontWeight: "500" },
  tapWrap: { position: "absolute", bottom: 112, left: 0, right: 0 },
  tapArea: { alignItems: "center" },
  tapPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.15),
    backgroundColor: "rgba(32,32,40,0.9)",
  },
  tapDot: { width: 8, height: 8, backgroundColor: palette.blue[400], borderRadius: 4 },
  tapText: { fontSize: 14, color: palette.gray[300] },
})
