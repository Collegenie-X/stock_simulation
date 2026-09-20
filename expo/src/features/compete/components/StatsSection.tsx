import { StyleSheet, Text, View } from "react-native"
import { Trophy, Users } from "lucide-react-native"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { COMPETE_LABELS } from "../config"
import { twColor } from "../utils/tw"

interface LevelDistribution {
  level: string
  count: number
  /** Tailwind 배경 클래스 ("bg-green-500") */
  color: string
}

interface RealtimeStats {
  totalParticipants: number
  todayNew: number
  weeklyAvgReturn: number
  topReturnThisWeek: number
}

interface StatsSectionProps {
  stats: RealtimeStats
  levelDistribution: LevelDistribution[]
}

const L = COMPETE_LABELS.stats

export function StatsSection({ stats, levelDistribution }: StatsSectionProps) {
  const totalCount = levelDistribution.reduce((sum, l) => sum + l.count, 0)

  return (
    <View style={{ marginTop: 24, marginBottom: 24 }}>
      <Text style={styles.title}>{L.title}</Text>

      <View style={styles.grid}>
        <View style={[styles.card, { flex: 1 }]}>
          <View style={styles.cardHead}>
            <Users size={16} color={palette.gray[400]} />
            <Text style={styles.gray12}>{L.participants}</Text>
          </View>
          <Text style={[styles.big, { color: "#ffffff" }]}>{formatNumber(stats.totalParticipants)}명</Text>
          <Text style={{ fontSize: 12, color: palette.green[400], marginTop: 4 }}>
            +{stats.todayNew}명 ({L.todayNew})
          </Text>
        </View>

        <View style={[styles.card, { flex: 1 }]}>
          <View style={styles.cardHead}>
            <Trophy size={16} color={palette.yellow[500]} />
            <Text style={styles.gray12}>{L.avgReturn}</Text>
          </View>
          <Text style={[styles.big, { color: palette.red[400] }]}>+{stats.weeklyAvgReturn}%</Text>
          <Text style={[styles.gray12, { marginTop: 4 }]}>{L.weeklyAvg}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{L.levelDistribution}</Text>
        <View style={{ gap: 10 }}>
          {levelDistribution.map((item) => (
            <View key={item.level} style={styles.levelRow}>
              <Text style={[styles.gray12, { width: 48, flexShrink: 0 }]}>{item.level}</Text>
              <View style={styles.track}>
                <View
                  style={{
                    height: "100%",
                    borderRadius: 9999,
                    backgroundColor: twColor(item.color, palette.gray[500]),
                    width: `${totalCount > 0 ? (item.count / totalCount) * 100 : 0}%`,
                  }}
                />
              </View>
              <Text style={styles.count}>
                {formatNumber(item.count)}
                {L.levelUnit}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "700", color: "#ffffff", marginBottom: 12 },
  grid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  card: { backgroundColor: "#252525", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  gray12: { fontSize: 12, color: palette.gray[400] },
  big: { fontSize: 24, fontWeight: "700" },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff", marginBottom: 12 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  track: { flex: 1, height: 8, backgroundColor: "#1a1a1a", borderRadius: 9999, overflow: "hidden" },
  count: { fontSize: 12, color: "#ffffff", fontWeight: "700", width: 56, textAlign: "right", flexShrink: 0 },
})
