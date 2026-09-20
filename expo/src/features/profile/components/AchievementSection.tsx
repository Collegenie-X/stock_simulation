import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"
import { ACHIEVEMENTS } from "../config"

export function AchievementSection() {
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked)

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <Text style={styles.headText}>
          업적 <Text style={styles.headCount}>{unlocked.length}</Text> / {ACHIEVEMENTS.length}
        </Text>
      </View>
      <View style={styles.grid}>
        {ACHIEVEMENTS.map((a) => (
          <View key={a.id} style={[styles.cell, a.unlocked ? styles.cellUnlocked : styles.cellLocked]}>
            <Text style={styles.cellIcon}>{a.icon}</Text>
          </View>
        ))}
      </View>
      {/* 설명 */}
      <View style={styles.names}>
        {ACHIEVEMENTS.map((a) =>
          a.unlocked ? (
            <View key={a.id} style={styles.nameChip}>
              <Text style={styles.nameText}>{a.name}</Text>
            </View>
          ) : null,
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginTop: 20 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingHorizontal: 2 },
  headText: { fontSize: 12, fontWeight: "500", color: palette.gray[500] },
  headCount: { fontWeight: "700", color: "#ffffff" },
  grid: { flexDirection: "row", gap: 8 },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 2 },
  cellUnlocked: { backgroundColor: "#252525", borderWidth: 1, borderColor: alpha("#ffffff", 0.1) },
  cellLocked: { backgroundColor: "#1e1e1e", opacity: 0.3 },
  cellIcon: { fontSize: 20, color: "#ffffff" },
  names: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  nameChip: { backgroundColor: alpha("#ffffff", 0.05), borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  nameText: { fontSize: 12, color: palette.gray[400] },
})
