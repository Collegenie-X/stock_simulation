"use client"

import { Heart, Bot } from "lucide-react"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { MiniChart } from "./MiniChart"
import { buildChartData } from "./utils/stockBreath"
import type { StockListItem } from "../types"

export interface StockRowProps {
  stock: StockListItem
  currentTurn: number
  stockViewTab: "현재가" | "평가금"
  isFavorite: boolean
  livePrice: number
  tickUp: boolean
  showInvestmentInfo?: boolean
  /** AI도 이 주식을 보유 중인지 */
  isAIHolding?: boolean
  onSelect: () => void
  onToggleFavorite: () => void
}

export const StockRow = ({
  stock,
  currentTurn,
  stockViewTab,
  isFavorite,
  livePrice,
  tickUp,
  showInvestmentInfo = false,
  isAIHolding = false,
  onSelect,
  onToggleFavorite,
}: StockRowProps) => {
  const chartData = buildChartData(stock, currentTurn)

  const liveDailyChange =
    stock.prevPrice > 0 ? ((livePrice - stock.prevPrice) / stock.prevPrice) * 100 : 0
  const liveDailyChangePct = Math.abs(liveDailyChange).toFixed(1)
  const liveDailyIsUp = liveDailyChange >= 0

  const liveProfit = stock.myAvg > 0
    ? ((livePrice - stock.myAvg) / stock.myAvg) * 100
    : 0
  const liveProfitPct = Math.abs(liveProfit).toFixed(1)
  const liveIsProfit = liveProfit >= 0

  return (
    <div className="flex items-center gap-3 py-2.5">
      <button
        onClick={onSelect}
        className="flex-1 flex items-center gap-3 active:opacity-70 transition-opacity"
      >
        {/* 미니차트 */}
        <div className="shrink-0 relative">
          <MiniChart
            data={chartData}
            color={stock.isUp ? "#ef4444" : "#3b82f6"}
            isUp={stock.isUp}
          />
          {/* AI 보유 뱃지 */}
          {isAIHolding && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-purple-500 flex items-center justify-center border border-[#191919]">
              <Bot className="w-2 h-2 text-white" />
            </div>
          )}
        </div>

        {/* 이름 + 서브정보 */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1">
            <span className="font-bold text-white text-sm truncate">{stock.name}</span>
            {isAIHolding && (
              <span className="text-[8px] font-bold text-purple-400 bg-purple-500/15 px-1 py-px rounded shrink-0 flex items-center gap-0.5">
                <Bot className="w-2 h-2" />
                AI
              </span>
            )}
          </div>
          {showInvestmentInfo && stock.myHoldings > 0 ? (
            stockViewTab === "현재가" ? (
              <div className="text-xs text-gray-500">
                내 평균 {formatNumber(Math.round(stock.myAvg))}원
              </div>
            ) : (
              <div className="text-xs text-gray-500">{stock.myHoldings}주</div>
            )
          ) : (
            <div className="text-xs text-gray-500">
              전일 {formatNumber(Math.round(stock.prevPrice))}원
            </div>
          )}
        </div>

        {/* 오른쪽 가격 (라이브) */}
        {showInvestmentInfo && stock.myHoldings > 0 && stockViewTab === "평가금" ? (
          <div className="text-right shrink-0">
            <div className={cn(
              "text-sm font-bold transition-colors duration-300",
              liveIsProfit ? "text-red-400" : "text-blue-400"
            )}>
              {formatNumber(Math.round(livePrice * stock.myHoldings))}원
            </div>
            <div className={cn(
              "text-xs font-bold",
              liveIsProfit ? "text-red-500" : "text-blue-500"
            )}>
              {liveIsProfit ? "+" : "-"}{liveProfitPct}%
            </div>
          </div>
        ) : (
          <div className="text-right shrink-0">
            <div className={cn(
              "text-sm font-bold transition-colors duration-300",
              liveDailyIsUp ? "text-red-400" : "text-blue-400"
            )}>
              {formatNumber(livePrice)}원
            </div>
            <div className={cn(
              "text-xs font-bold",
              liveDailyIsUp ? "text-red-500" : "text-blue-500"
            )}>
              {liveDailyIsUp ? "+" : "-"}{liveDailyChangePct}%
            </div>
          </div>
        )}
      </button>

      {/* 관심 하트 버튼 */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
        className="shrink-0 p-1 active:scale-90 transition-transform"
      >
        <Heart
          className={cn(
            "w-5 h-5",
            isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
          )}
        />
      </button>
    </div>
  )
}
