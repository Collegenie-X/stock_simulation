"use client"

import labelsData from "@/data/profit-analysis-labels.json"
import { LABELS } from "../../config"
import type { TradeRecord } from "../../types"
import { TradeHistoryItem } from "./TradeHistoryItem"

interface TradeHistoryListProps {
  trades: TradeRecord[]
  groupedByDate: { dateKey: string; dateLabel: string; trades: TradeRecord[] }[]
}

export const TradeHistoryList = ({ trades, groupedByDate }: TradeHistoryListProps) => {
  const labels = LABELS.profitAnalysis

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-3">{labelsData.emptyState.icon}</div>
        <p className="text-gray-400 font-medium">{labelsData.emptyState.message}</p>
        <p className="text-gray-600 text-sm mt-1">{labelsData.emptyState.subMessage}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm font-bold text-gray-300 px-5 pt-4 pb-2">
        {labels.tradeHistoryTitle}
      </p>
      {groupedByDate.map(({ dateKey, dateLabel, trades: dateTrades }) => {
        const dayBuys = dateTrades.filter((t) => t.action === "buy")
        const daySells = dateTrades.filter((t) => t.action === "sell")
        const dayProfit = daySells.reduce((sum, t) => sum + (t.profit || 0), 0)

        return (
          <div key={dateKey} className="mb-2">
            {/* 날짜 헤더 */}
            <div className="flex items-center justify-between px-5 py-2 bg-gray-800/30">
              <span className="text-xs font-semibold text-gray-400">{dateLabel}</span>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {dayBuys.length > 0 && (
                  <span className="text-red-400">매수 {dayBuys.length}건</span>
                )}
                {daySells.length > 0 && (
                  <span className="text-blue-400">매도 {daySells.length}건</span>
                )}
                {dayProfit !== 0 && (
                  <span
                    className={dayProfit >= 0 ? "text-red-400" : "text-blue-400"}
                  >
                    {dayProfit >= 0 ? "+" : ""}
                    {formatNumber(dayProfit)}원
                  </span>
                )}
              </div>
            </div>

            {/* 거래 아이템 목록 */}
            <div className="px-5">
              {dateTrades.map((trade) => (
                <TradeHistoryItem key={trade.id} trade={trade} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
