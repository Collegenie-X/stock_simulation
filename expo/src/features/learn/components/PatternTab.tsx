import React, { useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { BookOpen, Brain, ChevronRight, Target, TrendingUp, Waves, Zap } from "lucide-react-native"
import {
  CHART_PATTERNS,
  PATTERN_CATEGORIES,
  SIGNAL_COLORS,
  type PatternCategory,
  type ChartPattern,
} from "@/data/chart-patterns"
import { BASIC_STRATEGIES } from "@/data/pattern-practice"
import { Gradient, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { twColor } from "../utils/tw"
import { MiniPatternChart } from "./MiniPatternChart"
import { RotatingChevron } from "./RotatingChevron"

const SIGNAL_LABEL: Record<string, string> = {
  매수: "↑ 매수",
  매도: "↓ 매도",
  양방향: "↕ 양방향",
}

// ─── Hero Section ────────────────────────────────────────────────
function PatternHero({ totalCount }: { totalCount: number }) {
  const [open, setOpen] = useState(false)

  return (
    <Gradient dir="r" colors={[alpha(palette.indigo[600], 0.8), alpha(palette.purple[700], 0.8)]} style={styles.hero}>
      <Pressable style={styles.heroHeader} onPress={() => setOpen(!open)}>
        <View style={styles.heroIcon}>
          <Waves size={24} color="#ffffff" />
        </View>
        <View style={styles.flexBody}>
          <Text style={styles.heroCaption}>파도 패턴 연습</Text>
          <Text style={styles.heroTitle}>파도 흐름 읽는 눈 키우기</Text>
          <Text style={styles.heroSub}>패턴으로 파도의 전환점을 포착하세요</Text>
        </View>
        <RotatingChevron rotated={open} size={16} color="#ffffff" opacity={0.6} />
      </Pressable>

      {open && (
        <View style={styles.heroDetail}>
          <View style={styles.heroBox}>
            <Text style={styles.heroBoxTitle}>🌊 파도 패턴이란?</Text>
            {[
              "주가의 파도는 특정 모양(패턴)을 만들며 흘러가요",
              "패턴을 읽으면 파도의 전환점을 미리 알 수 있어요",
              "상승 파도(↑)와 하락 파도(↓)의 신호를 구분하세요",
              "패턴 연습으로 AI와의 갭을 줄여나가세요",
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
          <Text style={styles.heroProgress}>0 / {totalCount} 패턴 연습 완료</Text>
        </View>
      )}
    </Gradient>
  )
}

// ─── Pattern Card ────────────────────────────────────────────────
function PatternCard({ pattern }: { pattern: ChartPattern; catConfig: { emoji: string; color: string; bgColor: string; borderColor: string } }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const sigColor = SIGNAL_COLORS[pattern.signal]

  return (
    <View style={[styles.card, open ? { backgroundColor: "#1e1e2e", borderColor: alpha(palette.indigo[500], 0.3) } : null]}>
      {/* 접힌 상태 */}
      <View style={styles.cardRow}>
        {/* 클릭 가능한 카드 본체 영역 */}
        <Pressable style={styles.cardMain} onPress={() => router.push(`/learn/patterns/${pattern.id}`)}>
          {/* 미니 차트 */}
          <View style={styles.miniChart}>
            <MiniPatternChart chartData={pattern.chartData} signal={pattern.signal} />
          </View>

          {/* 텍스트 */}
          <View style={styles.flexBody}>
            <View style={styles.nameRow}>
              <Text style={styles.emoji14}>{pattern.emoji}</Text>
              <Text numberOfLines={1} style={[styles.cardName, { flexShrink: 1 }]}>{pattern.name}</Text>
            </View>
            {/* 간단 설명 한 줄 */}
            <Text numberOfLines={1} style={styles.cardDesc}>{pattern.description}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: twColor(sigColor.bg, "bg"), borderColor: twColor(sigColor.border, "border") }]}>
                <Text style={[styles.badgeText, { color: twColor(sigColor.color, "text") }]}>{SIGNAL_LABEL[pattern.signal]}</Text>
              </View>
              <Text style={styles.stars}>{"⭐".repeat(pattern.difficulty)}</Text>
            </View>
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
          {/* 파도 흐름 분석 */}
          <View style={[styles.grid3, { marginTop: 12 }]}>
            <View style={[styles.metric, tint(palette.cyan[500])]}>
              <Waves size={12} color={palette.cyan[400]} style={styles.metricIcon} />
              <Text style={styles.metricLabel}>파도 유형</Text>
              <Text style={[styles.metricValue, { color: palette.cyan[300] }]}>
                {pattern.signal === "매수" ? "상승 파도" : pattern.signal === "매도" ? "하락 파도" : "전환 파도"}
              </Text>
            </View>
            <View style={[styles.metric, tint(palette.purple[500])]}>
              <TrendingUp size={12} color={palette.purple[400]} style={styles.metricIcon} />
              <Text style={styles.metricLabel}>난이도</Text>
              <Text style={[styles.metricValue, { color: palette.purple[300] }]}>{"⭐".repeat(pattern.difficulty)}</Text>
            </View>
            <View style={[styles.metric, tint(palette.yellow[500])]}>
              <Target size={12} color={palette.yellow[400]} style={styles.metricIcon} />
              <Text style={styles.metricLabel}>정확도 목표</Text>
              <Text style={[styles.metricValue, { color: palette.yellow[300] }]}>{70 + pattern.difficulty * 5}%</Text>
            </View>
          </View>

          {/* 핵심 포인트 */}
          <View style={{ gap: 6 }}>
            {pattern.keyPoints.map((point, idx) => (
              <View key={idx} style={styles.pointRow}>
                <Text style={styles.pointMark}>✦</Text>
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>

          {/* 파도 읽기 코멘트 */}
          <View style={[styles.note, { backgroundColor: alpha(palette.cyan[500], 0.08), borderColor: alpha(palette.cyan[500], 0.2) }]}>
            <Waves size={14} color={palette.cyan[400]} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.noteTitle, { color: palette.cyan[300] }]}>파도 읽기 포인트</Text>
              <Text style={styles.noteBody}>
                이 패턴이 나타나면 파도의 {pattern.signal === "매수" ? "상승 전환" : pattern.signal === "매도" ? "하락 전환" : "방향 전환"}을
                {" "}예상할 수 있어요. 거래량 증가와 함께 나타나면 신뢰도가 높아요.
              </Text>
            </View>
          </View>

          {/* 매매 팁 */}
          <View style={[styles.note, { backgroundColor: alpha(palette.yellow[500], 0.1), borderColor: alpha(palette.yellow[500], 0.2) }]}>
            <Zap size={14} color={palette.yellow[400]} style={{ marginTop: 2 }} />
            <Text style={styles.tipText}>{pattern.tradingTip}</Text>
          </View>

          {/* 실전 예시 */}
          <View style={styles.example}>
            <View style={styles.exampleHead}>
              <BookOpen size={10} color={palette.gray[400]} />
              <Text style={styles.exampleTitle}>실전 예시</Text>
            </View>
            <Text style={styles.exampleText}>
              <Text style={{ color: palette.gray[300], fontWeight: "600" }}>상황:</Text> {pattern.example.situation}
            </Text>
            <Text style={[styles.exampleText, { marginTop: 4 }]}>
              <Text style={{ color: palette.green[400], fontWeight: "600" }}>대응:</Text> {pattern.example.action}
            </Text>
          </View>

          {/* 연습 버튼 */}
          <PressableScale scaleTo={0.98} onPress={() => router.push(`/learn/patterns/${pattern.id}`)}>
            <Gradient dir="r" colors={[palette.cyan[600], palette.indigo[600]]} style={styles.cta}>
              <Waves size={14} color="#ffffff" />
              <Text style={styles.ctaText}>파도 패턴 연습하기</Text>
              <ChevronRight size={14} color="#ffffff" />
            </Gradient>
          </PressableScale>
        </View>
      )}
    </View>
  )
}

