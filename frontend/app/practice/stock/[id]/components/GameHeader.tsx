"use client"

import { useEffect, useRef, useState } from "react"
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

  // 자산 변동 시 펄스 애니메이션
  const prevAssetRef = useRef(totalValue)
  const [assetPulse, setAssetPulse] = useState<"up" | "down" | null>(null)
  useEffect(() => {
    if (totalValue !== prevAssetRef.current) {
      setAssetPulse(totalValue > prevAssetRef.current ? "up" : "down")
      prevAssetRef.current = totalValue
      const t = setTimeout(() => setAssetPulse(null), 500)
      return () => clearTimeout(t)
    }
  }, [totalValue])

  return (
    <div className="sticky top-0 z-20 bg-[#191919]/95 backdrop-blur-sm border-b border-gray-800/50">
      {/* 진행도 바 (최상단, 얇게) */}
      <div className="w-full bg-gray-800 h-[3px] relative overflow-hidden">
        <div
          className="h-full rounded-r-full transition-all duration-500 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-gradient-sweep"
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
              <div className="flex items-baseline gap-1.5 mb-0.5">
                <span className="text-lg leading-none inline-block">
                  {profitRate >= 10 ? "🤩" : profitRate >= 3 ? "😎" : profitRate >= 0 ? "😊" : profitRate >= -3 ? "😐" : profitRate >= -10 ? "😰" : "😱"}
                </span>
                <span
                  key={totalValue}
                  className={cn(
                    "text-2xl font-black text-white tracking-tight inline-block",
                    assetPulse && "animate-ticker-pulse",
                  )}
                >
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
            <ChevronRight className="w-4 h-4 text-gray-600 mt-1" />
          </button>

          <button
            onClick={onExitClick}
            className="px-2.5 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-500 hover:text-white transition-colors text-[11px] font-bold"
          >
            ✕
          </button>
        </div>

        {/* 2행: AI 비교 - 이모지 중심 카드 */}
        <div className="grid grid-cols-2 gap-2">
          {/* 유사 AI */}
          <div className="bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700/30 flex items-center gap-2">
            <span className="text-lg shrink-0">{aiEmoji}</span>
            <div className="flex-1 min-w-0 flex items-baseline justify-between gap-1">
              <span className={cn(
                "text-sm font-extrabold tabular-nums",
                aiProfitRate >= 0 ? "text-red-400" : "text-blue-400"
              )}>
                {aiProfitRate >= 0 ? "+" : ""}{aiProfitRate.toFixed(1)}%
              </span>
              <span className={cn(
                "text-[10px] font-bold tabular-nums shrink-0",
                gapToSimilar >= 0 ? "text-green-400" : "text-purple-400"
              )}>
                {gapToSimilar >= 0 ? "▲" : "▼"}{Math.abs(gapToSimilar)}
              </span>
            </div>
          </div>

          {/* 최고 AI */}
          <div className="bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700/30 flex items-center gap-2">
            <span className="text-lg shrink-0">👑</span>
            <div className="flex-1 min-w-0 flex items-baseline justify-between gap-1">
              <span className={cn(
                "text-sm font-extrabold tabular-nums",
                bestAIProfitRate >= 0 ? "text-red-400" : "text-blue-400"
              )}>
                {bestAIProfitRate >= 0 ? "+" : ""}{bestAIProfitRate.toFixed(1)}%
              </span>
              <span className={cn(
                "text-[10px] font-bold tabular-nums shrink-0",
                gapToBest >= 0 ? "text-green-400" : "text-orange-400"
              )}>
                {gapToBest >= 0 ? "▲" : "▼"}{Math.abs(gapToBest)}
              </span>
            </div>
          </div>
        </div>

        {/* 다음 분석 일정 (있을 때만, 작게) */}
        {daysUntilReport > 0 && (
          <div className="mt-2 text-center">
            <span className="text-[9px] text-gray-600 font-bold tabular-nums tracking-wider">
              📊 D-{daysUntilReport}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
