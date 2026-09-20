import { StyleSheet, Text, View } from "react-native"
import { Gradient } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { palette } from "@/theme"
import { fmtPnl } from "../../utils/format"
import { RankFlare } from "../history/RankFlare"

interface SimulationHeroCardProps {
  isProfit: boolean
  weekLabel: string
  scenarioName: string
  profitRate: number
  profitAmount: number
  finalAssets: number
  rank: number
  totalUsers: number
  tradeCount: number
  winDays: number
  loseDays: number
  waveAccuracy: number
}

export function SimulationHeroCard(p: SimulationHeroCardProps) {
  const stats: { label: string; value: string; color?: string }[] = [
    { label: "거래", value: `${p.tradeCount}회` },
    { label: "승일", value: `${p.winDays}일`, color: palette.green[400] },
    { label: "패일", value: `${p.loseDays}일`, color: palette.red[400] },
    { label: "파도", value: `${p.waveAccuracy}%`, color: palette.cyan[400] },
  ]

  return (
    <Gradient dir="br" colors={p.isProfit ? ["#0a1f12", "#112918"] : ["#1f0a0a", "#291112"]} style={styles.card}>
      <Text style={styles.bgEmoji}>{p.isProfit ? "🏆" : "💪"}</Text>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.meta}>
            {p.weekLabel} · {p.scenarioName}
          </Text>
          <Text style={[styles.profit, { color: p.isProfit ? palette.red[400] : palette.blue[400] }]}>
            {p.isProfit ? "+" : ""}
            {p.profitRate}%
          </Text>
          <Text style={styles.sub}>
            {fmtPnl(p.profitAmount)} · 최종 {formatNumber(p.finalAssets)}원
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.emoji}>{p.isProfit ? "🏆" : "💪"}</Text>
          <RankFlare rank={p.rank} total={p.totalUsers} size="md" />
        </View>
      </View>

      {/* 스탯 그리드 */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={[styles.statValue, { color: stat.color ?? "#ffffff" }]}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  card: { marginTop: 20, borderRadius: 24, padding: 24, overflow: "hidden" },
  bgEmoji: { position: "absolute", top: -16, right: -16, fontSize: 128, opacity: 0.05, color: "#ffffff" },
  top: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 8 },
  meta: { fontSize: 12, color: palette.gray[400], marginBottom: 4 },
  profit: { fontSize: 48, lineHeight: 54, fontWeight: "900" },
  sub: { fontSize: 14, color: palette.gray[400], marginTop: 4 },
  emoji: { fontSize: 48, lineHeight: 58, marginBottom: 8, color: "#ffffff" },
  stat: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 8, alignItems: "center" },
  statLabel: { fontSize: 10, color: palette.gray[500], marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: "900" },
})
