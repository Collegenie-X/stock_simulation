"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, ChevronUp, Bot } from "lucide-react"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { LABELS } from "../config"
import { StockRow } from "./StockRow"
import type { StockListSectionProps, StockListItem } from "../types"

const AI_DEFAULT_VISIBLE = 2

export const StockListSection = ({
  allStocksData,
  currentTurn,
  favorites,
  stockViewTab,
  livePrices,
  tickUps,
  aiHoldings,
  aiName,
  aiEmoji,
  onChangeViewTab,
  onSelectStock,
  onToggleFavorite,
  onDecision,
}: StockListSectionProps) => {
  // 섹션별 데이터 분리
  const myStocks = allStocksData.filter((s) => s.myHoldings > 0)
  const watchlistStocks = allStocksData.filter(
    (s) => favorites.includes(s.id) && s.myHoldings === 0
  )
  const stocksByCategory = allStocksData.reduce(
    (acc, stock) => {
      const category = (stock as any).category || "기타"
      if (!acc[category]) acc[category] = []
      acc[category].push(stock)
      return acc
    },
    {} as Record<string, StockListItem[]>
  )

  // AI가 보유한 주식 (사용자가 보유하지 않은 것만 별도 표시)
  const aiOnlyStocks = allStocksData.filter(
    (s) => (aiHoldings[s.id] || 0) > 0 && s.myHoldings === 0
  )

  // 내 주식 헤더: 라이브 가격 기반 총수익 계산
  const totalLiveProfit = myStocks.reduce((sum, s) => {
    const lp = livePrices[s.id] ?? s.currentPrice
    return sum + Math.round((lp - s.myAvg) * s.myHoldings)
  }, 0)
  const totalCost = myStocks.reduce(
    (sum, s) => sum + Math.round(s.myAvg * s.myHoldings), 0
  )
  const totalProfitRate =
    totalCost > 0 ? ((totalLiveProfit / totalCost) * 100).toFixed(1) : "0.0"
  const isTotalProfit = totalLiveProfit >= 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-5 py-3 pb-44 space-y-4">

        {/* ── 내 주식 ── */}
        {myStocks.length > 0 && (
          <div>
            {/* 헤더 행 1: 레이블 + 총수익 */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400">{LABELS.sections.myStocks}</h3>
              <span className={cn(
                "text-[11px] font-bold",
                isTotalProfit ? "text-red-400" : "text-blue-400"
              )}>
                {isTotalProfit ? "+" : ""}{formatNumber(totalLiveProfit)}원
                {" "}({isTotalProfit ? "+" : ""}{totalProfitRate}%)
              </span>
            </div>
            {/* 헤더 행 2: 현재가/평가금 탭 (오른쪽 정렬, 작게) */}
            <div className="flex justify-end mt-1 mb-2">
              <div className="flex bg-gray-800/50 rounded-lg p-0.5 gap-0.5">
                {(["현재가", "평가금"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => onChangeViewTab(tab)}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold transition-all",
                      stockViewTab === tab
                        ? "bg-gray-600 text-white"
                        : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-0">
              {myStocks.map((stock) => (
                <StockRow
                  key={stock.id}
                  stock={stock}
                  currentTurn={currentTurn}
                  stockViewTab={stockViewTab}
                  showInvestmentInfo
                  livePrice={livePrices[stock.id] ?? stock.currentPrice}
                  tickUp={tickUps[stock.id] ?? true}
                  isFavorite={favorites.includes(stock.id)}
                  isAIHolding={(aiHoldings[stock.id] || 0) > 0}
                  onSelect={() => onSelectStock(stock.id)}
                  onToggleFavorite={() => onToggleFavorite(stock.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── AI 포트폴리오 (접기/펼치기) ── */}
        {aiOnlyStocks.length > 0 && (
          <AIHoldingsSection
            stocks={aiOnlyStocks}
            aiName={aiName}
            currentTurn={currentTurn}
            stockViewTab={stockViewTab}
            livePrices={livePrices}
            tickUps={tickUps}
            favorites={favorites}
            aiHoldings={aiHoldings}
            onSelectStock={onSelectStock}
            onToggleFavorite={onToggleFavorite}
          />
        )}

        {/* ── 관심 주식 ── */}
        {watchlistStocks.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-2">
              {LABELS.sections.watchlist}
            </h3>
            <div className="space-y-0">
              {watchlistStocks.map((stock) => (
                <StockRow
                  key={stock.id}
                  stock={stock}
                  currentTurn={currentTurn}
                  stockViewTab={stockViewTab}
                  livePrice={livePrices[stock.id] ?? stock.currentPrice}
                  tickUp={tickUps[stock.id] ?? true}
                  isFavorite
                  isAIHolding={(aiHoldings[stock.id] || 0) > 0}
                  onSelect={() => onSelectStock(stock.id)}
                  onToggleFavorite={() => onToggleFavorite(stock.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── 전체 주식 (카테고리별) ── */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 mb-2">
            {LABELS.sections.allStocks}
          </h3>
          {Object.entries(stocksByCategory).map(([category, stocks]) => (
            <div key={category} className="mb-3">
              <div className="text-[11px] font-bold text-gray-500 mb-1.5 ml-0.5">
                {category}
              </div>
              <div className="space-y-0">
                {stocks.map((stock) => (
                  <StockRow
                    key={stock.id}
                    stock={stock}
                    currentTurn={currentTurn}
                    stockViewTab={stockViewTab}
                    livePrice={livePrices[stock.id] ?? stock.currentPrice}
                    tickUp={tickUps[stock.id] ?? true}
                    isFavorite={favorites.includes(stock.id)}
                    isAIHolding={(aiHoldings[stock.id] || 0) > 0}
                    onSelect={() => onSelectStock(stock.id)}
                    onToggleFavorite={() => onToggleFavorite(stock.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── AI 보유 종목 접기/펼치기 서브 컴포넌트 ──────────────────
function AIHoldingsSection({
  stocks,
  aiName,
  currentTurn,
  stockViewTab,
  livePrices,
  tickUps,
  favorites,
  aiHoldings,
  onSelectStock,
  onToggleFavorite,
}: {
  stocks: StockListItem[]
  aiName: string
  currentTurn: number
  stockViewTab: "현재가" | "평가금"
  livePrices: Record<string, number>
  tickUps: Record<string, boolean>
  favorites: string[]
  aiHoldings: Record<string, number>
  onSelectStock: (id: string) => void
  onToggleFavorite: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const visibleStocks = expanded ? stocks : stocks.slice(0, AI_DEFAULT_VISIBLE)
  const hasMore = stocks.length > AI_DEFAULT_VISIBLE

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Bot className="w-2.5 h-2.5 text-purple-400" />
        </div>
        <h3 className="text-xs font-bold text-purple-400">🤖 {aiName} 보유 종목</h3>
        <span className="text-[10px] text-gray-500 font-bold ml-auto">
          {stocks.length}종목
        </span>
      </div>

      {/* 종목 리스트 */}
      <div className="space-y-0">
        {visibleStocks.map((stock) => (
          <StockRow
            key={stock.id}
            stock={stock}
            currentTurn={currentTurn}
            stockViewTab={stockViewTab}
            livePrice={livePrices[stock.id] ?? stock.currentPrice}
            tickUp={tickUps[stock.id] ?? true}
            isFavorite={favorites.includes(stock.id)}
            isAIHolding
            onSelect={() => onSelectStock(stock.id)}
            onToggleFavorite={() => onToggleFavorite(stock.id)}
          />
        ))}
      </div>

      {/* 더보기 / 접기 버튼 */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 py-2 text-[11px] font-bold text-purple-400/70 hover:text-purple-400 transition-colors"
        >
          {expanded ? (
            <>접기 <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>+{stocks.length - AI_DEFAULT_VISIBLE}종목 더보기 <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}
    </div>
  )
}
