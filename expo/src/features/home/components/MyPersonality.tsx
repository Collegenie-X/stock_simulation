import { useEffect, useState } from "react"
import { Platform, StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { Gradient, PressableScale } from "@/components/ui"
import { localStore } from "@/lib/storage"
import { alpha, palette } from "@/theme"
import { PERSONALITY_META } from "@/features/analysis/config"
import type { PersonalityType } from "@/features/analysis/types"
import PersonalityCharacter from "@/features/analysis/components/PersonalityCharacter"

interface DnaResult {
  primaryPersonality: PersonalityType
  secondaryPersonality: PersonalityType | null
  challengerScore: number
}

/** 웹 PERSONALITY_META 의 Tailwind 클래스(accent/border/bg/text)를 RN 색상으로 옮긴 것 */
const PERSONALITY_COLORS: Record<PersonalityType, { accent: [string, string]; border: string; bg: string; text: string }> = {
  analyst: { accent: [palette.blue[500], palette.cyan[500]], border: alpha(palette.blue[500], 0.6), bg: alpha(palette.blue[500], 0.1), text: palette.blue[300] },
  challenger: { accent: [palette.orange[500], palette.red[500]], border: alpha(palette.orange[500], 0.6), bg: alpha(palette.orange[500], 0.1), text: palette.orange[300] },
  conservative: { accent: [palette.green[500], palette.emerald[500]], border: alpha(palette.green[500], 0.6), bg: alpha(palette.green[500], 0.1), text: palette.green[300] },
  emotional: { accent: [palette.purple[500], palette.violet[500]], border: alpha(palette.purple[500], 0.6), bg: alpha(palette.purple[500], 0.1), text: palette.purple[300] },
  systematic: { accent: [palette.cyan[500], palette.teal[500]], border: alpha(palette.cyan[500], 0.6), bg: alpha(palette.cyan[500], 0.1), text: palette.cyan[300] },
}

export default function MyPersonality() {
  const router = useRouter()
  const [dna, setDna] = useState<DnaResult | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStore.getItem("compete_dna_result")
      if (raw) setDna(JSON.parse(raw))
    } catch {}
    setLoaded(true)
  }, [])

  if (!loaded) return null

  // 측정 안 했을 때 — 측정 유도 카드
  if (!dna || !PERSONALITY_META[dna.primaryPersonality]) {
    return (
      <View style={styles.root}>
        <PressableScale onPress={() => router.push("/analysis")} scaleTo={0.99} style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🧬</Text>
          <View style={styles.flex1}>
            <Text style={styles.emptyTitle}>투자 성향 측정하기</Text>
            <Text style={styles.emptyDesc}>3분 만에 내 스타일 찾기</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </PressableScale>
      </View>
    )
  }

  const m = PERSONALITY_META[dna.primaryPersonality]
  const c = PERSONALITY_COLORS[dna.primaryPersonality]
  const sec = dna.secondaryPersonality ? PERSONALITY_META[dna.secondaryPersonality] : null

  return (
    <View style={styles.root}>
      <PressableScale
        onPress={() => router.push("/analysis?view=report")}
        scaleTo={0.99}
        style={[styles.card, { borderColor: c.border, backgroundColor: c.bg }]}
      >
        {/* glow */}
        <Gradient dir="r" colors={c.accent} style={styles.glow} pointerEvents="none" />

        {/* character */}
        <View style={styles.character}>
          <PersonalityCharacter type={dna.primaryPersonality} size={56} />
        </View>

        {/* info */}
        <View style={styles.info}>
          <View style={styles.tagRow}>
            <Text style={[styles.tag, { color: c.text, opacity: 0.7, letterSpacing: 0.9 }]}>MY DNA</Text>
            <Text style={[styles.tag, { color: alpha("#ffffff", 0.3) }]}>·</Text>
            <Text style={styles.score}>{dna.challengerScore}</Text>
          </View>
          <Text numberOfLines={1} style={[styles.label, { color: c.text }]}>
            {m.label}
          </Text>
          <Text numberOfLines={1} style={styles.catchphrase}>
            {m.catchphrase}
            {sec ? <Text style={{ color: alpha("#ffffff", 0.3) }}> · 보조 {sec.label}</Text> : null}
          </Text>
        </View>

        <Text style={styles.arrow}>→</Text>
      </PressableScale>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 20 },
  flex1: { flex: 1 },
  emptyCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: alpha("#ffffff", 0.04),
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.1),
  },
  emptyEmoji: { fontSize: 30, color: "#ffffff" },
  emptyTitle: { fontSize: 14, fontWeight: "900", color: "#ffffff" },
  emptyDesc: { fontSize: 11, color: alpha("#ffffff", 0.45), fontWeight: "600" },
  arrow: { color: alpha("#ffffff", 0.4), fontSize: 18, flexShrink: 0 },
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    paddingRight: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  glow: { position: "absolute", left: -24, top: -24, width: 96, height: 96, borderRadius: 48, opacity: 0.12 },
  character: { flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tag: { fontSize: 9, fontWeight: "900" },
  score: { fontSize: 9, color: alpha("#ffffff", 0.35), fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }) },
  label: { fontSize: 16, fontWeight: "900", lineHeight: 20 },
  catchphrase: { fontSize: 11, color: alpha("#ffffff", 0.55), fontWeight: "600" },
})
