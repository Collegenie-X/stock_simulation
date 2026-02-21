"use client"

import { useMemo, useState, useEffect } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  Label,
  ReferenceLine,
  ReferenceArea,
} from "recharts"
import { formatNumber } from "@/lib/format"
import type { StockChartProps, ChartEvent } from "../types"

const COLOR_MAP = {
  red: "#F87171",
  blue: "#60A5FA",
}

const EVENT_COLOR_MAP = {
  positive: "#F87171", // 상승 - 빨강
  negative: "#60A5FA", // 하락 - 파랑
  neutral: "#9CA3AF",  // 중립 - 회색
}

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
  const gradientId = `gradient-${color}-${Math.random().toString(36).substr(2, 9)}`
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null)

  const { min, max, maxPointIndex, minPointIndex, maxPrice, minPrice } = useMemo(() => {
    if (!data || data.length === 0)
      return { min: 0, max: 0, maxPointIndex: -1, minPointIndex: -1, maxPrice: 0, minPrice: 0 }

    const values = data.map((d: any) => d[dataKey])
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

  const formatXAxis = (value: any, index: number) => {
    if (!data || !data[index]) return ""
    const dateStr = (data[index] as any).date || ""

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

  return (
    <div className="w-full select-none" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 25, right: 10, left: 10, bottom: 30 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[min, max]} />
          <XAxis
            dataKey="index"
            type="number"
            hide={!showXAxis}
            tickFormatter={formatXAxis}
            tick={{ fill: "#6B7280", fontSize: 10 }}
            stroke="transparent"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
            domain={[0, data.length - 1]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const pointData = payload[0].payload
                return (
                  <div className="bg-gray-900/90 backdrop-blur border border-gray-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xl">
                    <div className="text-gray-400">{pointData.date || ""}</div>
                    <div className="mt-1">{formatNumber(Number(payload[0].value))}원</div>
                  </div>
                )
              }
              return null
            }}
            cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={chartColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            animationDuration={600}
            isAnimationActive={true}
            dot={false}
          />

          {maxPointIndex >= 0 && data[maxPointIndex] && (
            <ReferenceDot x={maxPointIndex} y={maxPrice} r={3} fill="#F87171" stroke="white" strokeWidth={1.5}>
              <Label
                content={({ viewBox }: any) => {
                  const { x, y } = viewBox
                  return (
                    <text x={x} y={y - 12} fill="#F87171" fontSize={10} textAnchor="middle" fontWeight="600">
                      최고 {formatNumber(maxPrice)}원
                    </text>
                  )
                }}
              />
            </ReferenceDot>
          )}

          {minPointIndex >= 0 && data[minPointIndex] && (
            <ReferenceDot x={minPointIndex} y={minPrice} r={3} fill="#9CA3AF" stroke="white" strokeWidth={1.5}>
              <Label
                content={({ viewBox }: any) => {
                  const { x, y } = viewBox
                  return (
                    <text x={x} y={y + 18} fill="#9CA3AF" fontSize={10} textAnchor="middle" fontWeight="600">
                      최저 {formatNumber(minPrice)}원
                    </text>
                  )
                }}
              />
            </ReferenceDot>
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
            
            return (
              <g key={`event-${idx}`}>
                {/* 선택된 이벤트 구간 강조 */}
                {isSelected && (
                  <ReferenceArea
                    x1={startIdx}
                    x2={endIdx}
                    fill={eventColor}
                    fillOpacity={0.2}
                    stroke={eventColor}
                    strokeWidth={2}
                    strokeOpacity={0.6}
                  />
                )}
                
                {/* 이벤트 세로 라인 */}
                <ReferenceLine
                  x={event.index}
                  stroke={eventColor}
                  strokeWidth={isSelected ? 3 : (isHovered ? 2.5 : 2)}
                  strokeOpacity={isSelected ? 0.9 : 0.4}
                  strokeDasharray={isSelected ? "0" : "5 5"}
                  onMouseEnter={() => setHoveredEvent(idx)}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  <Label
                    content={({ viewBox }: any) => {
                      const { x, y, height } = viewBox
                      const labelY = y + height - 40
                      
                      return (
                        <g>
                          {/* 번호 배지 */}
                          <circle
                            cx={x}
                            cy={labelY}
                            r={isSelected ? 12 : 10}
                            fill={isSelected ? eventColor : "#3B82F6"}
                            stroke="white"
                            strokeWidth={isSelected ? 2.5 : 2}
                          />
                          <text
                            x={x}
                            y={labelY + 4}
                            fill="white"
                            fontSize={isSelected ? 11 : 10}
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            {idx + 1}
                          </text>
                          
                          {/* 호버 시 상세 정보 */}
                          {(isHovered || isSelected) && (
                            <>
                              <rect
                                x={x - 75}
                                y={labelY - 35}
                                width={150}
                                height={24}
                                fill="#1e1e1e"
                                stroke={eventColor}
                                strokeWidth={1.5}
                                rx={8}
                                opacity={0.98}
                              />
                              <text
                                x={x}
                                y={labelY - 19}
                                fill="white"
                                fontSize={10}
                                textAnchor="middle"
                                fontWeight="600"
                              >
                                {event.emoji} {event.headline.slice(0, 14)}...
                              </text>
                            </>
                          )}
                        </g>
                      )
                    }}
                  />
                </ReferenceLine>
              </g>
            )
          })}

          {data && data.length > 0 && (
            <ReferenceDot
              x={data.length - 1}
              y={(data[data.length - 1] as any)[dataKey]}
              r={4}
              fill={chartColor}
              stroke="white"
              strokeWidth={2}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
