import { StyleSheet, Text, View } from "react-native"
import { SeriesChart } from "@/components/charts"
import { alpha } from "@/theme"

interface CumulativeReturnChartProps {
  data: { day: string; cumulative: number }[]
  isProfit: boolean
}

export function CumulativeReturnChart({ data, isProfit }: CumulativeReturnChartProps) {
  const color = isProfit ? "#22c55e" : "#ef4444"
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>📈 누적 수익률 곡선</Text>
      <SeriesChart
        data={data}
        height={160}
        xKey="day"
        series={[{ key: "cumulative", type: "area", color, strokeWidth: 2.5, fillOpacity: 0.3, name: "누적 수익률" }]}
        showGrid
        showXAxis
        showYAxis
        xTickCount={data.length}
        yTickFormatter={(v) => `${Math.round(v * 10) / 10}%`}
        yAxisWidth={36}
        gridColor={alpha("#ffffff", 0.03)}
        axisColor="#6b7280"
        referenceLines={[{ y: 0, color: alpha("#ffffff", 0.13) }]}
        tooltip
        tooltipFormatter={(v) => `누적 수익률 : ${v >= 0 ? "+" : ""}${v}%`}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  panel: { marginTop: 16, backgroundColor: "#0f0f0f", borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), padding: 16 },
  title: { fontSize: 14, fontWeight: "700", color: "#ffffff", marginBottom: 12 },
})
