import { StyleSheet, Text, View } from "react-native"
import { Medal } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { LABELS } from "@/features/practice-stock/config"
import { rateColor } from "./colors"

// ── 최종 순위 ─────────────────────────────────────────────
export function FinalRanking({ userRate, userValue, simRate, simValue, simName, simEmoji, bestRate, bestValue, bestName, bestEmoji }: {
  userRate: number; userValue: number
  simRate: number; simValue: number; simName: string; simEmoji: string
  bestRate: number; bestValue: number; bestName: string; bestEmoji: string
  initialValue: number
}) {
  const players = [
    { name: "나", emoji: "🧑", rate: userRate, value: userValue, isUser: true },
    { name: simName, emoji: simEmoji, rate: simRate, value: simValue, isUser: false },
    { name: bestName, emoji: bestEmoji, rate: bestRate, value: bestValue, isUser: false },
  ].sort((a, b) => b.rate - a.rate)
  const medals = ["🥇", "🥈", "🥉"]

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Medal size={16} color={palette.yellow[400]} />
        <Text style={styles.title}>{LABELS.finalReport.rankingTitle}</Text>
      </View>
      <View style={{ gap: 8 }}>
        {players.map((p, i) => (
          <View
            key={i}
            style={[
              styles.row,
              p.isUser
                ? { backgroundColor: alpha(palette.blue[500], 0.1), borderColor: alpha(palette.blue[500], 0.2) }
                : { backgroundColor: alpha(palette.gray[800], 0.4), borderColor: alpha(palette.gray[700], 0.2) },
            ]}
          >
            <Text style={styles.medal}>{medals[i]}</Text>
            <Text style={styles.emoji}>{p.emoji}</Text>
            <Text style={[styles.name, { color: p.isUser ? palette.blue[400] : palette.gray[300] }]} numberOfLines={1}>{p.name}</Text>
            <Text style={[styles.rate, { color: rateColor(p.rate) }]}>
              {p.rate >= 0 ? "+" : ""}{p.rate.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: alpha(palette.gray[800], 0.5),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
    padding: 16,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  title: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  medal: { fontSize: 16, color: "#ffffff" },
  emoji: { fontSize: 14, color: "#ffffff" },
  name: { flex: 1, fontSize: 12, fontWeight: "700" },
  rate: { fontSize: 14, fontWeight: "800" },
})
