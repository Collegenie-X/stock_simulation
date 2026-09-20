import { StyleSheet, Text, View } from "react-native"
import { Trophy } from "lucide-react-native"
import { SeriesChart } from "@/components/charts"
import { alpha, palette } from "@/theme"
import type { RankTrendItem } from "./types"

export function RankTrendChart({ data }: { data: RankTrendItem[] }) {
  const minRank = Math.min(...data.map((d) => d.rank))
  const maxRank = Math.max(...data.map((d) => d.rank))

  // 웹 <YAxis reversed> 대체: 순위를 음수로 뒤집어 그리고 라벨에서 다시 양수로 표시
  const chartData = data.map((d) => ({ ...d, inv: -d.rank }))

  return (
    <View style={styles.box}>
      <View style={styles.titleRow}>
        <Trophy size={16} color={palette.yellow[500]} />
        <Text style={styles.title}>실전 순위 변화 추이</Text>
        <Text style={styles.note}>(실전만 해당)</Text>
      </View>
      <SeriesChart
        data={chartData}
        height={120}
        xKey="week"
        series={[{ key: "inv", type: "area", color: "#eab308", strokeWidth: 2.5, fillOpacity: 0.25, dots: true, name: "순위" }]}
        yDomain={[-(maxRank + 30), -(minRank - 30)]}
        showGrid
        showXAxis
        showYAxis
        xTickCount={data.length}
        yTickFormatter={(v) => `${Math.round(-v)}위`}
        gridColor={alpha("#ffffff", 0.03)}
        axisColor="#6b7280"
        tooltip
        tooltipFormatter={(v) => `순위 : ${Math.round(-v)}위`}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  box: { backgroundColor: "#0d0d1a", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  title: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  note: { marginLeft: "auto", fontSize: 12, color: palette.gray[500] },
})
