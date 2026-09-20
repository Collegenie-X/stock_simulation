/**
 * 기본 전략 상세 페이지 — 첫 화면엔 캐릭터와 핵심만, 나머지는 펼치기/닫기
 */
import React, { useEffect, useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Brain, ChevronDown, Gamepad2, Layers } from "lucide-react-native"
import { MobileHeader, Screen } from "@/components/layout"
import { LiveMiniChart, valuesToPoints } from "@/components/charts"
import { FadeUp, Float, Gradient, Ping, Pop } from "@/components/ui"
import { type BasicStrategy } from "@/data/pattern-practice"
import { alpha, palette } from "@/theme"
import { CollapsibleSection } from "../../scenarios/components/CollapsibleSection"
import { DetailBottomBar } from "./DetailBottomBar"

const TALK_INTERVAL = 3400

const RULES = [
  { emoji: "💰", text: "100만원으로 시작해요 (현금 반 + 주식 반)" },
  { emoji: "📈", text: "10턴 동안 사거나 팔거나 기다려요" },
  { emoji: "⏱️", text: "한 턴에 15초 — 빠르게 결정해요!" },
  { emoji: "🎯", text: "조금(25%) / 반반(50%) / 많이(75%) / 전부(100%)" },
  { emoji: "🏆", text: "번 돈 + 좋은 선택으로 점수를 받아요" },
]

