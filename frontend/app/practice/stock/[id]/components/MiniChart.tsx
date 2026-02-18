"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts"
import type { MiniChartProps } from "../types"

export const MiniChart = ({ data, color, isUp, weekNumber = 0 }: MiniChartProps) => {
  const prices = data.map((d) => d.price).filter((p) => p > 0)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const padding = (maxPrice - minPrice) * 0.2 || maxPrice * 0.05
  const yMin = Math.floor(minPrice - padding)
  const yMax = Math.ceil(maxPrice + padding)

  const gradientId = `colorGradient-${isUp ? "up" : "down"}-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="h-12 w-16 shrink-0 mr-3 relative" style={{ minHeight: "48px", minWidth: "64px" }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={48} minWidth={64}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="index" hide />
          <YAxis hide domain={[yMin, yMax]} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
