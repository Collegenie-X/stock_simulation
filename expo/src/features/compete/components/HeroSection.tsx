import React, { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown, Crown, Info, Share2, Swords, Target, Zap } from "lucide-react-native"
import { FadeUp, Float, GlowOrb, Gradient, Pop, PressableScale } from "@/components/ui"
import PersonalityCharacter from "@/features/analysis/components/PersonalityCharacter"
import type { PersonalityType } from "@/features/analysis/types"
import { localStore } from "@/lib/storage"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { COMPETE_LABELS, INVESTMENT_STYLES, WAVE_PATTERN_TYPES } from "../config"
import { CountUp } from "./game/CountUp"
import { GrowBar } from "./game/GrowBar"
import { TrendLine } from "./game/TrendLine"
import { VsBattleRow } from "./hero/VsBattleRow"
import { ShareSheet } from "./hero/ShareSheet"
import type { MyProfile } from "./hero/types"

interface HeroSectionProps {
  profile: MyProfile
  rankTrend?: { week: string; rank: number; profitRate: number }[]
}

const STYLE_TO_CHARACTER: Record<string, PersonalityType> = {
  aggressive: "challenger",
  conservative: "conservative",
  moderate: "analyst",
  balanced: "analyst",
}

/** 성향 분석 결과가 있으면 그 캐릭터를, 없으면 투자 스타일에 맞는 캐릭터를 사용 */
function resolveCharacter(style: string): PersonalityType {
  const dna = localStore.getJSON<{ primaryPersonality?: PersonalityType }>("compete_dna_result")
  return dna?.primaryPersonality ?? STYLE_TO_CHARACTER[style] ?? "challenger"
}

const L = COMPETE_LABELS.hero

const SCORE_PARTS = [
  { label: "수익률", pct: "50%", weight: 50, color: palette.red[400] },
  { label: "파도정확도", pct: "25%", weight: 25, color: palette.cyan[400] },
  { label: "승률", pct: "15%", weight: 15, color: palette.green[400] },
  { label: "일관성", pct: "10%", weight: 10, color: palette.yellow[400] },
]

