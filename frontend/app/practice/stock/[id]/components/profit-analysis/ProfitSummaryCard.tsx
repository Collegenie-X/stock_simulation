"use client"

import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import { LABELS } from "../../config"

interface ProfitSummaryCardProps {
  totalProfit: number
  totalProfitRate: number
  buyCount: number
  sellCount: number
}

export const ProfitSummaryCard = ({
  totalProfit,
  totalProfitRate,
  buyCount,
  sellCount,
}: ProfitSummaryCardProps) => {
  const isPositive = totalProfit >= 0
  const labels = LABELS.profitAnalysis

  return (
    <div className="px-5 py-6 border-b border-gray-800">
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-2">{labels.realizedProfit}</p>
        <p
          className={cn(
            "text-4xl font-bold mb-1",
            isPositive ? "text-red-500" : "text-blue-500",
          )}
        >
          {isPositive ? "+" : ""}
          {formatNumber(totalProfit)}원
        </p>
        <p className={cn("text-sm", isPositive ? "text-red-400" : "text-blue-400")}>
          ({isPositive ? "+" : ""}
          {totalProfitRate.toFixed(1)}%)
        </p>
      </div>

      {/* 매수/매도 카운트 */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">{labels.buyCount}</p>
          <p className="text-lg font-bold text-red-400">{buyCount}건</p>
        </div>
        <div className="w-px bg-gray-700" />
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">{labels.sellCount}</p>
          <p className="text-lg font-bold text-blue-400">{sellCount}건</p>
        </div>
        <div className="w-px bg-gray-700" />
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">{labels.totalTrades}</p>
          <p className="text-lg font-bold text-white">{buyCount + sellCount}건</p>
        </div>
      </div>
    </div>
  )
}
