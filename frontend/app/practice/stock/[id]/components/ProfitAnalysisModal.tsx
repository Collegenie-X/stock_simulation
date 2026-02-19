"use client"

import { useState, useMemo } from "react"
import { ArrowLeft } from "lucide-react"
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

interface ProfitAnalysisModalProps {
  scenarioId: string
  currentDay: number
  currentPrices?: Record<string, number>
  holdings?: Record<string, number>
  averagePrices?: Record<string, number>
  onClose: () => void
}

type ContentTab = "거래내역" | "기업별분석"
type TradeFilter = "전체" | "매수" | "매도"

const CONTENT_TABS: ContentTab[] = ["거래내역", "기업별분석"]
const TRADE_FILTERS: TradeFilter[] = ["전체", "매수", "매도"]

export const ProfitAnalysisModal = ({
  scenarioId,
  currentDay,
  currentPrices = {},
  holdings = {},
  averagePrices = {},
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

  // 전체/매수/매도 필터 적용
  const displayTrades = useMemo(() => {
    if (tradeFilter === "전체") return filteredTrades
    return filteredTrades.filter((t) =>
      tradeFilter === "매수" ? t.action === "buy" : t.action === "sell",
    )
  }, [filteredTrades, tradeFilter])

  // 필터 적용된 날짜 그룹 (empty 그룹 제거)
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

        {/* ── 콘텐츠 탭 (거래내역 / 기업별분석) ─── */}
        <div className="flex border-b border-gray-800 flex-shrink-0">
          {CONTENT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setContentTab(tab)}
              className={cn(
                "flex-1 py-3.5 text-sm font-bold transition-colors",
                contentTab === tab
                  ? "text-white border-b-2 border-white"
                  : "text-gray-500",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── 기간 네비게이터 ───────────────────── */}
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

        {/* ── 수익 요약 카드 ────────────────────── */}
        <div className="flex-shrink-0">
          <ProfitSummaryCard
            totalProfit={summary.totalProfit}
            totalProfitRate={summary.totalProfitRate}
            buyCount={summary.buyCount}
            sellCount={summary.sellCount}
          />
        </div>

        {/* ── 스크롤 영역 ───────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ══ 탭 1: 거래내역 ══════════════════════ */}
          {contentTab === "거래내역" && (
            <>
              {/* 종목별 거래 비율 원차트 (필터와 무관하게 전체 기간 trades 사용) */}
              <TradePieChart
                trades={filteredTrades.length > 0 ? filteredTrades : allTrades}
              />

              {/* 전체 / 매수 / 매도 필터 탭 */}
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

              {/* 거래 상세 리스트 (날짜별 그룹) */}
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
                        {/* 날짜 헤더 */}
                        <div className="flex items-center justify-between px-5 py-2 bg-gray-800/30">
                          <span className="text-xs font-semibold text-gray-400">{dateLabel}</span>
                          <div className="flex items-center gap-3 text-xs">
                            {dayBuys.length > 0 && (
                              <span className="text-red-400">매수 {dayBuys.length}건</span>
                            )}
                            {daySells.length > 0 && (
                              <span className="text-blue-400">매도 {daySells.length}건</span>
                            )}
                            {dayProfit !== 0 && (
                              <span className={dayProfit >= 0 ? "text-red-400" : "text-blue-400"}>
                                {dayProfit >= 0 ? "+" : ""}{dayProfit.toLocaleString()}원
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 기업 정보 포함 거래 카드 */}
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
        </div>

        {/* ── 거래 없음 다이얼로그 ──────────────── */}
        {showEmptyAlert && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
            <div className="bg-[#252525] rounded-2xl p-6 mx-8 max-w-xs w-full shadow-2xl text-center">
              <div className="text-3xl mb-3">📭</div>
              <p className="text-sm font-bold text-white mb-1">
                {periodLabel}
              </p>
              <p className="text-sm text-gray-400 mb-5">
                해당 기간에 거래 내역이 없습니다.
              </p>
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
