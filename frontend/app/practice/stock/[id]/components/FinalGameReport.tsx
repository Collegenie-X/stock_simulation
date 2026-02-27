"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Trophy, TrendingUp, TrendingDown, Target, Zap, Award,
  ChevronRight, ChevronDown, ChevronUp, Star, Shield, Flame,
  Swords, BarChart3, PieChart, Calendar, Wallet,
  Crown, Medal, Home, ShoppingCart, BadgeDollarSign,
} from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, Legend,
} from "recharts"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import { LABELS } from "../config"
import { StockDetailPanel } from "./StockDetailPanel"
import type {
  FinalGameReportProps, FinalGameReportTradeRecord,
  StockDetailData, AssetHistoryPoint,
} from "../types"

// ── 등급 ─────────────────────────────────────────────────
type FinalGrade = "S+" | "S" | "A" | "B" | "C" | "D" | "F"

function calcFinalGrade(profitRate: number, gapToBest: number, tradeCount: number, totalDays: number): FinalGrade {
  const score =
    (profitRate >= 10 ? 40 : profitRate >= 5 ? 30 : profitRate >= 0 ? 20 : profitRate >= -5 ? 10 : 0) +
    (gapToBest >= 0 ? 30 : gapToBest >= -3 ? 20 : gapToBest >= -7 ? 10 : 0) +
    (tradeCount >= totalDays ? 20 : tradeCount >= totalDays * 0.5 ? 15 : 5) + 10
  if (score >= 90) return "S+"
  if (score >= 80) return "S"
  if (score >= 65) return "A"
  if (score >= 50) return "B"
  if (score >= 35) return "C"
  if (score >= 20) return "D"
  return "F"
}

const FINAL_GRADE_CONFIG: Record<FinalGrade, { color: string; bg: string; border: string; glow: string; emoji: string; title: string; subtitle: string }> = {
  "S+": { color: "text-yellow-300", bg: "bg-gradient-to-br from-yellow-500/30 to-amber-600/20", border: "border-yellow-400/50", glow: "shadow-yellow-500/50", emoji: "👑", title: "전설의 투자자", subtitle: "AI도 인정하는 실력!" },
  S:   { color: "text-yellow-400", bg: "bg-gradient-to-br from-yellow-500/20 to-amber-600/10", border: "border-yellow-500/40", glow: "shadow-yellow-500/30", emoji: "🏆", title: "마스터 투자자", subtitle: "놀라운 성과입니다!" },
  A:   { color: "text-green-400",  bg: "bg-gradient-to-br from-green-500/20 to-emerald-600/10", border: "border-green-500/40",  glow: "shadow-green-500/30",  emoji: "🌟", title: "숙련된 투자자", subtitle: "꾸준한 성장세!" },
  B:   { color: "text-blue-400",   bg: "bg-gradient-to-br from-blue-500/20 to-sky-600/10",     border: "border-blue-500/40",   glow: "shadow-blue-500/30",   emoji: "💎", title: "안정적 투자자", subtitle: "기본기가 탄탄합니다" },
  C:   { color: "text-orange-400", bg: "bg-gradient-to-br from-orange-500/20 to-amber-600/10", border: "border-orange-500/40", glow: "shadow-orange-500/30", emoji: "📈", title: "성장하는 투자자", subtitle: "경험이 쌓이고 있어요" },
  D:   { color: "text-red-400",    bg: "bg-gradient-to-br from-red-500/20 to-rose-600/10",     border: "border-red-500/40",    glow: "shadow-red-500/30",    emoji: "🔥", title: "도전적 투자자", subtitle: "실패도 경험입니다!" },
  F:   { color: "text-gray-400",   bg: "bg-gradient-to-br from-gray-600/20 to-gray-700/10",    border: "border-gray-500/40",   glow: "shadow-gray-500/20",   emoji: "💪", title: "초보 투자자", subtitle: "다시 도전해 보세요!" },
}

