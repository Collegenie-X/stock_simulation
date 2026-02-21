"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, Bot, TrendingUp, TrendingDown, Minus, Swords } from "lucide-react"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { LABELS } from "../config"
import {
  PeriodNav,
  ProfitSummaryCard,
  TradePieChart,
  CompanySummaryList,
  useTradeAnalysis,
} from "./profit-analysis"
import { TradeDetailCard } from "./profit-analysis/TradeDetailCard"
import labelsData from "@/data/profit-analysis-labels.json"
import type { AIAction, InvestStyle } from "./hooks/useAICompetitor"

interface ProfitAnalysisModalProps {
  scenarioId: string
  currentDay: number
  currentPrices?: Record<string, number>
  holdings?: Record<string, number>
  averagePrices?: Record<string, number>
  // AI 비교 데이터
  aiName?: string
  aiEmoji?: string
  aiStyle?: InvestStyle
  aiMotto?: string
  aiTotalValue?: number
  aiProfitRate?: number
  aiHoldings?: Record<string, number>
  aiAvgPrices?: Record<string, number>
  aiTodayActions?: AIAction[]
  aiTotalTrades?: number
  userTotalValue?: number
  userProfitRate?: number
  initialValue?: number
  // AI 전체 행동 로그
  allStockNames?: Record<string, string>
  onClose: () => void
}

type ContentTab = "거래내역" | "기업별분석" | "AI 비교"
type TradeFilter = "전체" | "매수" | "매도"

const CONTENT_TABS: ContentTab[] = ["거래내역", "기업별분석", "AI 비교"]
const TRADE_FILTERS: TradeFilter[] = ["전체", "매수", "매도"]

const STYLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  conservative: { label: "안정형", color: "text-blue-400", bg: "bg-blue-500/20" },
  stable: { label: "신중형", color: "text-cyan-400", bg: "bg-cyan-500/20" },
  balanced: { label: "균형형", color: "text-green-400", bg: "bg-green-500/20" },
  aggressive: { label: "공격형", color: "text-orange-400", bg: "bg-orange-500/20" },
  ultra_aggressive: { label: "초공격형", color: "text-red-400", bg: "bg-red-500/20" },
}

