import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown, ChevronUp, Trophy } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { LABELS } from "@/features/practice-stock/config"
import { RARITY_STYLE, type FinalAchievement } from "./achievements"

// ── 업적 카드 ─────────────────────────────────────────────
export function AchievementsCard({ achievements }: { achievements: FinalAchievement[] }) {
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const shown = showAllAchievements ? achievements : achievements.slice(0, 3)

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Trophy size={16} color={palette.yellow[400]} />
          <Text style={styles.title}>{LABELS.finalReport.achievementsTitle}</Text>
        </View>
        <Text style={styles.count}>{achievements.length}개 획득</Text>
      </View>
      <View style={{ gap: 8 }}>
        {shown.map((a, i) => {
          const rs = RARITY_STYLE[a.rarity]
          return (
            <View key={i} style={[styles.row, { backgroundColor: rs.bg, borderColor: rs.border }]}>
              <a.Icon size={16} color={rs.text} />
              <Text style={[styles.rowText, { color: rs.text }]}>{a.text}</Text>
              <Text style={styles.rarity}>{a.rarity.toUpperCase()}</Text>
            </View>
          )
        })}
      </View>
      {achievements.length > 3 && (
        <Pressable onPress={() => setShowAllAchievements((v) => !v)} style={styles.more} hitSlop={6}>
          <Text style={styles.moreText}>{showAllAchievements ? "접기" : `+${achievements.length - 3}개 더보기`}</Text>
          {showAllAchievements ? <ChevronUp size={12} color={palette.gray[500]} /> : <ChevronDown size={12} color={palette.gray[500]} />}
        </Pressable>
      )}
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  count: { fontSize: 10, fontWeight: "700", color: palette.gray[500] },
  row: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  rowText: { fontSize: 11, fontWeight: "700" },
  rarity: { marginLeft: "auto", fontSize: 8, fontWeight: "700", color: palette.gray[600] },
  more: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  moreText: { fontSize: 10, fontWeight: "700", color: palette.gray[500] },
})
