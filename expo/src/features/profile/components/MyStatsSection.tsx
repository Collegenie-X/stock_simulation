import type { ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"
import { formatKRW, formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { PROFILE_LABELS } from "../config"

const L = PROFILE_LABELS.myStats

interface MyStatsSectionProps {
  profitRate: number
  winRate: number
  rank: number
  bestRank: number
  totalAssets: number
}

interface StatRowProps {
  label: string
  value: ReactNode
  color?: string
  last?: boolean
}

function StatRow({ label, value, color = "#ffffff", last }: StatRowProps) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, { color }]}>{value}</Text>
    </View>
  )
}

export function MyStatsSection({ profitRate, winRate, rank, bestRank, totalAssets }: MyStatsSectionProps) {
  const profitPos = profitRate >= 0

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{L.title}</Text>
      <View style={styles.card}>
        <StatRow
          label={L.profitRate}
          color={profitPos ? palette.red[400] : palette.blue[400]}
          value={`${profitPos ? "+" : ""}${profitRate}%`}
        />
        <StatRow label={L.winRate} color={palette.green[400]} value={`${winRate}%`} />
        <StatRow label={L.rank} value={`${formatNumber(rank)} ${L.rankUnit}`} />
        <StatRow label={L.bestRank} color={palette.yellow[400]} value={`${bestRank} ${L.rankUnit}`} />
        <StatRow label={L.totalAssets} value={formatKRW(totalAssets)} last />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginTop: 20 },
  title: { fontSize: 12, fontWeight: "500", color: palette.gray[500], marginBottom: 12, paddingHorizontal: 2 },
  card: { backgroundColor: "#252525", borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: alpha("#ffffff", 0.05) },
  rowLabel: { fontSize: 14, color: palette.gray[400] },
  rowValue: { fontSize: 14, fontWeight: "700" },
})
