"use client"

import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import { LABELS } from "../config"
import type { GameHeaderProps } from "../types"

export const GameHeader = ({
  currentDay,
  totalDays,
  currentDayName,
  currentDayPhase,
  currentWeekNumber,
  totalValue,
  profitRate,
  aiName,
  aiEmoji,
  aiProfitRate,
  aiTopStocks,
  nextReportDay,
  bestAIName,
  bestAIEmoji,
  bestAIProfitRate,
  decisionTimer,
  totalDecisions,
  remainingDecisions,
  isTimerPaused,
  isWaitingForDecision,
  onTogglePause,
  onExitClick,
  onProfitClick,
}: GameHeaderProps) => {
  const gapToBest = Number((profitRate - bestAIProfitRate).toFixed(1))
  const gapToSimilar = Number((profitRate - aiProfitRate).toFixed(1))
  const daysUntilReport = nextReportDay - currentDay

  return (
    <div className="sticky top-0 z-20 bg-[#191919]/95 backdrop-blur-sm border-b border-gray-800/50">
      {/* 진행도 바 (최상단, 얇게) */}
      <div className="w-full bg-gray-800 h-[3px]">
        <div
          className="bg-blue-500 h-full rounded-r-full transition-all duration-500"
          style={{
            width: `${totalDays > 0 ? Math.min((currentDay / totalDays) * 100, 100) : 0}%`,
          }}
        />
      </div>

      <div className="px-4 pt-2.5 pb-3">
        {/* 1행: 총 자산 (크게 강조) + 종료 */}
        <div className="flex items-start justify-between mb-3">
          <button
            onClick={onProfitClick}
            className="flex items-baseline gap-2 active:opacity-70 transition-opacity"
          >
            <div>
              <div className="text-[10px] text-gray-500 mb-1">{LABELS.header.totalAsset}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white tracking-tight">
                  {formatNumber(totalValue)}<span className="text-sm text-gray-400 font-bold">원</span>
                </span>
                <span className={cn(
                  "text-sm font-bold",
                  profitRate >= 0 ? "text-red-400" : "text-blue-400"
                )}>
                  {profitRate >= 0 ? "+" : ""}{profitRate}%
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 mt-5" />
          </button>

          <button
            onClick={onExitClick}
            className="px-2.5 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-500 hover:text-white transition-colors text-[11px] font-bold"
          >
            {LABELS.actions.exit} ✕
          </button>
        </div>

        {/* 2행: AI 비교 - 간결한 2칸 카드 */}
        <div className="grid grid-cols-2 gap-2">
          {/* 유사 AI */}
          <div className="bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700/30">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px]">{aiEmoji}</span>
              <span className="text-[10px] text-gray-500 font-bold truncate">{LABELS.header.similarAILabel}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className={cn(
                "text-sm font-extrabold tabular-nums",
                aiProfitRate >= 0 ? "text-red-400" : "text-blue-400"
              )}>
                {aiProfitRate >= 0 ? "+" : ""}{aiProfitRate.toFixed(1)}%
              </span>
              <span className={cn(
                "text-[10px] font-bold tabular-nums",
                gapToSimilar >= 0 ? "text-green-400" : "text-purple-400"
              )}>
                {gapToSimilar >= 0 ? "+" : ""}{gapToSimilar}%p
              </span>
            </div>
          </div>

          {/* 최고 AI */}
          <div className="bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700/30">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px]">{bestAIEmoji}</span>
              <span className="text-[10px] text-gray-500 font-bold truncate">{LABELS.header.bestAILabel}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className={cn(
                "text-sm font-extrabold tabular-nums",
                bestAIProfitRate >= 0 ? "text-red-400" : "text-blue-400"
              )}>
                {bestAIProfitRate >= 0 ? "+" : ""}{bestAIProfitRate.toFixed(1)}%
              </span>
              <span className={cn(
                "text-[10px] font-bold tabular-nums",
                gapToBest >= 0 ? "text-green-400" : "text-orange-400"
              )}>
                {gapToBest >= 0 ? "+" : ""}{gapToBest}%p
              </span>
            </div>
          </div>
        </div>

        {/* 다음 분석 일정 (있을 때만, 작게) */}
        {daysUntilReport > 0 && (
          <div className="mt-2 text-center">
            <span className="text-[9px] text-gray-600 font-bold tabular-nums">
              📊 분석 리포트 {daysUntilReport}일 후
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
