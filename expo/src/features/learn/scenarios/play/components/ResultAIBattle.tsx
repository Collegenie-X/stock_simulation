import { StyleSheet, Text, View } from "react-native"
import { Bot, Trophy, User } from "lucide-react-native"
import type { AIStrategy } from "@/data/legendary-scenarios"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"

interface Props {
  aiResults: (AIStrategy & { returnNum: number })[]
  rate: number
  beaten: number
  bestAIReturn: number
}

/** AI 투자자 비교 - 게임 형식 */
export function ResultAIBattle({ aiResults, rate, beaten, bestAIReturn }: Props) {
  const badge =
    beaten >= aiResults.length
      ? { bg: alpha(palette.green[500], 0.2), text: palette.green[400] }
      : beaten > 0
        ? { bg: alpha(palette.yellow[500], 0.2), text: palette.yellow[400] }
        : { bg: alpha(palette.red[500], 0.2), text: palette.red[400] }

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <View style={styles.head}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Gradient dir="br" colors={[palette.purple[500], palette.pink[600]]} style={styles.icon}>
            <Bot size={16} color="#ffffff" />
          </Gradient>
          <Text style={styles.title}>AI 대결 결과</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Trophy size={14} color={badge.text} />
          <Text style={{ fontSize: 12, fontWeight: "700", color: badge.text }}>
            {beaten}/{aiResults.length} 격파
          </Text>
        </View>
      </View>

      {/* 나의 수익률 카드 */}
      <Gradient dir="r" colors={[alpha(palette.blue[600], 0.2), alpha(palette.cyan[600], 0.2)]} style={styles.myCard}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={styles.avatar}>
            <User size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={{ fontSize: 10, color: palette.cyan[300], fontWeight: "600" }}>나의 최종 수익률</Text>
            <Text style={{ fontSize: 24, fontWeight: "900", color: rate >= 0 ? palette.red[400] : palette.blue[400] }}>
              {rate >= 0 ? "+" : ""}
              {rate.toFixed(2)}%
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 9, color: palette.gray[400] }}>최고 AI 대비</Text>
          <Text style={{ fontSize: 18, fontWeight: "900", color: rate >= bestAIReturn ? palette.green[400] : palette.orange[400] }}>
            {rate >= bestAIReturn ? "+" : ""}
            {(rate - bestAIReturn).toFixed(1)}%p
          </Text>
        </View>
      </Gradient>

      {/* AI 리스트 */}
      <View style={{ gap: 8 }}>
        {aiResults.map((ai, i) => {
          const win = rate > ai.returnNum
          const gap = rate - ai.returnNum
          return (
            <View
              key={i}
              style={[
                styles.aiRow,
                win ? { backgroundColor: alpha(palette.green[500], 0.08), borderColor: alpha(palette.green[500], 0.2) } : { backgroundColor: "#1a1a1a", borderColor: alpha(palette.gray[800], 0.3) },
              ]}
            >
              <View>
                <Text style={{ fontSize: 24, color: "#ffffff" }}>{ai.emoji}</Text>
                {win && (
                  <View style={styles.check}>
                    <Text style={{ fontSize: 8, color: "#ffffff" }}>✓</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#ffffff" }}>{ai.name}</Text>
                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: win ? alpha(palette.green[500], 0.2) : palette.gray[700] }}>
                    <Text style={{ fontSize: 9, fontWeight: "700", color: win ? palette.green[400] : palette.gray[500] }}>{win ? "🎉 승리" : "패배"}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 10, color: palette.gray[500] }}>{ai.type}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: ai.returnNum >= 0 ? palette.red[400] : palette.blue[400] }}>{ai.returnRate}</Text>
                <Text style={{ fontSize: 10, fontWeight: "700", color: gap >= 0 ? palette.green[400] : palette.orange[400] }}>
                  갭 {gap >= 0 ? "+" : ""}
                  {gap.toFixed(1)}%p
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  icon: { width: 32, height: 32, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  title: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 },
  myCard: { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha(palette.cyan[500], 0.3), marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", overflow: "hidden" },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: alpha("#ffffff", 0.1), alignItems: "center", justifyContent: "center" },
  aiRow: { borderRadius: 12, padding: 12, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  check: { position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: palette.green[500], alignItems: "center", justifyContent: "center" },
})
