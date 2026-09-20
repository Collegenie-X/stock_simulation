import { StyleSheet, Text, View } from "react-native"
import { BarChart3 } from "lucide-react-native"
import { getAIPersonality, type AIStrategy, type InvestorPersonality } from "@/data/legendary-scenarios"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"

export function ReturnComparisonChart({ aiStrategies, userPersonality }: { aiStrategies: AIStrategy[]; userPersonality: InvestorPersonality }) {
  const parseRate = (rate: string): number => {
    return parseFloat(rate.replace("%", "").replace("+", ""))
  }

  const maxAbs = Math.max(...aiStrategies.map((ai) => Math.abs(parseRate(ai.returnRate))), 1)

  const insight = (() => {
    const sorted = [...aiStrategies].sort((a, b) => parseRate(b.returnRate) - parseRate(a.returnRate))
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    if (!best || !worst) return ""
    return `${best.type}(${best.returnRate})이 가장 높은 수익을, ${worst.type}(${worst.returnRate})이 가장 낮은 결과를 기록했습니다. 성향에 따라 같은 상황에서도 큰 차이가 발생합니다.`
  })()

  return (
    <View>
      <View style={styles.header}>
        <BarChart3 size={16} color={palette.purple[400]} />
        <Text style={styles.title}>성향별 수익률 비교</Text>
      </View>
      <Text style={styles.sub}>같은 상황에서 성향에 따라 결과가 이렇게 달라집니다</Text>

      <View style={styles.card}>
        {aiStrategies.map((ai) => {
          const rate = parseRate(ai.returnRate)
          const isPositive = rate >= 0
          const barWidth = Math.min((Math.abs(rate) / maxAbs) * 100, 100)
          const isMyType = getAIPersonality(ai.type) === userPersonality

          return (
            <View key={ai.name}>
              <View style={styles.rowTop}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 18, color: "#ffffff" }}>{ai.emoji}</Text>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#ffffff" }}>{ai.type}</Text>
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
                  colors={isPositive ? [palette.green[500], palette.green[400]] : [palette.red[600], palette.red[400]]}
                  style={[{ width: `${barWidth}%`, height: "100%", borderRadius: 9999 }, isMyType && { borderWidth: 1, borderColor: alpha(palette.cyan[400], 0.5) }]}
                />
              </View>
            </View>
          )
        })}

        {/* 핵심 인사이트 */}
        <View style={styles.insightWrap}>
          <View style={styles.insight}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: palette.yellow[400], marginBottom: 4 }}>인사이트</Text>
            <Text style={{ fontSize: 10, color: palette.gray[300], lineHeight: 16 }}>{insight}</Text>
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
  card: { backgroundColor: "#252525", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), gap: 16 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  mine: { backgroundColor: palette.cyan[500], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  track: { height: 12, backgroundColor: palette.gray[700], borderRadius: 9999, overflow: "hidden" },
  insightWrap: { paddingTop: 12, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },
  insight: { backgroundColor: alpha(palette.yellow[500], 0.1), borderWidth: 1, borderColor: alpha(palette.yellow[500], 0.2), borderRadius: 8, padding: 12 },
})
