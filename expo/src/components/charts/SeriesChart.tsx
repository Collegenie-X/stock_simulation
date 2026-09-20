/**
 * SeriesChart — recharts(AreaChart / LineChart / ComposedChart / BarChart) 대체 컴포넌트
 * react-native-svg 기반이며, 부모 너비에 맞춰 자동으로 크기를 계산합니다(ResponsiveContainer 역할).
 *
 * 사용 예)
 *  <SeriesChart
 *    data={chartData} height={200}
 *    series={[{ key: "price", type: "area", color: "#f04452" }]}
 *    xKey="date" showYAxis showGrid
 *    referenceLines={[{ y: avgPrice, color: "#facc15", dashed: true, label: "평단" }]}
 *    referenceDots={[{ index: 12, y: 71000, color: "#ef4444", label: "B" }]}
 *    tooltip
 *  />
 */
import React, { useId, useMemo, useState } from "react"
import { Text, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native"
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg"
import { alpha, palette } from "@/theme"
import { areaPath, linePath, monotonePath, niceTicks, type Pt } from "./path"

export interface ChartSeries {
  key: string
  type?: "line" | "area" | "bar"
  color: string
  strokeWidth?: number
  dashed?: boolean
  /** area 상단 채움 투명도 (기본 0.3) */
  fillOpacity?: number
  curve?: "monotone" | "linear"
  /** 각 데이터 포인트에 점 표시 */
  dots?: boolean
  /** bar: 데이터별 색상 (recharts <Cell> 대체) */
  barColor?: (datum: any, index: number) => string
  /** null/undefined 값을 건너뛰지 않고 이어 그림 */
  connectNulls?: boolean
  /** tooltip 에 표시할 이름 */
  name?: string
}

export interface ChartReferenceLine {
  x?: number // data index
  y?: number
  color?: string
  dashed?: boolean
  label?: string
  labelColor?: string
  strokeWidth?: number
}

export interface ChartReferenceDot {
  index: number
  y: number
  color?: string
  r?: number
  label?: string
  labelColor?: string
  stroke?: string
}

export interface ChartReferenceArea {
  x1: number
  x2: number
  color?: string
  opacity?: number
}

export interface SeriesChartProps {
  data: any[]
  series: ChartSeries[]
  height?: number
  width?: number
  xKey?: string
  /** [min, max] 고정 또는 "auto"(패딩 포함 자동) */
  yDomain?: [number, number] | "auto"
  /** auto 도메인 상하 패딩 비율 (기본 0.1) */
  yPadding?: number
  showGrid?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  xTickCount?: number
  yTickCount?: number
  xTickFormatter?: (value: any, index: number) => string
  yTickFormatter?: (value: number) => string
  yAxisWidth?: number
  yAxisSide?: "left" | "right"
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  referenceLines?: ChartReferenceLine[]
  referenceDots?: ChartReferenceDot[]
  referenceAreas?: ChartReferenceArea[]
  /** 터치 시 값 툴팁 표시 */
  tooltip?: boolean
  tooltipFormatter?: (value: number, series: ChartSeries, datum: any) => string
  tooltipLabelFormatter?: (datum: any, index: number) => string
  onPointPress?: (datum: any, index: number) => void
  style?: StyleProp<ViewStyle>
  axisColor?: string
  gridColor?: string
}

export function SeriesChart({
  data,
  series,
  height = 200,
  width: fixedWidth,
  xKey,
  yDomain = "auto",
  yPadding = 0.1,
  showGrid = false,
  showXAxis = false,
  showYAxis = false,
  xTickCount = 4,
  yTickCount = 4,
  xTickFormatter,
  yTickFormatter,
  yAxisWidth = 44,
  yAxisSide = "left",
  margin,
  referenceLines = [],
  referenceDots = [],
  referenceAreas = [],
  tooltip = false,
  tooltipFormatter,
  tooltipLabelFormatter,
  onPointPress,
  style,
  axisColor = palette.gray[500],
  gridColor = alpha("#ffffff", 0.06),
}: SeriesChartProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const [measured, setMeasured] = useState(0)
  const [active, setActive] = useState<number | null>(null)
  const width = fixedWidth ?? measured

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width)
    if (w !== measured) setMeasured(w)
  }

  const m = {
    top: margin?.top ?? 8,
    right: (margin?.right ?? 8) + (showYAxis && yAxisSide === "right" ? yAxisWidth : 0),
    bottom: (margin?.bottom ?? 4) + (showXAxis ? 18 : 0),
    left: (margin?.left ?? 8) + (showYAxis && yAxisSide === "left" ? yAxisWidth : 0),
  }
  const plotW = Math.max(0, width - m.left - m.right)
  const plotH = Math.max(0, height - m.top - m.bottom)
  const n = data.length
  const hasBar = series.some((s) => s.type === "bar")

  const [yMin, yMax] = useMemo<[number, number]>(() => {
    if (Array.isArray(yDomain)) return yDomain
    const values: number[] = []
    for (const s of series) for (const d of data) {
      const v = d?.[s.key]
      if (typeof v === "number" && isFinite(v)) values.push(v)
    }
    for (const r of referenceLines) if (typeof r.y === "number") values.push(r.y)
    for (const r of referenceDots) values.push(r.y)
    if (!values.length) return [0, 1]
    let lo = Math.min(...values)
    let hi = Math.max(...values)
    if (hasBar) lo = Math.min(lo, 0)
    const pad = (hi - lo) * yPadding || Math.abs(hi) * 0.05 || 1
    return [hasBar && lo === 0 ? 0 : lo - pad, hi + pad]
  }, [data, series, yDomain, yPadding, referenceLines, referenceDots, hasBar])

  const band = n > 0 ? plotW / n : 0
  const xAt = (i: number) => (hasBar ? m.left + band * (i + 0.5) : n <= 1 ? m.left + plotW / 2 : m.left + (plotW * i) / (n - 1))
  const yAt = (v: number) => m.top + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH

  const yTicks = showYAxis || showGrid ? niceTicks(yMin, yMax, yTickCount) : []
  const xTickIdx = useMemo(() => {
    if (!showXAxis || n === 0) return []
    const c = Math.min(xTickCount, n)
    if (c <= 1) return [0]
    return Array.from(new Set(Array.from({ length: c }, (_, i) => Math.round((i * (n - 1)) / (c - 1)))))
  }, [showXAxis, n, xTickCount])

  const handleTouch = (pageX: number) => {
    if (!n) return
    const rel = pageX - m.left
    const idx = hasBar ? Math.floor(rel / (band || 1)) : Math.round((rel / (plotW || 1)) * (n - 1))
    const clamped = Math.max(0, Math.min(n - 1, idx))
    setActive(clamped)
    onPointPress?.(data[clamped], clamped)
  }

  const interactive = tooltip || !!onPointPress

  return (
    <View
      onLayout={fixedWidth ? undefined : onLayout}
      style={[{ height, width: fixedWidth ?? "100%" }, style]}
      onStartShouldSetResponder={() => interactive}
      onMoveShouldSetResponder={() => interactive}
      onResponderGrant={(e) => handleTouch(e.nativeEvent.locationX)}
      onResponderMove={(e) => handleTouch(e.nativeEvent.locationX)}
      onResponderRelease={() => tooltip && setTimeout(() => setActive(null), 1200)}
    >
      {width > 0 && plotH > 0 && (
        <Svg width={width} height={height} pointerEvents="none">
          <Defs>
            {series.map((s, si) =>
              s.type === "area" ? (
                <LinearGradient key={s.key + si} id={`g${uid}${si}`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0.05" stopColor={s.color} stopOpacity={s.fillOpacity ?? 0.3} />
                  <Stop offset="0.95" stopColor={s.color} stopOpacity={0} />
                </LinearGradient>
              ) : null,
            )}
          </Defs>

          {/* 그리드 & Y축 */}
          {yTicks.map((t, i) => (
            <G key={`y${i}`}>
              {showGrid && <Line x1={m.left} x2={m.left + plotW} y1={yAt(t)} y2={yAt(t)} stroke={gridColor} strokeWidth={1} strokeDasharray="3 3" />}
              {showYAxis && (
                <SvgText
                  x={yAxisSide === "left" ? m.left - 6 : m.left + plotW + 6}
                  y={yAt(t) + 3}
                  fontSize={9}
                  fill={axisColor}
                  textAnchor={yAxisSide === "left" ? "end" : "start"}
                >
                  {yTickFormatter ? yTickFormatter(t) : String(Math.round(t))}
                </SvgText>
              )}
            </G>
          ))}

          {/* X축 라벨 */}
          {xTickIdx.map((idx, i) => {
            const raw = xKey ? data[idx]?.[xKey] : idx
            return (
              <SvgText
                key={`x${idx}`}
                x={xAt(idx)}
                y={height - (margin?.bottom ?? 4) - 4}
                fontSize={9}
                fill={axisColor}
                textAnchor={i === 0 ? "start" : i === xTickIdx.length - 1 ? "end" : "middle"}
              >
                {xTickFormatter ? xTickFormatter(raw, idx) : String(raw ?? "")}
              </SvgText>
            )
          })}

          {/* 참조 영역 */}
          {referenceAreas.map((a, i) => {
            const x1 = xAt(Math.max(0, a.x1))
            const x2 = xAt(Math.min(n - 1, a.x2))
            return <Rect key={`ra${i}`} x={Math.min(x1, x2)} y={m.top} width={Math.abs(x2 - x1)} height={plotH} fill={a.color ?? "#ffffff"} opacity={a.opacity ?? 0.08} />
          })}

          {/* 시리즈 */}
          {series.map((s, si) => {
            if (s.type === "bar") {
              const bw = Math.max(1, band * 0.6)
              return (
                <G key={s.key + si}>
                  {data.map((d, i) => {
                    const v = d?.[s.key]
                    if (typeof v !== "number") return null
                    const y0 = yAt(Math.max(0, yMin))
                    const y1 = yAt(v)
                    return <Rect key={i} x={xAt(i) - bw / 2} y={Math.min(y0, y1)} width={bw} height={Math.max(1, Math.abs(y1 - y0))} rx={2} fill={s.barColor ? s.barColor(d, i) : s.color} />
                  })}
                </G>
              )
            }
            // null 구간에서 선을 끊어 그림
            const segments: Pt[][] = []
            let cur: Pt[] = []
            data.forEach((d, i) => {
              const v = d?.[s.key]
              if (typeof v === "number" && isFinite(v)) cur.push({ x: xAt(i), y: yAt(v) })
              else if (!s.connectNulls && cur.length) {
                segments.push(cur)
                cur = []
              }
            })
            if (cur.length) segments.push(cur)
            return (
              <G key={s.key + si}>
                {segments.map((pts, gi) => {
                  const d = s.curve === "linear" ? linePath(pts) : monotonePath(pts)
                  return (
                    <G key={gi}>
                      {s.type === "area" && pts.length > 1 && <Path d={areaPath(d, pts, m.top + plotH)} fill={`url(#g${uid}${si})`} />}
                      <Path d={d} fill="none" stroke={s.color} strokeWidth={s.strokeWidth ?? 2} strokeDasharray={s.dashed ? "5 4" : undefined} strokeLinejoin="round" strokeLinecap="round" />
                      {s.dots && pts.map((p, pi) => <Circle key={pi} cx={p.x} cy={p.y} r={3} fill={s.color} />)}
                    </G>
                  )
                })}
              </G>
            )
          })}

          {/* 참조선 */}
          {referenceLines.map((r, i) => {
            const c = r.color ?? palette.gray[500]
            if (typeof r.y === "number") {
              const y = yAt(r.y)
              return (
                <G key={`rl${i}`}>
                  <Line x1={m.left} x2={m.left + plotW} y1={y} y2={y} stroke={c} strokeWidth={r.strokeWidth ?? 1} strokeDasharray={r.dashed === false ? undefined : "4 3"} />
                  {r.label && (
                    <SvgText x={m.left + plotW - 2} y={y - 4} fontSize={9} fill={r.labelColor ?? c} textAnchor="end" fontWeight="bold">
                      {r.label}
                    </SvgText>
                  )}
                </G>
              )
            }
            if (typeof r.x === "number") {
              const x = xAt(r.x)
              return (
                <G key={`rl${i}`}>
                  <Line x1={x} x2={x} y1={m.top} y2={m.top + plotH} stroke={c} strokeWidth={r.strokeWidth ?? 1} strokeDasharray={r.dashed === false ? undefined : "4 3"} />
                  {r.label && (
                    <SvgText x={x} y={m.top + 9} fontSize={9} fill={r.labelColor ?? c} textAnchor="middle" fontWeight="bold">
                      {r.label}
                    </SvgText>
                  )}
                </G>
              )
            }
            return null
          })}

          {/* 참조점 (매수/매도 마커 등) */}
          {referenceDots.map((r, i) => {
            if (r.index < 0 || r.index >= n) return null
            const cx = xAt(r.index)
            const cy = yAt(r.y)
            const rad = r.r ?? 5
            return (
              <G key={`rd${i}`}>
                <Circle cx={cx} cy={cy} r={rad} fill={r.color ?? "#ffffff"} stroke={r.stroke ?? "#ffffff"} strokeWidth={1.5} />
                {r.label && (
                  <SvgText x={cx} y={cy - rad - 4} fontSize={9} fill={r.labelColor ?? r.color ?? "#ffffff"} textAnchor="middle" fontWeight="bold">
                    {r.label}
                  </SvgText>
                )}
              </G>
            )
          })}

          {/* 활성 포인트 */}
          {tooltip && active != null && (
            <G>
              <Line x1={xAt(active)} x2={xAt(active)} y1={m.top} y2={m.top + plotH} stroke={alpha("#ffffff", 0.3)} strokeWidth={1} />
              {series.map((s, si) => {
                const v = data[active]?.[s.key]
                return typeof v === "number" && s.type !== "bar" ? <Circle key={si} cx={xAt(active)} cy={yAt(v)} r={4} fill={s.color} stroke="#ffffff" strokeWidth={1.5} /> : null
              })}
            </G>
          )}
        </Svg>
      )}

      {tooltip && active != null && width > 0 && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 4,
            left: Math.max(4, Math.min(width - 124, xAt(active) - 60)),
            width: 120,
            backgroundColor: "rgba(20,20,20,0.95)",
            borderColor: alpha("#ffffff", 0.1),
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 5,
          }}
        >
          <Text style={{ color: palette.gray[400], fontSize: 10 }} numberOfLines={1}>
            {tooltipLabelFormatter ? tooltipLabelFormatter(data[active], active) : String(xKey ? data[active]?.[xKey] ?? "" : active + 1)}
          </Text>
          {series.map((s, si) => {
            const v = data[active]?.[s.key]
            if (typeof v !== "number") return null
            return (
              <Text key={si} style={{ color: s.color, fontSize: 11, fontWeight: "700" }} numberOfLines={1}>
                {tooltipFormatter ? tooltipFormatter(v, s, data[active]) : `${s.name ? s.name + " " : ""}${Math.round(v * 100) / 100}`}
              </Text>
            )
          })}
        </View>
      )}
    </View>
  )
}
