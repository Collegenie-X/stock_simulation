import { StyleSheet, Text, View } from "react-native"
import { Activity, Zap } from "lucide-react-native"
import { SeriesChart, type ChartReferenceLine } from "@/components/charts"
import { Gradient } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { palette } from "@/theme"
import type { WavePoint } from "./data"
import { sectionStyles } from "./sectionStyles"

export function WavePatternSection({ data }: { data: WavePoint[] }) {
  // 웹 <ReferenceLine x=… label="매수|매도">
  const lines: ChartReferenceLine[] = data.flatMap((d, i) =>
    d.action === "buy"
      ? [{ x: i, color: "#FF3D00", strokeWidth: 2, label: "매수" }]
      : d.action === "sell"
        ? [{ x: i, color: "#00C853", strokeWidth: 2, label: "매도" }]
        : [],
  )

  return (
    <View style={[sectionStyles.card, { boxShadow: "0 10px 15px rgba(0,0,0,0.1)" }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Activity size={24} color={palette.blue[600]} />
        <Text style={sectionStyles.title}>파도 패턴 분석</Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <SeriesChart
          data={data}
          height={250}
          xKey="time"
          series={[{ key: "price", type: "area", color: "#4A6BFF", strokeWidth: 3, fillOpacity: 0.3, name: "주가" }]}
          yDomain={[60000, 115000]}
          showGrid
          showXAxis
          showYAxis
          xTickCount={data.length}
          yTickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
          yAxisWidth={36}
          gridColor="#f0f0f0"
          axisColor="#999999"
          referenceLines={lines}
          margin={{ top: 12, right: 16 }}
          tooltip
          tooltipFormatter={(v) => `주가 : ${formatNumber(v)}원`}
        />
      </View>

      <Gradient dir="br" colors={[palette.blue[50], palette.purple[50]]} style={styles.box}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Zap size={20} color={palette.orange[500]} />
          <Text style={{ fontWeight: "700", fontSize: 16, color: palette.gray[900] }}>파동 해석</Text>
        </View>
        <View style={{ gap: 8 }}>
          <View style={styles.row}>
            <Text style={styles.label}>1-2파 포착률</Text>
            <Text style={[styles.value, { color: palette.green[600] }]}>100%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>3파 활용</Text>
            <Text style={[styles.value, { color: palette.blue[600] }]}>완벽</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>조정파 대응</Text>
            <Text style={[styles.value, { color: palette.purple[600] }]}>우수</Text>
          </View>
        </View>
      </Gradient>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { borderRadius: 16, padding: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 14, color: palette.gray[600] },
  value: { fontSize: 14, fontWeight: "700" },
})
