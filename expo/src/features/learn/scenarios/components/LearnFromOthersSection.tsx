import { StyleSheet, Text, View } from "react-native"
import { GraduationCap } from "lucide-react-native"
import { INVESTOR_DNA_MAP, getOtherAIs, getAIPersonality, type AIStrategy, type InvestorPersonality } from "@/data/legendary-scenarios"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"

const bgColors: Record<string, string[]> = {
  green: [palette.green[600], palette.green[700]],
  red: [palette.red[500], palette.red[600]],
  blue: [palette.blue[500], palette.blue[600]],
}

export function LearnFromOthersSection({ aiStrategies, userPersonality }: { aiStrategies: AIStrategy[]; userPersonality: InvestorPersonality }) {
  const otherAIs = getOtherAIs(aiStrategies, userPersonality)
  const myDNA = INVESTOR_DNA_MAP[userPersonality]

  return (
    <View>
      <View style={styles.header}>
        <GraduationCap size={16} color={palette.amber[400]} />
        <Text style={styles.title}>다른 성향에서 배우기</Text>
      </View>
      <Text style={styles.sub}>
        나의 <Text style={{ color: palette.cyan[400], fontWeight: "700" }}>{myDNA.label}</Text> 성향에는 없는, 다른 성향의 장점을 배워보세요
      </Text>

      <View style={{ gap: 12 }}>
        {otherAIs.map((ai) => (
          <Gradient key={ai.name} dir="br" colors={bgColors[ai.color] ?? [palette.gray[600], palette.gray[700]]} style={styles.card}>
            <View style={styles.glow} />
            <View style={styles.cardTop}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                <Text style={{ fontSize: 20, color: "#ffffff" }}>{ai.emoji}</Text>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#ffffff" }}>{ai.name}</Text>
                  <Text style={{ fontSize: 10, color: alpha("#ffffff", 0.7) }}>{ai.type} 전략</Text>
                </View>
              </View>
              <View style={[styles.rate, { backgroundColor: ai.returnRate.startsWith("+") ? alpha("#ffffff", 0.2) : alpha(palette.red[900], 0.4) }]}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#ffffff" }}>{ai.returnRate}</Text>
              </View>
            </View>

            <View style={[styles.box, { gap: 6, marginBottom: 8 }]}>
              {ai.actions.map((action, idx) => (
                <Text key={idx} style={{ fontSize: 10, color: alpha("#ffffff", 0.8) }}>
                  • {action}
                </Text>
              ))}
            </View>

            <View style={styles.box}>
              <Text style={{ fontSize: 10, color: alpha("#ffffff", 0.7), marginBottom: 2 }}>{myDNA.label} 성향인 내가 배울 점</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#ffffff" }}>
                {getAIPersonality(ai.type) === "aggressive"
                  ? "과감한 진입 타이밍과 빠른 판단력을 참고하되, 리스크 관리는 나의 방식을 유지하세요"
                  : getAIPersonality(ai.type) === "conservative"
                    ? "손절 기준의 철저함과 인내심을 배우되, 기회를 놓치지 않는 유연성을 더하세요"
                    : "상황에 따른 유연한 전환 능력과 분산 투자의 지혜를 참고하세요"}
              </Text>
            </View>
          </Gradient>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  title: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  sub: { fontSize: 12, color: palette.gray[400], marginBottom: 12 },
  card: { borderRadius: 12, padding: 16, overflow: "hidden" },
  glow: { position: "absolute", top: -16, right: -16, width: 64, height: 64, borderRadius: 32, backgroundColor: alpha("#ffffff", 0.08) },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  rate: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  box: { backgroundColor: alpha("#ffffff", 0.1), borderRadius: 8, padding: 10 },
})
