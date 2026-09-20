import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"

interface RankFlareProps {
  rank: number
  total: number
  /** sm: 기록 카드(text-xs) / md: 결과 화면(text-sm) */
  size?: "sm" | "md"
}

export function RankFlare({ rank, total, size = "sm" }: RankFlareProps) {
  const pct = (((total - rank) / total) * 100).toFixed(1)
  const isTop = rank <= 20
  const color = isTop ? palette.yellow[300] : palette.blue[300]
  const md = size === "md"
  const text = { fontSize: md ? 14 : 12, fontWeight: "900" as const, color }

  return (
    <View
      style={[
        styles.pill,
        md ? { gap: 6, paddingHorizontal: 12, paddingVertical: 4 } : { gap: 4, paddingHorizontal: 8, paddingVertical: 2 },
        isTop
          ? { backgroundColor: alpha(palette.yellow[500], 0.2), borderColor: alpha(palette.yellow[500], 0.4) }
          : { backgroundColor: alpha(palette.blue[500], 0.1), borderColor: alpha(palette.blue[500], 0.2) },
      ]}
    >
      {isTop && <Text style={text}>👑</Text>}
      <Text style={text}>{rank}위</Text>
      <Text style={[text, { color: alpha("#ffffff", md ? 0.3 : 0.4) }]}>·</Text>
      <Text style={text}>상위 {pct}%</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", borderRadius: 9999, borderWidth: 1 },
})
