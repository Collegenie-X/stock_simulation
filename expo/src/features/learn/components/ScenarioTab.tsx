import React, { useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { Info, Sparkles, Swords, Target, TrendingUp, Users, Waves } from "lucide-react-native"
import {
  LEGENDARY_SCENARIOS,
  DIFFICULTY_CONFIG,
  CATEGORY_COLORS,
  INVESTOR_DNA_MAP,
  getAIPersonality,
} from "@/data/legendary-scenarios"
import type { InvestorPersonality } from "@/data/legendary-scenarios"
import { getScenarioStockType } from "@/data/scenario-stock-types"
import { LiveMiniChart, valuesToPoints } from "@/components/charts"
import { Gradient, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { twColor, twGradient } from "../utils/tw"
import { buildPrices } from "../scenarios/utils/personality"
import { RotatingChevron } from "./RotatingChevron"

// ─── Hero Section ────────────────────────────────────────────────
function ScenarioHero({ myDNA }: { myDNA: { emoji: string; label: string } }) {
  const [open, setOpen] = useState(false)

  return (
    <Gradient dir="r" colors={[alpha(palette.yellow[600], 0.8), alpha(palette.orange[700], 0.8)]} style={styles.hero}>
      <Pressable style={styles.heroHeader} onPress={() => setOpen(!open)}>
        <View style={styles.heroIcon}>
          <Text style={styles.heroIconEmoji}>🌊</Text>
        </View>
        <View style={styles.flexBody}>
          <Text style={styles.heroCaption}>파도 흐름 연습</Text>
          <Text style={styles.heroTitle}>시나리오 시뮬레이션</Text>
          <Text style={styles.heroSub}>파도의 흐름을 읽고 AI와 갭을 비교하세요</Text>
        </View>
        <View style={styles.versus}>
          <View style={styles.versusAvatar}>
            <Text style={styles.versusEmoji}>👤</Text>
          </View>
          <Swords size={12} color={palette.yellow[300]} />
          <View style={styles.versusAvatar}>
            <Text style={styles.versusEmoji}>{myDNA.emoji}</Text>
          </View>
        </View>
        <RotatingChevron rotated={open} size={16} color="#ffffff" opacity={0.6} />
      </Pressable>

      {open && (
        <View style={styles.heroDetail}>
          <View style={styles.heroBox}>
            <Text style={styles.heroBoxTitle}>🌊 파도 읽기가 중요한 이유</Text>
            {[
              "주가는 파도처럼 상승과 하락을 반복해요",
              "파도의 전환점을 읽으면 매매 타이밍이 보여요",
              "유사 AI와 갭을 비교하며 판단력을 키워요",
              "최대 갭을 줄이면 손실을 최소화할 수 있어요",
            ].map((text, i) => (
              <View key={i} style={styles.heroLine}>
                <Text style={styles.heroLineNo}>0{i + 1}</Text>
                <Text style={styles.heroLineText}>{text}</Text>
              </View>
            ))}
          </View>
          <View style={styles.heroTrack}>
            <View style={[styles.heroFill, { width: "0%" }]} />
          </View>
          <Text style={styles.heroProgress}>0 / {LEGENDARY_SCENARIOS.length} 시나리오 완료</Text>
        </View>
      )}
    </Gradient>
  )
}

// ─── Scenario Card ────────────────────────────────────────────────
interface ScenarioCardProps {
  scenario: (typeof LEGENDARY_SCENARIOS)[number]
  userPersonality: InvestorPersonality
}

function ScenarioCard({ scenario, userPersonality }: ScenarioCardProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const diffConfig = DIFFICULTY_CONFIG[scenario.difficulty as keyof typeof DIFFICULTY_CONFIG]
  const categoryColor = CATEGORY_COLORS[scenario.category] || "from-gray-500/20 to-gray-600/20"
  const stockType = getScenarioStockType(scenario.id)
  const stockTypeText = stockType ? twColor(stockType.stockTypeColor, "text") : "#ffffff"
  // 우측 미니 그래프: 턴별 등락을 이은 가격 흐름
  const prices = useMemo(() => buildPrices(scenario.events), [scenario])
  const sparkPoints = useMemo(() => valuesToPoints(prices), [prices])
  const totalReturn = prices[prices.length - 1] - 100
  const trendColor = totalReturn >= 0 ? palette.green[400] : palette.red[400]

  return (
    <View style={[styles.card, open ? { backgroundColor: "#1e1e16", borderColor: alpha(palette.yellow[500], 0.3) } : null]}>
      {/* 접힌 상태 */}
      <View style={styles.cardRow}>
        {/* 클릭 가능한 카드 본체 영역 */}
        <Pressable style={styles.cardMain} onPress={() => router.push(`/learn/scenarios/${scenario.id}`)}>
          <Gradient dir="br" colors={twGradient(categoryColor)} style={styles.cardEmojiWrap}>
            <Text style={styles.cardEmoji}>{scenario.emoji}</Text>
          </Gradient>
          <View style={styles.flexBody}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{scenario.title}</Text>
            </View>
            {/* 종목 유형 배지 */}
            {!!stockType && (
              <View style={styles.stockBadgeRow}>
                <View style={[styles.badge, { backgroundColor: twColor(stockType.stockTypeBg, "bg"), borderColor: twColor(stockType.stockTypeBorder, "border") }]}>
                  <Text style={[styles.badgeText, { color: stockTypeText }]}>
                    {stockType.stockTypeEmoji} {stockType.stockType}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: twColor(diffConfig.bgColor, "bg"), borderColor: twColor(diffConfig.borderColor, "border") }]}>
                <Text style={[styles.badgeText, { color: twColor(diffConfig.color, "text") }]}>{diffConfig.label}</Text>
              </View>
              <Text style={styles.stars}>{"⭐".repeat(scenario.difficulty)}</Text>
              <Text style={styles.clearRate}>클리어 {scenario.stats.avgClearRate}%</Text>
            </View>
          </View>
          {/* 미니 그래프 */}
          <View style={styles.spark}>
            <LiveMiniChart points={sparkPoints} color={trendColor} width={64} height={34} />
            <Text style={[styles.sparkText, { color: trendColor }]}>
              {totalReturn >= 0 ? "+" : ""}
              {totalReturn.toFixed(0)}%
            </Text>
          </View>
        </Pressable>

        {/* 펼치기 버튼 (독립적) */}
        <Pressable onPress={() => setOpen(!open)} hitSlop={6} style={({ pressed }) => [styles.expandBtn, pressed && styles.expandPressed]}>
          <RotatingChevron rotated={open} size={16} color={palette.gray[500]} />
        </Pressable>
      </View>

      {/* 펼쳐진 상태 */}
      {open && (
        <View style={styles.cardDetail}>
          {/* 핵심 특성 설명 */}
          {!!stockType && (
            <View
              style={[
                styles.typeBox,
                { backgroundColor: twColor(stockType.stockTypeBg, "bg"), borderColor: twColor(stockType.stockTypeBorder, "border") },
              ]}
            >
              <View style={styles.typeHead}>
                <Text style={styles.typeEmoji}>{stockType.stockTypeEmoji}</Text>
                <Text style={[styles.typeName, { color: stockTypeText }]}>{stockType.stockType}</Text>
              </View>
              <Text style={styles.typeTagline}>"{stockType.tagline}"</Text>
              <View style={{ gap: 4 }}>
                {stockType.characteristics.map((c, i) => (
                  <View key={i} style={styles.charRow}>
                    <Text style={[styles.charMark, { color: stockTypeText }]}>✦</Text>
                    <Text style={styles.charText}>{c}</Text>
                  </View>
                ))}
              </View>
              {/* 왜 움직이나 */}
              <View style={styles.whyBox}>
                <View style={styles.whyHead}>
                  <Info size={10} color={palette.gray[400]} />
                  <Text style={styles.whyTitle}>이 종목이 움직이는 이유</Text>
                </View>
                <Text style={styles.whyText}>{stockType.whyItMoves}</Text>
              </View>
            </View>
          )}

          {/* 유사 종목 */}
          {!!stockType && (
            <View>
              <View style={styles.subHead}>
                <Sparkles size={12} color={palette.yellow[400]} />
                <Text style={styles.subHeadText}>비슷한 특성의 주식들</Text>
              </View>
              <View style={styles.grid3}>
                {stockType.similarStocks.map((s) => (
                  <View key={s.name} style={styles.similar}>
                    <Text style={styles.similarEmoji}>{s.emoji}</Text>
                    <Text style={styles.similarName}>{s.name}</Text>
                    <Text style={styles.similarReason}>{s.reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 파도 흐름 & AI 갭 분석 */}
          <View>
            <View style={styles.subHead}>
              <Waves size={12} color={palette.cyan[400]} />
              <Text style={styles.subHeadText}>파도 흐름 & AI 갭 분석</Text>
            </View>

            {/* 핵심 지표 */}
            <View style={[styles.grid3, { marginBottom: 8 }]}>
              <View style={[styles.metric, tint(palette.cyan[500])]}>
                <Waves size={12} color={palette.cyan[400]} style={styles.metricIcon} />
                <Text style={styles.metricLabel}>파도 정확도</Text>
                <Text style={[styles.metricValue, { color: palette.cyan[300] }]}>{scenario.stats.avgClearRate}%</Text>
              </View>
              <View style={[styles.metric, tint(palette.yellow[500])]}>
                <TrendingUp size={12} color={palette.yellow[400]} style={styles.metricIcon} />
                <Text style={styles.metricLabel}>최대 갭</Text>
                <Text style={[styles.metricValue, { color: palette.yellow[300] }]}>-{(100 - scenario.stats.avgClearRate) / 2}%</Text>
              </View>
              <View style={[styles.metric, tint(palette.purple[500])]}>
                <Target size={12} color={palette.purple[400]} style={styles.metricIcon} />
                <Text style={styles.metricLabel}>유사 AI 갭</Text>
                <Text style={[styles.metricValue, { color: palette.purple[300] }]}>-{(100 - scenario.stats.avgClearRate) / 4}%p</Text>
              </View>
            </View>

            {/* AI 비교 */}
            <View style={styles.aiBox}>
              <View style={styles.aiHead}>
                <Users size={10} color={palette.gray[500]} />
                <Text style={styles.aiHeadText}>성향별 AI 수익률</Text>
              </View>
              <View style={styles.grid3}>
                {scenario.aiStrategies.map((ai) => {
                  const isMyType = getAIPersonality(ai.type) === userPersonality
                  return (
                    <View
                      key={ai.name}
                      style={[
                        styles.aiCell,
                        isMyType
                          ? { backgroundColor: alpha(palette.cyan[500], 0.15), borderColor: alpha(palette.cyan[400], 0.4) }
                          : { backgroundColor: alpha("#ffffff", 0.05), borderColor: alpha("#ffffff", 0.05) },
                      ]}
                    >
                      {isMyType && (
                        <View style={styles.meTagWrap} pointerEvents="none">
                          <View style={styles.meTag}>
                            <Text style={styles.meTagText}>나</Text>
                          </View>
                        </View>
                      )}
                      <Text style={styles.aiEmoji}>{ai.emoji}</Text>
                      <Text style={styles.aiType}>{ai.type}</Text>
                      <Text
                        style={[
                          styles.aiReturn,
                          { color: ai.returnRate.startsWith("+") ? palette.green[400] : ai.returnRate.startsWith("-") ? palette.red[400] : palette.gray[400] },
                        ]}
                      >
                        {ai.returnRate}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </View>
          </View>

          {/* 파도 읽기 코멘트 */}
          <View style={styles.note}>
            <Text style={styles.noteEmoji}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.noteTitle}>파도 읽기 포인트</Text>
              <Text style={styles.noteBody}>
                이 시나리오에서는 {stockType?.stockType || "종목"} 특성상 {scenario.difficulty >= 4 ? "급격한 변동성" : "완만한 흐름"}이 나타나요.
                {" "}전환점을 놓치지 않도록 거래량 변화에 주목하세요.
              </Text>
            </View>
          </View>

          {/* 연습 버튼 */}
          <PressableScale scaleTo={0.98} onPress={() => router.push(`/learn/scenarios/${scenario.id}`)}>
            <Gradient dir="r" colors={[palette.cyan[600], palette.blue[600]]} style={styles.cta}>
              <Waves size={14} color="#ffffff" />
              <Text style={styles.ctaText}>파도 읽기 연습</Text>
            </Gradient>
          </PressableScale>
        </View>
      )}
    </View>
  )
}

// ─── Main Tab ────────────────────────────────────────────────────
interface Props {
  userPersonality: InvestorPersonality
}

export function ScenarioTab({ userPersonality }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const myDNA = INVESTOR_DNA_MAP[userPersonality]

  const diffFilters: { label: string; value: string | number; color?: string }[] = [
    { label: "전체", value: "all" },
    { label: "초급", value: 2, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { label: "중급", value: 3, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    { label: "고급", value: 4, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    { label: "최고급", value: 5, color: "bg-red-500/20 text-red-400 border-red-500/30" },
  ]

  const filtered = LEGENDARY_SCENARIOS.filter((s) => activeFilter === "all" || s.difficulty === Number(activeFilter))

  return (
    <View style={{ gap: 16 }}>
      <ScenarioHero myDNA={myDNA} />

      {/* 난이도 필터 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {diffFilters.map((f) => {
          const active = String(activeFilter) === String(f.value)
          const colors = !active
            ? { bg: "#252525", text: palette.gray[500], border: alpha("#ffffff", 0.05) }
            : f.value === "all"
              ? { bg: alpha("#ffffff", 0.2), text: "#ffffff", border: alpha("#ffffff", 0.3) }
              : { bg: twColor(f.color, "bg"), text: twColor(f.color, "text"), border: twColor(f.color, "border") }
          return (
            <Pressable
              key={String(f.value)}
              onPress={() => setActiveFilter(String(f.value))}
              style={[styles.filter, { backgroundColor: colors.bg, borderColor: colors.border }]}
            >
              <Text style={[styles.filterText, { color: colors.text }]}>{f.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* 시나리오 목록 */}
      <View style={{ gap: 8 }}>
        <View style={styles.listHead}>
          <View style={styles.listHeadLeft}>
            <Waves size={12} color={palette.cyan[400]} />
            <Text style={styles.listHeadText}>연습 시나리오 {filtered.length}개</Text>
          </View>
          <Text style={styles.listHeadHint}>탭하여 펼치기</Text>
        </View>
        {filtered.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} userPersonality={userPersonality} />
        ))}
      </View>
    </View>
  )
}

function tint(color: string) {
  return { backgroundColor: alpha(color, 0.1), borderColor: alpha(color, 0.2) }
}

const styles = StyleSheet.create({
  flexBody: { flex: 1, minWidth: 0 },

  hero: { borderRadius: 16, borderWidth: 1, borderColor: alpha(palette.yellow[500], 0.3), overflow: "hidden" },
  heroHeader: { width: "100%", flexDirection: "row", alignItems: "center", gap: 16, padding: 16 },
  heroIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: alpha("#ffffff", 0.2), alignItems: "center", justifyContent: "center" },
  heroIconEmoji: { fontSize: 24, color: "#ffffff" },
  heroCaption: { fontSize: 12, fontWeight: "600", color: palette.yellow[200] },
  heroTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  heroSub: { fontSize: 11, color: alpha(palette.yellow[100], 0.7), marginTop: 2 },
  versus: { flexDirection: "row", alignItems: "center", gap: 4 },
  versusAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: alpha("#ffffff", 0.2), alignItems: "center", justifyContent: "center" },
  versusEmoji: { fontSize: 14, color: "#ffffff" },
  heroDetail: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.1), gap: 12 },
  heroBox: { marginTop: 12, backgroundColor: alpha("#ffffff", 0.1), borderRadius: 12, padding: 12, gap: 6 },
  heroBoxTitle: { fontSize: 12, fontWeight: "700", color: palette.yellow[200], marginBottom: 2 },
  heroLine: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  heroLineNo: { fontSize: 12, color: palette.yellow[300], marginTop: 1 },
  heroLineText: { flex: 1, fontSize: 11, lineHeight: 15, color: palette.yellow[100] },
  heroTrack: { height: 6, backgroundColor: alpha("#ffffff", 0.2), borderRadius: 9999, overflow: "hidden" },
  heroFill: { height: "100%", backgroundColor: "#ffffff", borderRadius: 9999 },
  heroProgress: { fontSize: 10, color: alpha(palette.yellow[100], 0.6), textAlign: "center" },

  card: { borderRadius: 16, borderWidth: 1, backgroundColor: "#252525", borderColor: alpha("#ffffff", 0.05) },
  cardRow: { width: "100%", flexDirection: "row", alignItems: "center", gap: 4, padding: 14 },
  cardMain: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 12 },
  cardEmojiWrap: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardEmoji: { fontSize: 24, color: "#ffffff" },
  titleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 2 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  stockBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  stars: { fontSize: 10, color: palette.yellow[400] },
  clearRate: { fontSize: 10, color: palette.gray[500] },
  expandBtn: { padding: 8, borderRadius: 8 },
  spark: { width: 64, alignItems: "center" },
  sparkText: { fontSize: 10, fontWeight: "900", fontVariant: ["tabular-nums"] },
  expandPressed: { backgroundColor: alpha("#ffffff", 0.05) },
  cardDetail: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05), gap: 12 },

  typeBox: { marginTop: 12, borderRadius: 12, padding: 12, borderWidth: 1 },
  typeHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  typeEmoji: { fontSize: 16, color: "#ffffff" },
  typeName: { fontSize: 12, fontWeight: "700" },
  typeTagline: { fontSize: 11, lineHeight: 18, color: palette.gray[300], marginBottom: 8 },
  charRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  charMark: { fontSize: 10, marginTop: 1 },
  charText: { flex: 1, fontSize: 10, lineHeight: 14, color: palette.gray[400] },
  whyBox: { marginTop: 8, backgroundColor: alpha("#000000", 0.2), borderRadius: 8, padding: 8 },
  whyHead: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  whyTitle: { fontSize: 10, fontWeight: "700", color: palette.gray[400] },
  whyText: { fontSize: 10, lineHeight: 16, color: palette.gray[300] },

  subHead: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  subHeadText: { fontSize: 10, fontWeight: "700", color: palette.gray[500] },
  grid3: { flexDirection: "row", gap: 6 },
  similar: { flex: 1, backgroundColor: alpha("#ffffff", 0.05), borderWidth: 1, borderColor: alpha("#ffffff", 0.08), borderRadius: 12, padding: 8, alignItems: "center" },
  similarEmoji: { fontSize: 18, color: "#ffffff", marginBottom: 2 },
  similarName: { fontSize: 10, fontWeight: "700", color: "#ffffff", textAlign: "center" },
  similarReason: { fontSize: 9, lineHeight: 12, color: palette.gray[500], marginTop: 2, textAlign: "center" },

  metric: { flex: 1, borderRadius: 12, padding: 8, alignItems: "center", borderWidth: 1 },
  metricIcon: { marginBottom: 2 },
  metricLabel: { fontSize: 8, color: palette.gray[500] },
  metricValue: { fontSize: 14, fontWeight: "900" },

  aiBox: { backgroundColor: "#1a1a1a", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  aiHead: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  aiHeadText: { fontSize: 9, color: palette.gray[500] },
  aiCell: { flex: 1, borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 6, alignItems: "center" },
  meTagWrap: { position: "absolute", top: -6, left: 0, right: 0, alignItems: "center" },
  meTag: { backgroundColor: palette.cyan[500], paddingHorizontal: 4, paddingVertical: 2, borderRadius: 9999 },
  meTagText: { fontSize: 7, fontWeight: "700", color: "#ffffff" },
  aiEmoji: { fontSize: 12, color: "#ffffff" },
  aiType: { fontSize: 8, color: palette.gray[500] },
  aiReturn: { fontSize: 10, fontWeight: "700" },

  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: alpha(palette.cyan[500], 0.08),
    borderWidth: 1,
    borderColor: alpha(palette.cyan[500], 0.2),
    borderRadius: 12,
    padding: 10,
  },
  noteEmoji: { fontSize: 14, color: "#ffffff" },
  noteTitle: { fontSize: 10, fontWeight: "700", color: palette.cyan[300], marginBottom: 2 },
  noteBody: { fontSize: 10, lineHeight: 16, color: palette.gray[400] },

  cta: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 10 },
  ctaText: { fontSize: 12, fontWeight: "700", color: "#ffffff" },

  filterRow: { gap: 8, paddingBottom: 4 },
  filter: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: "700" },

  listHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  listHeadLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  listHeadText: { fontSize: 12, fontWeight: "700", color: palette.gray[500] },
  listHeadHint: { fontSize: 10, color: palette.gray[600] },
})
