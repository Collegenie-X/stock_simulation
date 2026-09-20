import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native"
import { alpha, palette } from "@/theme"
import { rateColor, signed } from "./colors"

interface RateCompareRowProps {
  userProfitRate: number
  aiSimilarName: string
  aiSimilarEmoji: string
  aiSimilarProfitRate: number
  aiBestName: string
  aiBestEmoji: string
  aiBestProfitRate: number
  /** 수익률 글자 크기 (최종 리포트 14 / 미니 리포트 12) */
  valueSize?: number
  gap?: number
  style?: StyleProp<ViewStyle>
}

/** 3자 수익률 비교 (나 / 유사 AI / 최고 AI) — 최종·미니 리포트 공용 */
export function RateCompareRow({
  userProfitRate, aiSimilarName, aiSimilarEmoji, aiSimilarProfitRate,
  aiBestName, aiBestEmoji, aiBestProfitRate, valueSize = 14, gap = 8, style,
}: RateCompareRowProps) {
  const cells = [
    { key: "me", label: "나", text: `${signed(userProfitRate)}${userProfitRate}%`, rate: userProfitRate, base: palette.blue[500] },
    { key: "sim", label: `${aiSimilarEmoji} ${aiSimilarName}`, text: `${signed(aiSimilarProfitRate)}${aiSimilarProfitRate.toFixed(1)}%`, rate: aiSimilarProfitRate, base: palette.purple[500] },
    { key: "best", label: `${aiBestEmoji} ${aiBestName}`, text: `${signed(aiBestProfitRate)}${aiBestProfitRate.toFixed(1)}%`, rate: aiBestProfitRate, base: palette.yellow[500] },
  ]
  return (
    <View style={[{ flexDirection: "row", gap }, style]}>
      {cells.map((c) => (
        <View key={c.key} style={[styles.cell, { backgroundColor: alpha(c.base, 0.1), borderColor: alpha(c.base, 0.2) }]}>
          <Text style={styles.label} numberOfLines={1}>{c.label}</Text>
          <Text style={{ fontSize: valueSize, fontWeight: "800", color: rateColor(c.rate) }}>{c.text}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  cell: { flex: 1, borderRadius: 12, padding: 8, alignItems: "center", borderWidth: 1 },
  label: { fontSize: 8, color: palette.gray[500], marginBottom: 2 },
})
