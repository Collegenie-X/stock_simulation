"use client"

import { Heart, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { LABELS } from "../config"
import { MiniChart } from "./MiniChart"
import type { StockListSectionProps, StockListItem } from "../types"

// 주식 미니 차트 데이터 생성 헬퍼
function buildChartData(stock: StockListItem, currentTurn: number) {
  const historyNeeded = 30
  const sampleRate = 2
  const rawData: { price: number; index: number }[] = []

  if (currentTurn < historyNeeded) {
    for (let i = historyNeeded - currentTurn; i > 0; i--) {
      rawData.push({ price: stock.initialPrice, index: rawData.length })
    }
  }

  const startIdx = Math.max(0, currentTurn - historyNeeded + 1)
  for (let i = startIdx; i <= currentTurn; i++) {
    const p = stock.turns?.[i]?.price || stock.initialPrice
    rawData.push({ price: p, index: rawData.length })
  }

  return rawData.filter((_, idx) => idx % sampleRate === 0)
}

// ── 개별 주식 행 ──────────────────────────────────────────────
interface StockRowProps {
  stock: StockListItem
  currentTurn: number
  stockViewTab: "현재가" | "평가금"
  isFavorite: boolean
  onSelect: () => void
  onToggleFavorite: () => void
}

const StockRow = ({
  stock,
  currentTurn,
  stockViewTab,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: StockRowProps) => {
  const chartData = buildChartData(stock, currentTurn)
  const profit = Math.round((stock.currentPrice - stock.myAvg) * stock.myHoldings)
  const profitRateNum =
    stock.myAvg > 0 ? ((profit / (stock.myAvg * stock.myHoldings)) * 100).toFixed(1) : "0.0"
  const isProfit = profit >= 0

  return (
    <div className="flex items-center gap-3 py-2.5">
      <button
        onClick={onSelect}
        className="flex-1 flex items-center gap-3 active:opacity-70 transition-opacity"
      >
        <div className="shrink-0">
          <MiniChart
            data={chartData}
            color={stock.isUp ? "#ef4444" : "#3b82f6"}
            isUp={stock.isUp}
          />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="font-bold text-white text-sm truncate">{stock.name}</div>
          {stock.myHoldings > 0 ? (
            stockViewTab === "현재가" ? (
              <div className="text-xs text-gray-500">
                내 평균 {Math.round(stock.myAvg).toLocaleString()}원
              </div>
            ) : (
              <div className="text-xs text-gray-500">{stock.myHoldings}주</div>
            )
          ) : (
            <div className="text-xs text-gray-500 truncate">{stock.news}</div>
          )}
        </div>

        {/* 오른쪽 가격/수익 정보 */}
        {stock.myHoldings > 0 && stockViewTab === "평가금" ? (
          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-white">
              {Math.round(stock.currentPrice * stock.myHoldings).toLocaleString()}원
            </div>
            <div className={cn("text-xs font-bold", isProfit ? "text-red-500" : "text-blue-500")}>
              {isProfit ? "+" : ""}
              {profit.toLocaleString()}원 ({isProfit ? "+" : ""}
              {profitRateNum}%)
            </div>
          </div>
        ) : (
          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-white">
              {Math.round(stock.currentPrice).toLocaleString()}원
            </div>
            <div className={cn("text-xs font-bold", stock.isUp ? "text-red-500" : "text-blue-500")}>
              {stock.isUp ? "+" : ""}
              {stock.change}%
            </div>
          </div>
        )}
      </button>

      {/* 하트 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite()
        }}
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

// ── 메인 스톡 리스트 섹션 ──────────────────────────────────────
export const StockListSection = ({
  allStocksData,
  currentTurn,
  favorites,
  stockViewTab,
  onSelectStock,
  onToggleFavorite,
  onDecision,
}: StockListSectionProps) => {
  // 섹션 분리
  const myStocks = allStocksData.filter((s) => s.myHoldings > 0)
  const watchlistStocks = allStocksData.filter(
    (s) => favorites.includes(s.id) && s.myHoldings === 0
  )

  // 전체 주식 카테고리별 그룹
  const stocksByCategory = allStocksData.reduce(
    (acc, stock) => {
      const category = (stock as any).category || "기타"
      if (!acc[category]) acc[category] = []
      acc[category].push(stock)
      return acc
    },
    {} as Record<string, StockListItem[]>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 주식 리스트 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-5 py-3 pb-24 space-y-4">
        {/* 내 주식 섹션 */}
        {myStocks.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-2">{LABELS.sections.myStocks}</h3>
            <div className="space-y-0">
              {myStocks.map((stock) => (
                <StockRow
                  key={stock.id}
                  stock={stock}
                  currentTurn={currentTurn}
                  stockViewTab={stockViewTab}
                  isFavorite={favorites.includes(stock.id)}
                  onSelect={() => onSelectStock(stock.id)}
                  onToggleFavorite={() => onToggleFavorite(stock.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 관심 주식 섹션 */}
        {watchlistStocks.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-2">{LABELS.sections.watchlist}</h3>
            <div className="space-y-0">
              {watchlistStocks.map((stock) => (
                <StockRow
                  key={stock.id}
                  stock={stock}
                  currentTurn={currentTurn}
                  stockViewTab={stockViewTab}
                  isFavorite={true}
                  onSelect={() => onSelectStock(stock.id)}
                  onToggleFavorite={() => onToggleFavorite(stock.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 전체 주식 섹션 - 카테고리별 */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 mb-2">{LABELS.sections.allStocks}</h3>
          {Object.entries(stocksByCategory).map(([category, stocks]) => (
            <div key={category} className="mb-3">
              <div className="text-[11px] font-bold text-gray-500 mb-1.5 ml-0.5">{category}</div>
              <div className="space-y-0">
                {stocks.map((stock) => (
                  <StockRow
                    key={stock.id}
                    stock={stock}
                    currentTurn={currentTurn}
                    stockViewTab={stockViewTab}
                    isFavorite={favorites.includes(stock.id)}
                    onSelect={() => onSelectStock(stock.id)}
                    onToggleFavorite={() => onToggleFavorite(stock.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 다음 시간 버튼 - 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-3 bg-[#191919]/95 backdrop-blur-lg border-t border-gray-700/50 pb-safe-bottom z-10">
        <button
          onClick={() => onDecision("skip")}
          className="w-full py-4 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-2xl font-bold text-base transition-all active:scale-[0.98] shadow-lg"
        >
          <span className="flex items-center justify-center gap-2">
            {LABELS.actions.skip}
            <ChevronRight className="w-5 h-5" />
          </span>
        </button>
      </div>
    </div>
  )
}
