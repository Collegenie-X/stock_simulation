import React, { useEffect, useId, useMemo, useRef, useState } from "react"
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native"
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg"
import { areaPath, monotonePath, type Pt } from "@/components/charts"
import { formatNumber } from "@/lib/format"
import { palette } from "@/theme"
import type { StockChartProps } from "@/features/practice-stock/types"

const COLOR_MAP = {
  red: "#F87171",
  blue: "#60A5FA",
}

const EVENT_COLOR_MAP = {
  positive: "#F87171", // 상승 - 빨강
  negative: "#60A5FA", // 하락 - 파랑
  neutral: "#9CA3AF",  // 중립 - 회색
}

// 웹 recharts margin 과 동일
const MARGIN = { top: 25, right: 10, left: 10, bottom: 30 }
const X_AXIS_HEIGHT = 18
const TOOLTIP_WIDTH = 132

export const StockChart = ({
  data,
  height = 200,
  color = "red",
  dataKey = "price",
  showXAxis = true,
  chartPeriod = "1M",
  events = [],
  selectedEventIndex,
}: StockChartProps) => {
  const chartColor = COLOR_MAP[color]
  const gradientId = `gradient${color}${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null)
  const [active, setActive] = useState<number | null>(null)
  const [width, setWidth] = useState(0)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current) }, [])

  const { min, max, maxPointIndex, minPointIndex, maxPrice, minPrice } = useMemo(() => {
    if (!data || data.length === 0)
      return { min: 0, max: 0, maxPointIndex: -1, minPointIndex: -1, maxPrice: 0, minPrice: 0 }

    const values = data.map((d: any) => d[dataKey]) as number[]
    const minVal = Math.min(...values)
    const maxVal = Math.max(...values)
    const padding = (maxVal - minVal) * 0.2

    return {
      min: Math.floor(minVal - padding),
      max: Math.ceil(maxVal + padding),
      maxPointIndex: values.indexOf(maxVal),
      minPointIndex: values.indexOf(minVal),
      maxPrice: maxVal,
      minPrice: minVal,
    }
  }, [data, dataKey])

  const formatXAxis = (index: number) => {
    if (!data || !data[index]) return ""
    const dateStr: string = (data[index] as any).date || ""

    if (!dateStr.includes("-")) return ""

    const parts = dateStr.split(" ")
    const datePart = parts[0].split("-")
    const year = datePart[0]
    const month = parseInt(datePart[1])
    const day = parseInt(datePart[2])
    const timePart = parts[1]

    if (chartPeriod === "1D" && timePart) return timePart
    if (chartPeriod === "1Y") return `${year.slice(2)}/${month}`
    return `${month}/${day}`
  }

  const n = data?.length ?? 0
  const bottom = MARGIN.bottom + (showXAxis ? X_AXIS_HEIGHT : 0)
  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right)
  const plotH = Math.max(0, height - MARGIN.top - bottom)
  const xAt = (i: number) => (n <= 1 ? MARGIN.left + plotW / 2 : MARGIN.left + (plotW * i) / (n - 1))
  const yAt = (v: number) => MARGIN.top + plotH - ((v - min) / (max - min || 1)) * plotH
  const clampX = (x: number, half: number) => Math.max(half + 2, Math.min(width - half - 2, x))

  const { line, area, lastPt } = useMemo(() => {
    if (!n || plotW <= 0 || plotH <= 0) return { line: "", area: "", lastPt: null as Pt | null }
    const pts: Pt[] = data.map((d: any, i: number) => ({ x: xAt(i), y: yAt(Number(d[dataKey])) }))
    const l = monotonePath(pts)
    return { line: l, area: pts.length > 1 ? areaPath(l, pts, MARGIN.top + plotH) : "", lastPt: pts[pts.length - 1] }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dataKey, n, plotW, plotH, min, max])

  // interval="preserveStartEnd" + minTickGap=40 근사
  const xTicks = useMemo(() => {
    if (!showXAxis || n === 0 || plotW <= 0) return [] as number[]
    const count = Math.max(2, Math.min(n, Math.floor(plotW / 64) + 1))
    if (n === 1) return [0]
    return Array.from(new Set(Array.from({ length: count }, (_, i) => Math.round((i * (n - 1)) / (count - 1)))))
  }, [showXAxis, n, plotW])

  // 이벤트 배지 위치 (웹: labelY = viewBox.y + viewBox.height - 40)
  const eventLabelY = MARGIN.top + plotH - 40

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width)
    if (w !== width) setWidth(w)
  }

  const handleTouch = (x: number, y: number, isStart: boolean) => {
    if (!n) return
    if (hideTimer.current) clearTimeout(hideTimer.current)
    // 이벤트 배지 터치 → 웹의 hover 상세 표시 대체
    if (isStart && events && events.length > 0) {
      const hit = events.findIndex((ev) => data[ev.index] && Math.abs(xAt(ev.index) - x) <= 16 && Math.abs(eventLabelY - y) <= 16)
      if (hit >= 0) {
        setHoveredEvent((prev) => (prev === hit ? null : hit))
        setActive(null)
        return
      }
      setHoveredEvent(null)
    }
    const idx = Math.round(((x - MARGIN.left) / (plotW || 1)) * (n - 1))
    setActive(Math.max(0, Math.min(n - 1, idx)))
  }

  const release = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setActive(null), 1200)
  }

  const activeDatum: any = active != null ? data[active] : null

  return (
    <View
      style={{ width: "100%", height }}
      onLayout={onLayout}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => handleTouch(e.nativeEvent.locationX, e.nativeEvent.locationY, true)}
      onResponderMove={(e) => handleTouch(e.nativeEvent.locationX, e.nativeEvent.locationY, false)}
      onResponderRelease={release}
      onResponderTerminate={release}
    >
      {width > 0 && plotH > 0 && n > 0 && (
        <Svg width={width} height={height} pointerEvents="none">
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.05" stopColor={chartColor} stopOpacity={0.3} />
              <Stop offset="0.95" stopColor={chartColor} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {/* X축 라벨 */}
          {xTicks.map((idx, i) => {
            const label = formatXAxis(idx)
            if (!label) return null
            return (
              <SvgText
                key={`x${idx}`}
                x={xAt(idx)}
                y={MARGIN.top + plotH + 14}
                fontSize={10}
                fill="#6B7280"
                textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
              >
                {label}
              </SvgText>
            )
          })}

          {/* 가격 영역 */}
          {!!area && <Path d={area} fill={`url(#${gradientId})`} />}
          <Path d={line} fill="none" stroke={chartColor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {/* 터치 커서 */}
          {active != null && (
            <Line
              x1={xAt(active)}
              x2={xAt(active)}
              y1={MARGIN.top}
              y2={MARGIN.top + plotH}
              stroke={chartColor}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          )}

          {/* 최고점 */}
          {maxPointIndex >= 0 && data[maxPointIndex] && (
            <G>
              <Circle cx={xAt(maxPointIndex)} cy={yAt(maxPrice)} r={3} fill="#F87171" stroke="white" strokeWidth={1.5} />
              <SvgText x={clampX(xAt(maxPointIndex), 42)} y={yAt(maxPrice) - 12} fill="#F87171" fontSize={10} textAnchor="middle" fontWeight="600">
                {`최고 ${formatNumber(maxPrice)}원`}
              </SvgText>
            </G>
          )}

          {/* 최저점 */}
          {minPointIndex >= 0 && data[minPointIndex] && (
            <G>
              <Circle cx={xAt(minPointIndex)} cy={yAt(minPrice)} r={3} fill="#9CA3AF" stroke="white" strokeWidth={1.5} />
              <SvgText x={clampX(xAt(minPointIndex), 42)} y={yAt(minPrice) + 18} fill="#9CA3AF" fontSize={10} textAnchor="middle" fontWeight="600">
                {`최저 ${formatNumber(minPrice)}원`}
              </SvgText>
            </G>
          )}

          {/* 이벤트 구간 표시 */}
          {events && events.map((event, idx) => {
            const eventData = data[event.index]
            if (!eventData) return null

            const eventColor = EVENT_COLOR_MAP[event.type]
            const isSelected = selectedEventIndex === idx
            const isHovered = hoveredEvent === idx

            // 구간 계산 (이벤트 전후로 약간의 범위)
            const rangeSize = Math.max(2, Math.floor(data.length * 0.02))
            const startIdx = Math.max(0, event.index - rangeSize)
            const endIdx = Math.min(data.length - 1, event.index + rangeSize)
            const x = xAt(event.index)
            const boxX = clampX(x, 75)

            return (
              <G key={`event-${idx}`}>
                {/* 선택된 이벤트 구간 강조 */}
                {isSelected && (
                  <Rect
                    x={xAt(startIdx)}
                    y={MARGIN.top}
                    width={Math.max(0, xAt(endIdx) - xAt(startIdx))}
                    height={plotH}
                    fill={eventColor}
                    fillOpacity={0.2}
                    stroke={eventColor}
                    strokeWidth={2}
                    strokeOpacity={0.6}
                  />
                )}

                {/* 이벤트 세로 라인 */}
                <Line
                  x1={x}
                  x2={x}
                  y1={MARGIN.top}
                  y2={MARGIN.top + plotH}
                  stroke={eventColor}
                  strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 2}
                  strokeOpacity={isSelected ? 0.9 : 0.4}
                  strokeDasharray={isSelected ? undefined : "5 5"}
                />

                {/* 번호 배지 */}
                <Circle
                  cx={x}
                  cy={eventLabelY}
                  r={isSelected ? 12 : 10}
                  fill={isSelected ? eventColor : "#3B82F6"}
                  stroke="white"
                  strokeWidth={isSelected ? 2.5 : 2}
                />
                <SvgText
                  x={x}
                  y={eventLabelY + 4}
                  fill="white"
                  fontSize={isSelected ? 11 : 10}
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {String(idx + 1)}
                </SvgText>

                {/* 터치(웹: 호버) / 선택 시 상세 정보 */}
                {(isHovered || isSelected) && (
                  <G>
                    <Rect
                      x={boxX - 75}
                      y={eventLabelY - 35}
                      width={150}
                      height={24}
                      fill="#1e1e1e"
                      stroke={eventColor}
                      strokeWidth={1.5}
                      rx={8}
                      opacity={0.98}
                    />
                    <SvgText
                      x={boxX}
                      y={eventLabelY - 19}
                      fill="white"
                      fontSize={10}
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {`${event.emoji} ${event.headline.slice(0, 14)}...`}
                    </SvgText>
                  </G>
                )}
              </G>
            )
          })}

          {/* 현재(마지막) 포인트 */}
          {lastPt && <Circle cx={lastPt.x} cy={lastPt.y} r={4} fill={chartColor} stroke="white" strokeWidth={2} />}

          {/* 터치 포인트 */}
          {active != null && activeDatum && (
            <Circle cx={xAt(active)} cy={yAt(Number(activeDatum[dataKey]))} r={4} fill={chartColor} stroke="white" strokeWidth={1.5} />
          )}
        </Svg>
      )}

      {/* 툴팁 */}
      {active != null && activeDatum && width > 0 && (
        <View
          pointerEvents="none"
          style={[styles.tooltip, { left: Math.max(4, Math.min(width - TOOLTIP_WIDTH - 4, xAt(active) - TOOLTIP_WIDTH / 2)) }]}
        >
          <Text style={styles.tooltipDate} numberOfLines={1}>{activeDatum.date || ""}</Text>
          <Text style={styles.tooltipValue}>{formatNumber(Number(activeDatum[dataKey]))}원</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    top: 4,
    width: TOOLTIP_WIDTH,
    backgroundColor: "rgba(17,24,39,0.95)",
    borderWidth: 1,
    borderColor: palette.gray[700],
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    boxShadow: "0 10px 20px rgba(0,0,0,0.4)",
  },
  tooltipDate: { color: palette.gray[400], fontSize: 12, fontWeight: "700" },
  tooltipValue: { color: "#ffffff", fontSize: 12, fontWeight: "700", marginTop: 4 },
})
