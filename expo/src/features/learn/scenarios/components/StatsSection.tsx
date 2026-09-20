import { StyleSheet, Text, View } from "react-native"
import { BarChart3, Trophy } from "lucide-react-native"
import type { LegendaryScenario } from "@/data/legendary-scenarios"
import { alpha, palette } from "@/theme"

export function StatsSection({ scenario }: { scenario: LegendaryScenario }) {
  return (
    <View>
      <View style={styles.header}>
        <BarChart3 size={16} color={palette.purple[400]} />
        <Text style={styles.title}>시나리오 통계</Text>
      </View>
      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.value}>{scenario.stats.avgClearRate}%</Text>
          <Text style={styles.label}>평균 클리어율</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.value}>{scenario.stats.avgSurvivalRate}%</Text>
          <Text style={styles.label}>생존율</Text>
        </View>
        <View style={styles.card}>
          <View style={{ marginBottom: 4, height: 28, justifyContent: "center" }}>
            <Trophy size={20} color={palette.yellow[400]} />
          </View>
          <Text style={[styles.label, { lineHeight: 13 }]}>{scenario.stats.bestStrategy}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  title: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  grid: { flexDirection: "row", gap: 12 },
  card: { flex: 1, backgroundColor: "#252525", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), alignItems: "center" },
  value: { fontSize: 24, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  label: { fontSize: 10, color: palette.gray[400], textAlign: "center" },
})
