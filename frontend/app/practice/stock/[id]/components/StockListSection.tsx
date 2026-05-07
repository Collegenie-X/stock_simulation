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
      <div className="flex-1 overflow-y-auto px-5 py-3 pb-36 space-y-4">

        {/* ── 내 주식 ── */}
        {myStocks.length > 0 && (
          <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800/40 overflow-hidden">
            {/* 헤더: 레이블 + 총수익 + 탭 */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-1">
                  <span>{isTotalProfit ? "🔥" : "💧"}</span>
                  <span>{LABELS.sections.myStocks.replace("💼 ", "")}</span>
                </h3>
                <span className={cn(
                  "text-sm font-bold",
                  isTotalProfit ? "text-red-400" : "text-blue-400"
                )}>
                  {isTotalProfit ? "+" : ""}{formatNumber(totalLiveProfit)}원
                  <span className="text-[11px] ml-0.5 opacity-70">
                    ({isTotalProfit ? "+" : ""}{totalProfitRate}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-end">
                <div className="flex bg-gray-800/50 rounded-lg p-0.5 gap-0.5">
                  {(["현재가", "평가금"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => onChangeViewTab(tab)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all",
                        stockViewTab === tab
                          ? "bg-gray-600 text-white"
                          : "text-gray-500 hover:text-gray-300"
                      )}
                    >
                      {tab === "현재가" ? "💹" : "💰"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* 종목 리스트 */}
            <div className="divide-y divide-gray-800/30">
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

        {/* ── 전체 주식 (카테고리별 아코디언) ── */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 mb-2">
            {LABELS.sections.allStocks}
            <span className="text-[10px] text-gray-500 ml-1.5 font-medium">
              · {Object.keys(stocksByCategory).length}개 카테고리 / {allStocksData.length}종목
            </span>
          </h3>
          <div className="space-y-2">
            {Object.entries(stocksByCategory).map(([category, stocks]) => (
              <CategoryAccordion
                key={category}
                category={category}
                stocks={stocks}
                currentTurn={currentTurn}
                stockViewTab={stockViewTab}
                livePrices={livePrices}
                tickUps={tickUps}
                favorites={favorites}
                aiHoldings={aiHoldings}
                onSelectStock={onSelectStock}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 카테고리별 아코디언 서브 컴포넌트 ──────────────────────
function CategoryAccordion({
  category,
  stocks,
  currentTurn,
  stockViewTab,
  livePrices,
  tickUps,
  favorites,
  aiHoldings,
  onSelectStock,
  onToggleFavorite,
}: {
  category: string
  stocks: StockListItem[]
  currentTurn: number
  stockViewTab: "현재가" | "평가금"
  livePrices: Record<string, number>
  tickUps: Record<string, boolean>
  favorites: string[]
  aiHoldings: Record<string, number>
  onSelectStock: (id: string) => void
  onToggleFavorite: (id: string) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-[#1a1a1a]/60 rounded-xl border border-gray-800/40 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-800/30 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-gray-200">{category}</span>
          <span className="text-[10px] font-bold text-gray-500 bg-gray-800/60 px-1.5 py-0.5 rounded-full">
            {stocks.length}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        )}
      </button>
      {open && (
        <div className="px-1 pb-1 space-y-0">
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
      )}
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
