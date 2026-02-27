"use client"

import { useState, useEffect, useMemo } from "react"
import {
  TrendingUp, TrendingDown, Target, Zap, Award,
  ChevronRight, ChevronDown, ChevronUp, Star, Shield, Flame, Swords,
  ShoppingCart, BadgeDollarSign, Wallet, BarChart3,
} from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import { LABELS } from "../config"
import { StockDetailPanel } from "./StockDetailPanel"
import type {
  MiniGameReportProps, TradeRecord, MiniReportHoldingItem, StockDetailData,
} from "../types"

// ── 등급 ──────────────────────────────────────────────────
type Grade = "S" | "A" | "B" | "C" | "D"

function calcGrade(profitRate: number, gapToBest: number): Grade {
  if (profitRate >= 5 && gapToBest >= 0) return "S"
  if (profitRate >= 2 || gapToBest >= -1) return "A"
  if (profitRate >= 0) return "B"
  if (profitRate >= -3) return "C"
  return "D"
}

const GRADE_CONFIG: Record<Grade, { color: string; bg: string; border: string; glow: string; emoji: string; label: string }> = {
  S: { color: "text-yellow-300", bg: "bg-yellow-500/20", border: "border-yellow-400/60", glow: "shadow-yellow-500/40", emoji: "👑", label: "전설적인 투자!" },
  A: { color: "text-green-400",  bg: "bg-green-500/20",  border: "border-green-500/40",  glow: "shadow-green-500/30",  emoji: "🌟", label: "훌륭한 성과!" },
  B: { color: "text-blue-400",   bg: "bg-blue-500/20",   border: "border-blue-500/40",   glow: "shadow-blue-500/30",   emoji: "💪", label: "안정적 투자" },
  C: { color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/40", glow: "shadow-orange-500/30", emoji: "📈", label: "성장 중" },
  D: { color: "text-red-400",    bg: "bg-red-500/20",    border: "border-red-500/40",    glow: "shadow-red-500/30",    emoji: "🔥", label: "도전 계속!" },
}

function pickAchievements(
  profitRate: number, tradeCount: number, holdingsCount: number, gapToSimilar: number,
): { icon: React.ReactNode; text: string }[] {
  const list: { icon: React.ReactNode; text: string }[] = []
  if (profitRate >= 3)                list.push({ icon: <Flame className="w-3.5 h-3.5 text-orange-400" />, text: "수익률 3% 돌파!" })
  if (profitRate >= 0 && profitRate < 3) list.push({ icon: <Shield className="w-3.5 h-3.5 text-blue-400" />, text: "원금 방어 성공" })
  if (tradeCount >= 6)                list.push({ icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />, text: "활발한 트레이더" })
  if (holdingsCount >= 3)             list.push({ icon: <Target className="w-3.5 h-3.5 text-cyan-400" />, text: "분산 투자 실천" })
  if (gapToSimilar > 0)               list.push({ icon: <Swords className="w-3.5 h-3.5 text-purple-400" />, text: "유사 AI 추월!" })
  if (list.length === 0)              list.push({ icon: <Star className="w-3.5 h-3.5 text-gray-400" />, text: "경험치 획득 중" })
  return list.slice(0, 3)
}

// holdingItem → StockDetailData 변환 (3일차 보고서용)
function holdingToStockDetail(
  item: MiniReportHoldingItem,
  trades: TradeRecord[],
  aiSimilarProfitRate: number,
  aiBestProfitRate: number,
): StockDetailData {
  const stockTrades = trades.filter(t => t.stockId === item.stockId || t.stockName === item.stockName)
  const sellTrades = stockTrades.filter(t => t.action === "sell")
  const realizedProfit = sellTrades.reduce((s, t) => s + (t.profit ?? 0), 0)
  const totalProfit = realizedProfit + item.profitAmount
  const totalCost = stockTrades.filter(t => t.action === "buy").reduce((s, t) => s + t.totalAmount, 0)
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : item.profitRate

  // 거래 기반 간이 가격 히스토리 생성
  const priceHistory = stockTrades
    .filter(t => t.turn !== undefined)
    .sort((a, b) => (a.turn ?? 0) - (b.turn ?? 0))
    .map(t => ({ turn: t.turn ?? 0, price: t.price, date: t.date ?? "" }))

  // 현재가 포인트 추가
  if (priceHistory.length === 0 || priceHistory[priceHistory.length - 1].price !== item.currentPrice) {
    priceHistory.push({ turn: (priceHistory[priceHistory.length - 1]?.turn ?? 0) + 3, price: item.currentPrice, date: "현재" })
  }

  return {
    stockId: item.stockId,
    stockName: item.stockName,
    category: "",
    myTotalProfit: totalProfit,
    myTotalProfitRate: Number(totalProfitRate.toFixed(1)),
    myTrades: stockTrades.map(t => ({
      id: t.id,
      stockId: t.stockId,
      stockName: t.stockName,
      action: t.action,
      price: t.price,
      quantity: t.quantity,
      totalAmount: t.totalAmount,
      avgBuyPrice: t.avgBuyPrice,
      profit: t.profit,
      profitRate: t.profitRate,
      date: t.date,
      turn: t.turn,
      day: t.day,
    })),
    currentHolding: item.quantity,
    avgBuyPrice: item.avgPrice,
    currentPrice: item.currentPrice,
    unrealizedProfit: item.profitAmount,
    unrealizedProfitRate: item.profitRate,
    priceHistory,
    // 3일차에서는 AI 거래 상세 없음 — 빈 배열
    aiSimilarTrades: [],
    aiSimilarProfit: 0,
    aiSimilarProfitRate,
    aiBestTrades: [],
    aiBestProfit: 0,
    aiBestProfitRate,
    waveComment: "",
  }
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export const MiniGameReport = ({
  isVisible,
  reportDay,
  periodLabel,
  userProfitRate,
  userTotalValue,
  initialValue,
  cash,
  tradeCount,
  holdingsCount,
  tradeHistory,
  holdingItems,
  assetHistory,
  aiSimilarProfitRate,
  aiSimilarName,
  aiSimilarEmoji,
  aiBestProfitRate,
  aiBestName,
  aiBestEmoji,
  onContinue,
}: MiniGameReportProps) => {
  const [animStep, setAnimStep] = useState(0)
  const [activeTab, setActiveTab] = useState<"overview" | "stocks">("overview")
  const [selectedStock, setSelectedStock] = useState<StockDetailData | null>(null)

  useEffect(() => {
    if (!isVisible) { setAnimStep(0); setActiveTab("overview"); setSelectedStock(null); return }
    const timers = [
      setTimeout(() => setAnimStep(1), 200),
      setTimeout(() => setAnimStep(2), 600),
      setTimeout(() => setAnimStep(3), 1000),
      setTimeout(() => setAnimStep(4), 1400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [isVisible])

  const stats = useMemo(() => {
    const buyTrades = tradeHistory.filter(t => t.action === "buy")
    const sellTrades = tradeHistory.filter(t => t.action === "sell")
    const profitTrades = sellTrades.filter(t => (t.profit ?? 0) > 0)
    const lossTrades = sellTrades.filter(t => (t.profit ?? 0) < 0)
    const winRate = sellTrades.length > 0 ? Math.round((profitTrades.length / sellTrades.length) * 100) : 0
    const totalRealizedProfit = sellTrades.reduce((sum, t) => sum + (t.profit ?? 0), 0)
    const totalBuyAmount = buyTrades.reduce((sum, t) => sum + t.totalAmount, 0)
    const totalSellAmount = sellTrades.reduce((sum, t) => sum + t.totalAmount, 0)
    const unrealizedProfit = holdingItems.reduce((sum, h) => sum + h.profitAmount, 0)
    const totalHoldingValue = holdingItems.reduce((sum, h) => sum + h.currentPrice * h.quantity, 0)
    return {
      buyCount: buyTrades.length, sellCount: sellTrades.length,
      winRate, totalRealizedProfit, totalBuyAmount, totalSellAmount,
      profitTradeCount: profitTrades.length, lossTradeCount: lossTrades.length,
      unrealizedProfit, totalHoldingValue,
    }
  }, [tradeHistory, holdingItems])

  // 주식 상세 데이터 (보유 종목 기반)
  const stockDetails = useMemo(() =>
    holdingItems.map(item =>
      holdingToStockDetail(item, tradeHistory, aiSimilarProfitRate, aiBestProfitRate)
    ),
    [holdingItems, tradeHistory, aiSimilarProfitRate, aiBestProfitRate],
  )

  if (!isVisible) return null

  const profitAmount = userTotalValue - initialValue
  const gapToSimilar = Number((userProfitRate - aiSimilarProfitRate).toFixed(1))
  const gapToBest = Number((userProfitRate - aiBestProfitRate).toFixed(1))
  const grade = calcGrade(userProfitRate, gapToBest)
  const gc = GRADE_CONFIG[grade]
  const achievements = pickAchievements(userProfitRate, tradeCount, holdingsCount, gapToSimilar)

  // 종목 드릴다운 뷰
  if (selectedStock) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0d0d0d] flex flex-col">
        <StockDetailPanel
          stock={selectedStock}
          aiSimilarName={aiSimilarName}
          aiSimilarEmoji={aiSimilarEmoji}
          aiBestName={aiBestName}
          aiBestEmoji={aiBestEmoji}
          onBack={() => setSelectedStock(null)}
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0d] overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-md mx-auto px-4 py-6 pb-10">

        {/* ── 등급 배지 ── */}
        <div className={cn("text-center mb-4 transition-all duration-700", animStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
          <div className={cn(
            "inline-flex items-center justify-center w-20 h-20 rounded-3xl border-2 shadow-xl mb-2",
            gc.bg, gc.border, gc.glow,
            grade === "S" && "animate-pulse",
          )}>
            <span className="text-4xl">{gc.emoji}</span>
          </div>
          <div className={cn("text-2xl font-black tracking-tight mb-0.5", gc.color)}>{grade} 등급</div>
          <p className="text-xs text-gray-400 font-medium">{gc.label}</p>
          <div className="inline-flex items-center gap-2 bg-gray-800/60 rounded-full px-3 py-1 border border-gray-700/40 mt-2">
            <Award className="w-3 h-3 text-yellow-400" />
            <span className="text-[10px] font-bold text-gray-300">
              {LABELS.miniReport.periodTitle.replace("{day}", String(reportDay))}
            </span>
          </div>
        </div>

        {/* ── 수익률 + 자산 흐름 차트 ── */}
        <div className={cn(
          "bg-gradient-to-b from-gray-800/80 to-gray-900/80 rounded-3xl border border-gray-700/50 p-4 mb-4 transition-all duration-700",
          animStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        )}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[9px] text-gray-500 font-bold mb-0.5">{LABELS.miniReport.myResult}</div>
              <div className={cn("text-3xl font-black tracking-tight", userProfitRate >= 0 ? "text-red-400" : "text-blue-400")}>
                {userProfitRate >= 0 ? "+" : ""}{userProfitRate}%
              </div>
              <div className={cn("text-sm font-bold mt-0.5", profitAmount >= 0 ? "text-red-400/70" : "text-blue-400/70")}>
                {profitAmount >= 0 ? "+" : ""}{formatNumber(profitAmount)}원
              </div>
            </div>
            <div className="text-right text-[10px] text-gray-500">
              <div>{formatNumber(initialValue)}원 → {formatNumber(userTotalValue)}원</div>
              <div className="mt-0.5">{reportDay}일차 기준</div>
            </div>
          </div>

          {/* 자산 흐름 미니 차트 */}
          {assetHistory.length > 2 && (
            <div className="h-20 bg-gray-900/40 rounded-xl p-1.5 border border-gray-700/20 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={assetHistory}>
                  <defs>
                    <linearGradient id="miniReportGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={userProfitRate >= 0 ? "#ef4444" : "#3b82f6"} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={userProfitRate >= 0 ? "#ef4444" : "#3b82f6"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="turn" hide />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Area type="monotone" dataKey="value" stroke={userProfitRate >= 0 ? "#ef4444" : "#3b82f6"} strokeWidth={2} fill="url(#miniReportGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 3자 수익률 비교 */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-blue-500/10 rounded-xl p-2 text-center border border-blue-500/20">
              <div className="text-[8px] text-gray-500 mb-0.5">나</div>
              <div className={cn("text-xs font-extrabold", userProfitRate >= 0 ? "text-red-400" : "text-blue-400")}>
                {userProfitRate >= 0 ? "+" : ""}{userProfitRate}%
              </div>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-2 text-center border border-purple-500/20">
              <div className="text-[8px] text-gray-500 mb-0.5 truncate">{aiSimilarEmoji} {aiSimilarName}</div>
              <div className={cn("text-xs font-extrabold", aiSimilarProfitRate >= 0 ? "text-red-400" : "text-blue-400")}>
                {aiSimilarProfitRate >= 0 ? "+" : ""}{aiSimilarProfitRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-yellow-500/10 rounded-xl p-2 text-center border border-yellow-500/20">
              <div className="text-[8px] text-gray-500 mb-0.5 truncate">{aiBestEmoji} {aiBestName}</div>
              <div className={cn("text-xs font-extrabold", aiBestProfitRate >= 0 ? "text-red-400" : "text-blue-400")}>
                {aiBestProfitRate >= 0 ? "+" : ""}{aiBestProfitRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* ── 탭 ── */}
        <div className={cn("flex bg-gray-800/50 rounded-xl p-0.5 gap-0.5 mb-4 transition-all duration-700", animStep >= 3 ? "opacity-100" : "opacity-0")}>
          <button
            onClick={() => setActiveTab("overview")}
            className={cn("flex-1 py-2.5 rounded-lg text-xs font-bold transition-all", activeTab === "overview" ? "bg-gray-600 text-white" : "text-gray-500 hover:text-gray-300")}
          >
            {LABELS.miniReport.tabSummary}
          </button>
          <button
            onClick={() => setActiveTab("stocks")}
            className={cn("flex-1 py-2.5 rounded-lg text-xs font-bold transition-all", activeTab === "stocks" ? "bg-gray-600 text-white" : "text-gray-500 hover:text-gray-300")}
          >
            주식 상세
          </button>
        </div>

        {/* ── 탭 콘텐츠 ── */}
        <div className={cn("transition-all duration-700 mb-6", animStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>

          {/* 종합 탭 */}
          {activeTab === "overview" && (
            <div className="space-y-3">
              {/* 통계 그리드 */}
              <div className="grid grid-cols-4 gap-1.5">
                <MiniStatCard label={LABELS.miniReport.totalTrades} value={String(tradeHistory.length)} />
                <MiniStatCard label={LABELS.miniReport.buyLabel} value={String(stats.buyCount)} valueColor="text-red-400" />
                <MiniStatCard label={LABELS.miniReport.sellLabel} value={String(stats.sellCount)} valueColor="text-blue-400" />
                <MiniStatCard
                  label={LABELS.miniReport.winRateLabel}
                  value={`${stats.winRate}%`}
                  valueColor={stats.winRate >= 50 ? "text-green-400" : "text-orange-400"}
                />
              </div>

              {/* 실현/미실현 수익 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/20">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <BadgeDollarSign className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[9px] text-gray-500 font-bold">{LABELS.miniReport.realizedProfit}</span>
                  </div>
                  <div className={cn("text-sm font-extrabold", stats.totalRealizedProfit >= 0 ? "text-red-400" : "text-blue-400")}>
                    {stats.totalRealizedProfit >= 0 ? "+" : ""}{formatNumber(stats.totalRealizedProfit)}원
                  </div>
                  <div className="text-[9px] text-gray-600 mt-0.5">
                    수익 {stats.profitTradeCount} / 손실 {stats.lossTradeCount}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/20">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[9px] text-gray-500 font-bold">{LABELS.miniReport.unrealizedProfit}</span>
                  </div>
                  <div className={cn("text-sm font-extrabold", stats.unrealizedProfit >= 0 ? "text-red-400" : "text-blue-400")}>
                    {stats.unrealizedProfit >= 0 ? "+" : ""}{formatNumber(stats.unrealizedProfit)}원
                  </div>
                  <div className="text-[9px] text-gray-600 mt-0.5">{holdingsCount}종목 보유 중</div>
                </div>
              </div>

              {/* 현금 + 주식 자산 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Wallet className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[9px] text-gray-500 font-bold">{LABELS.miniReport.cashLabel}</span>
                  </div>
                  <div className="text-sm font-extrabold text-white">{formatNumber(cash)}원</div>
                  <div className="text-[9px] text-gray-600 mt-0.5">
                    {userTotalValue > 0 ? `${((cash / userTotalValue) * 100).toFixed(0)}%` : "0%"}
                  </div>
                </div>
                <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[9px] text-gray-500 font-bold">{LABELS.miniReport.stockValueLabel}</span>
                  </div>
                  <div className="text-sm font-extrabold text-white">{formatNumber(stats.totalHoldingValue)}원</div>
                  <div className="text-[9px] text-gray-600 mt-0.5">
                    {userTotalValue > 0 ? `${((stats.totalHoldingValue / userTotalValue) * 100).toFixed(0)}%` : "0%"}
                  </div>
                </div>
              </div>

              {/* 업적 */}
              <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-[11px] font-bold text-white">{LABELS.miniReport.achievementsTitle}</span>
                </div>
                <div className="space-y-1.5">
                  {achievements.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-900/40 rounded-lg px-2.5 py-2 border border-gray-700/20">
                      {a.icon}
                      <span className="text-[10px] font-bold text-gray-200">{a.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 거래 내역 요약 (최근 3건) */}
              {tradeHistory.length > 0 && (
                <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-gray-700/30 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300">최근 거래</span>
                    <span className="text-[9px] text-gray-600">총 {tradeHistory.length}건</span>
                  </div>
                  <div className="divide-y divide-gray-800/30">
                    {tradeHistory.slice(-3).reverse().map((trade, i) => (
                      <TradeRow key={trade.id || i} trade={trade} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 주식 상세 탭 */}
          {activeTab === "stocks" && (
            <div className="space-y-2">
              {stockDetails.length === 0 ? (
                <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 px-4 py-10 text-center">
                  <div className="text-3xl mb-3">📦</div>
                  <div className="text-sm text-gray-500">보유 종목이 없습니다</div>
                </div>
              ) : (
                stockDetails.map(stock => (
                  <MiniStockCard
                    key={stock.stockId}
                    stock={stock}
                    aiSimilarName={aiSimilarName}
                    aiSimilarEmoji={aiSimilarEmoji}
                    aiBestName={aiBestName}
                    aiBestEmoji={aiBestEmoji}
                    onClick={() => setSelectedStock(stock)}
                  />
                ))
              )}

              {/* 매도 완료 종목 (보유 없음) */}
              {(() => {
                const tradedIds = new Set(tradeHistory.map(t => t.stockId).filter(Boolean))
                const holdingIds = new Set(holdingItems.map(h => h.stockId))
                const soldIds = [...tradedIds].filter(id => !holdingIds.has(id!))
                const soldTrades = soldIds.map(id => {
                  const trades = tradeHistory.filter(t => t.stockId === id)
                  const name = trades[0]?.stockName ?? id ?? ""
                  const profit = trades.filter(t => t.action === "sell").reduce((s, t) => s + (t.profit ?? 0), 0)
                  const profitRate = trades.filter(t => t.action === "sell").reduce((s, t) => s + (t.profitRate ?? 0), 0)
                  return { id, name, profit, profitRate, trades }
                })
                if (soldTrades.length === 0) return null
                return (
                  <div className="mt-2">
                    <div className="text-[10px] text-gray-600 font-bold px-1 mb-1.5">매도 완료 종목</div>
                    {soldTrades.map(s => (
                      <div key={s.id} className="bg-gray-800/30 rounded-xl border border-gray-700/20 px-3 py-2.5 mb-1.5 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-bold text-gray-400">{s.name}</div>
                          <div className="text-[9px] text-gray-600 mt-0.5">{s.trades.length}건 거래 완료</div>
                        </div>
                        <div className="text-right">
                          <div className={cn("text-xs font-extrabold", s.profit >= 0 ? "text-red-400" : "text-blue-400")}>
                            {s.profit >= 0 ? "+" : ""}{formatNumber(s.profit)}원
                          </div>
                          <div className={cn("text-[9px]", s.profitRate >= 0 ? "text-red-400/60" : "text-blue-400/60")}>
                            {s.profitRate >= 0 ? "+" : ""}{s.profitRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        {/* ── 다음 날 버튼 ── */}
        <button
          onClick={onContinue}
          className={cn(
            "w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2",
            animStep >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          {LABELS.miniReport.continueButton}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// ── 종목 카드 (주식 상세 탭) ──────────────────────────────
function MiniStockCard({
  stock, aiSimilarName, aiSimilarEmoji, aiBestName, aiBestEmoji, onClick,
}: {
  stock: StockDetailData
  aiSimilarName: string; aiSimilarEmoji: string
  aiBestName: string; aiBestEmoji: string
  onClick: () => void
}) {
  const isProfit = stock.unrealizedProfitRate >= 0
  const buyCount = stock.myTrades.filter(t => t.action === "buy").length
  const sellCount = stock.myTrades.filter(t => t.action === "sell").length

  return (
    <button
      onClick={onClick}
      className="w-full bg-gray-800/50 rounded-2xl border border-gray-700/30 p-4 text-left active:scale-[0.98] transition-all hover:border-gray-600/50 hover:bg-gray-800/70"
    >
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white">{stock.stockName}</span>
            <span className="text-[9px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">
              {stock.currentHolding}주 보유
            </span>
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {stock.myTrades.length}건 거래 · {buyCount}매수 {sellCount}매도
          </div>
        </div>
        <div className="text-right">
          <div className={cn("text-base font-extrabold", isProfit ? "text-red-400" : "text-blue-400")}>
            {isProfit ? "+" : ""}{stock.unrealizedProfitRate.toFixed(1)}%
          </div>
          <div className={cn("text-[10px] font-bold", isProfit ? "text-red-400/60" : "text-blue-400/60")}>
            {isProfit ? "+" : ""}{formatNumber(stock.unrealizedProfit)}원
          </div>
        </div>
      </div>

      {/* 평균매수가 / 현재가 */}
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        <div className="bg-gray-900/40 rounded-lg px-2.5 py-1.5">
          <div className="text-[8px] text-gray-600 mb-0.5">평균 매수가</div>
          <div className="text-[11px] font-bold text-gray-300">{formatNumber(stock.avgBuyPrice)}원</div>
        </div>
        <div className="bg-gray-900/40 rounded-lg px-2.5 py-1.5">
          <div className="text-[8px] text-gray-600 mb-0.5">현재가</div>
          <div className={cn("text-[11px] font-bold", isProfit ? "text-red-400" : "text-blue-400")}>
            {formatNumber(stock.currentPrice)}원
          </div>
        </div>
      </div>

      {/* AI 비교 미니 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-900/40 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
          <span className="text-[9px] text-gray-500 truncate">{aiSimilarEmoji} {aiSimilarName}</span>
          <span className={cn("text-[10px] font-extrabold ml-1 shrink-0", stock.aiSimilarProfitRate >= 0 ? "text-red-400" : "text-blue-400")}>
            {stock.aiSimilarProfitRate >= 0 ? "+" : ""}{stock.aiSimilarProfitRate.toFixed(1)}%
          </span>
        </div>
        <div className="bg-gray-900/40 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
          <span className="text-[9px] text-gray-500 truncate">{aiBestEmoji} {aiBestName}</span>
          <span className={cn("text-[10px] font-extrabold ml-1 shrink-0", stock.aiBestProfitRate >= 0 ? "text-red-400" : "text-blue-400")}>
            {stock.aiBestProfitRate >= 0 ? "+" : ""}{stock.aiBestProfitRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 수익률 바 */}
      <div className="mt-2.5 flex items-center gap-2">
        <div className="flex-1 bg-gray-700/30 rounded-full h-1.5 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", isProfit ? "bg-red-400" : "bg-blue-400")}
            style={{ width: `${Math.min(100, Math.abs(stock.unrealizedProfitRate) * 5 + 10)}%` }}
          />
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
      </div>
    </button>
  )
}

// ── 미니 통계 카드 ────────────────────────────────────────
function MiniStatCard({ label, value, valueColor = "text-white" }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="bg-gray-800/40 rounded-xl p-2.5 text-center border border-gray-700/20">
      <div className="text-[8px] text-gray-500 mb-0.5">{label}</div>
      <div className={cn("text-base font-extrabold", valueColor)}>{value}</div>
    </div>
  )
}

// ── 거래 내역 행 ──────────────────────────────────────────
function TradeRow({ trade }: { trade: TradeRecord }) {
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
          <span className="text-[11px] font-bold text-white truncate">{trade.stockName}</span>
          {trade.day && <span className="text-[8px] text-gray-600 shrink-0">{trade.day}일차</span>}
        </div>
        <div className="text-[9px] text-gray-500 mt-0.5">
          {trade.quantity}주 × {formatNumber(trade.price)}원 = {formatNumber(trade.totalAmount)}원
        </div>
      </div>
      {!isBuy && (
        <div className="shrink-0 text-right">
          <div className={cn("text-[11px] font-extrabold", profit >= 0 ? "text-red-400" : "text-blue-400")}>
            {profit >= 0 ? "+" : ""}{formatNumber(profit)}원
          </div>
          <div className={cn("text-[9px] font-bold", profitRate >= 0 ? "text-red-400/70" : "text-blue-400/70")}>
            {profitRate >= 0 ? "+" : ""}{profitRate.toFixed(1)}%
          </div>
        </div>
      )}
      {isBuy && (
        <div className="shrink-0 text-right">
          <div className="text-[11px] font-bold text-gray-300">{formatNumber(trade.totalAmount)}원</div>
        </div>
      )}
    </div>
  )
}
