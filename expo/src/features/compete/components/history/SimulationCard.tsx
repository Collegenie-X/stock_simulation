import { StyleSheet, Text, View } from "react-native"
import { useRouter, type Href } from "expo-router"
import { Waves } from "lucide-react-native"
import { PressableScale } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { RankFlare } from "./RankFlare"
import type { SimulationRecord } from "./types"

const STYLE_LABEL: Record<string, { label: string; color: string }> = {
  aggressive: { label: "공격형", color: palette.red[400] },
  conservative: { label: "안정형", color: palette.green[400] },
  moderate: { label: "균형형", color: palette.blue[400] },
}

export function SimulationCard({ item }: { item: SimulationRecord }) {
  const router = useRouter()
  const isProfit = item.result === "profit"
  const styleInfo = STYLE_LABEL[item.style] ?? STYLE_LABEL.aggressive
  const highlightColor = alpha(isProfit ? palette.green[300] : palette.orange[300], 0.7)

  return (
    <PressableScale
      scaleTo={0.98}
      onPress={() => router.push(`/compete/result/simulation/${item.id}` as Href)}
      style={[
        styles.card,
        isProfit
          ? { backgroundColor: "#0e1e16", borderColor: alpha(palette.green[500], 0.2) }
          : { backgroundColor: "#1e0e0e", borderColor: alpha(palette.red[500], 0.2) },
      ]}
    >
      <View style={styles.top}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.metaRow}>
            <Text style={styles.gray12}>{item.weekLabel}</Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: styleInfo.color }}>{styleInfo.label}</Text>
          </View>
          <Text numberOfLines={1} style={styles.name}>
            {item.scenarioName}
          </Text>
          <Text style={[styles.gray12, { marginTop: 2 }]}>
            {item.stocks.join(" · ")} · {item.tradeCount}회
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", flexShrink: 0 }}>
          {isProfit ? (
            <Text style={[styles.profit, { color: palette.red[400] }]}>+{item.profitRate}%</Text>
          ) : (
            <Text style={[styles.profit, { color: palette.blue[400] }]}>{item.profitRate}%</Text>
          )}
          <Text style={{ fontSize: 12, color: palette.gray[500], marginTop: 2 }}>{formatNumber(item.finalAssets)}원</Text>
        </View>
      </View>

      {/* 랭킹 + 파도 정확도 */}
      <View style={styles.rankRow}>
        <RankFlare rank={item.rank} total={item.totalUsers} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={styles.inline}>
            <Waves size={12} color={palette.cyan[400]} />
            <Text style={{ fontSize: 12, color: palette.cyan[400], fontWeight: "700" }}>{item.waveAccuracy}%</Text>
          </View>
          <View style={styles.inline}>
            <Text style={{ fontSize: 12, color: palette.green[400] }}>{item.winDays}승</Text>
            <Text style={{ fontSize: 12, color: palette.gray[600] }}>/</Text>
            <Text style={{ fontSize: 12, color: palette.red[400] }}>{item.loseDays}패</Text>
          </View>
        </View>
      </View>

      {/* 도전자 점수 */}
      {item.rankScore !== undefined ? (
        <View style={styles.scoreRow}>
          <Text style={[styles.highlight, { color: highlightColor, flex: 1 }]}>{item.highlight}</Text>
          <View style={styles.scoreBadge}>
            <Text style={{ fontSize: 10, color: alpha(palette.yellow[400], 0.7) }}>점수</Text>
            <Text style={{ fontSize: 12, fontWeight: "900", color: palette.yellow[300] }}>{item.rankScore}</Text>
          </View>
        </View>
      ) : (
        <Text style={[styles.highlight, { color: highlightColor, marginTop: 5 }]}>{item.highlight}</Text>
      )}
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, borderWidth: 1, overflow: "hidden" },
  top: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 },
  gray12: { fontSize: 12, color: palette.gray[400] },
  name: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  profit: { fontSize: 20, fontWeight: "900" },
  rankRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginVertical: 5 },
  inline: { flexDirection: "row", alignItems: "center", gap: 4 },
  scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5, gap: 8 },
  highlight: { fontSize: 12, fontWeight: "600" },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: alpha(palette.yellow[500], 0.1),
    borderWidth: 1,
    borderColor: alpha(palette.yellow[500], 0.2),
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexShrink: 0,
  },
})
