/** DonutChart — recharts <PieChart><Pie innerRadius …/></PieChart> 대체 */
import React from "react"
import { View, type StyleProp, type ViewStyle } from "react-native"
import Svg, { Circle, Path } from "react-native-svg"

export interface DonutSlice {
  value: number
  color: string
  key?: string
}

interface DonutChartProps {
  data: DonutSlice[]
  size?: number
  /** 0 이면 일반 파이 차트 */
  innerRadius?: number
  padAngle?: number
  style?: StyleProp<ViewStyle>
  /** 중앙에 올릴 내용 */
  children?: React.ReactNode
  onSlicePress?: (slice: DonutSlice, index: number) => void
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arc(cx: number, cy: number, rOut: number, rIn: number, start: number, end: number) {
  const large = end - start > 180 ? 1 : 0
  const o1 = polar(cx, cy, rOut, start)
  const o2 = polar(cx, cy, rOut, end)
  if (rIn <= 0) return `M${cx},${cy}L${o1.x},${o1.y}A${rOut},${rOut} 0 ${large} 1 ${o2.x},${o2.y}Z`
  const i1 = polar(cx, cy, rIn, end)
  const i2 = polar(cx, cy, rIn, start)
  return `M${o1.x},${o1.y}A${rOut},${rOut} 0 ${large} 1 ${o2.x},${o2.y}L${i1.x},${i1.y}A${rIn},${rIn} 0 ${large} 0 ${i2.x},${i2.y}Z`
}

export function DonutChart({ data, size = 160, innerRadius = 50, padAngle = 2, style, children, onSlicePress }: DonutChartProps) {
  const slices = data.filter((d) => d.value > 0)
  const total = slices.reduce((s, d) => s + d.value, 0)
  const c = size / 2
  const rOut = size / 2
  let angle = 0

  return (
    <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {total <= 0 ? (
          <Circle cx={c} cy={c} r={(rOut + innerRadius) / 2} stroke="rgba(255,255,255,0.08)" strokeWidth={rOut - innerRadius} fill="none" />
        ) : slices.length === 1 ? (
          <Circle cx={c} cy={c} r={(rOut + innerRadius) / 2} stroke={slices[0].color} strokeWidth={rOut - innerRadius} fill="none" onPress={onSlicePress ? () => onSlicePress(slices[0], 0) : undefined} />
        ) : (
          slices.map((s, i) => {
            const sweep = (s.value / total) * 360
            const start = angle + padAngle / 2
            const end = angle + sweep - padAngle / 2
            angle += sweep
            return <Path key={s.key ?? i} d={arc(c, c, rOut, innerRadius, start, Math.max(start + 0.1, end))} fill={s.color} onPress={onSlicePress ? () => onSlicePress(s, i) : undefined} />
          })
        )}
      </Svg>
      {children}
    </View>
  )
}