// ─── Category Section ────────────────────────────────────────────
function CategorySection({ category }: { category: PatternCategory }) {
  const [collapsed, setCollapsed] = useState(false)
  const catConfig = PATTERN_CATEGORIES[category]
  const patterns = CHART_PATTERNS.filter((p) => p.category === category)

  return (
    <View style={{ gap: 8 }}>
      <Pressable onPress={() => setCollapsed(!collapsed)} style={styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>{catConfig.emoji}</Text>
        <Text style={styles.sectionTitle}>{category}</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{patterns.length}개</Text>
        </View>
        <RotatingChevron rotated={collapsed} degrees={-90} size={14} color={palette.gray[500]} />
      </Pressable>

      {!collapsed && (
        <View style={{ gap: 8 }}>
          {patterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} catConfig={catConfig} />
          ))}
        </View>
      )}
    </View>
  )
}

// ─── Basic Strategy Card ─────────────────────────────────────────
function BasicStrategyCard({ strategy }: { strategy: (typeof BASIC_STRATEGIES)[number] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <View style={[styles.card, open ? { backgroundColor: "#1a1a2e", borderColor: alpha(palette.emerald[500], 0.3) } : null]}>
      <View style={styles.cardRow}>
        <Pressable style={styles.cardMain} onPress={() => setOpen(!open)}>
          <View style={styles.strategyIcon}>
            <Text style={styles.strategyEmoji}>{strategy.emoji}</Text>
          </View>
          <View style={styles.flexBody}>
            <View style={styles.nameRow}>
              <Text numberOfLines={1} style={[styles.cardName, { flexShrink: 1 }]}>{strategy.name}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{strategy.category}</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={[styles.cardDesc, { marginBottom: 0 }]}>{strategy.description}</Text>
            <Text style={styles.strategyMeta}>{strategy.scenarios.length}개 시나리오 · 10턴</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => setOpen(!open)} hitSlop={6} style={({ pressed }) => [styles.expandBtn, pressed && styles.expandPressed]}>
          <RotatingChevron rotated={open} size={16} color={palette.gray[500]} />
        </Pressable>
      </View>

      {open && (
        <View style={styles.cardDetail}>
          {/* 핵심 학습 */}
          <View style={[styles.note, { marginTop: 12, padding: 12, backgroundColor: alpha(palette.emerald[500], 0.08), borderColor: alpha(palette.emerald[500], 0.2) }]}>
            <Brain size={14} color={palette.emerald[400]} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.noteTitle, { color: palette.emerald[300] }]}>핵심 학습</Text>
              <Text style={[styles.noteBody, { color: palette.gray[300] }]}>{strategy.keyLesson}</Text>
            </View>
          </View>

          {/* 파동 패턴 */}
          <View style={[styles.note, { padding: 12, backgroundColor: alpha(palette.cyan[500], 0.08), borderColor: alpha(palette.cyan[500], 0.2) }]}>
            <Waves size={14} color={palette.cyan[400]} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.noteTitle, { color: palette.cyan[300] }]}>파동 흐름</Text>
              <Text style={[styles.noteBody, { color: palette.gray[300] }]}>{strategy.wavePattern}</Text>
            </View>
          </View>

          {/* 시나리오 목록 */}
          <View style={{ gap: 8 }}>
            {strategy.scenarios.map((scenario, idx) => {
              const isBuy = scenario.signal === "buy"
              const c = isBuy ? palette.green : palette.red
              return (
                <View key={scenario.id} style={styles.scenarioItem}>
                  <View style={styles.scenarioHead}>
                    <View style={styles.scenarioNo}>
                      <Text style={styles.scenarioNoText}>{idx + 1}</Text>
                    </View>
                    <Text numberOfLines={1} style={styles.scenarioTitle}>{scenario.title}</Text>
                    <View style={[styles.signalBadge, { backgroundColor: alpha(c[500], 0.15), borderColor: alpha(c[500], 0.25) }]}>
                      <Text style={[styles.signalBadgeText, { color: c[400] }]}>{isBuy ? "↑ 매수" : "↓ 매도"}</Text>
                    </View>
                  </View>
                  <Text style={styles.scenarioTheme}>{scenario.theme}</Text>
                </View>
              )
            })}
          </View>

          <PressableScale scaleTo={0.98} onPress={() => router.push(`/learn/patterns/${strategy.id}`)}>
            <Gradient dir="r" colors={[palette.emerald[600], palette.teal[600]]} style={styles.cta}>
              <Brain size={14} color="#ffffff" />
              <Text style={styles.ctaText}>전략 연습하기</Text>
              <ChevronRight size={14} color="#ffffff" />
            </Gradient>
          </PressableScale>
        </View>
      )}
    </View>
  )
}

