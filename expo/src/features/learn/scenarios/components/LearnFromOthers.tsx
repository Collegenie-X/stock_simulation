import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown, GraduationCap } from "lucide-react-native"
import { INVESTOR_DNA_MAP, getAIPersonality, type InvestorPersonality, type LegendaryScenario } from "@/data/legendary-scenarios"
import { alpha, palette } from "@/theme"
import { sectionStyles } from "./CollapsibleSection"

const bgColors: Record<string, { bg: string; border: string }> = {
  green: { bg: alpha(palette.green[500], 0.1), border: alpha(palette.green[500], 0.2) },
  red: { bg: alpha(palette.red[500], 0.1), border: alpha(palette.red[500], 0.2) },
  blue: { bg: alpha(palette.blue[500], 0.1), border: alpha(palette.blue[500], 0.2) },
}

const LEARN_TEXT: Record<string, string> = {
  aggressive: "과감한 진입 타이밍과 빠른 판단력을 참고하세요",
  conservative: "손절 기준의 철저함과 인내심을 배우세요",
  balanced: "유연한 전환과 분산 투자의 지혜를 참고하세요",
}

// ── 다른 성향에서 배우기 ────────────────────────────────────────────
export function LearnFromOthers({ scenario, userPersonality }: { scenario: LegendaryScenario; userPersonality: InvestorPersonality }) {
  const [open, setOpen] = useState(false)
  const myDNA = INVESTOR_DNA_MAP[userPersonality]
  const others = scenario.aiStrategies.filter((ai) => getAIPersonality(ai.type) !== userPersonality)

  return (
    <View style={{ marginTop: 20 }}>
      <Pressable onPress={() => setOpen(!open)} style={sectionStyles.head}>
        <GraduationCap size={16} color={palette.amber[400]} />
        <Text style={sectionStyles.title}>다른 친구들은 어떻게 했을까?</Text>
        <View style={sectionStyles.badge}>
          <Text style={sectionStyles.badgeText}>{others.length}가지</Text>
        </View>
        <View style={open ? { transform: [{ rotate: "180deg" }] } : undefined}>
          <ChevronDown size={16} color={palette.gray[500]} />
        </View>
      </Pressable>

      {open && (
        <View style={{ gap: 8 }}>
          {others.map((ai) => {
            const personality = getAIPersonality(ai.type)
            const c = bgColors[ai.color] ?? { bg: alpha("#ffffff", 0.05), border: alpha("#ffffff", 0.1) }
            return (
              <View key={ai.name} style={[styles.card, { backgroundColor: c.bg, borderColor: c.border }]}>
                <View style={styles.top}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                    <Text style={{ fontSize: 18, color: "#ffffff" }}>{ai.emoji}</Text>
                    <View>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#ffffff" }}>{ai.name}</Text>
                      <Text style={{ fontSize: 9, color: palette.gray[500] }}>{ai.type}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: ai.returnRate.startsWith("+") ? palette.green[400] : palette.red[400] }}>{ai.returnRate}</Text>
                </View>
                <View style={[styles.box, { padding: 8, gap: 4, marginBottom: 8 }]}>
                  {ai.actions.map((action, i) => (
                    <Text key={i} style={{ fontSize: 9, color: palette.gray[300] }}>
                      • {action}
                    </Text>
                  ))}
                </View>
                <View style={[styles.box, { paddingHorizontal: 10, paddingVertical: 6 }]}>
                  <Text style={{ fontSize: 9, color: palette.gray[500], marginBottom: 2 }}>{myDNA.label} 성향인 내가 배울 점</Text>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#ffffff" }}>{LEARN_TEXT[personality] || LEARN_TEXT.balanced}</Text>
                </View>
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 12 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  box: { backgroundColor: alpha("#ffffff", 0.05), borderRadius: 8 },
})
