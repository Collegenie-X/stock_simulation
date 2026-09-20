/** 나 vs AI 멘토 수익률 대결 막대 */
import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"
import { GrowBar } from "../game/GrowBar"

interface VsBattleRowProps {
  emoji: string
  name: string
  aiRate: number
  myRate: number
  winLabel: string
  behindLabel: string
  delay?: number
}

export function VsBattleRow({ emoji, name, aiRate, myRate, winLabel, behindLabel, delay = 0 }: VsBattleRowProps) {
  const win = myRate > aiRate
  const max = Math.max(aiRate, myRate, 1) * 1.1
  const accent = win ? palette.green[400] : palette.orange[400]

  return (
    <View style={[styles.row, { borderColor: alpha(accent, 0.25), backgroundColor: alpha(accent, 0.06) }]}>
      <View style={styles.head}>
        <View style={styles.who}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: alpha(accent, 0.18) }]}>
          <Text style={[styles.badgeText, { color: accent }]}>{win ? `WIN · ${winLabel}` : `-${(aiRate - myRate).toFixed(1)}%p ${behindLabel}`}</Text>
        </View>
      </View>

      <View style={styles.barRow}>
        <Text style={[styles.side, { color: palette.red[400] }]}>나</Text>
        <GrowBar pct={(myRate / max) * 100} colors={[palette.red[400], palette.orange[400]]} height={7} delay={delay} style={styles.bar} />
        <Text style={[styles.rate, { color: "#ffffff" }]}>+{myRate}%</Text>
      </View>
      <View style={styles.barRow}>
        <Text style={[styles.side, { color: palette.gray[500] }]}>AI</Text>
        <GrowBar pct={(aiRate / max) * 100} colors={[palette.gray[500], palette.gray[400]]} height={7} delay={delay + 120} style={styles.bar} />
        <Text style={[styles.rate, { color: palette.gray[400] }]}>+{aiRate}%</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 7 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  who: { flexDirection: "row", alignItems: "center", gap: 6 },
  emoji: { fontSize: 16, color: "#ffffff" },
  name: { fontSize: 13, fontWeight: "700", color: "#ffffff" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999 },
  badgeText: { fontSize: 10, fontWeight: "900" },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  side: { width: 18, fontSize: 10, fontWeight: "900" },
  bar: { flex: 1 },
  rate: { width: 52, textAlign: "right", fontSize: 12, fontWeight: "800", fontVariant: ["tabular-nums"] },
})
