"use client"

import { useState } from "react"
import {
  ArrowUpRight, ArrowDownRight, Minus, ChevronRight,
  ChevronDown, ChevronUp, Swords, Bot, User, Waves, Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import { LABELS } from "../config"
import type { AIAction, InvestStyle, GapRecord, WaveAnalysis, StockCompareResult } from "./hooks/useAICompetitor"

// ── Props ─────────────────────────────────────────────────
export interface DaySummaryOverlayProps {
  isVisible: boolean
  currentDay: number
  currentDayName: string
  // 유저 데이터
  totalValue: number
  initialValue: number
  profitRate: number
  totalDecisions: number
  holdingsCount: number
  // 성향 유사 AI 대결 데이터
  aiName: string
  aiEmoji: string
  aiStyle: InvestStyle
  aiDescription: string
  aiMotto: string
  aiTotalValue: number
  aiProfitRate: number
  aiTodayActions: AIAction[]
  aiHoldingsCount: number
  aiTotalTrades: number
  // 최고 AI 데이터
  bestAIName: string
  bestAIEmoji: string
  bestAITotalValue: number
  bestAIProfitRate: number
  // 갭 분석 데이터
  gapHistory: GapRecord[]
  waveAnalysis?: WaveAnalysis
  // 종목별 3자 비교 (같은 종목, 다른 선택)
  stockCompareResults?: StockCompareResult[]
  // 이벤트
  onContinue: () => void
}

// ── 스타일 라벨 ────────────────────────────────────────────
const STYLE_LABELS: Record<InvestStyle, { label: string; color: string; bg: string }> = {
  conservative: { label: "안정형", color: "text-blue-400", bg: "bg-blue-500/20" },
  stable: { label: "신중형", color: "text-cyan-400", bg: "bg-cyan-500/20" },
  balanced: { label: "균형형", color: "text-green-400", bg: "bg-green-500/20" },
  aggressive: { label: "공격형", color: "text-orange-400", bg: "bg-orange-500/20" },
  ultra_aggressive: { label: "초공격형", color: "text-red-400", bg: "bg-red-500/20" },
}

// ── 분석 코멘트 생성 ───────────────────────────────────────
function generateBattleComment(
  userRate: number,
  aiRate: number,
  aiName: string,
): string {
  const diff = userRate - aiRate
  if (diff > 3) return `${aiName}을(를) 크게 앞서고 있습니다! 현재 전략을 유지하세요.`
  if (diff > 0) return `${aiName}보다 소폭 앞서고 있습니다. 방심은 금물!`
  if (diff === 0) return `${aiName}와(과) 동률입니다. 다음 결정이 중요합니다!`
  if (diff > -3) return `${aiName}에게 근소하게 뒤지고 있습니다. 역전 기회를 노리세요!`
  return `${aiName}에게 많이 뒤지고 있습니다. 전략 수정이 필요할 수 있습니다.`
}

function generateTip(aiStyle: InvestStyle, userRate: number): string {
  if (aiStyle === "conservative") {
    return userRate < 0
      ? "AI처럼 보수적으로 손실을 최소화해 보세요."
      : "AI보다 더 공격적으로 수익을 노려보세요."
  }
  if (aiStyle === "aggressive" || aiStyle === "ultra_aggressive") {
    return userRate < 0
      ? "AI의 공격적 전략은 변동성이 큽니다. 리스크 관리가 핵심!"
      : "좋은 흐름! 이익 실현 타이밍도 놓치지 마세요."
  }
  return "균형 잡힌 접근이 장기적으로 유리합니다."
}

function generateWaveComment(wave: WaveAnalysis, gapToBest: number): string {
  const accuracyLabel = wave.accuracy >= 70 ? "잘 읽고 있습니다" : wave.accuracy >= 50 ? "보통 수준입니다" : "연습이 필요합니다"
  const gapLabel = gapToBest >= 0 ? `최고 AI보다 ${Math.abs(gapToBest).toFixed(1)}%p 앞서고 있어요` : `최고 AI보다 ${Math.abs(gapToBest).toFixed(1)}%p 뒤처져 있어요`
  return `${wave.trend} 파도 (강도 ${wave.strength}%) - 파도 읽기 정확도 ${wave.accuracy}%, ${accuracyLabel}. ${gapLabel}.`
}

// ── 종목별 3자 비교 카드 ───────────────────────────────────
function StockCompareCard({
  result, aiName, aiEmoji, bestAIName, bestAIEmoji,
}: {
  result: StockCompareResult
  aiName: string; aiEmoji: string
  bestAIName: string; bestAIEmoji: string
}) {
  const ACTION_LABEL: Record<string, { label: string; color: string; bg: string }> = {
    buy:  { label: "매수", color: "text-red-400",  bg: "bg-red-500/15" },
    sell: { label: "매도", color: "text-blue-400", bg: "bg-blue-500/15" },
    skip: { label: "관망", color: "text-gray-400", bg: "bg-gray-700/40" },
    hold: { label: "관망", color: "text-gray-400", bg: "bg-gray-700/40" },
  }

  const userA = ACTION_LABEL[result.userAction] ?? ACTION_LABEL.hold
  const simA  = ACTION_LABEL[result.similarAction] ?? ACTION_LABEL.hold
  const bestA = ACTION_LABEL[result.bestAction] ?? ACTION_LABEL.hold

  const isSameAsSimilar = result.userAction === result.similarAction
  const isSameAsBest    = result.userAction === result.bestAction

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700/20 p-3">
      {/* 종목명 + 가격 */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[12px] font-extrabold text-white">{result.stockName}</span>
        <span className="text-[10px] text-gray-500">{formatNumber(result.price)}원</span>
      </div>

      {/* 3자 선택 비교 */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        {/* 나 */}
        <div className="text-center">
          <div className="text-[8px] text-gray-600 mb-1">나</div>
          <div className={cn("text-[10px] font-extrabold px-2 py-1 rounded-lg", userA.color, userA.bg)}>
            {userA.label}
            {result.userAction === "buy" && result.userQty > 0 && (
              <span className="text-[8px] ml-0.5">{result.userQty}주</span>
            )}
          </div>
        </div>
        {/* 유사 AI */}
        <div className="text-center">
          <div className="text-[8px] text-gray-600 mb-1 truncate">{aiEmoji} {aiName}</div>
          <div className={cn("text-[10px] font-extrabold px-2 py-1 rounded-lg", simA.color, simA.bg)}>
            {simA.label}
            {result.similarAction === "buy" && result.similarQty > 0 && (
              <span className="text-[8px] ml-0.5">{result.similarQty}주</span>
            )}
          </div>
        </div>
        {/* 최고 AI */}
        <div className="text-center">
          <div className="text-[8px] text-gray-600 mb-1 truncate">{bestAIEmoji} {bestAIName}</div>
          <div className={cn("text-[10px] font-extrabold px-2 py-1 rounded-lg", bestA.color, bestA.bg)}>
            {bestA.label}
            {result.bestAction === "buy" && result.bestQty > 0 && (
              <span className="text-[8px] ml-0.5">{result.bestQty}주</span>
            )}
          </div>
        </div>
      </div>

      {/* 일치/불일치 뱃지 */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {isSameAsSimilar ? (
          <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full border border-purple-500/20">
            {aiEmoji} 유사AI와 같은 선택
          </span>
        ) : (
          <span className="text-[9px] font-bold text-gray-500 bg-gray-700/30 px-1.5 py-0.5 rounded-full">
            {aiEmoji} 유사AI와 다른 선택
          </span>
        )}
        {isSameAsBest ? (
          <span className="text-[9px] font-bold text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded-full border border-yellow-500/20">
            {bestAIEmoji} 최고AI와 같은 선택
          </span>
        ) : (
          <span className="text-[9px] font-bold text-gray-500 bg-gray-700/30 px-1.5 py-0.5 rounded-full">
            {bestAIEmoji} 최고AI와 다른 선택
          </span>
        )}
      </div>

      {/* AI 이유 */}
      {result.similarReason && (
        <div className="mt-2 text-[9px] text-gray-500 leading-relaxed">
          <span className="text-purple-400 font-bold">{aiEmoji}</span> {result.similarReason}
        </div>
      )}
      {result.bestReason && result.bestReason !== result.similarReason && (
        <div className="mt-0.5 text-[9px] text-gray-500 leading-relaxed">
          <span className="text-yellow-400 font-bold">{bestAIEmoji}</span> {result.bestReason}
        </div>
      )}
    </div>
  )
}

// ── 갭 미니 차트 ───────────────────────────────────────────
function GapMiniChart({ history }: { history: GapRecord[] }) {
  if (history.length < 2) return null
  const recent = history.slice(-7)
  const maxAbs = Math.max(...recent.map(r => Math.max(Math.abs(r.gapToBest), Math.abs(r.gapToSimilar))), 1)

  return (
    <div className="flex items-end gap-1 h-10">
      {recent.map((r, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            className={cn("w-full rounded-sm", r.gapToBest >= 0 ? "bg-yellow-400/60" : "bg-red-400/40")}
            style={{ height: `${Math.max(2, (Math.abs(r.gapToBest) / maxAbs) * 36)}px` }}
          />
        </div>
      ))}
    </div>
  )
}

// ── 컴포넌트 ───────────────────────────────────────────────
export const DaySummaryOverlay = ({
  isVisible,
  currentDay,
  currentDayName,
  totalValue,
  initialValue,
  profitRate,
  totalDecisions,
  holdingsCount,
  aiName,
  aiEmoji,
  aiStyle,
  aiDescription,
  aiMotto,
  aiTotalValue,
  aiProfitRate,
  aiTodayActions,
  aiHoldingsCount,
  aiTotalTrades,
  bestAIName,
  bestAIEmoji,
  bestAITotalValue,
  bestAIProfitRate,
  gapHistory,
  waveAnalysis,
  stockCompareResults = [],
  onContinue,
}: DaySummaryOverlayProps) => {
  const [showAIDetail, setShowAIDetail] = useState(false)
  const [showGapDetail, setShowGapDetail] = useState(true)
  const [showStockCompare, setShowStockCompare] = useState(true)

  if (!isVisible) return null

  const profitAmount = totalValue - initialValue
  const aiProfitAmount = aiTotalValue - initialValue
  const bestAIProfitAmount = bestAITotalValue - initialValue
  const isProfit = profitRate >= 0
  const isAiProfit = aiProfitRate >= 0
  const isBestAiProfit = bestAIProfitRate >= 0
  const userWinningSimilar = profitRate >= aiProfitRate
  const userWinningBest = profitRate >= bestAIProfitRate
  const diffSimilar = Math.abs(profitRate - aiProfitRate).toFixed(1)
  const diffBest = Math.abs(profitRate - bestAIProfitRate).toFixed(1)
  const styleInfo = STYLE_LABELS[aiStyle]

  const battleComment = generateBattleComment(profitRate, aiProfitRate, aiName)
  const tip = generateTip(aiStyle, profitRate)

  const buyActions = aiTodayActions.filter(a => a.type === "buy")
  const sellActions = aiTodayActions.filter(a => a.type === "sell")
  const holdActions = aiTodayActions.filter(a => a.type === "hold")

  const latestGap = gapHistory[gapHistory.length - 1]
  const waveComment = waveAnalysis ? generateWaveComment(waveAnalysis, latestGap?.gapToBest ?? 0) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-500 scrollbar-hide">

        {/* ── 헤더 ── */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 mb-3 shadow-lg shadow-orange-500/30">
            <span className="text-2xl">🌅</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {currentDay}{LABELS.daySummary.dayEnd}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">{currentDayName}</p>
        </div>

        {/* ── 3-way 갭 분석 카드 ── */}
        <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 rounded-3xl border border-gray-700/50 overflow-hidden mb-3">
          <button
            onClick={() => setShowGapDetail(!showGapDetail)}
            className="w-full flex items-center justify-between px-4 pt-3 pb-2"
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-white">{LABELS.daySummary.gapAnalysisTitle}</span>
            </div>
            {showGapDetail
              ? <ChevronUp className="w-4 h-4 text-gray-500" />
              : <ChevronDown className="w-4 h-4 text-gray-500" />
            }
          </button>

          {showGapDetail && (
            <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
              {/* 3열 비교 */}
              <div className="grid grid-cols-3 gap-2">
                {/* 나 */}
                <div className="bg-blue-500/10 rounded-2xl p-3 border border-blue-500/20 text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-1.5 border border-blue-500/30">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-[9px] font-bold text-blue-400 mb-1">나</div>
                  <div className={cn("text-lg font-extrabold leading-none", isProfit ? "text-red-400" : "text-blue-400")}>
                    {isProfit ? "+" : ""}{profitRate}%
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1">{formatNumber(profitAmount)}원</div>
                </div>

                {/* 유사 AI */}
                <div className={cn(
                  "rounded-2xl p-3 border text-center",
                  userWinningSimilar ? "bg-gray-700/30 border-gray-600/30" : "bg-purple-500/10 border-purple-500/20"
                )}>
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-1.5 border border-purple-500/30">
                    <span className="text-sm">{aiEmoji}</span>
                  </div>
                  <div className="text-[9px] font-bold text-purple-400 mb-1 truncate">{aiName}</div>
                  <div className={cn("text-lg font-extrabold leading-none", isAiProfit ? "text-red-400" : "text-blue-400")}>
                    {isAiProfit ? "+" : ""}{aiProfitRate.toFixed(1)}%
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1">{formatNumber(aiProfitAmount)}원</div>
                </div>

                {/* 최고 AI */}
                <div className={cn(
                  "rounded-2xl p-3 border text-center",
                  userWinningBest ? "bg-gray-700/30 border-gray-600/30" : "bg-yellow-500/10 border-yellow-500/20"
                )}>
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-1.5 border border-yellow-500/30">
                    <span className="text-sm">{bestAIEmoji}</span>
                  </div>
                  <div className="text-[9px] font-bold text-yellow-400 mb-1 truncate">{LABELS.daySummary.bestAILabel}</div>
                  <div className={cn("text-lg font-extrabold leading-none", isBestAiProfit ? "text-red-400" : "text-blue-400")}>
                    {isBestAiProfit ? "+" : ""}{bestAIProfitRate.toFixed(1)}%
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1">{formatNumber(bestAIProfitAmount)}원</div>
                </div>
              </div>

              {/* 갭 차이 요약 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-900/50 rounded-xl p-2.5">
                  <div className="text-[9px] text-gray-500 mb-1">{LABELS.daySummary.gapToSimilarLabel}</div>
                  <div className={cn("text-sm font-extrabold", userWinningSimilar ? "text-green-400" : "text-red-400")}>
                    {userWinningSimilar ? "+" : "-"}{diffSimilar}%p
                  </div>
                  <div className="text-[9px] text-gray-600 mt-0.5">
                    {userWinningSimilar ? "앞서는 중" : "뒤처지는 중"}
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-2.5">
                  <div className="text-[9px] text-gray-500 mb-1">{LABELS.daySummary.gapToBestLabel}</div>
                  <div className={cn("text-sm font-extrabold", userWinningBest ? "text-green-400" : "text-orange-400")}>
                    {userWinningBest ? "+" : "-"}{diffBest}%p
                  </div>
                  <div className="text-[9px] text-gray-600 mt-0.5">
                    {userWinningBest ? "최고 AI 초과!" : "따라잡기 도전"}
                  </div>
                </div>
              </div>

              {/* 갭 히스토리 미니 차트 */}
              {gapHistory.length >= 2 && (
                <div>
                  <div className="text-[9px] text-gray-500 mb-1.5">{LABELS.daySummary.gapTrendLabel}</div>
                  <GapMiniChart history={gapHistory} />
                  <div className="flex justify-between text-[8px] text-gray-600 mt-1">
                    <span>과거</span>
                    <span>현재</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 종목별 3자 비교 (같은 종목, 다른 선택) ── */}
        {stockCompareResults.length > 0 && (
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 overflow-hidden mb-3">
            <button
              onClick={() => setShowStockCompare(!showStockCompare)}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">같은 종목 — 다른 선택 비교</span>
                <span className="text-[9px] text-gray-500 bg-gray-700/50 px-1.5 py-0.5 rounded-full">
                  {stockCompareResults.length}종목
                </span>
              </div>
              {showStockCompare
                ? <ChevronUp className="w-4 h-4 text-gray-500" />
                : <ChevronDown className="w-4 h-4 text-gray-500" />
              }
            </button>

            {showStockCompare && (
              <div className="px-3 pb-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                {stockCompareResults.map((r, i) => (
                  <StockCompareCard key={r.stockId + i} result={r} aiName={aiName} aiEmoji={aiEmoji} bestAIName={bestAIName} bestAIEmoji={bestAIEmoji} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 파도 흐름 분석 ── */}
        {waveAnalysis && (
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 p-4 mb-3">
            <div className="flex items-center gap-2 mb-3">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">{LABELS.daySummary.waveAnalysisTitle}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-900/50 rounded-xl p-2 text-center">
                <div className="text-[9px] text-gray-500 mb-1">파도 방향</div>
                <div className={cn(
                  "text-xs font-extrabold",
                  waveAnalysis.trend === "상승" ? "text-red-400" : waveAnalysis.trend === "하락" ? "text-blue-400" : "text-gray-400"
                )}>
                  {waveAnalysis.trend === "상승" ? "↑" : waveAnalysis.trend === "하락" ? "↓" : "→"} {waveAnalysis.trend}
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-2 text-center">
                <div className="text-[9px] text-gray-500 mb-1">파도 강도</div>
                <div className="text-xs font-extrabold text-yellow-400">{waveAnalysis.strength}%</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-2 text-center">
                <div className="text-[9px] text-gray-500 mb-1">읽기 정확도</div>
                <div className={cn(
                  "text-xs font-extrabold",
                  waveAnalysis.accuracy >= 70 ? "text-green-400" : waveAnalysis.accuracy >= 50 ? "text-yellow-400" : "text-red-400"
                )}>
                  {waveAnalysis.accuracy}%
                </div>
              </div>
            </div>

            {/* 정확도 프로그레스 바 */}
            <div className="mb-2.5">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-700",
                    waveAnalysis.accuracy >= 70 ? "bg-green-400" : waveAnalysis.accuracy >= 50 ? "bg-yellow-400" : "bg-red-400"
                  )}
                  style={{ width: `${waveAnalysis.accuracy}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-gray-300 leading-relaxed">{waveAnalysis.comment}</p>
            {waveComment && (
              <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{waveComment}</p>
            )}
          </div>
        )}

        {/* ── VS 대결 카드 (유사 AI) ── */}
        <div className="relative bg-gradient-to-b from-gray-800/80 to-gray-900/80 rounded-3xl border border-gray-700/50 overflow-hidden mb-3">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40 border-2 border-gray-900">
              <Swords className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-gray-700/50">
            {/* 나 (왼쪽) */}
            <div className={cn(
              "p-4 relative",
              userWinningSimilar && "bg-gradient-to-br from-yellow-500/5 to-transparent"
            )}>
              {userWinningSimilar && (
                <div className="absolute top-2 left-2 text-[10px] font-extrabold text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded-full">
                  WIN
                </div>
              )}
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2 border-2 border-blue-500/40">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-xs font-bold text-blue-400 mb-0.5">나</div>
                <div className={cn("text-2xl font-extrabold", isProfit ? "text-red-400" : "text-blue-400")}>
                  {isProfit ? "+" : ""}{profitRate}%
                </div>
                <div className="text-[11px] text-gray-400 mt-1">{formatNumber(totalValue)}원</div>
                <div className={cn("text-[10px] font-semibold mt-0.5", isProfit ? "text-red-400/70" : "text-blue-400/70")}>
                  {isProfit ? "+" : ""}{formatNumber(profitAmount)}원
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">보유 종목</span>
                  <span className="text-gray-300 font-bold">{holdingsCount}개</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">총 거래</span>
                  <span className="text-gray-300 font-bold">{totalDecisions}회</span>
                </div>
              </div>
            </div>

            {/* 유사 AI (오른쪽) */}
            <div className={cn(
              "p-4 relative",
              !userWinningSimilar && "bg-gradient-to-bl from-purple-500/5 to-transparent"
            )}>
              {!userWinningSimilar && profitRate !== aiProfitRate && (
                <div className="absolute top-2 right-2 text-[10px] font-extrabold text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded-full">
                  WIN
                </div>
              )}
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2 border-2 border-purple-500/40">
                  <span className="text-xl">{aiEmoji}</span>
                </div>
                <div className="text-xs font-bold text-purple-400 mb-0.5">{aiName}</div>
                <div className={cn("text-2xl font-extrabold", isAiProfit ? "text-red-400" : "text-blue-400")}>
                  {isAiProfit ? "+" : ""}{aiProfitRate.toFixed(1)}%
                </div>
                <div className="text-[11px] text-gray-400 mt-1">{formatNumber(aiTotalValue)}원</div>
                <div className={cn("text-[10px] font-semibold mt-0.5", isAiProfit ? "text-red-400/70" : "text-blue-400/70")}>
                  {isAiProfit ? "+" : ""}{formatNumber(aiProfitAmount)}원
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">보유 종목</span>
                  <span className="text-gray-300 font-bold">{aiHoldingsCount}개</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">총 거래</span>
                  <span className="text-gray-300 font-bold">{aiTotalTrades}회</span>
                </div>
              </div>
            </div>
          </div>

          {/* 차이 바 */}
          <div className="px-4 py-2.5 bg-gray-900/60 border-t border-gray-700/40">
            <div className="flex items-center justify-center gap-2 text-xs">
              {userWinningSimilar ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">+{diffSimilar}%p 앞서는 중</span>
                </>
              ) : profitRate === aiProfitRate ? (
                <>
                  <Minus className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-400 font-bold">동률</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-purple-400 font-bold">-{diffSimilar}%p 뒤처지는 중</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── AI 전략 & 오늘의 행동 ── */}
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 mb-3 overflow-hidden">
          <button
            onClick={() => setShowAIDetail(!showAIDetail)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-700/20 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Bot className="w-4 h-4 text-purple-400" />
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{aiName}의 투자 전략</span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", styleInfo.color, styleInfo.bg)}>
                    {styleInfo.label}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">"{aiMotto}"</p>
              </div>
            </div>
            {showAIDetail
              ? <ChevronUp className="w-4 h-4 text-gray-500" />
              : <ChevronDown className="w-4 h-4 text-gray-500" />
            }
          </button>

          {showAIDetail && (
            <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="bg-gray-900/50 rounded-xl p-3">
                <div className="text-[11px] text-gray-500 mb-1">투자 원칙</div>
                <p className="text-xs text-gray-300">{aiDescription}</p>
              </div>

              <div>
                <div className="text-[11px] text-gray-500 mb-2">오늘의 거래 내역</div>
                <div className="space-y-1.5">
                  {buyActions.map((a, i) => (
                    <div key={`buy-${i}`} className="flex items-center gap-2 bg-red-500/10 rounded-lg px-3 py-2">
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded">매수</span>
                      <span className="text-[11px] text-gray-300 font-medium flex-1 truncate">{a.stockName}</span>
                      <span className="text-[10px] text-gray-400">{a.quantity}주</span>
                    </div>
                  ))}
                  {sellActions.map((a, i) => (
                    <div key={`sell-${i}`} className="flex items-center gap-2 bg-blue-500/10 rounded-lg px-3 py-2">
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">매도</span>
                      <span className="text-[11px] text-gray-300 font-medium flex-1 truncate">{a.stockName}</span>
                      <span className="text-[10px] text-gray-400">{a.quantity}주</span>
                    </div>
                  ))}
                  {holdActions.length > 0 && buyActions.length === 0 && sellActions.length === 0 && (
                    <div className="flex items-center gap-2 bg-gray-700/30 rounded-lg px-3 py-2">
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-600/30 px-1.5 py-0.5 rounded">관망</span>
                      <span className="text-[11px] text-gray-400">{holdActions[0].reason}</span>
                    </div>
                  )}
                </div>
              </div>

              {(buyActions.length > 0 || sellActions.length > 0) && (
                <div>
                  <div className="text-[11px] text-gray-500 mb-1.5">AI 판단 근거</div>
                  <div className="space-y-1">
                    {[...buyActions, ...sellActions].slice(0, 3).map((a, i) => (
                      <div key={`reason-${i}`} className="flex items-start gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                        <p className="text-[11px] text-gray-400">{a.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 분석 코멘트 ── */}
        <div className="bg-gray-800/40 rounded-2xl p-4 border border-gray-700/30 mb-4">
          <div className="text-xs font-bold text-gray-400 mb-2.5">{LABELS.daySummary.analysisTitle}</div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-yellow-400 mt-2 shrink-0" />
              <p className="text-[12px] text-gray-300 leading-relaxed">{battleComment}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-purple-400 mt-2 shrink-0" />
              <p className="text-[12px] text-gray-300 leading-relaxed">{tip}</p>
            </div>
            {waveAnalysis && (
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <p className="text-[12px] text-gray-300 leading-relaxed">
                  파도 읽기 정확도 {waveAnalysis.accuracy}% —{" "}
                  {waveAnalysis.accuracy >= 70
                    ? "파도의 흐름을 잘 읽고 있습니다! 계속 연습하세요."
                    : waveAnalysis.accuracy >= 50
                    ? "파도를 어느 정도 읽고 있습니다. 더 연습하면 좋아질 거예요."
                    : "파도 읽기 연습이 필요합니다. AI의 매매 패턴을 따라해 보세요."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── 다음 날 버튼 ── */}
        <button
          onClick={onContinue}
          className="w-full py-4 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-2xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
        >
          분석 확인 완료 - 다음 날 시작
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
