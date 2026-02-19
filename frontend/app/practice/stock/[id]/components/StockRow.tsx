"use client"

import { Heart } from "lucide-react"
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
  /** true: 내 주식 섹션 — 평균가/주수 표시. false: 시장 정보(전일가) 표시 */
  showInvestmentInfo?: boolean
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
  onSelect,
  onToggleFavorite,
}: StockRowProps) => {
  const chartData = buildChartData(stock, currentTurn)

  // 전일 종가 대비 등락률 (livePrice 기준 → 라이브로 미세 변동)
  // 전일가 대비이므로 방향(+/-)이 자주 바뀌지 않음
  const liveDailyChange =
    stock.prevPrice > 0 ? ((livePrice - stock.prevPrice) / stock.prevPrice) * 100 : 0
  const liveDailyChangePct = Math.abs(liveDailyChange).toFixed(1)
  const liveDailyIsUp = liveDailyChange >= 0

  // 평가금 탭: 라이브 가격 기준 수익률
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
        <div className="shrink-0">
          <MiniChart
            data={chartData}
            color={stock.isUp ? "#ef4444" : "#3b82f6"}
            isUp={stock.isUp}
          />
        </div>

        {/* 이름 + 서브정보 */}
        <div className="flex-1 min-w-0 text-left">
          <div className="font-bold text-white text-sm truncate">{stock.name}</div>
          {showInvestmentInfo && stock.myHoldings > 0 ? (
            stockViewTab === "현재가" ? (
              <div className="text-xs text-gray-500">
                내 평균 {Math.round(stock.myAvg).toLocaleString()}원
              </div>
            ) : (
              <div className="text-xs text-gray-500">{stock.myHoldings}주</div>
            )
          ) : (
            <div className="text-xs text-gray-500">
              전일 {Math.round(stock.prevPrice).toLocaleString()}원
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
              {Math.round(livePrice * stock.myHoldings).toLocaleString()}원
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
              {livePrice.toLocaleString()}원
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
