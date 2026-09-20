import { StyleSheet, Text, View } from "react-native"
import { palette } from "@/theme"

interface RewardRowProps {
  emoji: string
  label: string
  value: string
  bg: string
  iconBg: string
  valueColor: string
}

export function RewardRow({ emoji, label, value, bg, iconBg, valueColor }: RewardRowProps) {
  return (
    <View style={[styles.row, { backgroundColor: bg }]}>
      <View style={styles.left}>
        <View style={[styles.icon, { backgroundColor: iconBg }]}>
          <Text style={{ fontSize: 20, color: "#ffffff" }}>{emoji}</Text>
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 12 },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 16, fontWeight: "600", color: palette.gray[900] },
  value: { fontSize: 18, fontWeight: "700" },
})
