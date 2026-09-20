import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"
import { PROFILE_LABELS } from "../config"

const L = PROFILE_LABELS.activityCount

interface ActivityCounts {
  simulations: number
  stockPractice: number
  wavePractice: number
  learnChapters: number
  totalTrades: number
  achievements: number
}

interface ActivityCountSectionProps {
  counts: ActivityCounts
}

const COLUMNS = 3

export function ActivityCountSection({ counts }: ActivityCountSectionProps) {
  const values: Record<string, number> = {
    simulations: counts.simulations,
    stockPractice: counts.stockPractice,
    wavePractice: counts.wavePractice,
    learnChapters: counts.learnChapters,
    totalTrades: counts.totalTrades,
    achievements: counts.achievements,
  }

  // grid-cols-3 → 3개씩 행으로 분할
  const items = [...L.items]
  const rows: (typeof items)[] = []
  for (let i = 0; i < items.length; i += COLUMNS) rows.push(items.slice(i, i + COLUMNS))

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{L.title}</Text>
      <View style={{ gap: 8 }}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.gridRow}>
            {row.map((item) => (
              <View key={item.key} style={styles.card}>
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={styles.value}>
                  {values[item.key] ?? 0}
                  <Text style={styles.unit}> {item.unit}</Text>
                </Text>
                <Text style={styles.label}>{item.label}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginTop: 20 },
  title: { fontSize: 12, fontWeight: "500", color: palette.gray[500], marginBottom: 12, paddingHorizontal: 2 },
  gridRow: { flexDirection: "row", gap: 8 },
  card: {
    flex: 1,
    backgroundColor: "#252525",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.05),
  },
  icon: { fontSize: 24, color: "#ffffff" },
  value: { fontSize: 20, fontWeight: "700", color: "#ffffff", marginTop: 4 },
  unit: { fontSize: 12, fontWeight: "400", color: palette.gray[500] },
  label: { fontSize: 12, color: palette.gray[500], marginTop: 2 },
})
