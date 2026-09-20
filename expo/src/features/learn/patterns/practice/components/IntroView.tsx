import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { Flame, Play } from "lucide-react-native"
import { Screen } from "@/components/layout"
import { Float, Gradient } from "@/components/ui"
import { INITIAL_CASH } from "@/data/pattern-practice"
import { alpha, palette } from "@/theme"
import { BottomFadeBar } from "./BottomFadeBar"
import { GradientCta } from "./GradientCta"

interface Props {
  displayEmoji: string
  displayName: string
  displayNameEn: string
  isBasicStrategy: boolean
  totalRounds: number
  turnsPerRound: number
  introGradient: readonly string[]
  onStart: () => void
}

export function IntroView({ displayEmoji, displayName, displayNameEn, isBasicStrategy, totalRounds, turnsPerRound, introGradient, onStart }: Props) {
  const router = useRouter()
  const pill = isBasicStrategy ? [palette.emerald[500], palette.teal[500]] : [palette.indigo[500], palette.purple[500]]

  const rules = [
    { emoji: "💰", text: `${(INITIAL_CASH / 10000).toFixed(0)}만원으로 시작 (현금 50% + 주식 50%)`, from: palette.indigo[500], to: palette.indigo[600] },
    { emoji: "📈", text: "선 그래프가 자동으로 그려져요", from: palette.blue[500], to: palette.blue[600] },
    { emoji: "🎯", text: `${turnsPerRound}턴 동안 % 단위로 사거나 팔거나 기다려요`, from: palette.green[500], to: palette.green[600] },
    { emoji: "⏱️", text: "조금(25%) / 반반(50%) / 많이(75%) / 전부(100%)", from: palette.yellow[500], to: palette.yellow[600] },
    { emoji: "🏆", text: "끝나면 수익 + 올바른 판단에 따라 점수 매겨요!", from: palette.red[500], to: palette.red[600] },
  ]

  return (
    <Screen
      bg="#000000"
      safeBottom={false}
      contentStyle={styles.content}
      fixed={
        <BottomFadeBar>
          <GradientCta colors={introGradient} onPress={onStart} style={{ flex: 1 }}>
            <Play size={24} color="#ffffff" />
            <Text style={styles.startText}>게임 시작!</Text>
          </GradientCta>
        </BottomFadeBar>
      }
    >
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/learn?tab=patterns"))}
        hitSlop={8}
        style={styles.back}
      >
        <Text style={styles.backText}>← 뒤로</Text>
      </Pressable>

      <View style={styles.hero}>
        <Float duration={1000} distance={20} style={{ marginBottom: 16 }}>
          <Text style={styles.heroEmoji}>{displayEmoji}</Text>
        </Float>
        <Text style={styles.heroTitle}>{displayName}</Text>
        <Text style={styles.heroSub}>{displayNameEn}</Text>
        <Gradient
          dir="r"
          colors={[alpha(pill[0], 0.2), alpha(pill[1], 0.2)]}
          style={[styles.pill, { borderColor: alpha(pill[0], 0.4) }]}
        >
          <Flame size={20} color={palette.orange[400]} />
          <Text style={styles.pillText}>
            {totalRounds}라운드 · {turnsPerRound}턴
          </Text>
        </Gradient>
      </View>

      <View style={styles.rules}>
        {rules.map((r, i) => (
          <Gradient key={i} dir="r" colors={[alpha(r.from, 0.2), alpha(r.to, 0.2)]} style={[styles.rule, { borderColor: alpha(r.from, 0.3) }]}>
            <Text style={styles.ruleEmoji}>{r.emoji}</Text>
            <Text style={styles.ruleText}>{r.text}</Text>
          </Gradient>
        ))}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 160 },
  back: { alignSelf: "flex-start", marginTop: 16, marginBottom: 16 },
  backText: { fontSize: 14, color: palette.gray[500] },
  hero: { alignItems: "center", marginTop: 8 },
  heroEmoji: { fontSize: 96, lineHeight: 112, color: "#ffffff" },
  heroTitle: { fontSize: 30, fontWeight: "900", color: "#ffffff", letterSpacing: -0.4, textAlign: "center" },
  heroSub: { fontSize: 16, color: palette.gray[500], marginTop: 4, textAlign: "center" },
  pill: { marginTop: 16, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 9999, borderWidth: 1 },
  pillText: { fontSize: 18, fontWeight: "900", color: "#ffffff" },
  rules: { marginTop: 32, gap: 12 },
  rule: { flexDirection: "row", alignItems: "center", gap: 16, padding: 16, borderRadius: 16, borderWidth: 1 },
  ruleEmoji: { fontSize: 30, color: "#ffffff" },
  ruleText: { flex: 1, fontSize: 16, fontWeight: "700", color: "#ffffff" },
  startText: { fontSize: 20, fontWeight: "900", color: "#ffffff" },
})
