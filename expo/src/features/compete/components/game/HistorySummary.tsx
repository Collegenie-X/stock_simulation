/** 역대 기록 핵심 요약 — 모드별 플레이 횟수 메달 + 최고 기록 */
import { StyleSheet, Text, View } from "react-native"
import { Pop } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { CountUp } from "./CountUp"

interface HistorySummaryProps {
  simulationCount: number
  stockCount: number
  waveCount: number
  bestRank: number
  bestProfit: number
}

export function HistorySummary({ simulationCount, stockCount, waveCount, bestRank, bestProfit }: HistorySummaryProps) {
  const medals = [
    { emoji: "🏆", label: "실전", count: simulationCount, color: palette.yellow[400] },
    { emoji: "📈", label: "종목 연습", count: stockCount, color: palette.green[400] },
    { emoji: "🌊", label: "파도 연습", count: waveCount, color: palette.cyan[400] },
  ]
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.row}>
        {medals.map((m, i) => (
          <Pop key={m.label} delay={150 + i * 120} style={[styles.medal, { borderColor: alpha(m.color, 0.3), backgroundColor: alpha(m.color, 0.08) }]}>
            <Text style={styles.medalEmoji}>{m.emoji}</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <CountUp value={m.count} duration={700} delay={200 + i * 120} style={[styles.medalCount, { color: m.color }]} />
              <Text style={styles.medalUnit}>회</Text>
            </View>
            <Text style={styles.medalLabel}>{m.label}</Text>
          </Pop>
        ))}
      </View>
      <View style={styles.best}>
        <Text style={styles.bestText}>
          👑 최고 기록 <Text style={{ color: palette.yellow[400], fontWeight: "900" }}>{bestRank}위</Text>
          {"  ·  "}
          <Text style={{ color: palette.red[400], fontWeight: "900" }}>+{bestProfit}%</Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  medal: { flex: 1, alignItems: "center", gap: 2, borderRadius: 16, borderWidth: 1, paddingVertical: 12 },
  medalEmoji: { fontSize: 24, color: "#ffffff" },
  medalCount: { fontSize: 20, fontWeight: "900", fontVariant: ["tabular-nums"] },
  medalUnit: { fontSize: 11, fontWeight: "700", color: palette.gray[500], marginLeft: 1 },
  medalLabel: { fontSize: 10, fontWeight: "700", color: palette.gray[400] },
  best: { alignItems: "center", backgroundColor: alpha("#ffffff", 0.04), borderRadius: 12, paddingVertical: 8 },
  bestText: { fontSize: 12, fontWeight: "700", color: palette.gray[300] },
})
