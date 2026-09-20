import { StyleSheet, Text, View } from "react-native"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"

interface SummaryCardProps {
  profitRate: number
  rank: number
  level: number
}

export function SummaryCard({ profitRate, rank, level }: SummaryCardProps) {
  return (
    <Gradient dir="br" colors={[palette.blue[500], palette.cyan[500], palette.purple[600]]} style={styles.card}>
      <Text style={styles.bgEmoji}>🌊</Text>

      <View style={styles.top}>
        <View>
          <Text style={[styles.label, { marginBottom: 4 }]}>총 수익</Text>
          <Text style={styles.profit}>+{profitRate}%</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.medal}>{rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🏆"}</Text>
          <Text style={styles.label}>랭킹 {rank}위</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>이긴 횟수</Text>
          <Text style={styles.cellValue}>10번</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>진 횟수</Text>
          <Text style={styles.cellValue}>2번</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>레벨</Text>
          <Text style={styles.cellValue}>{level}</Text>
        </View>
      </View>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  card: { marginTop: 24, borderRadius: 24, padding: 24, overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" },
  bgEmoji: { position: "absolute", top: 0, right: 0, fontSize: 128, opacity: 0.1, color: "#ffffff" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  label: { color: palette.blue[100], fontSize: 14 },
  profit: { fontSize: 48, fontWeight: "700", color: "#ffffff" },
  medal: { fontSize: 60, marginBottom: 8, color: "#ffffff" },
  grid: { flexDirection: "row", gap: 12, marginTop: 16 },
  cell: { flex: 1, backgroundColor: alpha("#ffffff", 0.2), borderRadius: 12, padding: 12, alignItems: "center" },
  cellLabel: { fontSize: 12, color: palette.blue[100], marginBottom: 4 },
  cellValue: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
})
