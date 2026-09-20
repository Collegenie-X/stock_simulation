import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BounceIn, FadeUp, Gradient } from "@/components/ui"
import { playClickSound } from "@/lib/sound"
import { alpha, palette } from "@/theme"
import type { PersonalityType } from "../types"
import { PERSONALITY_META, PERSONALITY_COLORS, PARTICLE_EMOJIS, SCORE_MESSAGES } from "../config"

// ─── Particle Burst ────────────────────────────────────────────────────────────

interface Particle {
  id: number
  emoji: string
  x: number
  y: number
  vx: number
  vy: number
  scale: number
  rotation: number
  opacity: number
}

/** animate-particleBurst: 1.2s ease-out, 중심에서 (vx, vy) 로 날아가며 축소·회전·페이드아웃 */
function ParticleItem({ p }: { p: Particle }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [v])

  const fontSize = 20 + p.scale * 10
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: `${p.x}%`,
        top: `${p.y}%`,
        marginLeft: -fontSize / 2,
        marginTop: -fontSize / 2,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        transform: [
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, p.vx] }) },
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, p.vy] }) },
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [p.scale, 0.2] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: [`${p.rotation}deg`, `${p.rotation + 360}deg`] }) },
        ],
      }}
    >
      <Text style={{ fontSize, color: "#ffffff" }}>{p.emoji}</Text>
    </Animated.View>
  )
}

export function ParticleBurst({ personalityType, trigger }: { personalityType: PersonalityType | null; trigger: number }) {
  const [particles, setParticles] = useState<Particle[]>([])
  const idRef = useRef(0)

  useEffect(() => {
    if (!personalityType || trigger === 0) return

    const emojis = PARTICLE_EMOJIS[personalityType]
    const newParticles: Particle[] = []
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5
      const speed = 60 + Math.random() * 100
      newParticles.push({
        id: ++idRef.current,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: 50,
        y: 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        scale: 0.6 + Math.random() * 0.8,
        rotation: Math.random() * 360,
        opacity: 1,
      })
    }
    setParticles(newParticles)

    const timer = setTimeout(() => setParticles([]), 1500)
    return () => clearTimeout(timer)
  }, [personalityType, trigger])

  if (particles.length === 0) return null

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overflowHidden, { zIndex: 50 }]}>
      {particles.map((p) => (
        <ParticleItem key={p.id} p={p} />
      ))}
    </View>
  )
}

// ─── Combo Burst ────────────────────────────────────────────────────────────────

/** animate-flameJitter: scale 1↔1.1, rotate -2deg↔2deg, 0.6s 반복 */
export function FlameJitter({ children }: { children: ReactNode }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [v])
  return (
    <Animated.View
      style={{
        transform: [
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["-2deg", "2deg"] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  )
}

/** animate-comboPop (1.6s ease-out) */
function ComboPop({ children }: { children: ReactNode }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [v])
  const range = [0, 0.25, 0.5, 0.75, 1]
  return (
    <Animated.View
      style={{
        opacity: v.interpolate({ inputRange: range, outputRange: [0, 1, 1, 1, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: range, outputRange: [40, -10, 0, -4, -50] }) },
          { scale: v.interpolate({ inputRange: range, outputRange: [0.4, 1.25, 1, 1.05, 0.9] }) },
          { rotate: v.interpolate({ inputRange: range, outputRange: ["-8deg", "4deg", "-2deg", "0deg", "0deg"] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  )
}

export function ComboBurst({
  combo,
  trigger,
  personalityType,
}: {
  combo: number
  trigger: number
  personalityType: PersonalityType | null
}) {
  const insets = useSafeAreaInsets()
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (combo < 2 || trigger === 0) return
    setShow(true)
    const t = setTimeout(() => setShow(false), 1500)
    return () => clearTimeout(t)
  }, [combo, trigger])

  if (!show || !personalityType) return null
  const c = PERSONALITY_COLORS[personalityType]
  const tier = combo >= 5 ? "MEGA COMBO!" : combo >= 4 ? "SUPER COMBO!" : combo >= 3 ? "COMBO!" : "콤보!"

  return (
    <View pointerEvents="none" style={[styles.topCenter, { top: insets.top + 112, zIndex: 50 }]}>
      <ComboPop key={trigger}>
        <View style={[styles.comboBox, { borderColor: c.border, backgroundColor: solidBg(c.accent[0]), boxShadow: c.glow }]}>
          <FlameJitter>
            <Text style={styles.comboFlame}>🔥</Text>
          </FlameJitter>
          <Text style={[styles.comboText, { color: c.text }]}>
            x{combo} {tier}
          </Text>
        </View>
      </ComboPop>
    </View>
  )
}

// ─── Level Up Ring ──────────────────────────────────────────────────────────────

/** animate-levelUpRing: scale 0.6→2.4, opacity 0.9→0, 1.2s ease-out */
function Ring({ color, delay = 0 }: { color: string; delay?: number }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration: 1200, delay, easing: Easing.out(Easing.ease), useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [v, delay])
  return (
    <Animated.View
      style={[
        styles.ring,
        {
          borderColor: color,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.4] }) }],
        },
      ]}
    />
  )
}

export function LevelUpRing({ trigger }: { trigger: number }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (trigger === 0) return
    setShow(true)
    const t = setTimeout(() => setShow(false), 1500)
    return () => clearTimeout(t)
  }, [trigger])

  if (!show) return null

  return (
    <View pointerEvents="none" key={trigger} style={[StyleSheet.absoluteFill, styles.center, { zIndex: 40 }]}>
      <Ring color={palette.yellow[400]} />
      <Ring color={alpha(palette.yellow[300], 0.6)} delay={200} />
      <BounceIn>
        <Text style={styles.levelUpText}>LEVEL UP! ⬆️</Text>
      </BounceIn>
    </View>
  )
}

