import { StyleSheet, Text, View } from "react-native"
import { Swords } from "lucide-react-native"
import { INVESTOR_DNA_MAP, getMatchedAI, type AIStrategy, type InvestorPersonality } from "@/data/legendary-scenarios"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { twColor, twGradient } from "../utils/tw"

export function MyAIMatchupSection({ aiStrategies, userPersonality }: { aiStrategies: AIStrategy[]; userPersonality: InvestorPersonality }) {
  const myDNA = INVESTOR_DNA_MAP[userPersonality]
  const matchedAI = getMatchedAI(aiStrategies, userPersonality)

  if (!matchedAI) return null

  const dnaColor = twColor(myDNA.color, "text")
  const dnaBorder = twColor(myDNA.borderColor, "border")
  const positive = matchedAI.returnRate.startsWith("+")
  const negative = matchedAI.returnRate.startsWith("-")

  return (
    <View>
      <View style={styles.header}>
        <Swords size={16} color={palette.cyan[400]} />
        <Text style={styles.title}>나의 성향 AI 대결</Text>
      </View>
      <Text style={styles.sub}>
        당신과 같은 <Text style={{ color: palette.cyan[400], fontWeight: "700" }}>{myDNA.label}</Text> 성향의 AI는 이 상황에서 어떻게 대처했을까요?
      </Text>

      {/* 대결 매치업 카드 */}
      <View style={styles.card}>
        <View style={styles.glow} />
        {/* VS 매치업 */}
        <View style={styles.vsRow}>
          <View style={styles.side}>
            <View style={styles.meAvatar}>
              <Text style={{ fontSize: 24, color: "#ffffff" }}>👤</Text>
            </View>
            <Text style={styles.name}>나</Text>
            <Text style={{ fontSize: 10, color: palette.cyan[400] }}>{myDNA.label} 투자자</Text>
          </View>

          <View style={{ alignItems: "center", gap: 4 }}>
            <Swords size={24} color={palette.yellow[400]} />
            <Text style={{ fontSize: 10, fontWeight: "700", color: palette.yellow[400] }}>VS</Text>
          </View>

          <View style={styles.side}>
            <Gradient dir="br" colors={twGradient(myDNA.bgGradient)} style={[styles.aiAvatar, { borderColor: dnaBorder }]}>
              <Text style={{ fontSize: 24, color: "#ffffff" }}>{matchedAI.emoji}</Text>
            </Gradient>
            <Text style={styles.name}>{matchedAI.name}</Text>
            <Text style={{ fontSize: 10, fontWeight: "700", color: dnaColor }}>AI {myDNA.label}</Text>
          </View>
        </View>

        {/* 매칭 AI 전략 */}
        <View style={[styles.strategy, { borderColor: dnaBorder }]}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: palette.gray[400], marginBottom: 8 }}>{myDNA.label} AI의 대처 전략</Text>
          {matchedAI.actions.map((action, idx) => (
            <View key={idx} style={[styles.action, idx === matchedAI.actions.length - 1 && { marginBottom: 0 }]}>
              <View style={styles.actionNum}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: dnaColor }}>{idx + 1}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 12, color: palette.gray[300] }}>{action}</Text>
            </View>
          ))}
        </View>

        {/* 결과 */}
        <View style={styles.result}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, color: palette.gray[400] }}>AI {myDNA.label}의 최종 결과</Text>
            <Text style={{ fontSize: 12, color: palette.gray[300], marginTop: 2 }}>{matchedAI.result}</Text>
          </View>
          <View
            style={[
              styles.resultRate,
              { backgroundColor: positive ? alpha(palette.green[500], 0.1) : negative ? alpha(palette.red[500], 0.1) : "transparent" },
            ]}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: positive ? palette.green[400] : negative ? palette.red[400] : palette.gray[400] }}>
              {matchedAI.returnRate}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  title: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  sub: { fontSize: 12, color: palette.gray[400], marginBottom: 12 },
  card: { backgroundColor: "#1a1a2e", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha(palette.cyan[500], 0.2), overflow: "hidden" },
  glow: { position: "absolute", top: 0, alignSelf: "center", width: 160, height: 160, borderRadius: 80, backgroundColor: alpha(palette.cyan[500], 0.04) },
  vsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16 },
  side: { flex: 1, alignItems: "center" },
  meAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: alpha(palette.cyan[500], 0.2), borderWidth: 2, borderColor: alpha(palette.cyan[400], 0.4), alignItems: "center", justifyContent: "center", marginBottom: 8 },
  aiAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: "center", justifyContent: "center", marginBottom: 8, overflow: "hidden" },
  name: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  strategy: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 12, backgroundColor: alpha("#ffffff", 0.05) },
  action: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  actionNum: { width: 16, height: 16, borderRadius: 8, backgroundColor: alpha("#ffffff", 0.1), alignItems: "center", justifyContent: "center", marginTop: 2 },
  result: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: alpha("#ffffff", 0.05), borderRadius: 12, padding: 12, gap: 8 },
  resultRate: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
})
