import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { BarChart3, ChevronDown, Swords } from "lucide-react-native"
import { INVESTOR_DNA_MAP, getAIPersonality, getMatchedAI, type InvestorPersonality, type LegendaryScenario } from "@/data/legendary-scenarios"
import { FadeUp, Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { twGradient } from "../utils/tw"
import { sectionStyles } from "./CollapsibleSection"

// ── 사고 대처 능력 (핵심) ──────────────────────────────────────────
export function CrisisResponseSection({ scenario, userPersonality }: { scenario: LegendaryScenario; userPersonality: InvestorPersonality }) {
  const [open, setOpen] = useState(false)
  const myDNA = INVESTOR_DNA_MAP[userPersonality]
  const matchedAI = getMatchedAI(scenario.aiStrategies, userPersonality)

  const parseRate = (s: string) => parseFloat(s.replace("%", "").replace("+", ""))
  const sorted = [...scenario.aiStrategies].sort((a, b) => parseRate(b.returnRate) - parseRate(a.returnRate))
  const maxAbs = Math.max(...scenario.aiStrategies.map((ai) => Math.abs(parseRate(ai.returnRate))), 1)

  return (
    <View style={{ marginTop: 20 }}>
      <Pressable onPress={() => setOpen(!open)} style={sectionStyles.head}>
        <Swords size={16} color={palette.cyan[400]} />
        <Text style={sectionStyles.title}>누가 제일 잘했을까?</Text>
        {sorted.length > 0 && (
          <View style={sectionStyles.badge}>
            <Text style={sectionStyles.badgeText}>
              1등 {sorted[0].emoji} {sorted[0].returnRate}
            </Text>
          </View>
        )}
        <View style={open ? { transform: [{ rotate: "180deg" }] } : undefined}>
          <ChevronDown size={16} color={palette.gray[500]} />
        </View>
      </Pressable>

      {open && (
        <FadeUp duration={300} distance={8}>
      {/* AI 수익률 비교 바차트 */}
      <View style={styles.chartCard}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 }}>
          <BarChart3 size={12} color={palette.gray[500]} />
          <Text style={{ fontSize: 10, fontWeight: "700", color: palette.gray[500] }}>성격별 마지막 수익</Text>
        </View>
        <View style={{ gap: 12 }}>
          {sorted.map((ai) => {
            const rate = parseRate(ai.returnRate)
            const isPositive = rate >= 0
            const barWidth = Math.min((Math.abs(rate) / maxAbs) * 100, 100)
            const isMyType = getAIPersonality(ai.type) === userPersonality
            return (
              <View key={ai.name}>
                <View style={styles.rowTop}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontSize: 16, color: "#ffffff" }}>{ai.emoji}</Text>
                    <Text style={{ fontSize: 12, color: "#ffffff" }}>{ai.type}</Text>
                    {isMyType && (
                      <View style={styles.mine}>
                        <Text style={{ fontSize: 8, fontWeight: "700", color: "#ffffff" }}>나의 성향</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: isPositive ? palette.green[400] : palette.red[400] }}>{ai.returnRate}</Text>
                </View>
                <View style={styles.track}>
                  <Gradient
                    dir="r"
                    colors={isPositive ? [palette.green[600], palette.green[400]] : [palette.red[600], palette.red[400]]}
                    style={[{ width: `${barWidth}%`, height: "100%", borderRadius: 9999 }, isMyType && { borderWidth: 1, borderColor: alpha(palette.cyan[400], 0.5) }]}
                  />
                </View>
              </View>
            )
          })}
        </View>
        {/* 인사이트 */}
        {sorted.length > 0 && (
          <View style={styles.insightWrap}>
            <View style={styles.insight}>
              <Text style={{ fontSize: 10, color: palette.yellow[300], lineHeight: 16 }}>
                💡 {sorted[0].type}({sorted[0].returnRate})이 1등! 성격에 따라 결과가 크게 달라져요
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 나 vs AI 매칭 */}
      {matchedAI && (
        <View style={styles.matchCard}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: palette.cyan[400], marginBottom: 12 }}>나와 닮은 {myDNA.label} AI는 이렇게 했어요</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <View style={{ alignItems: "center" }}>
              <View style={styles.meAvatar}>
                <Text style={{ fontSize: 20, color: "#ffffff" }}>👤</Text>
              </View>
              <Text style={styles.avatarLabel}>나</Text>
            </View>
            <View style={{ marginHorizontal: 4 }}>
              <Swords size={16} color={palette.yellow[400]} />
            </View>
            <View style={{ alignItems: "center" }}>
              <Gradient dir="br" colors={twGradient(myDNA.bgGradient)} style={styles.aiAvatar}>
                <Text style={{ fontSize: 20, color: "#ffffff" }}>{matchedAI.emoji}</Text>
              </Gradient>
              <Text style={styles.avatarLabel}>{matchedAI.name}</Text>
            </View>
            <View style={styles.actions}>
              {matchedAI.actions.slice(0, 3).map((action, i) => (
                <Text key={i} style={{ fontSize: 9, color: palette.gray[300], lineHeight: 12 }}>
                  • {action}
                </Text>
              ))}
              {matchedAI.actions.length > 3 && <Text style={{ fontSize: 9, color: palette.gray[500] }}>+{matchedAI.actions.length - 3}개 더...</Text>}
            </View>
          </View>
          <View style={styles.result}>
            <Text style={{ flex: 1, fontSize: 10, color: palette.gray[400] }}>{matchedAI.result}</Text>
            <Text style={{ fontSize: 14, fontWeight: "700", color: matchedAI.returnRate.startsWith("+") ? palette.green[400] : palette.red[400] }}>{matchedAI.returnRate}</Text>
          </View>
        </View>
      )}
        </FadeUp>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  chartCard: { backgroundColor: "#252525", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), marginBottom: 12 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  mine: { backgroundColor: palette.cyan[500], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  track: { height: 10, backgroundColor: palette.gray[700], borderRadius: 9999, overflow: "hidden" },
  insightWrap: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },
  insight: { backgroundColor: alpha(palette.yellow[500], 0.08), borderRadius: 12, padding: 10 },
  matchCard: { backgroundColor: "#1a1a2e", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha(palette.cyan[500], 0.2) },
  meAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: alpha(palette.cyan[500], 0.2), borderWidth: 1, borderColor: alpha(palette.cyan[400], 0.4), alignItems: "center", justifyContent: "center", marginBottom: 4 },
  aiAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4, overflow: "hidden" },
  avatarLabel: { fontSize: 9, color: palette.gray[400] },
  actions: { flex: 1, backgroundColor: alpha("#ffffff", 0.05), borderRadius: 12, padding: 8, marginLeft: 4, gap: 4 },
  result: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: alpha("#ffffff", 0.05), borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
})
