import { StyleSheet, View } from "react-native"
import { SeriesChart, type ChartSeries } from "@/components/charts"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import type { AssetHistoryPoint } from "@/features/practice-stock/types"

interface AssetFlowChartProps {
  data: AssetHistoryPoint[]
  isProfit: boolean
  /** 컨테이너 전체 높이 (최종 리포트 128 / 미니 리포트 80) */
  height?: number
  strokeWidth?: number
  fillOpacity?: number
  aiSimilarName?: string
  aiBestName?: string
  /** 터치 툴팁 (웹 AssetTooltip 대체) */
  tooltip?: boolean
}

/** 자산 흐름 차트 (3선: 나 / 유사AI / 최고AI) — 최종·미니 리포트 공용 */
export function AssetFlowChart({
  data, isProfit, height = 128, strokeWidth = 2.5, fillOpacity = 0.25, aiSimilarName, aiBestName, tooltip = false,
}: AssetFlowChartProps) {
  const color = isProfit ? "#ef4444" : "#3b82f6"
  const series: ChartSeries[] = [{ key: "value", name: "나", type: "area", color, strokeWidth, fillOpacity }]
  if (aiSimilarName !== undefined && data[0]?.aiSimilar !== undefined) {
    series.push({ key: "aiSimilar", name: aiSimilarName, type: "line", color: "#a78bfa", strokeWidth: 1.5, dashed: true })
  }
  if (aiBestName !== undefined && data[0]?.aiBest !== undefined) {
    series.push({ key: "aiBest", name: aiBestName, type: "line", color: "#f59e0b", strokeWidth: 1.5, dashed: true })
  }

  return (
    <View style={[styles.box, { height }]}>
      <SeriesChart
        data={data}
        series={series}
        xKey="turn"
        height={height - 14}
        margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        tooltip={tooltip}
        tooltipLabelFormatter={(d) => `턴 ${d?.turn ?? ""}`}
        tooltipFormatter={(v, s) => `${s.name ?? ""}: ${formatNumber(v)}원`}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: alpha(palette.gray[900], 0.4),
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.2),
  },
})