// ── 업적 ─────────────────────────────────────────────────
function buildAchievements(
  profitRate: number, tradeCount: number, holdingsCount: number,
  gapToSimilar: number, gapToBest: number, totalDays: number, winRate: number,
): { icon: React.ReactNode; text: string; rarity: "common" | "rare" | "epic" | "legendary" }[] {
  const list: { icon: React.ReactNode; text: string; rarity: "common" | "rare" | "epic" | "legendary" }[] = []
  if (gapToBest >= 0)          list.push({ icon: <Crown className="w-4 h-4" />,     text: "최고 AI 격파!",        rarity: "legendary" })
  if (profitRate >= 10)        list.push({ icon: <Flame className="w-4 h-4" />,     text: "수익률 10% 돌파",      rarity: "epic" })
  else if (profitRate >= 5)    list.push({ icon: <TrendingUp className="w-4 h-4" />, text: "수익률 5% 달성",       rarity: "rare" })
  if (gapToSimilar > 0)        list.push({ icon: <Swords className="w-4 h-4" />,    text: "유사 AI 승리",         rarity: "rare" })
  if (tradeCount >= totalDays * 2) list.push({ icon: <Zap className="w-4 h-4" />,   text: "적극적 트레이더",      rarity: "common" })
  if (holdingsCount >= 5)      list.push({ icon: <PieChart className="w-4 h-4" />,  text: "분산 투자 마스터",     rarity: "rare" })
  if (profitRate >= 0)         list.push({ icon: <Shield className="w-4 h-4" />,    text: "원금 수호자",          rarity: "common" })
  if (winRate >= 70)           list.push({ icon: <Target className="w-4 h-4" />,    text: "높은 승률 달성",       rarity: "epic" })
  if (list.length === 0)       list.push({ icon: <Star className="w-4 h-4" />,      text: "첫 게임 완료!",        rarity: "common" })
  return list.slice(0, 5)
}

const RARITY_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  common:    { bg: "bg-gray-700/30",     border: "border-gray-600/30",    text: "text-gray-300" },
  rare:      { bg: "bg-blue-500/10",     border: "border-blue-500/20",    text: "text-blue-400" },
  epic:      { bg: "bg-purple-500/10",   border: "border-purple-500/20",  text: "text-purple-400" },
  legendary: { bg: "bg-yellow-500/10",   border: "border-yellow-500/20",  text: "text-yellow-400" },
}

