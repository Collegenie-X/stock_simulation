"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import labelsData from "@/data/profit-analysis-labels.json"
import { LABELS } from "../../config"
import type { TradeRecord } from "../../types"

interface TradePieChartProps {
  trades: TradeRecord[]
}

interface ProfitEntry {
  nameKey: string
  name: string
  profit: number
  absProfit: number
  sellCount: number
}

function formatProfit(profit: number): string {
  const abs = Math.abs(profit)
  let str: string
  if (abs >= 100_000_000) str = `${(abs / 100_000_000).toFixed(1)}억원`
  else if (abs >= 10_000) str = `${Math.round(abs / 10_000)}만원`
  else str = `${formatNumber(abs)}원`
  return profit >= 0 ? `+${str}` : `-${str}`
}

const RADIAN = Math.PI / 180
const renderLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number
  innerRadius: number; outerRadius: number; percent: number
}) => {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

/** stockName 기준 매도 수익만 집계 */
function aggregateProfit(trades: TradeRecord[]): ProfitEntry[] {
  const byName: Record<string, { name: string; profit: number; sellCount: number }> = {}
  trades
    .filter((t) => t.action === "sell")
    .forEach((t) => {
      const key = t.stockName.trim()
      if (!byName[key]) byName[key] = { name: t.stockName, profit: 0, sellCount: 0 }
      byName[key].profit += t.profit ?? 0
      byName[key].sellCount += 1
    })
  return Object.entries(byName)
    .sort(([, a], [, b]) => b.profit - a.profit)
    .map(([nameKey, item]) => ({
      nameKey,
      name: item.name,
      profit: item.profit,
      absProfit: Math.abs(item.profit),
      sellCount: item.sellCount,
    }))
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload as ProfitEntry
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="font-bold text-white mb-1">{d.name}</p>
      <p className={cn("font-semibold", d.profit >= 0 ? "text-red-400" : "text-blue-400")}>
        실현수익 {formatProfit(d.profit)}
      </p>
      <p className="text-gray-500 mt-0.5">매도 {d.sellCount}건</p>
    </div>
  )
}

export const TradePieChart = ({ trades }: TradePieChartProps) => {
  const { colors } = labelsData.pieChart
  const labels = LABELS.profitAnalysis

  if (trades.length === 0) return null

  const allEntries = aggregateProfit(trades)
  const totalProfit = allEntries.reduce((s, e) => s + e.profit, 0)
  const totalSellCount = allEntries.reduce((s, e) => s + e.sellCount, 0)
  const totalAbsProfit = allEntries.reduce((s, e) => s + e.absProfit, 0)

  if (totalSellCount === 0 || totalProfit === 0) return null

  return (
    <div className="px-5 py-4 border-b border-gray-800">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-bold text-gray-300">{labels.tradeRatioTitle}</p>
        <p className={cn("text-sm font-bold", totalProfit >= 0 ? "text-red-400" : "text-blue-400")}>
          {formatProfit(totalProfit)}
        </p>
      </div>
      <p className="text-xs text-gray-600 mb-3">매도 {totalSellCount}건 · {allEntries.length}개 종목</p>

      <div className="flex items-center gap-3">
        {/* 도넛 차트 — absProfit(절댓값) 기준 비율 */}
        <div className="w-[130px] h-[130px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allEntries}
                cx="50%" cy="50%"
                innerRadius={30} outerRadius={58}
                dataKey="absProfit"
                nameKey="name"
                labelLine={false}
                label={renderLabel}
                isAnimationActive={false}
              >
                {allEntries.map((entry, i) => (
                  <Cell
                    key={`c-${i}`}
                    fill={entry.profit >= 0 ? colors[i % colors.length] : "#3b82f6"}
                    opacity={entry.profit >= 0 ? 1 : 0.5}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 범례: 종목명 + 비율 + 수익금 */}
        <div className="flex-1 space-y-2 overflow-hidden">
          {allEntries.slice(0, 7).map((item, i) => {
            const pct = totalAbsProfit > 0 ? (item.absProfit / totalAbsProfit) * 100 : 0
            const isProfit = item.profit >= 0
            return (
              <div key={item.nameKey} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: isProfit ? colors[i % colors.length] : "#3b82f6",
                    opacity: isProfit ? 1 : 0.5,
                  }} />
                <span className="text-xs text-gray-400 truncate flex-1 min-w-0">{item.name}</span>
                <span className="text-xs font-bold text-white flex-shrink-0">{pct.toFixed(0)}%</span>
                <span className={cn(
                  "text-xs font-semibold flex-shrink-0",
                  isProfit ? "text-red-400" : "text-blue-400",
                )}>
                  {formatProfit(item.profit)}
                </span>
              </div>
            )
          })}
          {allEntries.length > 7 && (
            <p className="text-xs text-gray-600">+{allEntries.length - 7}개 더</p>
          )}
        </div>
      </div>
    </div>
  )
}
