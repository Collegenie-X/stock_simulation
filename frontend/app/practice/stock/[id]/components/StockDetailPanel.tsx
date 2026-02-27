"use client"

import { useMemo } from "react"
import {
  ArrowLeft, ShoppingCart, BadgeDollarSign, Waves,
  TrendingUp, TrendingDown, Bot, Lightbulb,
} from "lucide-react"
import {
  ResponsiveContainer, ComposedChart, Area, Line,
  XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid,
} from "recharts"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import type { StockDetailData, FinalGameReportTradeRecord, StockAITrade } from "../types"

interface StockDetailPanelProps {
  stock: StockDetailData
  aiSimilarName: string
  aiSimilarEmoji: string
  aiBestName: string
  aiBestEmoji: string
  onBack: () => void
}

// ── 커스텀 툴팁 ──────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const price = payload[0]?.value
  return (
    <div className="bg-gray-900/95 border border-gray-700/60 rounded-xl px-3 py-2 shadow-xl text-[10px]">
      <div className="text-gray-400 mb-1">턴 {label}</div>
      <div className="font-extrabold text-white">{formatNumber(price)}원</div>
    </div>
  )
}

// ── 매수/매도 마커 도트 ──────────────────────────────────
function TradeDot(props: any) {
  const { cx, cy, payload } = props
  if (!payload?.myAction) return null
  const isBuy = payload.myAction === "buy"
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={isBuy ? "#ef4444" : "#3b82f6"} stroke="#1f2937" strokeWidth={2} />
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize={8} fill={isBuy ? "#ef4444" : "#3b82f6"} fontWeight="bold">
        {isBuy ? "매수" : "매도"}
      </text>
    </g>
  )
}

// ── AI 마커 도트 ─────────────────────────────────────────
function AIBestDot(props: any) {
  const { cx, cy, payload } = props
  if (!payload?.aiBestAction) return null
  const isBuy = payload.aiBestAction === "buy"
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={isBuy ? "#f59e0b" : "#a78bfa"} stroke="#1f2937" strokeWidth={1.5} />
    </g>
  )
}

// ── 차트 데이터 빌드 ─────────────────────────────────────
function buildChartData(
  stock: StockDetailData,
): { turn: number; price: number; date: string; myAction?: "buy" | "sell"; aiBestAction?: "buy" | "sell" }[] {
  const myTradeMap = new Map<number, "buy" | "sell">()
  stock.myTrades.forEach(t => { if (t.turn !== undefined) myTradeMap.set(t.turn, t.action) })

  const aiBestMap = new Map<number, "buy" | "sell">()
  stock.aiBestTrades.forEach(t => {
    if (t.action !== "hold") aiBestMap.set(t.turn, t.action as "buy" | "sell")
  })

  return stock.priceHistory.map(p => ({
    turn: p.turn,
    price: p.price,
    date: p.date,
    myAction: myTradeMap.get(p.turn),
    aiBestAction: aiBestMap.get(p.turn),
  }))
}

