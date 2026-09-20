import { StyleSheet, Text, View } from "react-native"
import { SeriesChart } from "@/components/charts"
import { alpha, palette } from "@/theme"

interface DailyReturnBarsProps {
  data: { day: string; value: number; type: string }[]
  winDays: number
  loseDays: number
}

export function DailyReturnBars({ data, winDays, loseDays }: DailyReturnBarsProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>📊 일별 수익/손실</Text>
      <SeriesChart
        data={data}
        height={130}
        xKey="day"
        series={[{ key: "value", type: "bar", color: "#22c55e", barColor: (d) => (d.type === "profit" ? "#22c55e" : "#ef4444") }]}
        showGrid
        showXAxis
        showYAxis
        xTickCount={data.length}
        yTickFormatter={(v) => `${Math.round(v * 10) / 10}%`}
        yAxisWidth={36}
        gridColor={alpha("#ffffff", 0.03)}
        axisColor="#6b7280"
        referenceLines={[{ y: 0, color: alpha("#ffffff", 0.13), dashed: false }]}
        tooltip
        tooltipFormatter={(v) => `수익률 : ${v >= 0 ? "+" : ""}${v}%`}
      />
      <View style={styles.legendRow}>
        <View style={styles.legend}>
          <View style={[styles.swatch, { backgroundColor: palette.green[500] }]} />
          <Text style={styles.legendText}>수익 {winDays}일</Text>
        </View>
        <View style={styles.legend}>
          <View style={[styles.swatch, { backgroundColor: palette.red[500] }]} />
          <Text style={styles.legendText}>손실 {loseDays}일</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: { marginTop: 12, backgroundColor: "#0f0f0f", borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), padding: 16 },
  title: { fontSize: 14, fontWeight: "700", color: "#ffffff", marginBottom: 12 },
  legendRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 8 },
  legend: { flexDirection: "row", alignItems: "center", gap: 6 },
  swatch: { width: 12, height: 8, borderRadius: 2 },
  legendText: { fontSize: 12, color: palette.gray[400] },
})
