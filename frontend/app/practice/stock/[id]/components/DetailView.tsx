"use client"

import { useMemo, useRef } from "react"
import { ArrowLeft, Heart, Bell, MoreHorizontal, Search, TrendingUp, TrendingDown, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import { LABELS, CHART_PERIOD_MAP } from "../config"
import { StockChart } from "./StockChart"
import { WeeklyReportModal } from "./WeeklyReportModal"
import { DatePopup } from "./DatePopup"
import { FloatingExitButton } from "./FloatingExitButton"
import { DAYS_PER_WEEK, DECISIONS_PER_DAY } from "../config"
import type { ChartEvent } from "../types"

// ── 타입 ──────────────────────────────────────────────────────
interface PendingOrder {
  stockId: string
  type: "buy" | "sell"
  targetPrice: number
  condition: "ge" | "le"
  quantity: number
}

interface ChartPoint {
  index: number
  price: number
  date?: string
}

export interface DetailViewProps {
  // 주식 기본 정보
  stockName: string
  currentPrice: number
  prevPrice: number
  change: string
  isUp: boolean

  // 내 주식 정보
  currentHoldings: number
  myAvg: number
  myReturn: string
  isProfit: boolean

  // 차트
  chartData: ChartPoint[]
  chartPeriod: "1D" | "1W" | "1M" | "1Y"
  onChartPeriodChange: (period: "1D" | "1W" | "1M" | "1Y") => void

  // 현금
  cash: number

  // 관심/탭
  selectedStockId: string
  favorites: string[]
  onToggleFavorite: (id: string) => void

  // 날짜/상태
  showDatePopup: boolean
  turnDate: string
  currentDayNumber: number
  currentWeekNumber: number
  currentDayName: string
  currentDayPhase: string
  isPlaying: boolean

  // 주간 리포트
  showWeeklyReport: boolean
  weeklyReturn: number
  profitRate: number
  weeklyHistory: { turn: number; value: number }[]
  onCloseReport: () => void

  // 알림 피드백
  feedback: { text: string; type: "success" | "error" | "neutral" } | null

  // 예약 주문
  pendingOrders: PendingOrder[]
  onCancelOrder: (order: PendingOrder) => void

  // 종목 뉴스/이벤트 (전일 기반 - 뉴스는 한발 늦게 도착)
  stockNews?: string
  stockCategory?: string
  prevDayChange?: number
  prevDayIsUp?: boolean
  prevDayNews?: string

  // 네비게이션/액션
  onBack: () => void
  onBuy: () => void
  onSell: () => void
  onShowHint: () => void
  onExitClick: () => void
}

// ── 컴포넌트 ──────────────────────────────────────────────────
export const DetailView = ({
  stockName,
  currentPrice,
  prevPrice,
  change,
  isUp,
  currentHoldings,
  myAvg,
  myReturn,
  isProfit,
  chartData,
  chartPeriod,
  onChartPeriodChange,
  cash,
  selectedStockId,
  favorites,
  onToggleFavorite,
  showDatePopup,
  turnDate,
  currentDayNumber,
  currentWeekNumber,
  currentDayName,
  currentDayPhase,
  isPlaying,
  showWeeklyReport,
  weeklyReturn,
  profitRate,
  weeklyHistory,
  onCloseReport,
  feedback,
  pendingOrders,
  onCancelOrder,
  stockNews = "",
  stockCategory = "",
  prevDayChange,
  prevDayIsUp,
  prevDayNews = "",
  onBack,
  onBuy,
  onSell,
  onShowHint,
  onExitClick,
}: DetailViewProps) => {
  const profitAmt = currentHoldings > 0 ? Math.round((currentPrice - myAvg) * currentHoldings) : 0
  const totalStockValue = currentHoldings > 0 ? Math.round(currentPrice * currentHoldings) : 0
  const estimatedTax = Math.round(totalStockValue * 0.002)
  const myPendingOrders = pendingOrders.filter((o) => o.stockId === selectedStockId)

  const dailyEvents = useMemo(() => {
    return generateDailyEvents({
      currentIsUp: isUp,
      currentChange: Number(change),
      stockNews,
      stockCategory,
      stockName,
      prevDayChange,
      prevDayIsUp,
      prevDayNews,
    })
  }, [isUp, change, stockNews, stockCategory, stockName, prevDayChange, prevDayIsUp, prevDayNews])

  const chartRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen bg-[#191919] text-white flex flex-col">
      {/* 플로팅 종료 버튼 (항상 표시) */}
      <FloatingExitButton onClick={onExitClick} />

      <DatePopup isVisible={showDatePopup} date={turnDate} />

      {/* 거래 완료 피드백 토스트 */}
      {feedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top duration-300">
          <div
            className={cn(
              "px-6 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-md flex items-center gap-3 min-w-[280px]",
              feedback.type === "success"
                ? "bg-green-500/20 border-green-500 text-green-100"
                : feedback.type === "error"
                  ? "bg-red-500/20 border-red-500 text-red-100"
                  : "bg-blue-500/20 border-blue-500 text-blue-100",
            )}
          >
            <div className="text-3xl">
              {feedback.type === "success" ? "✅" : feedback.type === "error" ? "❌" : "ℹ️"}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">{feedback.text}</div>
              <div className="text-sm opacity-80">거래가 완료되었습니다</div>
            </div>
          </div>
        </div>
      )}

      <WeeklyReportModal
        isOpen={showWeeklyReport}
        onClose={onCloseReport}
        weekNumber={currentWeekNumber}
        weeklyReturn={weeklyReturn}
        totalReturn={profitRate}
        chartData={weeklyHistory.slice(-(DAYS_PER_WEEK * DECISIONS_PER_DAY))}
      />

      {/* 헤더 */}
      <div className="px-4 py-3 sticky top-0 bg-[#191919]/95 backdrop-blur-sm z-10 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="w-6 h-6 text-gray-300" />
          </button>
          <div className="flex gap-3">
            <button
              onClick={onShowHint}
              className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/20 transition-all active:scale-95 flex items-center gap-1"
            >
              <span className="text-sm">💡</span>
              <span className="text-xs font-bold text-yellow-400">심층분석</span>
            </button>
            <Heart
              className={cn(
                "w-6 h-6 transition-colors cursor-pointer",
                favorites.includes(selectedStockId) ? "text-red-500 fill-current" : "text-gray-400",
              )}
              onClick={() => onToggleFavorite(selectedStockId)}
            />
            <Bell className="w-6 h-6 text-gray-400" />
            <MoreHorizontal className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* 날짜 / 주차 */}
        <div className="flex items-center justify-center gap-2 pb-2">
          <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">
            {currentDayNumber}일차 · {currentWeekNumber}주차
          </span>
          <span className="text-xs text-gray-500">
            {currentDayName} ({currentDayPhase})
          </span>
          {isPlaying && (
            <span className="flex items-center gap-1 text-xs text-green-400 animate-pulse">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              진행 중
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* 가격 정보 */}
        <div className="px-5 pt-2 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-bold text-xl text-white">{stockName}</div>
            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
              <Search className="w-3 h-3 text-gray-400" />
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">{formatNumber(currentPrice)}원</div>
          <div className={cn("text-sm font-medium flex items-center gap-1", isUp ? "text-red-500" : "text-blue-500")}>
            어제보다 {isUp ? "+" : ""}
            {formatNumber(Math.abs(currentPrice - prevPrice))}원 ({change}%)
          </div>
        </div>

        {/* 상세 탭 */}
        <div className="flex px-5 border-b border-gray-800 mb-6">
          {LABELS.stockDetailTabs.map((tab) => (
            <button
              key={tab}
              className={cn(
                "pb-3 mr-6 text-sm font-bold relative transition-colors",
                tab === "차트" ? "text-white" : "text-gray-500",
              )}
            >
              {tab}
              {tab === "차트" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
            </button>
          ))}
        </div>

        {/* 차트 */}
        <div 
          ref={chartRef}
          className="h-[360px] w-full mb-4 relative bg-gray-900 rounded-xl overflow-hidden"
        >
          <StockChart
            data={chartData}
            height={360}
            color={isUp ? "red" : "blue"}
            showXAxis
            chartPeriod={chartPeriod}
          />
        </div>

        {/* 차트 기간 선택 */}
        <div className="px-5 mb-4">
          <div className="flex justify-between bg-gray-800/30 rounded-lg p-1">
            {(LABELS.chartPeriods as readonly string[]).map((period) => {
              const mappedPeriod = CHART_PERIOD_MAP[period] as "1D" | "1W" | "1M" | "1Y"
              const isActive = chartPeriod === mappedPeriod
              return (
                <button
                  key={period}
                  onClick={() => onChartPeriodChange(mappedPeriod)}
                  className={cn(
                    "flex-1 py-1.5 text-sm font-medium rounded-md transition-all text-center",
                    isActive ? "bg-gray-700 text-white shadow-sm" : "text-gray-500 hover:text-gray-300",
                  )}
                >
                  {period}
                </button>
              )
            })}
          </div>
        </div>

        {/* 오늘의 이벤트/뉴스 */}
        {dailyEvents.length > 0 && (
          <div className="px-5 mb-6">
            <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-gray-800/40">
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Newspaper className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-bold text-gray-300">시장 뉴스</span>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto",
                    isUp ? "bg-red-500/15 text-red-400" : "bg-blue-500/15 text-blue-400"
                  )}>
                    {isUp ? "상승세" : "하락세"}
                  </span>
                </div>
              </div>
              <div className="px-4 pb-4 space-y-0">
                {dailyEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 py-2.5 border-b border-gray-800/30 last:border-0"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      evt.type === "positive" ? "bg-red-500/15" : evt.type === "negative" ? "bg-blue-500/15" : "bg-gray-700/50"
                    )}>
                      {evt.type === "positive"
                        ? <TrendingUp className="w-3 h-3 text-red-400" />
                        : evt.type === "negative"
                        ? <TrendingDown className="w-3 h-3 text-blue-400" />
                        : <span className="text-[10px]">{evt.emoji}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-gray-200 leading-relaxed">{evt.headline}</p>
                      {evt.detail && (
                        <p className="text-[10px] text-gray-500 mt-0.5">{evt.detail}</p>
                      )}
                      {evt.isDelayed && (
                        <span className="inline-block mt-1 text-[9px] text-yellow-600 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                          어제 발표 · 주가 이미 반영
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-600 mt-1 shrink-0">{evt.time}</span>
                  </div>
                ))}
              </div>
              {prevDayChange !== undefined && (
                <div className="px-4 pb-3 pt-1 border-t border-gray-800/30">
                  <p className="text-[10px] text-gray-600 italic text-center">
                    뉴스가 보도될 때쯤 주가는 이미 움직인 뒤입니다
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 내 주식 정보 카드 */}
        {currentHoldings > 0 && (
          <div className="px-5 mb-6">
            <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-800/60">
                <span className="font-bold text-white text-base">{LABELS.stockDetail.myStockInfo}</span>
                <button className="text-xs text-blue-400 border border-blue-400/40 px-3 py-1 rounded-full">
                  {LABELS.stockDetail.avgCalcButton}
                </button>
              </div>

              <div className="px-5 py-1 space-y-0">
                <div className="flex items-center justify-between py-3.5 border-b border-gray-800/40">
                  <span className="text-sm text-gray-400">{LABELS.stockDetail.avgPerShare}</span>
                  <span className="text-sm font-medium text-white">
                    {formatNumber(Math.round(myAvg))}원
                  </span>
                </div>

                <div className="flex items-center justify-between py-3.5 border-b border-gray-800/40">
                  <span className="text-sm text-gray-400">{LABELS.stockDetail.holdingQty}</span>
                  <span className="text-sm font-medium text-white">{currentHoldings}주</span>
                </div>

                <div className="flex items-center justify-between py-3.5 border-b border-gray-800/40">
                  <div>
                    <div className="text-sm text-gray-400 mb-0.5">{LABELS.stockDetail.totalAmount}</div>
                    <div className="flex items-center gap-1 text-xs text-blue-400">
                      <span>{LABELS.stockDetail.feeTaxIncluded}</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white font-bold">
                        ✓
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {formatNumber(totalStockValue)}원
                    </div>
                    <div className={cn("text-xs font-bold", isProfit ? "text-red-500" : "text-blue-500")}>
                      {isProfit ? "+" : ""}
                      {formatNumber(profitAmt)}원 ({isProfit ? "+" : ""}
                      {myReturn}%)
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3.5 border-b border-gray-800/40">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-400">{LABELS.stockDetail.tradingFee}</span>
                    <span className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[9px] text-gray-500">
                      ?
                    </span>
                  </div>
                  <span className="text-sm text-gray-300">{LABELS.stockDetail.feeEstimate}</span>
                </div>

                <div className="flex items-center justify-between py-3.5">
                  <span className="text-sm text-gray-400">{LABELS.stockDetail.sellTax}</span>
                  <span className="text-sm text-gray-300">
                    {formatNumber(estimatedTax)}원 예상
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 미체결 주문 */}
        {myPendingOrders.length > 0 && (
          <div className="px-5 mb-6">
            <h3 className="font-bold text-gray-200 mb-3">{LABELS.stockDetail.pendingOrders}</h3>
            <div className="space-y-3">
              {myPendingOrders.map((order, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800/30 rounded-2xl p-4 border border-gray-800 flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "text-xs font-bold px-1.5 py-0.5 rounded",
                          order.type === "buy"
                            ? "bg-red-500/20 text-red-500"
                            : "bg-blue-500/20 text-blue-500",
                        )}
                      >
                        {order.type === "buy" ? "구매" : "판매"}
                      </span>
                      <span className="text-sm font-bold text-gray-300">
                        {order.condition === "ge" ? "이상" : "이하"} 조건
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white">
                      {order.targetPrice < 100
                        ? `${order.targetPrice > 0 ? "+" : ""}${order.targetPrice}% 도달 시`
                        : `${formatNumber(order.targetPrice)}원 도달 시`}
                    </div>
                  </div>
                  <button
                    onClick={() => onCancelOrder(order)}
                    className="text-xs bg-gray-700 text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {LABELS.stockDetail.cancelOrder}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 매매 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#191919] border-t border-gray-800 z-20" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="px-4 pt-3 pb-1">
          <div className="flex gap-3">
            <button
              onClick={onSell}
              disabled={currentHoldings === 0}
              className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-2xl font-bold text-lg transition-colors active:scale-[0.98]"
            >
              {LABELS.actions.sell}
            </button>
            <button
              onClick={onBuy}
              disabled={cash < currentPrice}
              className="flex-1 h-14 bg-red-500 hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-2xl font-bold text-lg transition-colors active:scale-[0.98]"
            >
              {LABELS.actions.buy}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 이벤트 생성 (JSON 데이터 기반) ───────────────────────
import eventsData from "@/data/stock-market-events.json"

interface DailyEvent {
  type: "positive" | "negative" | "neutral"
  emoji: string
  headline: string
  detail?: string
  time: string
  isDelayed?: boolean
}

const { categoryMapping, times: TIMES, positive: POSITIVE_POOL, negative: NEGATIVE_POOL, volumeAlert } = eventsData

function resolveCategory(category: string): string {
  for (const [key, keywords] of Object.entries(categoryMapping)) {
    if (keywords.some((kw) => category.includes(kw))) return key
  }
  return "기본"
}

interface EventParams {
  currentIsUp: boolean
  currentChange: number
  stockNews: string
  stockCategory: string
  stockName: string
  prevDayChange?: number
  prevDayIsUp?: boolean
  prevDayNews?: string
}

function generateDailyEvents(params: EventParams): DailyEvent[] {
  const {
    currentIsUp, currentChange, stockNews, stockCategory, stockName,
    prevDayChange, prevDayIsUp, prevDayNews,
  } = params

  const cat = resolveCategory(stockCategory)
  const absChange = Math.abs(currentChange)
  const events: DailyEvent[] = []

  const hasPrevData = prevDayChange !== undefined && prevDayIsUp !== undefined
  const prevWasUp = prevDayIsUp ?? currentIsUp
  const prevAbsChange = Math.abs(prevDayChange ?? currentChange)

  // 1) 전일 기반 뉴스 (한발 늦은 뉴스) — 전일 움직임에 대한 보도
  if (hasPrevData) {
    const pool = prevWasUp
      ? (POSITIVE_POOL as Record<string, { headlines: string[]; details: string[] }>)
      : (NEGATIVE_POOL as Record<string, { headlines: string[]; details: string[] }>)
    const data = pool[cat] || pool["기본"]
    const seed = stockName.length + Math.round((prevDayChange ?? 0) * 100)
    const idx = Math.abs(seed) % data.headlines.length

    events.push({
      type: prevWasUp ? "positive" : "negative",
      emoji: prevWasUp ? "📈" : "📉",
      headline: data.headlines[idx],
      detail: data.details[idx],
      time: TIMES[0],
      isDelayed: true,
    })

    // 전일 뉴스 데이터가 있으면 포함
    if (prevDayNews) {
      events.push({
        type: "neutral",
        emoji: "📋",
        headline: prevDayNews,
        time: TIMES[1],
        isDelayed: true,
      })
    }

    // 오늘 방향이 전일과 반대면 "반전 경고" 추가
    if (prevWasUp !== currentIsUp) {
      events.push({
        type: currentIsUp ? "positive" : "negative",
        emoji: "🔄",
        headline: currentIsUp
          ? `${stockName}, 어제 하락 분위기에서 반등 성공`
          : `${stockName}, 호재 뉴스에도 불구하고 차익실현 매물 출회`,
        detail: currentIsUp
          ? "과매도 구간 진입 후 기술적 반등 관측"
          : "소식 발표 후 이미 오른 주가에 매도세 집중",
        time: TIMES[2],
      })
    }

    // 전일 변동폭이 컸으면 거래량 뉴스
    if (prevAbsChange > 3) {
      events.push({
        type: "neutral",
        emoji: "🔔",
        headline: volumeAlert.headline
          .replace("{stockName}", stockName)
          .replace("{volume}", String(Math.round(prevAbsChange * 30))),
        detail: prevAbsChange > 5 ? volumeAlert.detailHigh : volumeAlert.detailNormal,
        time: TIMES[3],
        isDelayed: true,
      })
    }
  } else {
    // 첫날: 전일 데이터 없으면 현재 기준으로 표시
    const pool = currentIsUp
      ? (POSITIVE_POOL as Record<string, { headlines: string[]; details: string[] }>)
      : (NEGATIVE_POOL as Record<string, { headlines: string[]; details: string[] }>)
    const data = pool[cat] || pool["기본"]
    const seed = stockName.length + Math.round(currentChange * 100)
    const idx = Math.abs(seed) % data.headlines.length

    events.push({
      type: currentIsUp ? "positive" : "negative",
      emoji: currentIsUp ? "📈" : "📉",
      headline: data.headlines[idx],
      detail: data.details[idx],
      time: TIMES[0],
    })

    if (stockNews) {
      events.push({
        type: "neutral",
        emoji: "📋",
        headline: stockNews,
        time: TIMES[1],
      })
    }

    if (absChange > 3) {
      events.push({
        type: "neutral",
        emoji: "🔔",
        headline: volumeAlert.headline
          .replace("{stockName}", stockName)
          .replace("{volume}", String(Math.round(absChange * 30))),
        detail: absChange > 5 ? volumeAlert.detailHigh : volumeAlert.detailNormal,
        time: TIMES[3],
      })
    }
  }

  return events
}
