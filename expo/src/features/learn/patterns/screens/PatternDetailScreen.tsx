import React, { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Coins, ListOrdered, TrendingUp, Zap } from "lucide-react-native"
import { MobileHeader, Screen } from "@/components/layout"
import { FadeUp, Float, Gradient, Pulse } from "@/components/ui"
import { CHART_PATTERNS, PATTERN_CATEGORIES, type ChartPattern } from "@/data/chart-patterns"
import { BASIC_STRATEGIES, type BasicStrategy } from "@/data/pattern-practice"
import { alpha, palette } from "@/theme"
import { CollapsibleSection } from "../../scenarios/components/CollapsibleSection"
import { SignalBadge, DifficultyBar, PatternSteps, ProfitScenario } from "../components"
import { BasicStrategyDetail } from "../components/BasicStrategyDetail"
import { DetailBottomBar } from "../components/DetailBottomBar"
import { PatternCharacterSection } from "../components/PatternCharacterSection"
import { PatternLiveChart } from "../components/PatternLiveChart"

// ── 히어로 (접기/펼치기) ──────────────────────────────────────────
function PatternHero({ pattern }: { pattern: ChartPattern }) {
  const [open, setOpen] = useState(false)
  const catConfig = PATTERN_CATEGORIES[pattern.category]

  return (
    <Gradient dir="br" colors={[palette.indigo[600], palette.purple[700]]} style={styles.hero}>
      <Pressable style={{ padding: 16 }} onPress={() => setOpen(!open)}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <Float duration={2000} distance={4}>
            <Text style={{ fontSize: 30, color: "#ffffff" }}>{pattern.emoji}</Text>
          </Float>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  {catConfig.emoji} {pattern.category}
                </Text>
              </View>
              <SignalBadge signal={pattern.signal} />
            </View>
            <Text style={styles.heroTitle}>{pattern.name}</Text>
            <Text style={styles.heroSub}>{pattern.nameEn}</Text>
          </View>
          <View style={[{ marginTop: 4, opacity: 0.6 }, open && { transform: [{ rotate: "180deg" }] }]}>
            <ChevronDown size={16} color="#ffffff" />
          </View>
        </View>
      </Pressable>

      {open && (
        <FadeUp duration={300} distance={8} style={styles.heroBody}>
          <Text style={styles.heroDesc}>{pattern.description}</Text>
          <View style={styles.heroBars}>
            <DifficultyBar value={pattern.difficulty} label="어려움" />
            <DifficultyBar value={pattern.reliability} label="믿음직" />
          </View>
        </FadeUp>
      )}
    </Gradient>
  )
}

