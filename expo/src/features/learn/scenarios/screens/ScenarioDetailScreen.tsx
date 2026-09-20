import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BarChart3, Play, Shield, Target, Zap } from "lucide-react-native"
import { MobileHeader, Screen } from "@/components/layout"
import { Gradient, PressableScale, Pulse } from "@/components/ui"
import { LEGENDARY_SCENARIOS, DIFFICULTY_CONFIG, getPersonalityFromCharacter, type LegendaryScenario, type InvestorPersonality } from "@/data/legendary-scenarios"
import { storage } from "@/lib/storage"
import { alpha, palette } from "@/theme"
import { StrategyCard } from "../components/StrategyCard"
import { ScenarioPriceChart } from "../components/ScenarioPriceChart"
import { CollapsibleSection } from "../components/CollapsibleSection"
import { HeroSection } from "../components/HeroSection"
import { StockCharacterSection } from "../components/StockCharacterSection"
import { CrisisResponseSection } from "../components/CrisisResponseSection"
import { EventTimelineSection } from "../components/EventTimelineSection"
import { LearnFromOthers } from "../components/LearnFromOthers"
import { twGradient } from "../utils/tw"

// ── 메인 페이지 ────────────────────────────────────────────────────
export default function ScenarioDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [scenario, setScenario] = useState<LegendaryScenario | null>(null)
  const [userPersonality, setUserPersonality] = useState<InvestorPersonality>("balanced")

  useEffect(() => {
    const found = LEGENDARY_SCENARIOS.find((s) => s.id === params.id)
    setScenario(found || null)
    const character = storage.getCharacter()
    if (character) setUserPersonality(getPersonalityFromCharacter(character.type))
  }, [params.id])

  if (!scenario) {
    return (
      <Screen bg="#191919" scroll={false} contentStyle={{ alignItems: "center", justifyContent: "center" }}>
        <Pulse>
          <Text style={{ fontSize: 36, color: "#ffffff" }}>🎮</Text>
        </Pulse>
      </Screen>
    )
  }

  const diffConfig = DIFFICULTY_CONFIG[scenario.difficulty as keyof typeof DIFFICULTY_CONFIG]

  return (
    <Screen
      bg="#191919"
      withHeader
      contentStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 112 }}
      fixed={
        <>
          <MobileHeader title={scenario.title} showBack showSettings />
          {/* 하단 고정 버튼 */}
          <Gradient dir="t" colors={["#191919", "#191919", alpha("#191919", 0)]} style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <PressableScale onPress={() => router.push("/learn")} style={styles.listBtn}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#ffffff" }}>목록으로</Text>
              </PressableScale>
              <PressableScale onPress={() => router.push(`/learn/scenarios/${scenario.id}/play`)} style={{ flex: 2 }}>
                <Gradient dir="r" colors={twGradient(scenario.gradientFrom, scenario.gradientTo)} style={styles.playBtn}>
                  <Play size={16} color="#ffffff" />
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#ffffff" }}>시나리오 플레이</Text>
                </Gradient>
              </PressableScale>
            </View>
          </Gradient>
        </>
      }
    >
      {/* 1. 히어로 (접기/펼치기) */}
      <HeroSection scenario={scenario} diffConfig={diffConfig} />

      {/* 2. 주식 캐릭터 (성격 게이지 + 닮은꼴 뱃지) */}
      <StockCharacterSection scenario={scenario} />

      {/* 3. 대표 가격 차트 */}
      <View style={{ marginTop: 20 }}>
        <View style={styles.sectionHead}>
          <BarChart3 size={16} color={palette.purple[400]} />
          <Text style={styles.sectionTitle}>주가는 이렇게 움직였어요</Text>
        </View>
        <ScenarioPriceChart scenario={scenario} />
      </View>

      {/* 4. 사고 대처 능력 분석 */}
      <CrisisResponseSection scenario={scenario} userPersonality={userPersonality} />

      {/* 5. 10턴 이벤트 (접기/펼치기) */}
      <EventTimelineSection scenario={scenario} />

      {/* 6. 대처 전략 (기존 아코디언 카드) */}
      <CollapsibleSection title={`이기는 방법 ${scenario.strategies.length}가지`} icon={<Target size={16} color={palette.green[400]} />} badge={`${scenario.strategies.length}개`}>
        <View style={{ gap: 8 }}>
          {scenario.strategies.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </View>
      </CollapsibleSection>

      {/* 7. 다른 성향에서 배우기 */}
      <LearnFromOthers scenario={scenario} userPersonality={userPersonality} />

      {/* 8. 꿀팁 모음 (교훈 + 팁 + 핵심 메시지) */}
      <CollapsibleSection title="꿀팁 모음" icon={<Zap size={16} color={palette.yellow[400]} />} badge="3개">
<View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <View style={[styles.tipCard, { borderColor: alpha(palette.yellow[500], 0.2) }]}>
            <Zap size={14} color={palette.yellow[400]} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.tipTitle, { color: palette.yellow[400] }]}>핵심 교훈</Text>
              <Text style={styles.tipText}>{scenario.keyLesson}</Text>
            </View>
          </View>
          <View style={[styles.tipCard, { borderColor: alpha(palette.blue[500], 0.2) }]}>
            <Shield size={14} color={palette.blue[400]} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.tipTitle, { color: palette.blue[400] }]}>생존 팁</Text>
              <Text style={styles.tipText}>{scenario.survivalTip}</Text>
            </View>
          </View>
        </View>
        <Gradient dir="br" colors={[alpha(palette.cyan[500], 0.1), alpha(palette.purple[500], 0.1)]} style={styles.message}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: palette.cyan[400], marginBottom: 8 }}>💡 이것만 기억하세요!</Text>
          <View style={{ gap: 4 }}>
            <Text style={styles.msgText}>
              • 주식은 <Text style={styles.msgStrong}>예상 못한 일</Text>이 꼭 생겨요
            </Text>
            <Text style={styles.msgText}>
              • <Text style={styles.msgStrong}>나의 성격</Text>에 맞는 방법을 찾는 게 중요해요
            </Text>
            <Text style={styles.msgText}>
              • 여러 가지 대처법을 알면 <Text style={styles.msgStrong}>더 잘 대응</Text>할 수 있어요
            </Text>
          </View>
        </Gradient>
      </CollapsibleSection>
    </Screen>
  )
}

const styles = StyleSheet.create({
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 24 },
  listBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: "#252525", borderWidth: 1, borderColor: alpha("#ffffff", 0.1), alignItems: "center", justifyContent: "center" },
  playBtn: { height: 48, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  tipCard: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: "#252525", borderRadius: 12, padding: 12, borderWidth: 1 },
  tipTitle: { fontSize: 10, fontWeight: "700", marginBottom: 4 },
  tipText: { fontSize: 10, color: palette.gray[300], lineHeight: 14 },
  message: { borderWidth: 1, borderColor: alpha(palette.cyan[500], 0.2), borderRadius: 12, padding: 16, overflow: "hidden" },
  msgText: { fontSize: 12, color: palette.gray[300] },
  msgStrong: { color: "#ffffff", fontWeight: "700" },
})
