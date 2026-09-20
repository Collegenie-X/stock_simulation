import React, { useEffect, useMemo, useRef, useState } from "react"
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown } from "lucide-react-native"
import type { ChartPattern } from "@/data/chart-patterns"
import { FadeUp, Float, Ping, Pop } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { getPatternPersona, splitSteps, type PatternStat } from "../utils/personality"

const TALK_INTERVAL = 3400

// ── 성격 게이지 ───────────────────────────────────────────────────
function StatGauge({ stat, index }: { stat: PatternStat; index: number }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: stat.value, duration: 900, delay: 150 + index * 120, easing: Easing.out(Easing.cubic), useNativeDriver: false })
    anim.start()
    return () => anim.stop()
  }, [v, stat.value, index])

  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>
        {stat.emoji} {stat.label}
      </Text>
      <View style={styles.statTrack}>
        <Animated.View style={{ height: "100%", borderRadius: 9999, backgroundColor: stat.color, width: v.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) }} />
      </View>
      <Text style={[styles.statComment, { color: stat.color }]}>{stat.comment}</Text>
    </View>
  )
}

// ── 패턴 캐릭터 카드 ──────────────────────────────────────────────
export function PatternCharacterSection({ pattern }: { pattern: ChartPattern }) {
  const persona = useMemo(() => getPatternPersona(pattern), [pattern])
  const readSteps = useMemo(() => splitSteps(pattern.howToRead), [pattern])
  const [talkIdx, setTalkIdx] = useState(0)
  const [open, setOpen] = useState(false)

  // 말풍선: 한 번에 한 줄씩
  const lines = useMemo(() => [persona.catchphrase, ...pattern.keyPoints], [persona, pattern])

  useEffect(() => {
    if (lines.length < 2) return
    const t = setInterval(() => setTalkIdx((i) => (i + 1) % lines.length), TALK_INTERVAL)
    return () => clearInterval(t)
  }, [lines.length, talkIdx])

  const color = persona.color

  return (
    <View style={[styles.card, { backgroundColor: alpha(color, 0.08), borderColor: alpha(color, 0.3) }]}>
      {/* 캐릭터 */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={styles.avatarWrap}>
          <Ping style={[styles.avatarRing, { borderColor: color }]} duration={2200} scaleTo={1.35} />
          <Float duration={1800} distance={5}>
            <View style={[styles.avatar, { borderColor: color, backgroundColor: alpha(color, 0.15) }]}>
              <Text style={{ fontSize: 30, color: "#ffffff" }}>{pattern.emoji}</Text>
            </View>
          </Float>
          <View style={[styles.avatarTag, { backgroundColor: color }]}>
            <Text style={{ fontSize: 8, fontWeight: "900", color: "#111111" }}>Lv.{pattern.difficulty}</Text>
          </View>
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 15, fontWeight: "900", color }}>
            {persona.emoji} {persona.title}
          </Text>
          <View style={styles.personaBadge}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#ffffff" }}>{persona.signalWord}</Text>
          </View>
        </View>
      </View>

      {/* 말풍선 */}
      <Pressable onPress={() => setTalkIdx((i) => (i + 1) % lines.length)} style={styles.bubble}>
        <FadeUp key={talkIdx} duration={300} distance={6}>
          <Text style={styles.bubbleText}>“{lines[talkIdx]}”</Text>
        </FadeUp>
        <View style={styles.dots}>
          {lines.map((_, i) => (
            <View key={i} style={[styles.dot, i === talkIdx && { backgroundColor: color, width: 12 }]} />
          ))}
        </View>
      </Pressable>

      {/* 성격 게이지 */}
      <View style={{ gap: 8, marginTop: 14 }}>
        {persona.stats.map((s, i) => (
          <StatGauge key={s.key} stat={s} index={i} />
        ))}
      </View>

      {/* 자세히 보기 */}
      <Pressable onPress={() => setOpen(!open)} style={styles.moreBtn}>
        <Text style={{ fontSize: 11, fontWeight: "700", color }}>{open ? "접기" : "어떻게 찾아요? 자세히 보기"}</Text>
        <View style={open ? { transform: [{ rotate: "180deg" }] } : undefined}>
          <ChevronDown size={14} color={color} />
        </View>
      </Pressable>

      {open && (
        <FadeUp duration={300} distance={8} style={{ gap: 10, marginTop: 10 }}>
          {readSteps.length > 0 ? (
            readSteps.map((step, i) => (
              <Pop key={step} delay={i * 130} style={styles.readStep}>
                <View style={[styles.stepNo, { backgroundColor: alpha(color, 0.2), borderColor: alpha(color, 0.4) }]}>
                  <Text style={{ fontSize: 10, fontWeight: "900", color }}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </Pop>
            ))
          ) : (
            <Text style={styles.stepText}>{pattern.howToRead}</Text>
          )}
        </FadeUp>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { marginTop: 12, borderRadius: 20, borderWidth: 1, padding: 16 },
  avatarWrap: { width: 68, height: 72, alignItems: "center", justifyContent: "center" },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  avatarRing: { position: "absolute", width: 60, height: 60, borderRadius: 30, borderWidth: 2 },
  avatarTag: { position: "absolute", bottom: 0, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 9999 },
  personaBadge: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: alpha("#000000", 0.35), borderWidth: 1, borderColor: alpha("#ffffff", 0.12) },
  bubble: { marginTop: 12, backgroundColor: alpha("#000000", 0.3), borderRadius: 14, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8, minHeight: 58 },
  bubbleText: { fontSize: 13, fontWeight: "700", color: "#ffffff", lineHeight: 19 },
  dots: { flexDirection: "row", gap: 4, marginTop: 8 },
  dot: { width: 5, height: 5, borderRadius: 9999, backgroundColor: alpha("#ffffff", 0.2) },
  statRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statLabel: { width: 62, fontSize: 11, fontWeight: "700", color: palette.gray[300] },
  statTrack: { flex: 1, height: 8, borderRadius: 9999, backgroundColor: alpha("#000000", 0.35), overflow: "hidden" },
  statComment: { width: 74, fontSize: 10, fontWeight: "700", textAlign: "right" },
  moreBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: alpha("#000000", 0.2) },
  readStep: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  stepNo: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  stepText: { flex: 1, fontSize: 12, lineHeight: 18, color: palette.gray[200] },
})