export function BasicStrategyDetail({ strategy }: { strategy: BasicStrategy }) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [heroOpen, setHeroOpen] = useState(false)
  const [talkIdx, setTalkIdx] = useState(0)

  const lines = useMemo(() => [strategy.keyLesson, strategy.wavePattern], [strategy])
  useEffect(() => {
    const t = setInterval(() => setTalkIdx((i) => (i + 1) % lines.length), TALK_INTERVAL)
    return () => clearInterval(t)
  }, [lines.length, talkIdx])

  const color = palette.emerald[400]
  const buyCount = strategy.scenarios.filter((s) => s.signal === "buy").length

  return (
    <Screen
      bg="#191919"
      withHeader
      safeBottom={false}
      contentStyle={{ paddingHorizontal: 20, paddingBottom: 128 + insets.bottom }}
      fixed={
        <>
          <MobileHeader title={strategy.name} showBack showSettings />
          <DetailBottomBar
            onList={() => router.push("/learn?tab=patterns")}
            onPractice={() => router.push(`/learn/patterns/${strategy.id}/practice`)}
            practiceLabel="전략 연습하기"
            practiceIcon={<Brain size={16} color="#ffffff" />}
            practiceColors={[palette.emerald[500], palette.teal[600]]}
          />
        </>
      }
    >
      {/* 1. 히어로 (접기/펼치기) */}
      <Gradient dir="br" colors={[palette.emerald[600], palette.teal[700]]} style={styles.hero}>
        <Pressable style={{ padding: 16 }} onPress={() => setHeroOpen(!heroOpen)}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <Float duration={2000} distance={4}>
              <Text style={{ fontSize: 30, color: "#ffffff" }}>{strategy.emoji}</Text>
            </Float>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.heroBadges}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>🧠 {strategy.category}</Text>
                </View>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>10턴 연습</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>{strategy.name}</Text>
              <Text style={styles.heroSub}>{strategy.nameEn}</Text>
            </View>
            <View style={[{ marginTop: 4, opacity: 0.6 }, heroOpen && { transform: [{ rotate: "180deg" }] }]}>
              <ChevronDown size={16} color="#ffffff" />
            </View>
          </View>
        </Pressable>
        {heroOpen && (
          <FadeUp duration={300} distance={8} style={styles.heroBody}>
            <Text style={styles.heroDesc}>{strategy.description}</Text>
          </FadeUp>
        )}
      </Gradient>

      {/* 2. 전략 캐릭터 */}
      <View style={[styles.charCard, { backgroundColor: alpha(color, 0.08), borderColor: alpha(color, 0.3) }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={styles.avatarWrap}>
            <Ping style={[styles.avatarRing, { borderColor: color }]} duration={2200} scaleTo={1.35} />
            <Float duration={1800} distance={5}>
              <View style={[styles.avatar, { borderColor: color, backgroundColor: alpha(color, 0.15) }]}>
                <Text style={{ fontSize: 30, color: "#ffffff" }}>{strategy.emoji}</Text>
              </View>
            </Float>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 15, fontWeight: "900", color }}>🧠 {strategy.category} 연습</Text>
            <View style={styles.chips}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>🎮 {strategy.scenarios.length}판</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>🛒 살 기회 {buyCount}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>⏱️ 15초</Text>
              </View>
            </View>
          </View>
        </View>

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
      </View>

      {/* 3. 연습 시나리오 (접기/펼치기) */}
      <CollapsibleSection
        title="어떤 판을 연습해요?"
        icon={<Layers size={16} color={palette.indigo[400]} />}
        badge={`${strategy.scenarios.length}판`}
      >
        <View style={{ gap: 10 }}>
          {strategy.scenarios.map((scenario, idx) => {
            const isBuy = scenario.signal === "buy"
            const c = isBuy ? palette.green : palette.red
            return (
              <Pop key={scenario.id} delay={idx * 90} style={styles.scenario}>
                <View style={styles.scenarioHead}>
                  <View style={styles.scenarioNo}>
                    <Text style={styles.scenarioNoText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={styles.scenarioTitle}>
                      {scenario.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.scenarioTheme}>
                      {scenario.theme}
                    </Text>
                  </View>
                  <LiveMiniChart points={valuesToPoints(scenario.prices)} color={c[400]} width={60} height={32} />
                  <View style={[styles.signal, { backgroundColor: alpha(c[500], 0.15), borderColor: alpha(c[500], 0.25) }]}>
                    <Text style={[styles.signalText, { color: c[400] }]}>{isBuy ? "↑ 사기" : "↓ 팔기"}</Text>
                  </View>
                </View>
                <View style={styles.tipBox}>
                  <Text style={[styles.subTitle, { color: palette.yellow[400] }]}>💡 이렇게 해보세요</Text>
                  <Text style={styles.subBody}>{scenario.strategyTip}</Text>
                </View>
              </Pop>
            )
          })}
        </View>
      </CollapsibleSection>

      {/* 4. 게임 규칙 (접기/펼치기) */}
      <CollapsibleSection title="게임 규칙" icon={<Gamepad2 size={16} color={palette.yellow[400]} />} badge={`${RULES.length}개`}>
        <View style={styles.rules}>
          {RULES.map((r, i) => (
            <View key={i} style={styles.ruleRow}>
              <Text style={styles.ruleEmoji}>{r.emoji}</Text>
              <Text style={styles.ruleText}>{r.text}</Text>
            </View>
          ))}
        </View>
      </CollapsibleSection>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { marginTop: 16, borderRadius: 16, overflow: "hidden" },
  heroBadges: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 },
  heroBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: alpha("#ffffff", 0.2), borderWidth: 1, borderColor: alpha("#ffffff", 0.3) },
  heroBadgeText: { fontSize: 10, fontWeight: "700", color: "#ffffff" },
  heroTitle: { fontSize: 18, fontWeight: "700", color: "#ffffff", lineHeight: 23 },
  heroSub: { fontSize: 12, color: alpha("#ffffff", 0.7), marginTop: 2 },
  heroBody: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.1) },
  heroDesc: { fontSize: 13, color: alpha("#ffffff", 0.9), lineHeight: 20, marginTop: 12 },

  charCard: { marginTop: 12, borderRadius: 20, borderWidth: 1, padding: 16 },
  avatarWrap: { width: 68, height: 68, alignItems: "center", justifyContent: "center" },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  avatarRing: { position: "absolute", width: 60, height: 60, borderRadius: 30, borderWidth: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: alpha("#000000", 0.35), borderWidth: 1, borderColor: alpha("#ffffff", 0.12) },
  chipText: { fontSize: 10, fontWeight: "700", color: "#ffffff" },
  bubble: { marginTop: 12, backgroundColor: alpha("#000000", 0.3), borderRadius: 14, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8, minHeight: 58 },
  bubbleText: { fontSize: 13, fontWeight: "700", color: "#ffffff", lineHeight: 19 },
  dots: { flexDirection: "row", gap: 4, marginTop: 8 },
  dot: { width: 5, height: 5, borderRadius: 9999, backgroundColor: alpha("#ffffff", 0.2) },

  scenario: { backgroundColor: "#252525", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  scenarioHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  scenarioNo: { width: 24, height: 24, borderRadius: 12, backgroundColor: alpha(palette.indigo[500], 0.2), alignItems: "center", justifyContent: "center" },
  scenarioNoText: { fontSize: 12, fontWeight: "900", color: palette.indigo[300] },
  scenarioTitle: { fontSize: 13, fontWeight: "700", color: "#ffffff" },
  scenarioTheme: { fontSize: 10, lineHeight: 14, color: palette.gray[500], marginTop: 2 },
  signal: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  signalText: { fontSize: 10, fontWeight: "700" },
  tipBox: { marginTop: 8, backgroundColor: alpha(palette.yellow[500], 0.08), borderRadius: 10, padding: 10, borderWidth: 1, borderColor: alpha(palette.yellow[500], 0.15) },
  subTitle: { fontSize: 10, fontWeight: "700", marginBottom: 4 },
  subBody: { fontSize: 11, lineHeight: 17, color: palette.gray[300] },

  rules: { backgroundColor: "#1a1a1a", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), gap: 10 },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  ruleEmoji: { fontSize: 18, color: "#ffffff" },
  ruleText: { flex: 1, fontSize: 12, lineHeight: 18, color: palette.gray[300] },
})
