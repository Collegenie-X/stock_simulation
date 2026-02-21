"use client"

import { useMemo } from "react"
import { formatNumber } from "@/lib/format"

interface StockItem {
  name: string
  price: number
  change: number
  chartData: number[]
}

const STOCKS: StockItem[] = [
  { name: "삼성전자", price: 68000, change: 1.2, chartData: [67000, 67200, 67800, 68200, 68000, 68500, 69000, 68800, 69200] },
  { name: "카카오", price: 72000, change: 3.5, chartData: [68000, 69500, 71000, 70500, 72000, 71500, 73000, 72800, 74000] },
  { name: "테슬라", price: 245000, change: -2.1, chartData: [255000, 252000, 248000, 250000, 245000, 243000, 246000, 242000, 240000] },
  { name: "네이버", price: 185000, change: -0.8, chartData: [188000, 187000, 186500, 186000, 185000, 185500, 184000, 185200, 184500] },
  { name: "현대차", price: 198000, change: 2.3, chartData: [192000, 194000, 193000, 196000, 198000, 197000, 199000, 200000, 201000] },
]

function MiniLine({ data, isUp }: { data: number[]; isUp: boolean }) {
  const W = 56
  const H = 24
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = W / (data.length - 1)
  const color = isUp ? "#F04452" : "#3182F6"

  const points = data.map((v, i) => `${i * stepX},${H - ((v - min) / range) * H * 0.8 - H * 0.1}`)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-14 h-6">
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function HotStocks() {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-400 tracking-wider uppercase">Hot Charts</h3>
        <span className="text-[10px] text-gray-600 animate-pulse">LIVE</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
        {STOCKS.map((stock) => {
          const isUp = stock.change >= 0
          return (
            <button
              key={stock.name}
              onClick={() => (window.location.href = "/practice/setup")}
              className="flex-shrink-0 bg-[#1e1e2e] rounded-2xl p-3 border border-white/5 w-[130px] active:scale-95 transition-transform"
            >
              <div className="text-xs font-bold text-white mb-0.5 truncate">{stock.name}</div>
              <div className="text-[10px] text-gray-500 mb-2">{formatNumber(stock.price)}원</div>
              <MiniLine data={stock.chartData} isUp={isUp} />
              <div className={`text-xs font-bold mt-1.5 ${isUp ? "text-red-400" : "text-blue-400"}`}>
                {isUp ? "+" : ""}{stock.change}%
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
