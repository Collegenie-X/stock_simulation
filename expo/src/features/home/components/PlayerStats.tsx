import { StyleSheet, Text, View } from "react-native"
import { Flame, Heart, Star, Swords } from "lucide-react-native"
import { alpha, palette } from "@/theme"

interface PlayerStatsProps {
  level: number
  hearts: number
  maxHearts: number
  streak: number
  winRate: number
}

export default function PlayerStats({ level, hearts, maxHearts, streak, winRate }: PlayerStatsProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.chip, { gap: 6 }]}>
        <Star size={16} color={palette.yellow[400]} fill={palette.yellow[400]} />
        <Text style={[styles.value, { color: "#ffffff" }]}>Lv.{level}</Text>
      </View>

      <View style={styles.chip}>
        {Array.from({ length: maxHearts }).map((_, i) => {
          const c = i < hearts ? palette.red[400] : palette.gray[700]
          return <Heart key={i} size={14} color={c} fill={c} />
        })}
      </View>

      {streak > 0 && (
        <View style={styles.chip}>
          <Flame size={16} color={palette.orange[400]} />
          <Text style={[styles.value, { color: palette.orange[400] }]}>{streak}</Text>
        </View>
      )}

      {winRate > 0 && (
        <View style={[styles.chip, { marginLeft: "auto" }]}>
          <Swords size={14} color={palette.emerald[400]} />
          <Text style={[styles.value, { color: palette.emerald[400] }]}>{winRate}%</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { marginHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1e1e2e",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.05),
  },
  value: { fontSize: 12, fontWeight: "700" },
})
