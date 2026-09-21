import { useEffect, useRef, useState, type ReactNode } from "react"
import { Platform, StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { BounceIn, FadeUp, Float, Gradient, PressableScale, Pulse, GlowOrb } from "@/components/ui"
import { localStore } from "@/lib/storage"
import { playClickSound } from "@/lib/sound"
import { alpha, palette } from "@/theme"
import type { AbilityScores, AssessmentMode, HabitCounts, HabitTag, MoneyScores, PersonalityScores, PersonalityType } from "../types"
import { ABILITY_META, ABILITY_BAR_COLORS, HABIT_META, MONEY_META, MONEY_ORDER, PERSONALITY_META, PERSONALITY_COLORS, LABELS } from "../config"
import PersonalityCharacter from "./PersonalityCharacter"

interface ResultScreenProps {
  personalityScores: PersonalityScores
  abilities: AbilityScores
  moneyScores: MoneyScores
  habitCounts: HabitCounts
  totalQuestions: number
  mode?: AssessmentMode
}

function getDominantTypes(scores: PersonalityScores): [PersonalityType, PersonalityType | null] {
  const sorted = (Object.keys(scores) as PersonalityType[]).sort((a, b) => scores[b] - scores[a])
  const primary = sorted[0]
  const secondary = scores[sorted[1]] > 0 ? sorted[1] : null
  return [primary, secondary]
}

function toInvestmentStyle(p: PersonalityType): string {
  if (p === "challenger") return "aggressive"
  if (p === "conservative") return "conservative"
  return "moderate"
}

function toWavePattern(p: PersonalityType): string {
  if (p === "challenger" || p === "emotional") return "wave3Focus"
  if (p === "analyst") return "correction"
  if (p === "systematic") return "earlyEntry"
  return "topCapture"
}

function toChallengerScore(scores: PersonalityScores): number {
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1
  return Math.min(95, Math.round(30 + (scores.challenger / total) * 130))
}

function toWaveStats(p: PersonalityType) {
  const base = {
    challenger:   { wave1Capture: 78, wave3Focus: 95, wave5Exit: 72, correctionHandling: 55, avgHoldDays: 2.8, avgBuyTiming: "상승 초기", avgSellTiming: "고점 근처", bestWave: "3파", weakPoint: "조정파 대응" },
    analyst:      { wave1Capture: 85, wave3Focus: 80, wave5Exit: 88, correctionHandling: 90, avgHoldDays: 4.5, avgBuyTiming: "조정 완료 후", avgSellTiming: "목표가 도달", bestWave: "조정파", weakPoint: "5파 조기 이탈" },
    systematic:   { wave1Capture: 92, wave3Focus: 82, wave5Exit: 78, correctionHandling: 85, avgHoldDays: 5.1, avgBuyTiming: "1파 시작", avgSellTiming: "계획 목표가", bestWave: "1파", weakPoint: "변동성 대응" },
    conservative: { wave1Capture: 70, wave3Focus: 65, wave5Exit: 92, correctionHandling: 80, avgHoldDays: 6.2, avgBuyTiming: "안전 확인 후", avgSellTiming: "5파 꼭대기", bestWave: "5파 탈출", weakPoint: "초기 진입 망설임" },
    emotional:    { wave1Capture: 82, wave3Focus: 88, wave5Exit: 65, correctionHandling: 62, avgHoldDays: 3.1, avgBuyTiming: "감각적 타이밍", avgSellTiming: "고점 근처", bestWave: "3파", weakPoint: "데이터 검증 부족" },
  }
  return base[p] ?? base.challenger
}

// ==word== 형광펜 파서
function Highlighted({ text, highlightColor }: { text: string; highlightColor: string }) {
  const parts = text.split(/(==.+?==)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("==") && p.endsWith("==") ? (
          <Text key={i} style={{ backgroundColor: highlightColor, color: palette.slate[900], fontWeight: "900" }}>
            {p.slice(2, -2)}
          </Text>
        ) : (
          <Text key={i} style={{ color: alpha("#ffffff", 0.7) }}>{p}</Text>
        )
      )}
    </>
  )
}

// 점수 → 랭크
function toRank(score: number): { label: string; text: string; bg: string; border: string } {
  if (score >= 90) return { label: "S", text: palette.yellow[300], bg: alpha(palette.yellow[400], 0.2), border: alpha(palette.yellow[400], 0.6) }
  if (score >= 70) return { label: "A", text: palette.cyan[300], bg: alpha(palette.cyan[400], 0.2), border: alpha(palette.cyan[400], 0.6) }
  if (score >= 50) return { label: "B", text: palette.green[300], bg: alpha(palette.green[400], 0.2), border: alpha(palette.green[400], 0.6) }
  return { label: "C", text: alpha("#ffffff", 0.5), bg: alpha("#ffffff", 0.05), border: alpha("#ffffff", 0.2) }
}

const MONO = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" })

