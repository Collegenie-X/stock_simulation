/**
 * 커리어 모드 (웹 app/practice/page.tsx 포팅)
 */
import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useRouter, type Href } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ArrowLeft, Clock, Lock, Trophy } from "lucide-react-native"
import { Screen, MobileNav } from "@/components/layout"
import { Gradient, PressableScale, Pulse } from "@/components/ui"
import { storage } from "@/lib/storage"
import { alpha, palette } from "@/theme"

const CAREER_STAGES = [
  {
    id: 1,
    icon: "🌱",
    title: "새싹 투자자",
    subtitle: "매수/매도/스킵의 감각",
    money: "500만원",
    period: "1개월",
    time: "~5분",
    decisions: "22회",
    features: "매수 · 매도 · 스킵",
    color: [palette.emerald[600], palette.emerald[500]],
    bgColor: palette.emerald[500],
  },
  {
    id: 2,
    icon: "🌿",
    title: "초보 투자자",
    subtitle: "조건부 주문 입문",
    money: "1,000만원",
    period: "2개월",
    time: "~8분",
    decisions: "30회",
    features: "+ 조건부 주문 해금",
    color: [palette.green[600], palette.green[500]],
    bgColor: palette.green[500],
  },
  {
    id: 3,
    icon: "🌳",
    title: "중급 투자자",
    subtitle: "분할매수 학습",
    money: "5,000만원",
    period: "3개월",
    time: "~10분",
    decisions: "33회",
    features: "+ 분할매수 · 10종목",
    color: [palette.blue[600], palette.blue[500]],
    bgColor: palette.blue[500],
  },
  {
    id: 4,
    icon: "🏔️",
    title: "고급 투자자",
    subtitle: "추적손절 · 고급 전략",
    money: "1억원",
    period: "3개월",
    time: "~12분",
    decisions: "40회",
    features: "+ 추적손절 · 레버리지",
    color: [palette.indigo[600], palette.indigo[500]],
    bgColor: palette.indigo[500],
  },
  {
    id: 5,
    icon: "🏅",
    title: "프로 투자자",
    subtitle: "AI 감시 시작",
    money: "5억원",
    period: "6개월",
    time: "~18분",
    decisions: "48회",
    features: "+ AI 감시 · 무제한 종목",
    color: [palette.violet[600], palette.violet[500]],
    bgColor: palette.violet[500],
  },
  {
    id: 6,
    icon: "👑",
    title: "전설의 투자자",
    subtitle: "모든 기능 개방",
    money: "10억원",
    period: "12개월",
    time: "~28분",
    decisions: "60회",
    features: "완전 자유 · 선물/옵션",
    color: [palette.amber[600], palette.yellow[500]],
    bgColor: palette.yellow[500],
  },
]

/** 헤더 본문 높이 (py-4 + 제목/부제) */
const HEADER_BODY_HEIGHT = 77

