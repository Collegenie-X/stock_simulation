import { StyleSheet, Text, View } from "react-native"
import { SeriesChart } from "@/components/charts"
import { palette } from "@/theme"
import { dailyProfitData } from "./data"
import { sectionStyles } from "./sectionStyles"

export function DailyProfitSection() {
  return (
    <View style={sectionStyles.card}>
      <Text style={[sectionStyles.title, { marginBottom: 8 }]}>매일 얼마나 벌었나요?</Text>
      <Text style={sectionStyles.subtitle}>매일 수익과 손실이 다르게 나타나요</Text>

      <SeriesChart
        data={dailyProfitData}
        height={220}
        xKey="day"
        series={[{ key: "profit", type: "bar", color: "#10b981", barColor: (d) => (d.profit > 0 ? "#10b981" : "#ef4444") }]}
        showGrid
        showXAxis
        showYAxis
        xTickCount={7}
        yTickFormatter={(v) => `${Math.round(v * 10) / 10}%`}
        yAxisWidth={36}
        gridColor="#f0f0f0"
        axisColor="#999999"
        referenceLines={[{ y: 0, color: "#999999", dashed: false }]}
        tooltip
        tooltipFormatter={(v) => `${v > 0 ? "수익" : "손실"} : ${v}%`}
      />

      <View style={styles.grid}>
        <View style={[styles.cell, { backgroundColor: palette.green[50], borderColor: palette.green[200] }]}>
          <Text style={[styles.label, { color: palette.green[700] }]}>이긴 날</Text>
          <Text style={[styles.value, { color: palette.green[800] }]}>10일</Text>
        </View>
        <View style={[styles.cell, { backgroundColor: palette.red[50], borderColor: palette.red[200] }]}>
          <Text style={[styles.label, { color: palette.red[700] }]}>진 날</Text>
          <Text style={[styles.value, { color: palette.red[800] }]}>4일</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { marginTop: 16, flexDirection: "row", gap: 12 },
  cell: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 2 },
  label: { fontSize: 12, marginBottom: 4 },
  value: { fontSize: 24, fontWeight: "700" },
})
