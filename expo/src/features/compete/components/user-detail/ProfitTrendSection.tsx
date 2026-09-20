import { StyleSheet, Text, View } from "react-native"
import { SeriesChart } from "@/components/charts"
import { palette } from "@/theme"
import { dailyProfitData } from "./data"
import { sectionStyles } from "./sectionStyles"

export function ProfitTrendSection({ profitRate }: { profitRate: number }) {
  return (
    <View style={[sectionStyles.card, { boxShadow: "0 10px 15px rgba(0,0,0,0.1)" }]}>
      <Text style={[sectionStyles.title, { marginBottom: 16 }]}>수익률 추이</Text>
      <SeriesChart
        data={dailyProfitData}
        height={180}
        xKey="day"
        series={[{ key: "profit", type: "area", color: "#00C853", strokeWidth: 3, fillOpacity: 0.8, name: "수익률" }]}
        showGrid
        showXAxis
        showYAxis
        xTickCount={5}
        yTickFormatter={(v) => `${Math.round(v * 10) / 10}%`}
        yAxisWidth={36}
        gridColor="#f0f0f0"
        axisColor="#999999"
        tooltip
        tooltipFormatter={(v) => `수익률 : ${v}%`}
      />

      <View style={styles.grid}>
        <View style={[styles.cell, { backgroundColor: palette.green[50] }]}>
          <Text style={[styles.label, { color: palette.green[700] }]}>평균 수익</Text>
          <Text style={[styles.value, { color: palette.green[800] }]}>+{(profitRate / 6).toFixed(1)}%</Text>
        </View>
        <View style={[styles.cell, { backgroundColor: palette.blue[50] }]}>
          <Text style={[styles.label, { color: palette.blue[700] }]}>최대 수익</Text>
          <Text style={[styles.value, { color: palette.blue[800] }]}>+27%</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { marginTop: 16, flexDirection: "row", gap: 12 },
  cell: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  label: { fontSize: 12, marginBottom: 4 },
  value: { fontSize: 20, fontWeight: "700" },
})
