import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"
import { rateColor, signed } from "./colors"

interface AICompareMiniProps {
  aiSimilarName: string
  aiSimilarEmoji: string
  aiSimilarProfitRate: number
  aiBestName: string
  aiBestEmoji: string
  aiBestProfitRate: number
}

/** 종목 카드 하단의 AI 비교 미니 바 — 최종·미니 리포트 공용 */
export function AICompareMini({ aiSimilarName, aiSimilarEmoji, aiSimilarProfitRate, aiBestName, aiBestEmoji, aiBestProfitRate }: AICompareMiniProps) {
  const items = [
    { key: "sim", label: `${aiSimilarEmoji} ${aiSimilarName}`, rate: aiSimilarProfitRate },
    { key: "best", label: `${aiBestEmoji} ${aiBestName}`, rate: aiBestProfitRate },
  ]
  return (
    <View style={styles.row}>
      {items.map((it) => (
        <View key={it.key} style={styles.cell}>
          <Text style={styles.label} numberOfLines={1}>{it.label}</Text>
          <Text style={[styles.rate, { color: rateColor(it.rate) }]}>
            {signed(it.rate)}{it.rate.toFixed(1)}%
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  cell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: alpha(palette.gray[900], 0.4),
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: { flex: 1, fontSize: 9, color: palette.gray[500] },
  rate: { fontSize: 10, fontWeight: "800", marginLeft: 4 },
})