// ─── Score Pop ──────────────────────────────────────────────────────────────────

/** animate-scorePop (1.8s ease-out) */
function ScorePopAnim({ children }: { children: ReactNode }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [v])
  return (
    <Animated.View
      style={{
        opacity: v.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [30, 0, 0, -20] }) },
          { scale: v.interpolate({ inputRange: [0, 0.2, 0.4, 1], outputRange: [0.5, 1.1, 1, 0.9] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  )
}

export function ScorePop({ show, personalityType }: { show: boolean; personalityType: PersonalityType | null }) {
  const insets = useSafeAreaInsets()
  // 표시될 때마다 한 번만 메시지를 뽑는다 (리렌더 시 문구가 바뀌지 않도록)
  const msg = useMemo(
    () => SCORE_MESSAGES[Math.floor(Math.random() * SCORE_MESSAGES.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [show]
  )

  if (!show || !personalityType) return null

  const meta = PERSONALITY_META[personalityType]
  const c = PERSONALITY_COLORS[personalityType]

  return (
    <View pointerEvents="none" style={[styles.topCenter, { top: insets.top + 64, zIndex: 50 }]}>
      <ScorePopAnim>
        <View style={[styles.scoreBox, { borderColor: c.border, backgroundColor: solidBg(c.accent[0]), boxShadow: c.glow }]}>
          <Text style={styles.scoreEmoji}>{meta.emoji}</Text>
          <Text style={[styles.scorePlus, { color: c.text }]}>+10</Text>
          <Text style={styles.scoreMsg}>{msg}</Text>
        </View>
      </ScorePopAnim>
    </View>
  )
}

// ─── Feedback Timer Bar ─────────────────────────────────────────────────────────

export function FeedbackTimer({
  show,
  durationMs,
  personalityType,
  onSkip,
}: {
  show: boolean
  durationMs: number
  personalityType: PersonalityType | null
  onSkip: () => void
}) {
  const c = personalityType ? PERSONALITY_COLORS[personalityType] : null
  const width = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!show) return
    width.setValue(1)
    // shrinkWidth: width 100% → 0% (linear)
    const anim = Animated.timing(width, { toValue: 0, duration: durationMs, easing: Easing.linear, useNativeDriver: false })
    anim.start()
    return () => anim.stop()
  }, [show, durationMs, width])

  if (!show || !c) return null

  return (
    <FadeUp style={styles.timerWrap}>
      <Pressable
        onPress={() => {
          playClickSound()
          onSkip()
        }}
        style={({ pressed }) => [
          styles.timerBtn,
          { borderColor: c.border, backgroundColor: c.bg },
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.timerFill,
            { width: width.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) },
          ]}
        >
          <Gradient dir="r" colors={c.accent} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Text style={[styles.timerText, { color: c.text }]}>다음으로 →</Text>
      </Pressable>
    </FadeUp>
  )
}

// ─── Screen Flash ───────────────────────────────────────────────────────────────

/** animate-screenFlash: opacity 0.15 → 0, 0.4s ease-out */
function FlashLayer({ colors }: { colors: readonly [string, string] }) {
  const v = useRef(new Animated.Value(0.15)).current
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [v])
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 40, opacity: v }]}>
      <Gradient dir="b" colors={colors} style={StyleSheet.absoluteFill} />
    </Animated.View>
  )
}

export function ScreenFlash({ personalityType, trigger }: { personalityType: PersonalityType | null; trigger: number }) {
  const [show, setShow] = useState(false)
  const c = personalityType ? PERSONALITY_COLORS[personalityType] : null

  useEffect(() => {
    if (!personalityType || trigger === 0) return
    setShow(true)
    const t = setTimeout(() => setShow(false), 400)
    return () => clearTimeout(t)
  }, [personalityType, trigger])

  if (!show || !c) return null

  return <FlashLayer key={trigger} colors={c.accent} />
}

/**
 * 웹에서는 반투명 bg(10%) 뒤로 검은 페이지가 비치지만, 떠 있는 팝업은 본문 위에 겹치므로
 * 가독성을 위해 검정 위에 10% 를 합성한 불투명 색을 사용한다.
 */
function solidBg(hex: string): string {
  const h = hex.replace("#", "")
  const r = Math.round(parseInt(h.slice(0, 2), 16) * 0.1)
  const g = Math.round(parseInt(h.slice(2, 4), 16) * 0.1)
  const b = Math.round(parseInt(h.slice(4, 6), 16) * 0.1)
  return `rgba(${r},${g},${b},0.92)`
}

const styles = StyleSheet.create({
  overflowHidden: { overflow: "hidden" },
  center: { alignItems: "center", justifyContent: "center" },
  topCenter: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  comboBox: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, borderWidth: 2, alignItems: "center", gap: 4 },
  comboFlame: { fontSize: 30, color: "#ffffff" },
  comboText: { fontSize: 16, fontWeight: "900", letterSpacing: 0.4 },
  ring: { position: "absolute", width: 160, height: 160, borderRadius: 80, borderWidth: 4 },
  levelUpText: {
    color: palette.yellow[300],
    fontWeight: "900",
    fontSize: 30,
    textShadowColor: "rgba(250,204,21,0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  scoreBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreEmoji: { fontSize: 20, color: "#ffffff" },
  scorePlus: { fontSize: 14, fontWeight: "700" },
  scoreMsg: { fontSize: 12, color: alpha("#ffffff", 0.6) },
  timerWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  timerBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  timerFill: { position: "absolute", left: 0, top: 0, bottom: 0, opacity: 0.2, overflow: "hidden" },
  timerText: { fontSize: 14, fontWeight: "700" },
})