export default function PracticeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [progress, setProgress] = useState<any>(null)
  const [, setCharacter] = useState<any>(null)

  useEffect(() => {
    setProgress(storage.getProgress())
    setCharacter(storage.getCharacter())
  }, [])

  // 무료 버전: 모든 단계 잠금 해제
  const currentStage = Math.max(progress?.level || 1, 6)
  const currentInfo = CAREER_STAGES[Math.min(currentStage - 1, 5)]

  const header = (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.push("/home")} style={styles.backBtn} accessibilityLabel="뒤로가기" hitSlop={8}>
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>커리어 모드 🎯</Text>
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>ALL FREE</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>1~6단계 모두 무료 · 총 ~81분 · 233회 결정</Text>
        </View>
      </View>
    </View>
  )

  return (
    <Screen
      bg="#191919"
      withNav
      safeTop={false}
      contentStyle={{ paddingTop: insets.top + HEADER_BODY_HEIGHT }}
      fixed={
        <>
          {header}
          <MobileNav />
        </>
      }
    >
      <View style={styles.body}>
        {/* Progress Summary */}
        <Gradient dir="r" colors={[palette.gray[800], palette.gray[900]]} style={styles.summary}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>현재 진행</Text>
              <Text style={styles.summaryValue}>
                {currentInfo.icon} {currentInfo.title}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.summaryLabel}>진행률</Text>
              <Text style={[styles.summaryValue, { color: palette.blue[400] }]}>{currentStage}/6 단계</Text>
            </View>
          </View>
          <View style={styles.track}>
            <Gradient
              dir="r"
              colors={[palette.blue[500], palette.cyan[400]]}
              style={{ height: "100%", borderRadius: 9999, width: `${((currentStage - 1) / 6) * 100}%` }}
            />
          </View>
        </Gradient>

        {/* Career Stages */}
        <View>
          {/* Connecting line */}
          <View style={styles.line} />

          <View style={{ gap: 16 }}>
            {CAREER_STAGES.map((stage) => {
              const isLocked = stage.id > currentStage
              const isCompleted = stage.id < currentStage
              const isCurrent = stage.id === currentStage

              const indicator = (
                <View
                  style={[
                    styles.indicator,
                    isCompleted && { backgroundColor: alpha(palette.emerald[500], 0.2), borderColor: palette.emerald[500] },
                    isCurrent && { backgroundColor: alpha(stage.bgColor, 0.2), borderColor: "#ffffff" },
                    isLocked && { backgroundColor: palette.gray[800], borderColor: palette.gray[700] },
                  ]}
                >
                  {isLocked ? (
                    <Lock size={20} color={palette.gray[600]} />
                  ) : isCompleted ? (
                    <Trophy size={20} color={palette.emerald[400]} />
                  ) : (
                    <Text style={styles.indicatorIcon}>{stage.icon}</Text>
                  )}
                </View>
              )

              return (
                <View key={stage.id} style={styles.stageRow}>
                  {/* Stage indicator (배경이 반투명이라 연결선이 비치지 않도록 불투명 바탕을 둠) */}
                  <View style={styles.indicatorBase}>{isCurrent ? <Pulse>{indicator}</Pulse> : indicator}</View>

                  {/* Stage card */}
                  <PressableScale
                    scaleTo={0.98}
                    disabled={isLocked}
                    onPress={() => {
                      if (!isLocked) {
                        storage.setGameSettings({
                          speedMode: stage.id <= 2 ? "sprint" : stage.id <= 4 ? "standard" : "marathon",
                          timerSeconds: stage.id <= 2 ? 10 : stage.id <= 4 ? 15 : 20,
                          simulationMonths: stage.id === 1 ? 1 : stage.id === 2 ? 2 : stage.id <= 4 ? 3 : stage.id === 5 ? 6 : 12,
                          dailyOpportunities: stage.id <= 2 ? 1 : 2,
                          initialCash: parseInt(stage.money.replace(/[^0-9]/g, "")) * 10000,
                        })
                        router.push(`/practice/stock/scenario-${stage.id <= 2 ? "1" : "100days"}` as Href)
                      }
                    }}
                    style={[
                      styles.card,
                      isCompleted && { backgroundColor: alpha(palette.emerald[500], 0.05), borderColor: alpha(palette.emerald[500], 0.3) },
                      isCurrent && {
                        backgroundColor: alpha("#ffffff", 0.05),
                        borderColor: alpha("#ffffff", 0.2),
                        boxShadow: "0 10px 15px rgba(0,0,0,0.3)",
                      },
                      isLocked && { backgroundColor: "#1a1a1a", borderColor: "transparent" },
                    ]}
                  >
                    <View style={styles.cardTop}>
                      <View style={styles.cardTitleRow}>
                        <Text style={styles.cardTitle}>{stage.title}</Text>
                        {isCompleted && <Text style={[styles.cardState, { color: palette.emerald[400] }]}>✓ 완료</Text>}
                        {isCurrent && (
                          <Pulse>
                            <Text style={[styles.cardState, { color: palette.blue[400] }]}>← 진행 중</Text>
                          </Pulse>
                        )}
                      </View>
                      <Text style={styles.cardMoney}>{stage.money}</Text>
                    </View>
                    <Text style={styles.cardSubtitle}>{stage.subtitle}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Clock size={12} color={palette.gray[500]} />
                        <Text style={styles.metaText}>{stage.time}</Text>
                      </View>
                      <Text style={styles.metaText}>📅 {stage.period}</Text>
                      <Text style={styles.metaText}>🎯 {stage.decisions}</Text>
                    </View>
                    <View style={styles.featureChip}>
                      <Text style={styles.featureText}>{stage.features}</Text>
                    </View>
                  </PressableScale>
                </View>
              )
            })}
          </View>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(25,25,25,0.97)",
    borderBottomWidth: 1,
    borderBottomColor: alpha("#ffffff", 0.05),
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { padding: 8, marginLeft: -8, borderRadius: 9999 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 20, lineHeight: 28, fontWeight: "700", color: "#ffffff" },
  freeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: alpha(palette.emerald[500], 0.2),
    borderWidth: 1,
    borderColor: alpha(palette.emerald[500], 0.3),
  },
  freeBadgeText: { fontSize: 10, fontWeight: "700", color: palette.emerald[400] },
  subtitle: { fontSize: 12, lineHeight: 16, color: palette.gray[500] },

  body: { paddingHorizontal: 20, marginTop: 24 },

  summary: { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.1), marginBottom: 24 },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryLabel: { fontSize: 12, color: palette.gray[400], marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  track: { marginTop: 12, height: 8, backgroundColor: palette.gray[700], borderRadius: 9999, overflow: "hidden" },

  line: { position: "absolute", left: 24, top: 40, bottom: 40, width: 2, backgroundColor: palette.gray[800] },
  stageRow: { flexDirection: "row", gap: 16 },
  indicatorBase: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#191919", zIndex: 10 },
  indicator: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  indicatorIcon: { fontSize: 20, color: "#ffffff" },

  card: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "transparent" },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  cardState: { fontSize: 12 },
  cardMoney: { fontSize: 12, color: palette.gray[500] },
  cardSubtitle: { fontSize: 12, color: palette.gray[400], marginBottom: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 10, color: palette.gray[500] },
  featureChip: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: alpha("#ffffff", 0.05),
    borderRadius: 9999,
  },
  featureText: { fontSize: 10, color: palette.gray[400] },
})