// ─── Basic Strategy Section ──────────────────────────────────────
function BasicStrategySection() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <View style={{ gap: 8 }}>
      <Pressable onPress={() => setCollapsed(!collapsed)} style={styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>🧠</Text>
        <Text style={styles.sectionTitle}>기본 전략</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{BASIC_STRATEGIES.length}개</Text>
        </View>
        <RotatingChevron rotated={collapsed} degrees={-90} size={14} color={palette.gray[500]} />
      </Pressable>
      {!collapsed && (
        <View style={{ gap: 8 }}>
          <Text style={styles.sectionHint}>처분효과·그라데이션 등 실전 투자 심리와 분할매매 전략을 10턴으로 연습해요</Text>
          {BASIC_STRATEGIES.map((strategy) => (
            <BasicStrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </View>
      )}
    </View>
  )
}

// ─── Tab Section Header ──────────────────────────────────────────
function SectionDivider({ label, sub }: { label: string; sub: string }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <View style={{ alignItems: "center" }}>
        <Text style={styles.dividerLabel}>{label}</Text>
        <Text style={styles.dividerSub}>{sub}</Text>
      </View>
      <View style={styles.dividerLine} />
    </View>
  )
}

// ─── Main Tab ────────────────────────────────────────────────────
export function PatternTab() {
  const [activeFilter, setActiveFilter] = useState<string>("all")

  const filters = [
    { label: "전체", value: "all", emoji: "📋" },
    { label: "기본 전략", value: "basic", emoji: "🧠" },
    ...Object.entries(PATTERN_CATEGORIES).map(([key, val]) => ({
      label: key,
      value: key,
      emoji: val.emoji,
    })),
  ]

  const showBasic = activeFilter === "all" || activeFilter === "basic"
  const showPatterns = activeFilter === "all" || activeFilter !== "basic"

  const categories = (Object.keys(PATTERN_CATEGORIES) as PatternCategory[]).filter(
    (cat) => activeFilter === "all" || activeFilter === cat
  )

  return (
    <View style={{ gap: 16 }}>
      <PatternHero totalCount={CHART_PATTERNS.length} />

      {/* 카테고리 필터 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map((filter) => {
          const active = activeFilter === filter.value
          return (
            <Pressable
              key={filter.value}
              onPress={() => setActiveFilter(filter.value)}
              style={[styles.filter, active ? { backgroundColor: palette.indigo[600], borderColor: palette.indigo[500] } : null]}
            >
              <Text style={styles.filterEmoji}>{filter.emoji}</Text>
              <Text style={[styles.filterText, { color: active ? "#ffffff" : palette.gray[400] }]}>{filter.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* 기본 전략 섹션 */}
      {showBasic && (
        <>
          <SectionDivider label="기본 전략" sub="행동심리 · 분할매매 · 10턴 연습" />
          <BasicStrategySection />
        </>
      )}

      {/* 차트 패턴 섹션 */}
      {showPatterns && (
        <>
          {showBasic && <SectionDivider label="차트 패턴" sub="추세 반전 · 추세 지속 · 캔들스틱" />}
          <View style={{ gap: 20 }}>
            {categories.map((category) => (
              <CategorySection key={category} category={category} />
            ))}
          </View>
        </>
      )}
    </View>
  )
}

function tint(color: string) {
  return { backgroundColor: alpha(color, 0.1), borderColor: alpha(color, 0.2) }
}

const styles = StyleSheet.create({
  flexBody: { flex: 1, minWidth: 0 },

  hero: { borderRadius: 16, borderWidth: 1, borderColor: alpha(palette.indigo[500], 0.3), overflow: "hidden" },
  heroHeader: { width: "100%", flexDirection: "row", alignItems: "center", gap: 16, padding: 16 },
  heroIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: alpha("#ffffff", 0.2), alignItems: "center", justifyContent: "center" },
  heroCaption: { fontSize: 12, fontWeight: "600", color: palette.purple[200] },
  heroTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  heroSub: { fontSize: 11, color: alpha(palette.purple[100], 0.7), marginTop: 2 },
  heroDetail: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.1), gap: 12 },
  heroBox: { marginTop: 12, backgroundColor: alpha("#ffffff", 0.1), borderRadius: 12, padding: 12, gap: 6 },
  heroBoxTitle: { fontSize: 12, fontWeight: "700", color: palette.purple[200], marginBottom: 2 },
  heroLine: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  heroLineNo: { fontSize: 12, color: palette.purple[300], marginTop: 1 },
  heroLineText: { flex: 1, fontSize: 11, lineHeight: 15, color: palette.purple[100] },
  heroTrack: { height: 6, backgroundColor: alpha("#ffffff", 0.2), borderRadius: 9999, overflow: "hidden" },
  heroFill: { height: "100%", backgroundColor: "#ffffff", borderRadius: 9999 },
  heroProgress: { fontSize: 10, color: alpha(palette.purple[100], 0.6), textAlign: "center" },

  card: { borderRadius: 16, borderWidth: 1, backgroundColor: "#252525", borderColor: alpha("#ffffff", 0.05) },
  cardRow: { width: "100%", flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  cardMain: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 12 },
  miniChart: { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  emoji14: { fontSize: 14, color: "#ffffff" },
  cardName: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  cardDesc: { fontSize: 10, lineHeight: 14, color: palette.gray[400], marginBottom: 6 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  stars: { fontSize: 10, color: palette.yellow[400] },
  expandBtn: { padding: 8, borderRadius: 8 },
  expandPressed: { backgroundColor: alpha("#ffffff", 0.05) },
  cardDetail: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05), gap: 12 },

  grid3: { flexDirection: "row", gap: 6 },
  metric: { flex: 1, borderRadius: 12, padding: 8, alignItems: "center", borderWidth: 1 },
  metricIcon: { marginBottom: 2 },
  metricLabel: { fontSize: 8, color: palette.gray[500] },
  metricValue: { fontSize: 10, fontWeight: "700" },

  pointRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  pointMark: { fontSize: 12, color: palette.indigo[400], marginTop: 1 },
  pointText: { flex: 1, fontSize: 11, lineHeight: 15, color: palette.gray[300] },

  note: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderWidth: 1, borderRadius: 12, padding: 10 },
  noteTitle: { fontSize: 10, fontWeight: "700", marginBottom: 2 },
  noteBody: { fontSize: 10, lineHeight: 16, color: palette.gray[400] },
  tipText: { flex: 1, fontSize: 11, lineHeight: 15, color: palette.yellow[300] },

  example: { backgroundColor: alpha("#ffffff", 0.05), borderWidth: 1, borderColor: alpha("#ffffff", 0.08), borderRadius: 12, padding: 10 },
  exampleHead: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  exampleTitle: { fontSize: 10, fontWeight: "700", color: palette.gray[400] },
  exampleText: { fontSize: 10, lineHeight: 14, color: palette.gray[500] },

  cta: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 10 },
  ctaText: { fontSize: 12, fontWeight: "700", color: "#ffffff" },

  sectionHeader: { width: "100%", flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  sectionEmoji: { fontSize: 18, color: "#ffffff" },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: "#ffffff" },
  countPill: { backgroundColor: alpha("#ffffff", 0.05), paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  countText: { fontSize: 10, color: palette.gray[500] },
  sectionHint: { fontSize: 10, lineHeight: 16, color: palette.gray[500], paddingHorizontal: 4 },

  strategyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: alpha(palette.emerald[500], 0.15),
    borderWidth: 1,
    borderColor: alpha(palette.emerald[500], 0.25),
    alignItems: "center",
    justifyContent: "center",
  },
  strategyEmoji: { fontSize: 20, color: "#ffffff" },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: alpha(palette.emerald[500], 0.15),
    borderWidth: 1,
    borderColor: alpha(palette.emerald[500], 0.25),
  },
  categoryBadgeText: { fontSize: 9, fontWeight: "700", color: palette.emerald[400] },
  strategyMeta: { fontSize: 10, color: alpha(palette.emerald[400], 0.7), marginTop: 2 },

  scenarioItem: { backgroundColor: "#1e1e1e", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  scenarioHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  scenarioNo: { width: 20, height: 20, borderRadius: 10, backgroundColor: alpha(palette.indigo[500], 0.2), alignItems: "center", justifyContent: "center" },
  scenarioNoText: { fontSize: 10, fontWeight: "900", color: palette.indigo[300] },
  scenarioTitle: { flexShrink: 1, fontSize: 12, fontWeight: "700", color: "#ffffff" },
  signalBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  signalBadgeText: { fontSize: 9, fontWeight: "700" },
  scenarioTheme: { fontSize: 10, lineHeight: 14, color: palette.gray[500], paddingLeft: 28 },

  divider: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: alpha("#ffffff", 0.08) },
  dividerLabel: { fontSize: 11, fontWeight: "900", color: palette.gray[400], letterSpacing: 1.1 },
  dividerSub: { fontSize: 9, color: palette.gray[600], marginTop: 2 },

  filterRow: { gap: 8, paddingBottom: 4 },
  filter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    backgroundColor: "#252525",
    borderColor: alpha("#ffffff", 0.05),
  },
  filterEmoji: { fontSize: 12, color: "#ffffff" },
  filterText: { fontSize: 12, fontWeight: "700" },
})