export function HeroSection({ profile, rankTrend }: HeroSectionProps) {
  const [showShare, setShowShare] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [characterType] = useState(() => resolveCharacter(profile.investmentStyle))

  const mentors = profile.aiMentors
  const beaten = [mentors.conservative, mentors.aggressive].filter((m) => profile.profitRate > m.profitRate)
  const nextTarget = [mentors.conservative, mentors.aggressive].find((m) => profile.profitRate <= m.profitRate)
  const cheer = beaten.length === 2 ? "AI 전부 추월! 👑" : beaten.length === 1 ? `다음 상대는 ${nextTarget?.name} ${nextTarget?.emoji}` : "추격 시작! 🔥"

  const styleInfo = INVESTMENT_STYLES[profile.investmentStyle] ?? INVESTMENT_STYLES.aggressive
  const waveInfo = WAVE_PATTERN_TYPES[profile.wavePatternType] ?? WAVE_PATTERN_TYPES.wave3Focus
  const percentile = (((profile.totalRankUsers - profile.rank) / profile.totalRankUsers) * 100).toFixed(1)
  const bestHistoryRank = 15

  return (
    <>
      <FadeUp duration={450}>
        <Gradient dir="br" colors={["#1a1a2e", "#16213e", "#0f3460"]} style={styles.card}>
          <GlowOrb color={palette.blue[500]} size={320} opacity={0.3} style={{ top: -140, right: -140 }} />
          <GlowOrb color={palette.purple[500]} size={280} opacity={0.28} style={{ bottom: -120, left: -120 }} />

          {/* 캐릭터 + 순위 (핵심) */}
          <View style={styles.mainRow}>
            <View style={styles.charCol}>
              <Pop delay={700} style={styles.bubble}>
                <Text style={styles.bubbleText}>{cheer}</Text>
              </Pop>
              <Float duration={2400} distance={6}>
                <PersonalityCharacter type={characterType} size={104} />
              </Float>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv.{profile.level}</Text>
              </View>
            </View>

            <View style={styles.infoCol}>
              <View style={styles.nameRow}>
                <Text numberOfLines={1} style={styles.nickname}>
                  {profile.nickname}
                </Text>
                <Text style={styles.badgeEmojis}>{profile.badges.join("")}</Text>
              </View>
              <Text style={styles.kicker}>{L.myRank}</Text>
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3 }}>
                <CountUp value={profile.rank} duration={1000} style={styles.rankNum} />
                <Text style={styles.rankUnit}>{L.rankUnit}</Text>
              </View>
              <View style={styles.chipRow}>
                <View style={styles.profitChip}>
                  <CountUp value={profile.profitRate} decimals={1} prefix="+" suffix="%" duration={1000} delay={150} style={styles.profit} />
                </View>
                <View style={styles.percentileChip}>
                  <Text style={styles.percentileText}>
                    {L.topPercent} {percentile}%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 도전자 정신 게이지 */}
          <View style={styles.spirit}>
            <View style={styles.scoreHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Zap size={16} color={palette.yellow[400]} fill={palette.yellow[400]} />
                <Text style={styles.scoreTitle}>{L.challengerSpirit}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <CountUp value={profile.challengerScore} duration={1100} delay={200} style={styles.scoreValue} />
                <Text style={styles.scoreMax}> / 100</Text>
              </View>
            </View>
            <GrowBar pct={profile.challengerScore} colors={[palette.yellow[400], palette.orange[500]]} height={12} delay={200} duration={1100} />
          </View>

          {/* 순위 추이 (그려지는 그래프) */}
          {!!rankTrend?.length && (
            <View style={styles.trendBox}>
              <Text style={styles.trendTitle}>순위 추이 · 최근 {rankTrend.length}주</Text>
              <TrendLine
                values={rankTrend.map((r) => r.rank)}
                labels={rankTrend.map((r) => r.week)}
                color={palette.cyan[400]}
                higherIsBetter={false}
                lastLabel={`${profile.rank}위`}
              />
            </View>
          )}

          {/* 상세 (접기/펼치기) */}
          <Pressable onPress={() => setShowDetail((v) => !v)} style={({ pressed }) => [styles.detailToggle, pressed && { opacity: 0.7 }]}>
            <Text style={styles.detailToggleText}>{showDetail ? "상세 접기" : "스탯 · AI 대결 자세히"}</Text>
            <ChevronDown size={14} color={palette.gray[300]} strokeWidth={3} style={{ transform: [{ rotate: showDetail ? "180deg" : "0deg" }] }} />
          </Pressable>

          {showDetail && (
            <FadeUp duration={320} distance={10}>
              <View style={styles.statGrid}>
                <StatTile icon={<Target size={15} color={palette.green[400]} />} value={`${profile.winRate}%`} label={L.winRate} color={palette.green[400]} />
                <StatTile icon={<Swords size={15} color={palette.sky[400]} />} value={`${profile.totalTrades}회`} label={L.totalTrades} color="#ffffff" />
                <StatTile icon={<Crown size={15} color={palette.yellow[400]} />} value={`${bestHistoryRank}위`} label={L.bestRank} color={palette.yellow[400]} />
                <StatTile icon={<Text style={{ fontSize: 14, color: "#ffffff" }}>{waveInfo.emoji}</Text>} value={styleInfo.emoji} label="스타일" color={styleInfo.gradientFrom} />
              </View>

              <View style={styles.aiBox}>
                <View style={styles.aiHead}>
                  <Text style={styles.aiTitle}>{L.vsAI}</Text>
                  <Text style={styles.vs}>VS</Text>
                </View>
                <VsBattleRow emoji={mentors.conservative.emoji} name={mentors.conservative.name} aiRate={mentors.conservative.profitRate} myRate={profile.profitRate} winLabel={L.aiBeaten} behindLabel={L.aiBehind} delay={100} />
                <VsBattleRow emoji={mentors.aggressive.emoji} name={mentors.aggressive.name} aiRate={mentors.aggressive.profitRate} myRate={profile.profitRate} winLabel={L.aiBeaten} behindLabel={L.aiBehind} delay={250} />
              </View>

              <View style={styles.segments}>
                {SCORE_PARTS.map((item) => (
                  <View key={item.label} style={{ flex: item.weight, height: 4, borderRadius: 2, backgroundColor: item.color }} />
                ))}
              </View>
              <View style={styles.legend}>
                {SCORE_PARTS.map((item) => (
                  <View key={item.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>
                      {item.label} <Text style={{ color: item.color, fontWeight: "800" }}>{item.pct}</Text>
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.noticeRow}>
                <Info size={12} color={palette.gray[500]} />
                <Text style={styles.noticeText}>
                  <Text style={{ color: alpha(palette.yellow[400], 0.8), fontWeight: "700" }}>실전 시뮬레이션</Text>만 랭킹 반영 · 총 자산 {formatNumber(profile.totalAssets)}원
                </Text>
              </View>
            </FadeUp>
          )}

          <PressableScale scaleTo={0.96} onPress={() => setShowShare(true)} style={{ marginTop: 14 }}>
            <Gradient dir="r" colors={[palette.blue[500], palette.purple[600]]} style={styles.shareBtn}>
              <Share2 size={16} color="#ffffff" />
              <Text style={styles.shareText}>{L.shareBtn}</Text>
            </Gradient>
          </PressableScale>
        </Gradient>
      </FadeUp>

      <ShareSheet visible={showShare} onClose={() => setShowShare(false)} profile={profile} percentile={percentile} />
    </>
  )
}

function StatTile({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <View style={styles.statCell}>
      {icon}
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { marginTop: 16, borderRadius: 24, padding: 20, overflow: "hidden", borderWidth: 1, borderColor: alpha("#ffffff", 0.1), boxShadow: "0 25px 50px rgba(0,0,0,0.25)" },

  mainRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  charCol: { width: 112, alignItems: "center", paddingTop: 26 },
  bubble: { position: "absolute", top: 0, left: 0, right: -30, zIndex: 2, alignItems: "flex-start" },
  bubbleText: { fontSize: 10, fontWeight: "900", color: "#0b0b12", backgroundColor: "#ffffff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderBottomLeftRadius: 2, overflow: "hidden" },
  levelBadge: { marginTop: -10, backgroundColor: palette.yellow[400], borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 2, borderColor: "#16213e" },
  levelText: { fontSize: 10, fontWeight: "900", color: "#1a1000" },
  infoCol: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  nickname: { flexShrink: 1, fontWeight: "900", color: "#ffffff", fontSize: 16, letterSpacing: -0.3 },
  badgeEmojis: { fontSize: 13, color: "#ffffff" },
  kicker: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5, color: palette.cyan[400] },
  rankNum: { fontSize: 56, lineHeight: 60, fontWeight: "900", color: "#ffffff", letterSpacing: -2, fontVariant: ["tabular-nums"] },
  rankUnit: { fontSize: 18, fontWeight: "700", color: palette.gray[400], marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  profitChip: { backgroundColor: alpha(palette.red[400], 0.15), borderColor: alpha(palette.red[400], 0.35), borderWidth: 1, borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 3 },
  profit: { fontSize: 14, fontWeight: "900", color: palette.red[400], fontVariant: ["tabular-nums"] },
  percentileChip: { backgroundColor: alpha(palette.yellow[400], 0.15), borderColor: alpha(palette.yellow[400], 0.35), borderWidth: 1, borderRadius: 9999, paddingHorizontal: 9, paddingVertical: 4 },
  percentileText: { fontSize: 11, fontWeight: "900", color: palette.yellow[400] },

  spirit: { marginBottom: 14 },
  scoreHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  scoreTitle: { fontSize: 14, fontWeight: "800", color: "#ffffff" },
  scoreValue: { fontSize: 20, fontWeight: "900", color: palette.yellow[400], fontVariant: ["tabular-nums"] },
  scoreMax: { fontSize: 11, fontWeight: "700", color: palette.gray[500] },

  trendBox: { backgroundColor: alpha("#000000", 0.25), borderRadius: 16, padding: 12, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  trendTitle: { fontSize: 11, fontWeight: "700", color: palette.gray[400] },

  detailToggle: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 12 },
  detailToggleText: { fontSize: 12, fontWeight: "700", color: palette.gray[300] },

  statGrid: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCell: { flex: 1, backgroundColor: alpha("#ffffff", 0.05), borderRadius: 14, paddingVertical: 10, alignItems: "center", gap: 3, borderWidth: 1, borderColor: alpha("#ffffff", 0.06) },
  statValue: { fontSize: 15, fontWeight: "900" },
  statLabel: { fontSize: 10, color: palette.gray[500] },
  segments: { flexDirection: "row", gap: 3, marginTop: 12 },
  legend: { flexDirection: "row", flexWrap: "wrap", columnGap: 10, rowGap: 2, marginTop: 6 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 10, color: palette.gray[500] },
  aiBox: { backgroundColor: "#0d0d1a", borderRadius: 16, padding: 12, gap: 8, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  aiHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  aiTitle: { fontSize: 12, color: palette.gray[400], fontWeight: "700" },
  vs: { fontSize: 12, fontWeight: "900", fontStyle: "italic", color: palette.red[400], letterSpacing: 1 },
  noticeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  noticeText: { flex: 1, fontSize: 10, color: palette.gray[500] },

  shareBtn: { borderRadius: 16, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  shareText: { color: "#ffffff", fontWeight: "800", fontSize: 16 },
})
