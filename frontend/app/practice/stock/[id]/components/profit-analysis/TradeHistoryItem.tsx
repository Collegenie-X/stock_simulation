"use client"

import { cn } from "@/lib/utils"
import labelsData from "@/data/profit-analysis-labels.json"
import type { TradeRecord } from "../../types"

interface TradeHistoryItemProps {
  trade: TradeRecord
}

export const TradeHistoryItem = ({ trade }: TradeHistoryItemProps) => {
  const isBuy = trade.action === "buy"
  const actionLabel = isBuy
    ? labelsData.actionLabels.buy
    : labelsData.actionLabels.sell

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800/50 last:border-0">
      <div className="flex items-center gap-3">
        {/* 액션 배지 */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
            isBuy
              ? "bg-red-500/20 text-red-400"
              : "bg-blue-500/20 text-blue-400",
          )}
        >
          {actionLabel}
        </div>

        {/* 종목 정보 */}
        <div>
          <p className="text-sm font-semibold text-white">{trade.stockName}</p>
          <p className="text-xs text-gray-500">
            {trade.quantity}주 × {trade.price.toLocaleString()}원
          </p>
        </div>
      </div>

      {/* 금액 정보 */}
      <div className="text-right">
        <p
          className={cn(
            "text-sm font-bold",
            isBuy ? "text-red-400" : "text-blue-400",
          )}
        >
          {isBuy ? "-" : "+"}{trade.totalAmount.toLocaleString()}원
        </p>
        {!isBuy && trade.profit !== undefined && (
          <p
            className={cn(
              "text-xs",
              trade.profit >= 0 ? "text-red-400" : "text-blue-400",
            )}
          >
            {trade.profit >= 0 ? "+" : ""}
            {trade.profit.toLocaleString()}원
            {trade.profitRate !== undefined && (
              <span className="ml-1">
                ({trade.profitRate >= 0 ? "+" : ""}
                {trade.profitRate.toFixed(1)}%)
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