// 보고서 핵심 요약의 한 줄
function SummaryRow({ no, tag, emoji, title, body, color }: { no: string; tag: string; emoji: string; title: string; body: string; color: string }) {
  return (
    <View style={styles.reportItem}>
      <Text style={[styles.reportNo, { color }]}>{no}</Text>
      <View style={[styles.reportBar, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.summaryTag}>{tag}</Text>
        <Text style={[styles.summaryTitle, { color }]}>
          {emoji} {title}
        </Text>
        <Text style={styles.summaryBody}>{body}</Text>
      </View>
    </View>
  )
}

function CommentBox({ label, text, color, border, bg }: { label: string; text: string; color: string; border: string; bg: string }) {
  return (
    <View style={[styles.comment, { borderColor: border, backgroundColor: bg }]}>
      <Text style={[styles.commentLabel, { color }]}>💬 {label}</Text>
      <Text style={styles.commentText}>{text}</Text>
    </View>
  )
}

function Accordion({ emoji, title, hint, open, onToggle, children }: { emoji: string; title: string; hint: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <View style={[styles.card, styles.accordion]}>
      <PressableScale
        scaleTo={0.99}
        pressedOpacity={1}
        onPress={() => {
          playClickSound()
          onToggle()
        }}
        style={styles.accordionHead}
      >
        <Text style={styles.cardEmoji}>{emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text numberOfLines={1} style={styles.accordionHint}>{hint}</Text>
        </View>
        <Text style={styles.accordionArrow}>{open ? "▲" : "▼"}</Text>
      </PressableScale>
      {open && <FadeUp distance={8} duration={250} style={styles.accordionBody}>{children}</FadeUp>}
    </View>
  )
}

export default function ResultScreen({ personalityScores, abilities, moneyScores, habitCounts, totalQuestions, mode = "detailed" }: ResultScreenProps) {
  const router = useRouter()
  const params = useLocalSearchParams<{ returnTo?: string }>()
  const returnTo = typeof params.returnTo === "string" ? params.returnTo : null
  const [primary, secondary] = getDominantTypes(personalityScores)
  const primaryMeta = PERSONALITY_META[primary]
  const primaryColors = PERSONALITY_COLORS[primary]
  const secondaryMeta = secondary ? PERSONALITY_META[secondary] : null
  const secondaryColors = secondary ? PERSONALITY_COLORS[secondary] : null

  useEffect(() => {
    const dnaResult = {
      primaryPersonality: primary,
      secondaryPersonality: secondary,
      personalityScores,
      abilities,
      moneyScores,
      habitCounts,
      investmentStyle: toInvestmentStyle(primary),
      wavePatternType: toWavePattern(primary),
      challengerScore: toChallengerScore(personalityScores),
      wavePatternStats: toWaveStats(primary),
      updatedAt: new Date().toISOString(),
    }
    localStore.setItem("compete_dna_result", JSON.stringify(dnaResult))
  }, [primary, secondary, personalityScores, abilities, moneyScores, habitCounts])

  const maxAbility = Math.max(...Object.values(abilities), 1)
  const sortedAbilities = (Object.keys(abilities) as (keyof AbilityScores)[]).sort((a, b) => abilities[b] - abilities[a])
  const maxPersonality = Math.max(...Object.values(personalityScores), 1)
  const personalityTypes = (Object.keys(personalityScores) as PersonalityType[]).sort((a, b) => personalityScores[b] - personalityScores[a])
  const totalScore = Object.values(personalityScores).reduce((a, b) => a + b, 0)
  const rank = toRank(totalScore)

  // 자산 점검 · 습관 (동점이면 MONEY_ORDER 순서대로 더 위험한 쪽)
  const moneyTotal = Object.values(moneyScores).reduce((a, b) => a + b, 0)
  const topMoney = moneyTotal > 0 ? MONEY_ORDER.slice().sort((a, b) => moneyScores[b] - moneyScores[a])[0] : null
  const topHabits = (Object.keys(habitCounts) as HabitTag[])
    .filter((h) => habitCounts[h] > 0)
    .sort((a, b) => habitCounts[b] - habitCounts[a])
    .slice(0, 3)
  const topHabit = topHabits[0] ?? null
  const weakestAbility = sortedAbilities[sortedAbilities.length - 1]

  const overallComment =
    topMoney && !MONEY_META[topMoney].safe
      ? `먼저 볼 것은 매매 기술이 아니라 돈의 자리입니다. ${MONEY_META[topMoney].label} 습관은 급한 돈이 필요한 날, 가장 나쁜 가격에 팔게 만들 수 있습니다.${topHabit ? ` 그다음이 '${HABIT_META[topHabit].label}'입니다.` : ""}`
      : topHabit
        ? `${topMoney ? "돈의 자리는 잘 잡혀 있습니다. " : ""}다음 과제는 '${HABIT_META[topHabit].label}'입니다. 뿌리는 ${HABIT_META[topHabit].fear}입니다.`
        : "성향과 돈 관리가 같은 방향을 봅니다. 남은 것은 실제 장면에서도 그대로 하는지 확인하는 일입니다."

  const scoreGap = secondary ? personalityScores[primary] - personalityScores[secondary] : Infinity
  const distComment = !secondaryMeta
    ? `${primaryMeta.label} 하나로 뚜렷합니다. 어떤 장면에서도 같은 방식으로 반응한다는 뜻이며, 그 방식이 안 맞는 장에서는 약점도 뚜렷해집니다.`
    : scoreGap <= 10
      ? `${primaryMeta.label}과 ${secondaryMeta.label}이 거의 같은 크기입니다. 상황에 따라 다른 사람이 됩니다. 특히 금액이 커질 때 어느 쪽이 나오는지 지켜보세요.`
      : `${primaryMeta.label}이 중심이고, ${secondaryMeta.label}이 보조로 나옵니다. 흔들리는 장면에서는 보조 성향이 먼저 튀어나오기도 합니다.`

  const abilityComment =
    `가장 강한 능력은 ${ABILITY_META[sortedAbilities[0]].label}, 가장 약한 능력은 ${ABILITY_META[weakestAbility].label}입니다. ` +
    (weakestAbility === "moneyManagement"
      ? "매매보다 먼저 비상금과 투자금을 나누는 것부터 시작하세요."
      : weakestAbility === "emotionControl"
        ? "사고파는 기준을 미리 적어 두면 감정이 끼어들 자리가 줄어듭니다."
        : "약한 능력은 시뮬레이션에서 작은 돈으로 먼저 연습하세요.")

  const missions = [...primaryMeta.tips, ...(topMoney ? [MONEY_META[topMoney].missions[0]] : [])]

  const [openSection, setOpenSection] = useState<string | null>(null)
  const toggleSection = (id: string) => setOpenSection((cur) => (cur === id ? null : id))

  const [activeBubble, setActiveBubble] = useState<string | null>(null)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showBubble = (id: string) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    setActiveBubble(id)
    bubbleTimer.current = setTimeout(() => setActiveBubble(null), 1800)
  }
  useEffect(() => () => { if (bubbleTimer.current) clearTimeout(bubbleTimer.current) }, [])

  // 분석 리포트
  const now = new Date()
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`
  const reportId = `INV-${String(totalScore).padStart(4, "0")}-${primary.slice(0, 3).toUpperCase()}`

  return (
    <View style={styles.root}>

      {/* ── HERO CARD ── */}
      <BounceIn style={[styles.hero, { borderColor: primaryColors.border }]}>
        {/* gradient bg */}
        <Gradient dir="b" colors={["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0.6)"]} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: primaryColors.bg }]} />
        {/* glow blob */}
        <View pointerEvents="none" style={styles.heroGlowWrap}>
          <GlowOrb color={primaryColors.accent[0]} size={380} opacity={0.3} style={{ position: "relative" }} />
        </View>

        <View style={styles.heroBody}>
          {/* catchphrase bubble */}
          <Float style={styles.catchWrap}>
            <View style={styles.catchBubble}>
              <Text style={styles.catchText}>{primaryMeta.catchphrase}</Text>
            </View>
            <View style={styles.catchTail} />
          </Float>

          {/* character */}
          <Float>
            <PersonalityCharacter type={primary} size={170} />
          </Float>

          {/* title */}
          <Text style={[styles.resultTitle, { color: primaryColors.text }]}>{LABELS.resultTitle}</Text>
          <Text style={styles.heroLabel}>{primaryMeta.label}</Text>
          <Text style={styles.heroDesc}>{primaryMeta.desc}</Text>

          {/* score pills */}
          <View style={styles.scorePills}>
            <View style={[styles.scorePill, { borderColor: primaryColors.border }]}>
              <Text style={styles.scorePillLabel}>SCORE</Text>
              <Text style={styles.scorePillValue}>{totalScore}</Text>
            </View>
            <View style={[styles.scorePill, { borderColor: alpha("#ffffff", 0.1) }]}>
              <Text style={styles.scorePillLabel}>문항</Text>
              <Text style={styles.scorePillValue}>{totalQuestions}</Text>
            </View>
          </View>

          {/* secondary badge */}
          {!!secondary && !!secondaryMeta && !!secondaryColors && (
            <View style={[styles.secondary, { borderColor: secondaryColors.border }]}>
              <Text style={styles.secondaryEmoji}>{secondaryMeta.emoji}</Text>
              <Text style={[styles.secondaryText, { color: secondaryColors.text }]}>
                {LABELS.secondaryLabel}  {secondaryMeta.label}
              </Text>
            </View>
          )}
        </View>

        {/* rank badge */}
        <View style={[styles.rank, { borderColor: rank.border, backgroundColor: rank.bg }]}>
          <Text style={[styles.rankText, { color: rank.text }]}>{rank.label}</Text>
        </View>
      </BounceIn>

      {/* ── 핵심 요약 (보고서 첫 장) ── */}
      <FadeUp delay={200} distance={20}>
        <Gradient
          dir="b"
          colors={[alpha("#ffffff", 0.06), alpha("#ffffff", 0.02)]}
          style={[styles.reportHead, { borderColor: primaryColors.border }]}
        >
          <View style={styles.reportHeadRow}>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.reportKicker}>Investment Profile Report</Text>
              <Text style={[styles.reportTitle, { color: primaryColors.text }]}>핵심 요약</Text>
            </View>
            <View style={styles.reportIdCol}>
              <View style={[styles.reportIdBox, { borderColor: primaryColors.border, backgroundColor: primaryColors.bg }]}>
                <Text style={[styles.reportId, { color: primaryColors.text }]}>{reportId}</Text>
              </View>
              <Text style={styles.reportDate}>{dateStr}</Text>
            </View>
          </View>
          <Gradient dir="r" colors={primaryColors.accent} style={styles.reportDivider} />
        </Gradient>

        <View style={[styles.reportBody, { borderColor: primaryColors.border }]}>
          <SummaryRow no="01" tag="투자 성향" emoji={primaryMeta.emoji} title={primaryMeta.label} body={primaryMeta.summary} color={primaryColors.text} />
          {!!topMoney && (
            <SummaryRow
              no="02"
              tag="돈 다루는 습관"
              emoji={MONEY_META[topMoney].emoji}
              title={MONEY_META[topMoney].label}
              body={MONEY_META[topMoney].short}
              color={MONEY_META[topMoney].color}
            />
          )}
          <SummaryRow
            no={topMoney ? "03" : "02"}
            tag="조심할 습관"
            emoji={topHabit ? HABIT_META[topHabit].emoji : "✅"}
            title={topHabit ? `${HABIT_META[topHabit].label} ×${habitCounts[topHabit]}` : "눈에 띄는 습관 없음"}
            body={topHabit ? `뿌리: ${HABIT_META[topHabit].fear}` : "감정에 끌려간 선택이 거의 없었습니다."}
            color={topHabit ? palette.red[300] : palette.emerald[300]}
          />
          <CommentBox label="총평" text={overallComment} color={primaryColors.text} border={primaryColors.border} bg={primaryColors.bg} />
        </View>

        <View style={[styles.reportFoot, { borderColor: primaryColors.border }]}>
          <Text style={styles.reportConfidential}>교육용 결과 · 투자 자문 아님</Text>
          <Text style={[styles.reportSign, { color: primaryColors.text }]}>✦ {primaryMeta.label}</Text>
        </View>
      </FadeUp>

      {/* ── 상세 (열고 닫기) ── */}
      <FadeUp delay={400} distance={20} style={{ gap: 10 }}>
        <Text style={styles.detailKicker}>상세 보기 · 눌러서 열기</Text>

        {!!topMoney && (
          <Accordion
            emoji="💰"
            title="자산 점검"
            hint={`${MONEY_META[topMoney].label} · 주식은 제2의 자산`}
            open={openSection === "money"}
            onToggle={() => toggleSection("money")}
          >
            <View style={{ gap: 10 }}>
              {MONEY_ORDER.slice().reverse().map((tag) => {
                const m = MONEY_META[tag]
                const pct = Math.round((moneyScores[tag] / moneyTotal) * 100)
                return (
                  <View key={tag}>
                    <View style={styles.moneyRow}>
                      <Text style={styles.moneyEmoji}>{m.emoji}</Text>
                      <Text style={[styles.moneyLabel, { color: tag === topMoney ? m.color : alpha("#ffffff", 0.45) }]}>{m.label}</Text>
                      <Text style={styles.moneyCount}>{moneyScores[tag]}회</Text>
                    </View>
                    <View style={styles.moneyTrack}>
                      <View style={{ height: "100%", borderRadius: 9999, width: `${pct}%`, backgroundColor: m.color }} />
                    </View>
                  </View>
                )
              })}
            </View>
            <Text style={styles.detailText}>
              <Highlighted text={MONEY_META[topMoney].desc} highlightColor={MONEY_META[topMoney].color} />
            </Text>
            <CommentBox
              label="코멘트"
              text={MONEY_META[topMoney].check.replace(/==/g, "")}
              color={MONEY_META[topMoney].color}
              border={alpha("#ffffff", 0.12)}
              bg={alpha("#ffffff", 0.03)}
            />
            <Text style={styles.detailNote}>
              꽁돈이 생길 때, 급한 돈이 필요할 때, 여행비가 필요할 때의 선택을 모았습니다. 문제는 종목이 아니라 돈의 자리일 때가 많습니다.
            </Text>
          </Accordion>
        )}

        <Accordion
          emoji="🔁"
          title="내 습관"
          hint={topHabits.length ? topHabits.map((h) => HABIT_META[h].label).join(" · ") : "눈에 띄는 습관 없음"}
          open={openSection === "habit"}
          onToggle={() => toggleSection("habit")}
        >
          {topHabits.length === 0 ? (
            <Text style={styles.detailText}>추격매수·급락 손절 같은 감정적 선택이 거의 없었습니다.</Text>
          ) : (
            topHabits.map((h) => (
              <View key={h} style={styles.habitItem}>
                <Text style={styles.habitEmoji}>{HABIT_META[h].emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.habitTitle}>
                    {HABIT_META[h].label} <Text style={styles.habitCount}>×{habitCounts[h]}</Text>
                  </Text>
                  <Text style={styles.habitFear}>뿌리: {HABIT_META[h].fear}</Text>
                  <Text style={styles.habitTip}>→ {HABIT_META[h].tip}</Text>
                </View>
              </View>
            ))
          )}
          <CommentBox
            label="코멘트"
            text={
              topHabits.length
                ? "습관의 이름은 달라도 뿌리는 대부분 두려움입니다. 이름이 붙으면 고칠 수 있습니다. 시뮬레이션에서 이 습관이 실제로 얼마였는지 가격표로 확인해 보세요."
                : "아는 것과 지키는 것은 다른 능력입니다. 시뮬레이션에서 실제 선택도 같은지 확인해 보세요."
            }
            color={primaryColors.text}
            border={alpha("#ffffff", 0.12)}
            bg={alpha("#ffffff", 0.03)}
          />
        </Accordion>

        <Accordion
          emoji="📊"
          title="성향 분포"
          hint={secondaryMeta ? `${primaryMeta.label} + ${secondaryMeta.label}` : primaryMeta.label}
          open={openSection === "dist"}
          onToggle={() => toggleSection("dist")}
        >
        <View style={{ gap: 16 }}>
          {personalityTypes.map((type) => {
            const m = PERSONALITY_META[type]
            const mc = PERSONALITY_COLORS[type]
            const pct = Math.round((personalityScores[type] / maxPersonality) * 100)
            const isPrimary = type === primary
            const bubbleId = `p-${type}`
            const open = activeBubble === bubbleId
            return (
              <PressableScale
                key={type}
                scaleTo={0.98}
                pressedOpacity={1}
                onPress={() => {
                  playClickSound()
                  showBubble(bubbleId)
                }}
              >
                <View style={styles.distRow}>
                  <Text style={[styles.distEmoji, !isPrimary && { opacity: 0.5 }]}>{m.emoji}</Text>
                  <Text style={[styles.distLabel, { color: isPrimary ? mc.text : alpha("#ffffff", 0.45) }]}>{m.label}</Text>
                  {isPrimary && (
                    <View style={[styles.primaryTag, { backgroundColor: mc.bg, borderColor: mc.border }]}>
                      <Text style={[styles.primaryTagText, { color: mc.text }]}>주요</Text>
                    </View>
                  )}
                  <View style={styles.distRight}>
                    {!open && (
                      <Pulse>
                        <Text style={[styles.distBubbleIcon, { color: isPrimary ? mc.text : alpha("#ffffff", 0.3), opacity: isPrimary ? 1 : 0.3 }]}>💬</Text>
                      </Pulse>
                    )}
                    <Text style={[styles.distScore, { color: isPrimary ? "#ffffff" : alpha("#ffffff", 0.4) }]}>
                      {personalityScores[type]}
                    </Text>
                  </View>
                </View>
                <View style={styles.distTrack}>
                  <Gradient
                    dir="r"
                    colors={mc.accent}
                    style={[
                      styles.distFill,
                      { width: `${pct}%` },
                      isPrimary && { boxShadow: "0 0 8px rgba(255,255,255,0.3)" },
                    ]}
                  />
                </View>
                {open && (
                  <View pointerEvents="none" style={styles.distBubble}>
                    <BounceIn style={styles.distBubbleInner}>
                      <View style={[styles.bubble, { borderBottomRightRadius: 2 }]}>
                        <Text numberOfLines={1} style={styles.bubbleText}>{m.judge}</Text>
                      </View>
                      <PersonalityCharacter type={type} size={40} style={{ marginBottom: -4 }} />
                    </BounceIn>
                  </View>
                )}
              </PressableScale>
            )
          })}
        </View>
          <CommentBox label="코멘트" text={distComment} color={primaryColors.text} border={alpha("#ffffff", 0.12)} bg={alpha("#ffffff", 0.03)} />
        </Accordion>

        <Accordion
          emoji="⚔️"
          title="능력치"
          hint={`강점 ${ABILITY_META[sortedAbilities[0]].label} · 약점 ${ABILITY_META[weakestAbility].label}`}
          open={openSection === "ability"}
          onToggle={() => toggleSection("ability")}
        >
        <View style={styles.grid}>
          {sortedAbilities.map((key, idx) => {
            const meta = ABILITY_META[key]
            const pct = Math.round((abilities[key] / maxAbility) * 100)
            const bubbleId = `a-${key}`
            const open = activeBubble === bubbleId
            const isTop = idx === 0
            return (
              <PressableScale
                key={key}
                pressedOpacity={1}
                onPress={() => {
                  playClickSound()
                  showBubble(bubbleId)
                }}
                style={[
                  styles.abilityCard,
                  isTop
                    ? { borderColor: alpha(palette.yellow[400], 0.5), backgroundColor: alpha(palette.yellow[400], 0.08) }
                    : { borderColor: alpha("#ffffff", 0.08), backgroundColor: alpha("#ffffff", 0.02) },
                ]}
              >
                <View style={styles.abilityTop}>
                  {!open ? (
                    <Pulse>
                      <Text style={{ fontSize: 12, color: "#ffffff", opacity: isTop ? 0.7 : 0.25 }}>💬</Text>
                    </Pulse>
                  ) : (
                    <View />
                  )}
                  {isTop && (
                    <View style={styles.maxTag}>
                      <Text style={styles.maxTagText}>MAX</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.abilityEmoji}>{meta.emoji}</Text>
                <Text style={[styles.abilityValue, { color: isTop ? palette.yellow[300] : alpha("#ffffff", 0.8) }]}>{abilities[key]}</Text>
                <Text style={[styles.abilityLabel, { color: isTop ? alpha(palette.yellow[400], 0.8) : alpha("#ffffff", 0.4) }]}>{meta.label}</Text>
                <View style={styles.abilityTrack}>
                  <Gradient dir="r" colors={ABILITY_BAR_COLORS[key]} style={{ height: "100%", borderRadius: 9999, width: `${pct}%` }} />
                </View>
                {open && (
                  <View pointerEvents="none" style={styles.abilityBubble}>
                    <BounceIn>
                      <View style={styles.bubble}>
                        <Text numberOfLines={1} style={styles.bubbleText}>{meta.oneLiner}</Text>
                      </View>
                    </BounceIn>
                  </View>
                )}
              </PressableScale>
            )
          })}
        </View>
          <CommentBox label="코멘트" text={abilityComment} color={primaryColors.text} border={alpha("#ffffff", 0.12)} bg={alpha("#ffffff", 0.03)} />
        </Accordion>

        <Accordion
          emoji="📑"
          title={`${primaryMeta.label} 상세 분석`}
          hint={`${primaryMeta.analysis.length}가지 관찰`}
          open={openSection === "report"}
          onToggle={() => toggleSection("report")}
        >
        <View style={{ gap: 16 }}>
          {primaryMeta.analysis.map((item, i) => (
            <View key={i} style={styles.reportItem}>
              <Text style={[styles.reportNo, { color: primaryColors.text }]}>{String(i + 1).padStart(2, "0")}</Text>
              <View style={[styles.reportBar, { backgroundColor: primaryColors.border }]} />
              <Text style={styles.reportText}>
                <Highlighted text={item} highlightColor={primaryColors.highlight} />
              </Text>
            </View>
          ))}
        </View>
        </Accordion>
      </FadeUp>

      {/* ── 다음 미션 ── */}
      <FadeUp delay={600} distance={20} style={[styles.mission, { borderColor: primaryColors.border, backgroundColor: primaryColors.bg }]}>
        <View style={[styles.cardHead, { marginBottom: 12 }]}>
          <Text style={styles.cardEmoji}>🎯</Text>
          <Text style={styles.cardTitle}>{LABELS.tipsTitle}</Text>
        </View>
        <View style={{ gap: 8 }}>
          {missions.map((tip, i) => (
            <View key={i} style={[styles.tip, { borderColor: primaryColors.border }]}>
              <Text style={[styles.tipNo, { color: primaryColors.text }]}>{i + 1}</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </FadeUp>

      {/* quick mode → upgrade */}
      {mode === "quick" && (
        <FadeUp delay={800} distance={20} style={styles.card}>
          <View style={styles.upgradeHead}>
            <Text style={styles.upgradeEmoji}>🔬</Text>
            <Text style={styles.cardTitle}>정밀 측정 GO</Text>
          </View>
          <PressableScale
            scaleTo={0.98}
            onPress={() => {
              playClickSound()
              router.push("/analysis?mode=detailed")
            }}
            style={styles.upgradeBtn}
          >
            <Text style={styles.upgradeBtnText}>시뮬레이션 시작하기 →</Text>
          </PressableScale>
        </FadeUp>
      )}

      {/* compete 반환 버튼 */}
      {returnTo === "compete" && (
        <FadeUp delay={mode === "quick" ? 900 : 700} distance={20}>
          <Gradient
            dir="r"
            colors={[alpha(palette.yellow[500], 0.15), alpha(palette.orange[500], 0.15)]}
            style={styles.competeCard}
          >
            <View style={styles.upgradeHead}>
              <Text style={styles.upgradeEmoji}>🏆</Text>
              <View>
                <Text style={styles.competeTitle}>경쟁 페이지에 반영 완료!</Text>
                <Text style={styles.competeSub}>투자 DNA 업데이트됨</Text>
              </View>
            </View>
            <PressableScale
              scaleTo={0.98}
              onPress={() => {
                playClickSound()
                router.push("/compete")
              }}
            >
              <Gradient dir="r" colors={[palette.yellow[500], palette.orange[500]]} style={styles.competeBtn}>
                <Text style={styles.competeBtnText}>경쟁 페이지로 돌아가기 →</Text>
              </Gradient>
            </PressableScale>
          </Gradient>
        </FadeUp>
      )}

      {/* action buttons */}
      <FadeUp delay={mode === "quick" ? 1000 : 800} distance={20} style={styles.actions}>
        {returnTo !== "compete" && (
          <PressableScale
            scaleTo={0.98}
            onPress={() => {
              playClickSound()
              router.push("/home")
            }}
          >
            <Gradient dir="r" colors={[palette.blue[600], palette.purple[600]]} style={styles.startBtn}>
              <Text style={styles.startBtnText}>{LABELS.startGameBtn}</Text>
            </Gradient>
          </PressableScale>
        )}
        <PressableScale
          scaleTo={0.98}
          onPress={() => {
            playClickSound()
            // 웹: window.location.href = `/analysis?mode=${mode}` (전체 새로고침으로 상태 초기화)
            router.replace({ pathname: "/analysis", params: { mode, retry: String(Date.now()) } })
          }}
          style={styles.retryBtn}
        >
          <Text style={styles.retryBtnText}>{LABELS.retryBtn}</Text>
        </PressableScale>
      </FadeUp>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: 20, paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },

  hero: { borderRadius: 24, borderWidth: 2, overflow: "hidden" },
  heroGlowWrap: { position: "absolute", top: -110, left: 0, right: 0, alignItems: "center" },
  heroGlow: { width: 256, height: 256, borderRadius: 128, opacity: 0.12 },
  heroBody: { alignItems: "center", paddingTop: 20, paddingBottom: 24, paddingHorizontal: 20 },
  catchWrap: { marginBottom: 8, alignItems: "center" },
  catchBubble: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    boxShadow: "0 20px 25px rgba(0,0,0,0.1), 0 8px 10px rgba(0,0,0,0.1)",
    zIndex: 1,
  },
  catchText: { color: palette.slate[900], fontSize: 14, fontWeight: "800" },
  catchTail: { width: 12, height: 12, backgroundColor: "#ffffff", transform: [{ rotate: "45deg" }], marginTop: -6 },
  rank: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontWeight: "900", fontSize: 24 },
  resultTitle: { fontSize: 12, fontWeight: "700", marginTop: 4, letterSpacing: 1.2, opacity: 0.7 },
  heroLabel: {
    fontSize: 36,
    fontWeight: "900",
    color: "#ffffff",
    marginTop: 2,
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
  heroDesc: { color: alpha("#ffffff", 0.65), fontSize: 14, lineHeight: 23, textAlign: "center", maxWidth: 320 },
  scorePills: { marginTop: 16, flexDirection: "row", gap: 12 },
  scorePill: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 1,
  },
  scorePillLabel: { fontSize: 10, color: alpha("#ffffff", 0.45), fontWeight: "700", letterSpacing: 0.5 },
  scorePillValue: { fontSize: 24, fontWeight: "900", color: "#ffffff", lineHeight: 26, marginTop: 2 },
  secondary: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 2,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  secondaryEmoji: { fontSize: 20, color: "#ffffff" },
  secondaryText: { fontSize: 12, fontWeight: "900" },

  card: { borderRadius: 16, backgroundColor: alpha("#ffffff", 0.03), borderWidth: 1, borderColor: alpha("#ffffff", 0.1), padding: 16 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  cardEmoji: { fontSize: 24, color: "#ffffff" },
  cardTitle: { fontSize: 14, fontWeight: "900", color: "#ffffff" },

  distRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  distEmoji: { fontSize: 30, color: "#ffffff" },
  distLabel: { fontSize: 14, fontWeight: "900" },
  primaryTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, borderWidth: 1 },
  primaryTagText: { fontSize: 9, fontWeight: "900" },
  distRight: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 8 },
  distBubbleIcon: { fontSize: 16 },
  distScore: { fontSize: 16, fontWeight: "900" },
  distTrack: { height: 12, borderRadius: 9999, backgroundColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  distFill: { height: "100%", borderRadius: 9999 },
  distBubble: { position: "absolute", top: -12, right: 4, zIndex: 10 },
  distBubbleInner: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  bubble: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    boxShadow: "0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1)",
  },
  bubbleText: { fontSize: 12, fontWeight: "800", color: palette.slate[900] },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  abilityCard: { width: "47%", flexGrow: 0, alignItems: "center", padding: 12, borderRadius: 16, borderWidth: 1 },
  abilityTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 4, minHeight: 16 },
  maxTag: { marginLeft: "auto", backgroundColor: alpha(palette.yellow[400], 0.15), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  maxTagText: { fontSize: 9, fontWeight: "900", color: palette.yellow[400] },
  abilityEmoji: { fontSize: 36, marginBottom: 4, color: "#ffffff" },
  abilityValue: { fontSize: 30, fontWeight: "900" },
  abilityLabel: { fontSize: 10, fontWeight: "700", marginTop: 2 },
  abilityTrack: { width: "100%", height: 6, borderRadius: 9999, backgroundColor: alpha("#ffffff", 0.05), marginTop: 8, overflow: "hidden" },
  abilityBubble: { position: "absolute", top: -12, left: -40, right: -40, alignItems: "center", zIndex: 10 },

  reportHead: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  reportHeadRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 8 },
  reportKicker: { textTransform: "uppercase", fontSize: 9, letterSpacing: 2.25, fontWeight: "900", color: alpha("#ffffff", 0.35) },
  reportTitle: { fontSize: 16, fontWeight: "900", marginTop: 2 },
  reportIdCol: { alignItems: "flex-end", gap: 2 },
  reportIdBox: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  reportId: { fontSize: 9, fontWeight: "900", letterSpacing: 0.9 },
  reportDate: { fontSize: 9, color: alpha("#ffffff", 0.3), fontFamily: MONO },
  reportDivider: { height: 1, width: "100%", opacity: 0.4 },
  reportBody: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    backgroundColor: alpha("#ffffff", 0.015),
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  reportItem: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  reportNo: { fontFamily: MONO, fontSize: 10, fontWeight: "900", opacity: 0.6, marginTop: 4, width: 20, textAlign: "right" },
  reportBar: { width: 1, alignSelf: "stretch", opacity: 0.5 },
  reportText: { flex: 1, fontSize: 14, color: alpha("#ffffff", 0.7), lineHeight: 23, letterSpacing: -0.35 },
  reportFoot: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    backgroundColor: alpha("#ffffff", 0.02),
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reportConfidential: { fontSize: 9, color: alpha("#ffffff", 0.25), fontFamily: MONO, letterSpacing: 0.45 },
  reportSign: { fontSize: 9, fontWeight: "900", opacity: 0.5 },

  summaryTag: { fontSize: 10, fontWeight: "700", color: alpha("#ffffff", 0.4), letterSpacing: 0.5 },
  summaryTitle: { fontSize: 17, fontWeight: "900", marginTop: 2 },
  summaryBody: { fontSize: 13, color: alpha("#ffffff", 0.65), lineHeight: 20, marginTop: 2 },
  comment: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  commentLabel: { fontSize: 11, fontWeight: "900" },
  commentText: { fontSize: 13, color: alpha("#ffffff", 0.75), lineHeight: 21 },

  detailKicker: { fontSize: 11, fontWeight: "700", color: alpha("#ffffff", 0.35), marginLeft: 4 },
  accordion: { padding: 0 },
  accordionHead: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  accordionHint: { fontSize: 11, color: alpha("#ffffff", 0.45), marginTop: 2 },
  accordionArrow: { fontSize: 11, color: alpha("#ffffff", 0.4) },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 14 },
  detailText: { fontSize: 14, color: alpha("#ffffff", 0.7), lineHeight: 23 },
  detailNote: { fontSize: 11, color: alpha("#ffffff", 0.35), lineHeight: 17 },

  moneyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  moneyEmoji: { fontSize: 18, color: "#ffffff" },
  moneyLabel: { fontSize: 13, fontWeight: "900" },
  moneyCount: { marginLeft: "auto", fontSize: 12, fontWeight: "700", color: alpha("#ffffff", 0.5) },
  moneyTrack: { height: 8, borderRadius: 9999, backgroundColor: alpha("#ffffff", 0.05), overflow: "hidden" },

  habitItem: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  habitEmoji: { fontSize: 24, color: "#ffffff" },
  habitTitle: { fontSize: 14, fontWeight: "900", color: "#ffffff" },
  habitCount: { color: palette.red[300] },
  habitFear: { fontSize: 12, color: alpha("#ffffff", 0.5), marginTop: 2 },
  habitTip: { fontSize: 13, color: alpha("#ffffff", 0.75), lineHeight: 20, marginTop: 4 },

  mission: { borderRadius: 16, borderWidth: 2, padding: 16 },
  tip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderWidth: 1,
  },
  tipNo: { fontSize: 18, fontWeight: "900" },
  tipText: { flex: 1, fontSize: 14, fontWeight: "700", color: alpha("#ffffff", 0.9) },

  upgradeHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  upgradeEmoji: { fontSize: 30, color: "#ffffff" },
  upgradeBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: alpha("#ffffff", 0.1),
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.15),
    alignItems: "center",
  },
  upgradeBtnText: { color: alpha("#ffffff", 0.8), fontSize: 14, fontWeight: "900" },

  competeCard: { borderRadius: 16, borderWidth: 2, borderColor: alpha(palette.yellow[500], 0.4), padding: 16 },
  competeTitle: { fontSize: 14, fontWeight: "900", color: palette.yellow[300] },
  competeSub: { fontSize: 12, color: alpha("#ffffff", 0.5) },
  competeBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    boxShadow: "0 10px 15px rgba(234,179,8,0.25)",
  },
  competeBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "900" },

  actions: { gap: 8, marginTop: 4 },
  startBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.blue[500], 0.3),
    alignItems: "center",
    boxShadow: "0 10px 15px rgba(59,130,246,0.3)",
  },
  startBtnText: { color: "#ffffff", fontWeight: "900", fontSize: 16 },
  retryBtn: { width: "100%", paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.08), alignItems: "center" },
  retryBtnText: { color: alpha("#ffffff", 0.4), fontSize: 14, fontWeight: "600" },
})