// ── 자산 차트 툴팁 ────────────────────────────────────────
function AssetTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900/95 border border-gray-700/60 rounded-xl px-3 py-2 shadow-xl text-[10px] space-y-1">
      <div className="text-gray-400">턴 {label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="font-bold text-white">{formatNumber(p.value)}원</span>
        </div>
      ))}
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export const FinalGameReport = ({
  isVisible,
  totalDays,
  userProfitRate,
  userTotalValue,
  initialValue,
  cash,
  holdings,
  tradeHistory,
  weeklyHistory,
  assetHistory,
  stockDetails,
  aiSimilarName,
  aiSimilarEmoji,
  aiSimilarProfitRate,
  aiSimilarTotalValue,
  aiBestName,
  aiBestEmoji,
  aiBestProfitRate,
  aiBestTotalValue,
  onGoHome,
  onPlayAgain,
}: FinalGameReportProps) => {
  const [animStep, setAnimStep] = useState(0)
  const [activeTab, setActiveTab] = useState<"overview" | "stocks">("overview")
  const [selectedStock, setSelectedStock] = useState<StockDetailData | null>(null)
  const [showAllAchievements, setShowAllAchievements] = useState(false)

  useEffect(() => {
    if (!isVisible) { setAnimStep(0); setSelectedStock(null); setActiveTab("overview"); return }
    const timers = [
      setTimeout(() => setAnimStep(1), 300),
      setTimeout(() => setAnimStep(2), 800),
      setTimeout(() => setAnimStep(3), 1300),
      setTimeout(() => setAnimStep(4), 1800),
      setTimeout(() => setAnimStep(5), 2300),
    ]
    return () => timers.forEach(clearTimeout)
  }, [isVisible])

  const stats = useMemo(() => {
    const profitAmount = userTotalValue - initialValue
    const gapToSimilar = Number((userProfitRate - aiSimilarProfitRate).toFixed(1))
    const gapToBest = Number((userProfitRate - aiBestProfitRate).toFixed(1))
    const buyTrades = tradeHistory.filter(t => t.action === "buy")
    const sellTrades = tradeHistory.filter(t => t.action === "sell")
    const profitTrades = sellTrades.filter(t => (t.profit ?? 0) > 0)
    const lossTrades = sellTrades.filter(t => (t.profit ?? 0) < 0)
    const winRate = sellTrades.length > 0 ? Math.round((profitTrades.length / sellTrades.length) * 100) : 0
    const totalRealizedProfit = sellTrades.reduce((sum, t) => sum + (t.profit ?? 0), 0)
    const bestTrade = sellTrades.length > 0 ? sellTrades.reduce((b, t) => (t.profit ?? 0) > (b.profit ?? 0) ? t : b, sellTrades[0]) : null
    const worstTrade = sellTrades.length > 0 ? sellTrades.reduce((w, t) => (t.profit ?? 0) < (w.profit ?? 0) ? t : w, sellTrades[0]) : null
    const holdingsCount = Object.keys(holdings).filter(k => holdings[k] > 0).length
    const grade = calcFinalGrade(userProfitRate, gapToBest, tradeHistory.length, totalDays)
    const achievements = buildAchievements(userProfitRate, tradeHistory.length, holdingsCount, gapToSimilar, gapToBest, totalDays, winRate)
    return { profitAmount, gapToSimilar, gapToBest, buyCount: buyTrades.length, sellCount: sellTrades.length, winRate, totalRealizedProfit, profitTradeCount: profitTrades.length, lossTradeCount: lossTrades.length, bestTrade, worstTrade, holdingsCount, grade, achievements }
  }, [userProfitRate, userTotalValue, initialValue, aiSimilarProfitRate, aiBestProfitRate, tradeHistory, holdings, totalDays])

  if (!isVisible) return null

  const gc = FINAL_GRADE_CONFIG[stats.grade]

  // 종목 상세 드릴다운 뷰
  if (selectedStock) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0d0d0d] flex flex-col">
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

  // 자산 차트 데이터 (AI 포함)
  const chartData: AssetHistoryPoint[] = assetHistory && assetHistory.length > 0
    ? assetHistory
    : weeklyHistory.map(w => ({ turn: w.turn, value: w.value }))

  return (
    <div className="fixed inset-0 z-[100] bg-[#0d0d0d] overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-md mx-auto px-4 py-6 pb-10">

        {/* ── 등급 ── */}
        <div className={cn("text-center mb-5 transition-all duration-1000", animStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="text-[10px] text-gray-500 font-bold mb-3">{LABELS.finalReport.gameComplete}</div>
          <div className={cn("inline-flex items-center justify-center w-24 h-24 rounded-[2rem] border-2 shadow-2xl mb-3", gc.bg, gc.border, gc.glow, stats.grade === "S+" && "animate-pulse")}>
            <span className="text-5xl">{gc.emoji}</span>
          </div>
          <div className={cn("text-4xl font-black tracking-tight mb-1", gc.color)}>{stats.grade} {LABELS.finalReport.gradeLabel}</div>
          <div className="text-sm font-bold text-white mb-0.5">{gc.title}</div>
          <p className="text-xs text-gray-400">{gc.subtitle}</p>
        </div>

        {/* ── 최종 수익률 ── */}
        <div className={cn("bg-gradient-to-b from-gray-800/80 to-gray-900/80 rounded-3xl border border-gray-700/50 p-4 mb-4 transition-all duration-700", animStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[9px] text-gray-500 font-bold mb-0.5">{LABELS.finalReport.finalReturn}</div>
              <div className={cn("text-4xl font-black tracking-tight", userProfitRate >= 0 ? "text-red-400" : "text-blue-400")}>
                {userProfitRate >= 0 ? "+" : ""}{userProfitRate}%
              </div>
              <div className={cn("text-sm font-bold mt-0.5", stats.profitAmount >= 0 ? "text-red-400/70" : "text-blue-400/70")}>
                {stats.profitAmount >= 0 ? "+" : ""}{formatNumber(stats.profitAmount)}원
              </div>
            </div>
            <div className="text-right text-[10px] text-gray-500 space-y-1">
              <div>{formatNumber(initialValue)}원 → {formatNumber(userTotalValue)}원</div>
              <div>{totalDays}일 플레이</div>
            </div>
          </div>

          {/* 자산 흐름 차트 (3선: 나 / 유사AI / 최고AI) */}
          {chartData.length > 2 && (
            <div className="h-32 bg-gray-900/40 rounded-xl p-1.5 border border-gray-700/20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="myGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={userProfitRate >= 0 ? "#ef4444" : "#3b82f6"} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={userProfitRate >= 0 ? "#ef4444" : "#3b82f6"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="turn" hide />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip content={<AssetTooltip />} />
                  <Area type="monotone" dataKey="value" name="나" stroke={userProfitRate >= 0 ? "#ef4444" : "#3b82f6"} strokeWidth={2.5} fill="url(#myGrad)" />
                  {chartData[0]?.aiSimilar !== undefined && (
                    <Area type="monotone" dataKey="aiSimilar" name={aiSimilarName} stroke="#a78bfa" strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
                  )}
                  {chartData[0]?.aiBest !== undefined && (
                    <Area type="monotone" dataKey="aiBest" name={aiBestName} stroke="#f59e0b" strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 3자 수익률 비교 */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-blue-500/10 rounded-xl p-2 text-center border border-blue-500/20">
              <div className="text-[8px] text-gray-500 mb-0.5">나</div>
              <div className={cn("text-sm font-extrabold", userProfitRate >= 0 ? "text-red-400" : "text-blue-400")}>
                {userProfitRate >= 0 ? "+" : ""}{userProfitRate}%
              </div>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-2 text-center border border-purple-500/20">
              <div className="text-[8px] text-gray-500 mb-0.5 truncate">{aiSimilarEmoji} {aiSimilarName}</div>
              <div className={cn("text-sm font-extrabold", aiSimilarProfitRate >= 0 ? "text-red-400" : "text-blue-400")}>
                {aiSimilarProfitRate >= 0 ? "+" : ""}{aiSimilarProfitRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-yellow-500/10 rounded-xl p-2 text-center border border-yellow-500/20">
              <div className="text-[8px] text-gray-500 mb-0.5 truncate">{aiBestEmoji} {aiBestName}</div>
              <div className={cn("text-sm font-extrabold", aiBestProfitRate >= 0 ? "text-red-400" : "text-blue-400")}>
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
            {LABELS.finalReport.tabOverview}
          </button>
          <button
            onClick={() => setActiveTab("stocks")}
            className={cn("flex-1 py-2.5 rounded-lg text-xs font-bold transition-all", activeTab === "stocks" ? "bg-gray-600 text-white" : "text-gray-500 hover:text-gray-300")}
          >
            {LABELS.finalReport.tabStocks}
          </button>
        </div>

        {/* ── 탭 콘텐츠 ── */}
        <div className={cn("transition-all duration-700 mb-6", animStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>

          {/* 종합 탭 */}
          {activeTab === "overview" && (
            <div className="space-y-3">
              {/* 통계 그리드 */}
              <div className="grid grid-cols-2 gap-2">
                <StatCard label={LABELS.finalReport.totalDays} value={`${totalDays}일`} icon={<Calendar className="w-3.5 h-3.5 text-cyan-400" />} />
                <StatCard label={LABELS.finalReport.totalTrades} value={`${tradeHistory.length}회`} icon={<BarChart3 className="w-3.5 h-3.5 text-green-400" />} />
                <StatCard label={LABELS.finalReport.winRate} value={`${stats.winRate}%`} icon={<Target className="w-3.5 h-3.5 text-yellow-400" />} />
                <StatCard label={LABELS.finalReport.holdingStocks} value={`${stats.holdingsCount}종목`} icon={<Wallet className="w-3.5 h-3.5 text-purple-400" />} />
              </div>

              {/* 매수/매도/실현수익 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800/40 rounded-xl p-3 text-center border border-gray-700/20">
                  <div className="text-[9px] text-gray-500 mb-1">{LABELS.finalReport.buyCount}</div>
                  <div className="text-lg font-extrabold text-red-400">{stats.buyCount}</div>
                </div>
                <div className="bg-gray-800/40 rounded-xl p-3 text-center border border-gray-700/20">
                  <div className="text-[9px] text-gray-500 mb-1">{LABELS.finalReport.sellCount}</div>
                  <div className="text-lg font-extrabold text-blue-400">{stats.sellCount}</div>
                </div>
                <div className="bg-gray-800/40 rounded-xl p-3 text-center border border-gray-700/20">
                  <div className="text-[9px] text-gray-500 mb-1">{LABELS.finalReport.realizedProfit}</div>
                  <div className={cn("text-sm font-extrabold", stats.totalRealizedProfit >= 0 ? "text-red-400" : "text-blue-400")}>
                    {stats.totalRealizedProfit >= 0 ? "+" : ""}{formatNumber(stats.totalRealizedProfit)}
                  </div>
                </div>
              </div>

              {/* 최고/최악 거래 */}
              {(stats.bestTrade || stats.worstTrade) && (
                <div className="grid grid-cols-2 gap-2">
                  {stats.bestTrade && (
                    <div className="bg-red-500/5 rounded-xl border border-red-500/15 p-3">
                      <div className="text-[9px] text-gray-500 mb-1">{LABELS.finalReport.bestTrade}</div>
                      <div className="text-xs font-bold text-white truncate">{stats.bestTrade.stockName}</div>
                      <div className="text-sm font-extrabold text-red-400 mt-0.5">+{formatNumber(stats.bestTrade.profit ?? 0)}원</div>
                    </div>
                  )}
                  {stats.worstTrade && (
                    <div className="bg-blue-500/5 rounded-xl border border-blue-500/15 p-3">
                      <div className="text-[9px] text-gray-500 mb-1">{LABELS.finalReport.worstTrade}</div>
                      <div className="text-xs font-bold text-white truncate">{stats.worstTrade.stockName}</div>
                      <div className="text-sm font-extrabold text-blue-400 mt-0.5">{formatNumber(stats.worstTrade.profit ?? 0)}원</div>
                    </div>
                  )}
                </div>
              )}

              {/* 업적 */}
              <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-bold text-white">{LABELS.finalReport.achievementsTitle}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold">{stats.achievements.length}개 획득</span>
                </div>
                <div className="space-y-2">
                  {(showAllAchievements ? stats.achievements : stats.achievements.slice(0, 3)).map((a, i) => {
                    const rs = RARITY_STYLE[a.rarity]
                    return (
                      <div key={i} className={cn("flex items-center gap-2.5 rounded-xl px-3 py-2.5 border", rs.bg, rs.border)}>
                        <div className={rs.text}>{a.icon}</div>
                        <span className={cn("text-[11px] font-bold", rs.text)}>{a.text}</span>
                        <span className="ml-auto text-[8px] font-bold text-gray-600 uppercase">{a.rarity}</span>
                      </div>
                    )
                  })}
                </div>
                {stats.achievements.length > 3 && (
                  <button onClick={() => setShowAllAchievements(v => !v)} className="w-full mt-2 text-[10px] text-gray-500 font-bold flex items-center justify-center gap-1">
                    {showAllAchievements ? "접기" : `+${stats.achievements.length - 3}개 더보기`}
                    {showAllAchievements ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* 최종 순위 */}
              <FinalRanking
                userRate={userProfitRate} userValue={userTotalValue}
                simRate={aiSimilarProfitRate} simValue={aiSimilarTotalValue} simName={aiSimilarName} simEmoji={aiSimilarEmoji}
                bestRate={aiBestProfitRate} bestValue={aiBestTotalValue} bestName={aiBestName} bestEmoji={aiBestEmoji}
                initialValue={initialValue}
              />
            </div>
          )}

          {/* 주식 상세 탭 */}
          {activeTab === "stocks" && (
            <div className="space-y-2">
              {(!stockDetails || stockDetails.length === 0) ? (
                <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 px-4 py-10 text-center">
                  <div className="text-3xl mb-3">📊</div>
                  <div className="text-sm text-gray-500">종목 상세 데이터가 없습니다</div>
                </div>
              ) : (
                stockDetails.map(stock => (
                  <StockCard
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
            </div>
          )}
        </div>

        {/* ── 액션 버튼 ── */}
        <div className={cn("space-y-2 transition-all duration-700", animStep >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
          <button onClick={onPlayAgain} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
            {LABELS.finalReport.playAgain}
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={onGoHome} className="w-full py-3.5 bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-gray-700/30">
            <Home className="w-4 h-4" />
            {LABELS.finalReport.goHome}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 종목 카드 (탭 목록) ───────────────────────────────────
function StockCard({
  stock, aiSimilarName, aiSimilarEmoji, aiBestName, aiBestEmoji, onClick,
}: {
  stock: StockDetailData
  aiSimilarName: string; aiSimilarEmoji: string
  aiBestName: string; aiBestEmoji: string
  onClick: () => void
}) {
  const isProfit = stock.myTotalProfitRate >= 0
  const hasHolding = stock.currentHolding > 0

  return (
    <button
      onClick={onClick}
      className="w-full bg-gray-800/50 rounded-2xl border border-gray-700/30 p-4 text-left active:scale-[0.98] transition-all hover:border-gray-600/50 hover:bg-gray-800/70"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white">{stock.stockName}</span>
            <span className="text-[9px] font-bold text-gray-500 bg-gray-700/50 px-1.5 py-0.5 rounded-full">{stock.category}</span>
            {hasHolding && (
              <span className="text-[9px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">보유중</span>
            )}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {stock.myTrades.length}건 거래 · {stock.myTrades.filter(t => t.action === "buy").length}매수 {stock.myTrades.filter(t => t.action === "sell").length}매도
          </div>
        </div>
        <div className="text-right">
          <div className={cn("text-base font-extrabold", isProfit ? "text-red-400" : "text-blue-400")}>
            {isProfit ? "+" : ""}{stock.myTotalProfitRate.toFixed(1)}%
          </div>
          <div className={cn("text-[10px] font-bold", isProfit ? "text-red-400/60" : "text-blue-400/60")}>
            {isProfit ? "+" : ""}{formatNumber(stock.myTotalProfit)}원
          </div>
        </div>
      </div>

      {/* AI 비교 미니 바 */}
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

      {/* 미니 수익률 바 */}
      <div className="mt-2.5 flex items-center gap-2">
        <div className="flex-1 bg-gray-700/30 rounded-full h-1.5 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", isProfit ? "bg-red-400" : "bg-blue-400")}
            style={{ width: `${Math.min(100, Math.abs(stock.myTotalProfitRate) * 4 + 10)}%` }}
          />
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
      </div>
    </button>
  )
}

// ── 최종 순위 ─────────────────────────────────────────────
function FinalRanking({ userRate, userValue, simRate, simValue, simName, simEmoji, bestRate, bestValue, bestName, bestEmoji, initialValue }: {
  userRate: number; userValue: number
  simRate: number; simValue: number; simName: string; simEmoji: string
  bestRate: number; bestValue: number; bestName: string; bestEmoji: string
  initialValue: number
}) {
  const players = [
    { name: "나", emoji: "🧑", rate: userRate, value: userValue, isUser: true },
    { name: simName, emoji: simEmoji, rate: simRate, value: simValue, isUser: false },
    { name: bestName, emoji: bestEmoji, rate: bestRate, value: bestValue, isUser: false },
  ].sort((a, b) => b.rate - a.rate)
  const medals = ["🥇", "🥈", "🥉"]

  return (
    <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Medal className="w-4 h-4 text-yellow-400" />
        <span className="text-xs font-bold text-white">{LABELS.finalReport.rankingTitle}</span>
      </div>
      <div className="space-y-2">
        {players.map((p, i) => (
          <div key={i} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 border", p.isUser ? "bg-blue-500/10 border-blue-500/20" : "bg-gray-800/40 border-gray-700/20")}>
            <span className="text-base">{medals[i]}</span>
            <span className="text-sm">{p.emoji}</span>
            <span className={cn("text-xs font-bold flex-1", p.isUser ? "text-blue-400" : "text-gray-300")}>{p.name}</span>
            <span className={cn("text-sm font-extrabold", p.rate >= 0 ? "text-red-400" : "text-blue-400")}>
              {p.rate >= 0 ? "+" : ""}{p.rate.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 통계 카드 ─────────────────────────────────────────────
function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/20">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[9px] text-gray-500">{label}</span>
      </div>
      <div className="text-lg font-extrabold text-white">{value}</div>
    </div>
  )
}
