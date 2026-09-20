/** Sparkline — 축 없는 미니 차트 (목록 행, 카드 썸네일용) */
import React from "react"
import type { StyleProp, ViewStyle } from "react-native"
import { SeriesChart } from "./SeriesChart"

interface SparklineProps {
  values: number[]
  color: string
  width?: number
  height?: number
  area?: boolean
  strokeWidth?: number
  style?: StyleProp<ViewStyle>
}

export function Sparkline({ values, color, width, height = 48, area = true, strokeWidth = 2, style }: SparklineProps) {
  const data = values.map((v) => ({ v }))
  return (
    <SeriesChart
      data={data}
      width={width}
      height={height}
      yPadding={0.2}
      margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
      series={[{ key: "v", type: area ? "area" : "line", color, strokeWidth, fillOpacity: 0.2 }]}
      style={style}
    />
  )
}
