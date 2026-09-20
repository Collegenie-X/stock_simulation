import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"
import { PROFILE_LABELS } from "../config"

const L = PROFILE_LABELS.simulationDetail

export function DailyReturnBar({ returns }: { returns: number[] }) {
  const maxAbs = Math.max(...returns.map(Math.abs), 1)
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{L.dailyReturnsTitle}</Text>
      <View style={styles.bars}>
        {returns.map((r, i) => {
          const heightPct = Math.max(5, (Math.abs(r) / maxAbs) * 100)
          const color = r >= 0 ? palette.red[400] : palette.blue[400]
          return (
            <View key={i} style={styles.barCol}>
              <Text numberOfLines={1} style={[styles.barLabel, { color }]}>
                {r >= 0 ? "+" : ""}
                {r}
              </Text>
              <View style={[styles.bar, { backgroundColor: color, height: heightPct * 0.6 }]} />
            </View>
          )
        })}
      </View>
      <View style={styles.axis}>
        <Text style={styles.axisText}>1일</Text>
        <Text style={styles.axisText}>{returns.length}일</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#252525", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  title: { fontSize: 14, fontWeight: "600", color: palette.gray[400], marginBottom: 12 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 80 },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  barLabel: { fontSize: 12, fontWeight: "700" },
  bar: { width: "100%", borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  axis: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  axisText: { fontSize: 12, color: palette.gray[600] },
})