export function StockDetailPanel({
  stock,
  aiSimilarName,
  aiSimilarEmoji,
  aiBestName,
  aiBestEmoji,
  onBack,
}: StockDetailPanelProps) {
  const chartData = useMemo(() => buildChartData(stock), [stock])
  const isMyProfit = stock.myTotalProfit >= 0
  const firstPrice = stock.priceHistory[0]?.price ?? 0
  const lastPrice = stock.priceHistory[stock.priceHistory.length - 1]?.price ?? 0
  const stockTotalChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice * 100).toFixed(1) : "0.0"
  const isStockUp = Number(stockTotalChange) >= 0

  // 내 매수 평균가 레퍼런스 라인
  const avgBuyRef = stock.avgBuyPrice > 0 ? stock.avgBuyPrice : null

  return (
    <div className="flex flex-col h-full">
      {/* ── 헤더 ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/50">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl bg-gray-800/60 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white">{stock.stockName}</span>
            <span className="text-[9px] font-bold text-gray-500 bg-gray-800/60 px-1.5 py-0.5 rounded-full">
              {stock.category}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-gray-500">{formatNumber(lastPrice)}원</span>
            <span className={cn("text-[10px] font-bold", isStockUp ? "text-red-400" : "text-blue-400")}>
              {isStockUp ? "+" : ""}{stockTotalChange}% (기간 전체)
            </span>
          </div>
        </div>
        {/* 내 수익 요약 */}
        <div className="text-right shrink-0">
          <div className={cn("text-sm font-extrabold", isMyProfit ? "text-red-400" : "text-blue-400")}>
            {isMyProfit ? "+" : ""}{stock.myTotalProfitRate.toFixed(1)}%
          </div>
          <div className={cn("text-[9px] font-bold", isMyProfit ? "text-red-400/60" : "text-blue-400/60")}>
            {isMyProfit ? "+" : ""}{formatNumber(stock.myTotalProfit)}원
          </div>
        </div>
      </div>

      {/* ── 스크롤 영역 ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 space-y-4">

        {/* ── 가격 차트 ── */}
        <div className="bg-gray-800/40 rounded-2xl border border-gray-700/30 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-300">가격 흐름 + 거래 마커</span>
            <div className="flex items-center gap-3 text-[9px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                <span className="text-gray-500">내 매수</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                <span className="text-gray-500">내 매도</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                <span className="text-gray-500">최고AI</span>
              </span>
            </div>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isStockUp ? "#ef4444" : "#3b82f6"} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={isStockUp ? "#ef4444" : "#3b82f6"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                <XAxis
                  dataKey="turn"
                  tick={{ fontSize: 8, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${v}턴`}
                />
                <YAxis
                  tick={{ fontSize: 8, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                  width={32}
                />
                <Tooltip content={<ChartTooltip />} />
                {/* 평균 매수가 기준선 */}
                {avgBuyRef && (
                  <ReferenceLine
                    y={avgBuyRef}
                    stroke="#f59e0b"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    label={{ value: "평균매수", position: "right", fontSize: 8, fill: "#f59e0b" }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isStockUp ? "#ef4444" : "#3b82f6"}
                  strokeWidth={2}
                  fill="url(#stockGrad)"
                  dot={<TradeDot />}
                />
                {/* 최고 AI 마커 */}
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="transparent"
                  dot={<AIBestDot />}
                  activeDot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 내 거래 vs AI 비교 카드 ── */}
        <div className="grid grid-cols-3 gap-2">
          {/* 나 */}
          <div className="bg-blue-500/8 rounded-xl p-3 border border-blue-500/20 text-center">
            <div className="text-[9px] text-gray-500 mb-1 font-bold">나</div>
            <div className={cn("text-base font-extrabold", isMyProfit ? "text-red-400" : "text-blue-400")}>
              {isMyProfit ? "+" : ""}{stock.myTotalProfitRate.toFixed(1)}%
            </div>
            <div className={cn("text-[9px] mt-0.5", isMyProfit ? "text-red-400/60" : "text-blue-400/60")}>
              {isMyProfit ? "+" : ""}{formatNumber(stock.myTotalProfit)}원
            </div>
          </div>
          {/* 유사 AI */}
          <div className="bg-purple-500/8 rounded-xl p-3 border border-purple-500/20 text-center">
            <div className="text-[9px] text-gray-500 mb-1 font-bold truncate">{aiSimilarEmoji} {aiSimilarName}</div>
            <div className={cn("text-base font-extrabold", stock.aiSimilarProfitRate >= 0 ? "text-red-400" : "text-blue-400")}>
              {stock.aiSimilarProfitRate >= 0 ? "+" : ""}{stock.aiSimilarProfitRate.toFixed(1)}%
            </div>
            <div className={cn("text-[9px] mt-0.5", stock.aiSimilarProfitRate >= 0 ? "text-red-400/60" : "text-blue-400/60")}>
              {stock.aiSimilarProfitRate >= 0 ? "+" : ""}{formatNumber(stock.aiSimilarProfit)}원
            </div>
          </div>
          {/* 최고 AI */}
          <div className="bg-yellow-500/8 rounded-xl p-3 border border-yellow-500/20 text-center">
            <div className="text-[9px] text-gray-500 mb-1 font-bold truncate">{aiBestEmoji} {aiBestName}</div>
            <div className={cn("text-base font-extrabold", stock.aiBestProfitRate >= 0 ? "text-red-400" : "text-blue-400")}>
              {stock.aiBestProfitRate >= 0 ? "+" : ""}{stock.aiBestProfitRate.toFixed(1)}%
            </div>
            <div className={cn("text-[9px] mt-0.5", stock.aiBestProfitRate >= 0 ? "text-red-400/60" : "text-blue-400/60")}>
              {stock.aiBestProfitRate >= 0 ? "+" : ""}{formatNumber(stock.aiBestProfit)}원
            </div>
          </div>
        </div>

        {/* ── 내 거래 내역 ── */}
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-700/30">
            <span className="text-[11px] font-bold text-gray-300">내 거래 내역</span>
          </div>
          {stock.myTrades.length === 0 ? (
            <div className="px-3 py-5 text-center text-[11px] text-gray-600">거래 내역 없음</div>
          ) : (
            <div className="divide-y divide-gray-800/30">
              {stock.myTrades.map((t, i) => (
                <MyTradeRow key={t.id || i} trade={t} />
              ))}
            </div>
          )}
        </div>

        {/* ── AI 거래 비교 ── */}
        <div className="space-y-2">
          {/* 유사 AI */}
          <AITradeSection
            name={aiSimilarName}
            emoji={aiSimilarEmoji}
            trades={stock.aiSimilarTrades}
            profit={stock.aiSimilarProfit}
            profitRate={stock.aiSimilarProfitRate}
            colorClass="purple"
          />
          {/* 최고 AI */}
          <AITradeSection
            name={aiBestName}
            emoji={aiBestEmoji}
            trades={stock.aiBestTrades}
            profit={stock.aiBestProfit}
            profitRate={stock.aiBestProfitRate}
            colorClass="yellow"
          />
        </div>

        {/* ── 파도 분석 코멘트 ── */}
        {stock.waveComment && (
          <div className="bg-cyan-500/5 rounded-2xl border border-cyan-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-bold text-cyan-400">파도 분석</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">{stock.waveComment}</p>
          </div>
        )}

        {/* ── 개선 포인트 ── */}
        <ImprovementCard stock={stock} />

        <div className="h-4" />
      </div>
    </div>
  )
}

// ── 내 거래 행 ────────────────────────────────────────────
function MyTradeRow({ trade }: { trade: FinalGameReportTradeRecord }) {
  const isBuy = trade.action === "buy"
  const profit = trade.profit ?? 0
  const profitRate = trade.profitRate ?? 0

  return (
    <div className="px-3 py-2.5 flex items-center gap-2.5">
      <div className={cn(
        "shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center",
        isBuy ? "bg-red-500/10 border border-red-500/20" : "bg-blue-500/10 border border-blue-500/20",
      )}>
        {isBuy
          ? <ShoppingCart className="w-3.5 h-3.5 text-red-400" />
          : <BadgeDollarSign className="w-3.5 h-3.5 text-blue-400" />
        }
        <span className={cn("text-[8px] font-bold mt-0.5", isBuy ? "text-red-400" : "text-blue-400")}>
          {isBuy ? "매수" : "매도"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-white">{trade.day}일차</span>
          <span className="text-[9px] text-gray-500">{trade.date}</span>
        </div>
        <div className="text-[9px] text-gray-500 mt-0.5">
          {trade.quantity}주 × {formatNumber(trade.price)}원 = {formatNumber(trade.totalAmount)}원
        </div>
        {!isBuy && trade.avgBuyPrice && (
          <div className="text-[9px] text-gray-600 mt-0.5">
            평균매수가 {formatNumber(trade.avgBuyPrice)}원
          </div>
        )}
      </div>
      {!isBuy && (
        <div className="shrink-0 text-right">
          <div className={cn("text-[12px] font-extrabold", profit >= 0 ? "text-red-400" : "text-blue-400")}>
            {profit >= 0 ? "+" : ""}{formatNumber(profit)}원
          </div>
          <div className={cn("text-[10px] font-bold", profitRate >= 0 ? "text-red-400/70" : "text-blue-400/70")}>
            {profitRate >= 0 ? "+" : ""}{profitRate.toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  )
}

// ── AI 거래 섹션 ──────────────────────────────────────────
function AITradeSection({
  name, emoji, trades, profit, profitRate, colorClass,
}: {
  name: string; emoji: string; trades: StockAITrade[]
  profit: number; profitRate: number; colorClass: "purple" | "yellow"
}) {
  const isProfit = profitRate >= 0
  const colors = {
    purple: { bg: "bg-purple-500/8", border: "border-purple-500/20", text: "text-purple-400" },
    yellow: { bg: "bg-yellow-500/8", border: "border-yellow-500/20", text: "text-yellow-400" },
  }[colorClass]

  return (
    <div className={cn("rounded-2xl border overflow-hidden", colors.bg, colors.border)}>
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-gray-700/20">
        <div className="flex items-center gap-2">
          <Bot className={cn("w-3.5 h-3.5", colors.text)} />
          <span className="text-[11px] font-bold text-gray-300">{emoji} {name}</span>
        </div>
        <div className="text-right">
          <span className={cn("text-xs font-extrabold", isProfit ? "text-red-400" : "text-blue-400")}>
            {isProfit ? "+" : ""}{profitRate.toFixed(1)}%
          </span>
          <span className={cn("text-[9px] ml-1.5", isProfit ? "text-red-400/60" : "text-blue-400/60")}>
            ({isProfit ? "+" : ""}{formatNumber(profit)}원)
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-800/20">
        {trades.length === 0 ? (
          <div className="px-3 py-3 text-[10px] text-gray-600 text-center">거래 없음 (관망)</div>
        ) : (
          trades.map((t, i) => {
            const isBuy = t.action === "buy"
            const isHold = t.action === "hold"
            return (
              <div key={i} className="px-3 py-2 flex items-start gap-2.5">
                <span className={cn(
                  "shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-md mt-0.5",
                  isBuy ? "bg-red-500/15 text-red-400" :
                  isHold ? "bg-gray-700/40 text-gray-500" :
                  "bg-blue-500/15 text-blue-400",
                )}>
                  {isBuy ? "매수" : isHold ? "관망" : "매도"}
                </span>
                <div className="flex-1 min-w-0">
                  {!isHold && (
                    <div className="text-[10px] text-gray-300 font-bold">
                      {t.day}일차 · {t.quantity}주 × {formatNumber(t.price)}원
                    </div>
                  )}
                  <div className="text-[9px] text-gray-500 mt-0.5 leading-relaxed">{t.reason}</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── 개선 포인트 카드 ──────────────────────────────────────
function ImprovementCard({ stock }: { stock: StockDetailData }) {
  const myRate = stock.myTotalProfitRate
  const bestRate = stock.aiBestProfitRate
  const similarRate = stock.aiSimilarProfitRate
  const diff = bestRate - myRate

  let tip = ""
  if (diff > 5) {
    tip = `최고 AI보다 ${diff.toFixed(1)}%p 낮습니다. 매수 타이밍을 더 일찍 잡거나, 홀딩 기간을 늘려보세요.`
  } else if (diff > 0) {
    tip = `최고 AI와 ${diff.toFixed(1)}%p 차이입니다. 파도 전환점을 조금 더 주의 깊게 살펴보세요.`
  } else if (myRate > bestRate) {
    tip = `최고 AI를 ${Math.abs(diff).toFixed(1)}%p 앞섰습니다! 이 종목 파도 읽기가 탁월합니다.`
  } else {
    tip = "이 종목에서 AI와 비슷한 성과를 냈습니다."
  }

  if (myRate < 0 && similarRate >= 0) {
    tip = `유사 AI는 관망을 선택했습니다. 하락 파도 중 매수는 리스크가 높습니다.`
  }

  return (
    <div className="bg-yellow-500/5 rounded-2xl border border-yellow-500/15 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-yellow-400" />
        <span className="text-[11px] font-bold text-yellow-400">개선 포인트</span>
      </div>
      <p className="text-[11px] text-gray-300 leading-relaxed">{tip}</p>
    </div>
  )
}