export const ProfitAnalysisModal = ({
  scenarioId,
  currentDay,
  currentPrices = {},
  holdings = {},
  averagePrices = {},
  aiName = "AI",
  aiEmoji = "🤖",
  aiStyle = "balanced",
  aiMotto = "",
  aiTotalValue = 0,
  aiProfitRate = 0,
  aiHoldings = {},
  aiAvgPrices = {},
  aiTodayActions = [],
  aiTotalTrades = 0,
  userTotalValue = 0,
  userProfitRate = 0,
  initialValue = 1000000,
  allStockNames = {},
  onClose,
}: ProfitAnalysisModalProps) => {
  const [contentTab, setContentTab] = useState<ContentTab>("거래내역")
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>("전체")

  const {
    activePeriod,
    periodLabel,
    filteredTrades,
    groupedByDate,
    summary,
    allTrades,
    companyProfiles,
    canGoPrev,
    canGoNext,
    showEmptyAlert,
    dismissEmptyAlert,
    handleChangePeriod,
    handlePrev,
    handleNext,
  } = useTradeAnalysis({ scenarioId, currentDay, currentPrices, holdings, averagePrices })

  const displayTrades = useMemo(() => {
    if (tradeFilter === "전체") return filteredTrades
    return filteredTrades.filter((t) =>
      tradeFilter === "매수" ? t.action === "buy" : t.action === "sell",
    )
  }, [filteredTrades, tradeFilter])

  const displayGrouped = useMemo(() => {
    if (tradeFilter === "전체") return groupedByDate
    return groupedByDate
      .map(({ dateKey, dateLabel, trades }) => ({
        dateKey,
        dateLabel,
        trades: trades.filter((t) =>
          tradeFilter === "매수" ? t.action === "buy" : t.action === "sell",
        ),
      }))
      .filter((g) => g.trades.length > 0)
  }, [groupedByDate, tradeFilter])

  // AI 보유 종목 리스트 (이름 매핑)
  const aiHoldingsList = useMemo(() => {
    return Object.entries(aiHoldings)
      .filter(([, qty]) => qty > 0)
      .map(([sid, qty]) => {
        const name = allStockNames[sid] || sid
        const price = currentPrices[sid] || 0
        const avg = aiAvgPrices[sid] || price
        const profitPct = avg > 0 ? ((price - avg) / avg) * 100 : 0
        return { id: sid, name, qty, price, avg, profitPct, evalAmount: price * qty }
      })
      .sort((a, b) => b.evalAmount - a.evalAmount)
  }, [aiHoldings, allStockNames, currentPrices, aiAvgPrices])

  const styleInfo = STYLE_LABELS[aiStyle] || STYLE_LABELS.balanced
  const userWinning = userProfitRate >= aiProfitRate
  const isAiProfit = aiProfitRate >= 0
  const isUserProfit = userProfitRate >= 0

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="h-full bg-[#191919] flex flex-col">

        {/* ── 헤더 ─────────────────────────────── */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-800 flex-shrink-0">
          <button onClick={onClose} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold">{LABELS.profitAnalysis.title}</h2>
          <div className="w-10" />
        </div>

        {/* ── 콘텐츠 탭 ─── */}
        <div className="flex border-b border-gray-800 flex-shrink-0">
          {CONTENT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setContentTab(tab)}
              className={cn(
                "flex-1 py-3.5 text-sm font-bold transition-colors flex items-center justify-center gap-1",
                contentTab === tab
                  ? tab === "AI 비교"
                    ? "text-purple-400 border-b-2 border-purple-400"
                    : "text-white border-b-2 border-white"
                  : "text-gray-500",
              )}
            >
              {tab === "AI 비교" && <Bot className="w-3.5 h-3.5" />}
              {tab}
            </button>
          ))}
        </div>

        {/* ── 스크롤 영역 ───────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ══ 탭 1: 거래내역 ══════════════════════ */}
          {contentTab === "거래내역" && (
            <>
              <div className="flex-shrink-0">
                <PeriodNav
                  activePeriod={activePeriod}
                  periodIndex={0}
                  periodLabel={periodLabel}
                  onChangePeriod={handleChangePeriod}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  canGoPrev={canGoPrev}
                  canGoNext={canGoNext}
                />
              </div>
              <div className="flex-shrink-0">
                <ProfitSummaryCard
                  totalProfit={summary.totalProfit}
                  totalProfitRate={summary.totalProfitRate}
                  buyCount={summary.buyCount}
                  sellCount={summary.sellCount}
                />
              </div>

              <TradePieChart
                trades={filteredTrades.length > 0 ? filteredTrades : allTrades}
              />

              <div className="flex gap-1 px-5 pt-4 pb-2">
                {TRADE_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setTradeFilter(f)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold transition-colors",
                      tradeFilter === f
                        ? f === "매수"
                          ? "bg-red-500/30 text-red-400"
                          : f === "매도"
                          ? "bg-blue-500/30 text-blue-400"
                          : "bg-gray-600 text-white"
                        : "bg-gray-800/60 text-gray-500",
                    )}
                  >
                    {f}
                    {f === "전체" && filteredTrades.length > 0 && (
                      <span className="ml-1 opacity-70">{filteredTrades.length}</span>
                    )}
                    {f === "매수" && (
                      <span className="ml-1 opacity-70">
                        {filteredTrades.filter((t) => t.action === "buy").length}
                      </span>
                    )}
                    {f === "매도" && (
                      <span className="ml-1 opacity-70">
                        {filteredTrades.filter((t) => t.action === "sell").length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {displayTrades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-4xl mb-3">{labelsData.emptyState.icon}</div>
                  <p className="text-gray-400 font-medium">
                    {tradeFilter === "전체"
                      ? labelsData.emptyState.message
                      : `${tradeFilter} 내역이 없습니다`}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">{labelsData.emptyState.subMessage}</p>
                </div>
              ) : (
                <div className="pb-6">
                  {displayGrouped.map(({ dateKey, dateLabel, trades }) => {
                    const dayProfit = trades
                      .filter((t) => t.action === "sell")
                      .reduce((sum, t) => sum + (t.profit ?? 0), 0)
                    const dayBuys = trades.filter((t) => t.action === "buy")
                    const daySells = trades.filter((t) => t.action === "sell")
                    return (
                      <div key={dateKey} className="mb-2">
                        <div className="flex items-center justify-between px-5 py-2 bg-gray-800/30">
                          <span className="text-xs font-semibold text-gray-400">{dateLabel}</span>
                          <div className="flex items-center gap-3 text-xs">
                            {dayBuys.length > 0 && <span className="text-red-400">매수 {dayBuys.length}건</span>}
                            {daySells.length > 0 && <span className="text-blue-400">매도 {daySells.length}건</span>}
                            {dayProfit !== 0 && (
                              <span className={dayProfit >= 0 ? "text-red-400" : "text-blue-400"}>
                                {dayProfit >= 0 ? "+" : ""}{formatNumber(dayProfit)}원
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="px-4 pt-2">
                          {trades.map((trade) => (
                            <TradeDetailCard
                              key={trade.id}
                              trade={trade}
                              profile={companyProfiles[trade.stockId]}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* ══ 탭 2: 기업별 분석 ════════════════════ */}
          {contentTab === "기업별분석" && (
            <CompanySummaryList
              trades={allTrades}
              profiles={companyProfiles}
              currentPrices={currentPrices}
              currentHoldings={holdings}
              avgPrices={averagePrices}
            />
          )}

          {/* ══ 탭 3: AI 비교 ════════════════════════ */}
          {contentTab === "AI 비교" && (
            <div className="pb-8">

              {/* VS 카드 */}
              <div className="mx-5 mt-5 bg-gray-800/60 rounded-2xl border border-gray-700/40 overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-gray-700/40">
                  {/* 나 */}
                  <div className={cn("p-4", userWinning && "bg-blue-500/5")}>
                    <div className="text-center">
                      <div className="text-[10px] text-gray-500 font-bold mb-1">나의 성과</div>
                      <div className={cn(
                        "text-2xl font-extrabold",
                        isUserProfit ? "text-red-400" : "text-blue-400"
                      )}>
                        {isUserProfit ? "+" : ""}{userProfitRate}%
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1">
                        {formatNumber(userTotalValue)}원
                      </div>
                      {userWinning && (
                        <div className="mt-2 text-[10px] font-bold text-yellow-400 bg-yellow-500/10 inline-block px-2 py-0.5 rounded-full">
                          승리 중
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI */}
                  <div className={cn("p-4", !userWinning && "bg-purple-500/5")}>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 font-bold mb-1">
                        <Bot className="w-3 h-3" />
                        🤖 {aiName}
                      </div>
                      <div className={cn(
                        "text-2xl font-extrabold",
                        isAiProfit ? "text-red-400" : "text-blue-400"
                      )}>
                        {isAiProfit ? "+" : ""}{aiProfitRate.toFixed(1)}%
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1">
                        {formatNumber(aiTotalValue)}원
                      </div>
                      {!userWinning && userProfitRate !== aiProfitRate && (
                        <div className="mt-2 text-[10px] font-bold text-purple-400 bg-purple-500/10 inline-block px-2 py-0.5 rounded-full">
                          승리 중
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 원금 대비 수익금 비교 */}
                <div className="px-4 py-3 bg-gray-900/50 border-t border-gray-700/30">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-500">나의 수익금 </span>
                      <span className={cn("font-bold", isUserProfit ? "text-red-400" : "text-blue-400")}>
                        {isUserProfit ? "+" : ""}{formatNumber(userTotalValue - initialValue)}원
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">AI 수익금 </span>
                      <span className={cn("font-bold", isAiProfit ? "text-red-400" : "text-blue-400")}>
                        {isAiProfit ? "+" : ""}{formatNumber(aiTotalValue - initialValue)}원
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI 전략 정보 */}
              <div className="mx-5 mt-4 bg-gray-800/40 rounded-2xl p-4 border border-gray-700/30">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">AI 투자 전략</span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", styleInfo.color, styleInfo.bg)}>
                    {styleInfo.label}
                  </span>
                </div>
                {aiMotto && (
                  <p className="text-[11px] text-gray-400 italic mb-3">"{aiMotto}"</p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-900/50 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-gray-500 mb-1">총 거래 횟수</div>
                    <div className="text-lg font-bold text-white">{aiTotalTrades}회</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-gray-500 mb-1">보유 종목 수</div>
                    <div className="text-lg font-bold text-white">{aiHoldingsList.length}종목</div>
                  </div>
                </div>
              </div>

              {/* AI 보유 포트폴리오 */}
              <div className="mx-5 mt-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-bold text-gray-400">🤖 AI 보유 포트폴리오</span>
                </div>

                {aiHoldingsList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    AI가 아직 매수한 종목이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {aiHoldingsList.map((item) => {
                      const isProfit = item.profitPct >= 0
                      return (
                        <div key={item.id} className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-full bg-purple-500/15 flex items-center justify-center shrink-0">
                                <Bot className="w-3.5 h-3.5 text-purple-400" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-white truncate">{item.name}</div>
                                <div className="text-[10px] text-gray-500">
                                  {item.qty}주 · 평균 {formatNumber(Math.round(item.avg))}원
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-sm font-bold text-white">
                                {formatNumber(item.evalAmount)}원
                              </div>
                              <div className={cn(
                                "text-[11px] font-bold flex items-center justify-end gap-0.5",
                                isProfit ? "text-red-400" : "text-blue-400"
                              )}>
                                {isProfit
                                  ? <TrendingUp className="w-3 h-3" />
                                  : item.profitPct === 0
                                  ? <Minus className="w-3 h-3" />
                                  : <TrendingDown className="w-3 h-3" />
                                }
                                {isProfit ? "+" : ""}{item.profitPct.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* AI 최근 거래 내역 */}
              {aiTodayActions.length > 0 && aiTodayActions[0].type !== "hold" && (
                <div className="mx-5 mt-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Swords className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-xs font-bold text-gray-400">AI 최근 거래</span>
                  </div>
                  <div className="space-y-1.5">
                    {aiTodayActions.filter(a => a.type !== "hold").map((a, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2.5",
                        a.type === "buy" ? "bg-red-500/10 border border-red-500/20" : "bg-blue-500/10 border border-blue-500/20"
                      )}>
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          a.type === "buy" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                        )}>
                          {a.type === "buy" ? "매수" : "매도"}
                        </span>
                        <span className="text-[11px] text-gray-300 font-medium flex-1 truncate">
                          {a.stockName}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">{a.quantity}주</span>
                        <span className="text-[10px] text-gray-500 shrink-0">
                          @{formatNumber(a.price)}원
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* 거래 근거 */}
                  <div className="mt-3 bg-gray-800/30 rounded-xl p-3">
                    <div className="text-[10px] text-gray-500 mb-1.5">AI 판단 근거</div>
                    <div className="space-y-1">
                      {aiTodayActions.filter(a => a.type !== "hold").slice(0, 3).map((a, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                          <p className="text-[11px] text-gray-400">{a.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 거래 없음 다이얼로그 ──────────────── */}
        {showEmptyAlert && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
            <div className="bg-[#252525] rounded-2xl p-6 mx-8 max-w-xs w-full shadow-2xl text-center">
              <div className="text-3xl mb-3">📭</div>
              <p className="text-sm font-bold text-white mb-1">{periodLabel}</p>
              <p className="text-sm text-gray-400 mb-5">해당 기간에 거래 내역이 없습니다.</p>
              <button
                onClick={dismissEmptyAlert}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-bold text-white transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