export default function PatternDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [pattern, setPattern] = useState<ChartPattern | null>(null)
  const [basicStrategy, setBasicStrategy] = useState<BasicStrategy | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const id = params.id as string
    // 기본 전략 ID 먼저 확인
    const foundBasic = BASIC_STRATEGIES.find((s) => s.id === id)
    if (foundBasic) {
      setBasicStrategy(foundBasic)
      return
    }
    // 차트 패턴 확인
    const found = CHART_PATTERNS.find((p) => p.id === id)
    setPattern(found || null)
    if (found) {
      setCurrentIndex(CHART_PATTERNS.findIndex((p) => p.id === found.id))
    }
  }, [params.id])

  // 기본 전략 페이지
  if (basicStrategy) {
    return <BasicStrategyDetail strategy={basicStrategy} />
  }

  if (!pattern) {
    return (
      <Screen bg="#191919" scroll={false} contentStyle={styles.loading}>
        <Pulse>
          <Text style={styles.loadingEmoji}>📊</Text>
        </Pulse>
      </Screen>
    )
  }

  const prevPattern = currentIndex > 0 ? CHART_PATTERNS[currentIndex - 1] : null
  const nextPattern = currentIndex < CHART_PATTERNS.length - 1 ? CHART_PATTERNS[currentIndex + 1] : null

  return (
    <Screen
      bg="#191919"
      withHeader
      safeBottom={false}
      contentStyle={{ paddingHorizontal: 20, paddingBottom: 128 + insets.bottom }}
      fixed={
        <>
          <MobileHeader title={pattern.name} showBack showSettings />
          <DetailBottomBar
            onList={() => router.push("/learn?tab=patterns")}
            onPractice={() => router.push(`/learn/patterns/${pattern.id}/practice`)}
            practiceLabel="패턴 연습하기"
            practiceIcon={<TrendingUp size={16} color="#ffffff" />}
            practiceColors={[palette.indigo[500], palette.purple[600]]}
          />
        </>
      }
    >
      {/* 1. 히어로 (접기/펼치기) */}
      <PatternHero pattern={pattern} />

      {/* 2. 패턴 캐릭터 */}
      <PatternCharacterSection pattern={pattern} />

      {/* 3. 살아 움직이는 패턴 차트 */}
      <View style={{ marginTop: 20 }}>
        <View style={styles.sectionHead}>
          <Text style={{ fontSize: 16, color: "#ffffff" }}>📈</Text>
          <Text style={styles.sectionTitle}>이런 모양이 나와요</Text>
        </View>
        <PatternLiveChart chartData={pattern.chartData} signal={pattern.signal} />
      </View>

      {/* 4. 어떻게 만들어져요? */}
      <CollapsibleSection
        title="어떻게 만들어져요?"
        icon={<ListOrdered size={16} color={palette.blue[400]} />}
        badge={`${pattern.steps.length}단계`}
      >
        <View style={{ gap: 12 }}>
          <PatternSteps steps={pattern.steps} signal={pattern.signal} />
          <View style={styles.panel}>
            <Text style={[styles.panelLabel, { color: palette.orange[400] }]}>이런 일이 있었어요</Text>
            <Text style={styles.bodyText}>{pattern.example.situation}</Text>
            <View style={styles.hr} />
            <Text style={[styles.panelLabel, { color: palette.blue[400] }]}>이렇게 했어요</Text>
            <Text style={styles.bodyText}>{pattern.example.action}</Text>
            <View style={styles.hr} />
            <Text style={[styles.panelLabel, { color: palette.green[400] }]}>결과는?</Text>
            <Text style={[styles.bodyText, { fontWeight: "700", color: "#ffffff" }]}>{pattern.example.result}</Text>
          </View>
        </View>
      </CollapsibleSection>

      {/* 5. 얼마나 벌 수 있어요? */}
      <CollapsibleSection title="얼마나 벌 수 있어요?" icon={<Coins size={16} color={palette.green[400]} />} badge="돈 계산">
        <View style={{ gap: 12 }}>
          <ProfitScenario scenario={pattern.profitScenario} />
          <View style={[styles.callout, { backgroundColor: alpha(palette.orange[500], 0.1), borderColor: alpha(palette.orange[500], 0.2) }]}>
            <AlertTriangle size={16} color={palette.orange[400]} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.calloutTitle, { color: palette.orange[400] }]}>⚠️ 꼭 기억하세요!</Text>
              <View style={{ gap: 4 }}>
                <Text style={styles.warnText}>
                  • 이건 <Text style={styles.warnStrong}>예시일 뿐</Text>이라 꼭 이렇게 되진 않아요
                </Text>
                <Text style={styles.warnText}>
                  • 정한 가격까지 떨어지면 <Text style={styles.warnStrong}>바로 파는</Text> 연습을 해요
                </Text>
                <Text style={styles.warnText}>• 한 종목에 돈을 전부 넣으면 위험해요!</Text>
              </View>
            </View>
          </View>
        </View>
      </CollapsibleSection>

      {/* 6. 꿀팁 모음 */}
      <CollapsibleSection title="꿀팁 모음" icon={<Zap size={16} color={palette.yellow[400]} />} badge={`${pattern.keyPoints.length + 1}개`}>
        <View style={{ gap: 8 }}>
          <View style={[styles.callout, { backgroundColor: alpha(palette.yellow[500], 0.1), borderColor: alpha(palette.yellow[500], 0.2) }]}>
            <Text style={{ fontSize: 16, color: "#ffffff" }}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.calloutTitle, { color: palette.yellow[400] }]}>실전 꿀팁</Text>
              <Text style={styles.bodyText}>{pattern.tradingTip}</Text>
            </View>
          </View>
          {pattern.keyPoints.map((point, idx) => (
            <View key={idx} style={styles.keyPoint}>
              <View style={styles.keyPointNo}>
                <Text style={styles.keyPointNoText}>{idx + 1}</Text>
              </View>
              <Text style={styles.keyPointText}>{point}</Text>
            </View>
          ))}
        </View>
      </CollapsibleSection>

      {/* 이전/다음 패턴 네비게이션 */}
      <View style={styles.pager}>
        {prevPattern ? (
          <Pressable
            onPress={() => router.push(`/learn/patterns/${prevPattern.id}`)}
            style={({ pressed }) => [styles.pagerBtn, pressed && { backgroundColor: "#2a2a2a" }]}
          >
            <View style={styles.pagerHead}>
              <ChevronLeft size={12} color={palette.gray[500]} />
              <Text style={styles.pagerLabel}>이전 패턴</Text>
            </View>
            <Text numberOfLines={1} style={styles.pagerName}>
              {prevPattern.emoji} {prevPattern.name}
            </Text>
          </Pressable>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {nextPattern ? (
          <Pressable
            onPress={() => router.push(`/learn/patterns/${nextPattern.id}`)}
            style={({ pressed }) => [styles.pagerBtn, pressed && { backgroundColor: "#2a2a2a" }]}
          >
            <View style={[styles.pagerHead, { justifyContent: "flex-end" }]}>
              <Text style={styles.pagerLabel}>다음 패턴</Text>
              <ChevronRight size={12} color={palette.gray[500]} />
            </View>
            <Text numberOfLines={1} style={[styles.pagerName, { textAlign: "right" }]}>
              {nextPattern.emoji} {nextPattern.name}
            </Text>
          </Pressable>
        ) : (
          <View style={{ flex: 1 }} />
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", justifyContent: "center" },
  loadingEmoji: { fontSize: 36, color: "#ffffff" },

  hero: { marginTop: 16, borderRadius: 16, overflow: "hidden" },
  heroBadges: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 },
  heroBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: alpha("#ffffff", 0.2), borderWidth: 1, borderColor: alpha("#ffffff", 0.3) },
  heroBadgeText: { fontSize: 10, fontWeight: "700", color: "#ffffff" },
  heroTitle: { fontSize: 18, fontWeight: "700", color: "#ffffff", lineHeight: 23 },
  heroSub: { fontSize: 12, color: alpha("#ffffff", 0.7), marginTop: 2 },
  heroBody: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.1), gap: 12 },
  heroDesc: { fontSize: 13, color: alpha("#ffffff", 0.9), lineHeight: 20, marginTop: 12 },
  heroBars: { flexDirection: "row", gap: 12 },

  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff" },

  panel: { backgroundColor: "#252525", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), gap: 4 },
  panelLabel: { fontSize: 10, fontWeight: "700" },
  bodyText: { fontSize: 12, lineHeight: 18, color: palette.gray[300] },
  hr: { height: 1, backgroundColor: alpha("#ffffff", 0.05), marginVertical: 6 },

  callout: { borderWidth: 1, borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 8 },
  calloutTitle: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  warnText: { fontSize: 12, lineHeight: 18, color: palette.gray[300] },
  warnStrong: { color: "#ffffff", fontWeight: "700" },

  keyPoint: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "#252525", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  keyPointNo: { width: 24, height: 24, borderRadius: 12, backgroundColor: alpha(palette.green[500], 0.2), alignItems: "center", justifyContent: "center" },
  keyPointNoText: { fontSize: 10, fontWeight: "700", color: palette.green[400] },
  keyPointText: { flex: 1, fontSize: 12, lineHeight: 18, color: palette.gray[300] },

  pager: { marginTop: 24, flexDirection: "row", gap: 12 },
  pagerBtn: { flex: 1, backgroundColor: "#252525", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  pagerHead: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  pagerLabel: { fontSize: 10, color: palette.gray[500] },
  pagerName: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
})
