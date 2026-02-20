"use client"

import { Pause, Play, ChevronRight, Bot, Swords } from "lucide-react"
import { cn } from "@/lib/utils"
import { LABELS, DAY_PHASES, DECISIONS_PER_DAY } from "../config"
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
  decisionTimer,
  totalDecisions,
  remainingDecisions,
  isTimerPaused,
  isWaitingForDecision,
  onTogglePause,
  onExitClick,
  onProfitClick,
}: GameHeaderProps) => {
  const timerProgress = decisionTimer / 30

  const currentPhaseInDay = (totalDecisions - 1) % DECISIONS_PER_DAY

  const userWinning = profitRate >= aiProfitRate
  const daysUntilReport = nextReportDay - currentDay

  return (
    <>
      {/* 자유 거래 타임 - 최상단 Sticky */}
      {isWaitingForDecision && (
        <div className="sticky top-0 z-20 bg-[#191919]/95 backdrop-blur-sm border-b border-gray-700/50">
          <div className="px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">⏱️</span>
                <span className="text-xs font-bold text-white">{LABELS.timer.label}</span>
                <button
                  onClick={onTogglePause}
                  className={cn(
                    "p-1 rounded-full transition-colors",
                    isTimerPaused
                      ? "bg-green-500/20 hover:bg-green-500/30"
                      : "bg-gray-700/50 hover:bg-gray-700"
                  )}
                >
                  {isTimerPaused ? (
                    <Play className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Pause className="w-3.5 h-3.5 text-yellow-400" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] text-gray-400 font-bold">
                  {totalDecisions}번째 · 남은 {remainingDecisions}회
                </span>
                <div
                  className={cn(
                    "text-2xl font-black tabular-nums min-w-[2ch] text-right leading-none",
                    isTimerPaused
                      ? "text-yellow-400/60"
                      : decisionTimer > 20
                      ? "text-green-400"
                      : decisionTimer > 10
                      ? "text-yellow-400"
                      : "text-red-400 animate-pulse"
                  )}
                >
                  {decisionTimer}
                </div>
              </div>
            </div>

            {/* 진행 바 + 페이즈 표시 */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs font-black text-blue-400 shrink-0">
                {currentDayPhase} {currentDay}{LABELS.header.dayLabel}
              </span>
              <div className="flex items-center gap-0.5 shrink-0">
                {DAY_PHASES.map((phase, idx) => (
                  <div
                    key={phase}
                    className={cn(
                      "w-5 h-1.5 rounded-full transition-all",
                      idx < currentPhaseInDay
                        ? "bg-blue-500"
                        : idx === currentPhaseInDay
                        ? "bg-blue-400 animate-pulse"
                        : "bg-gray-700"
                    )}
                  />
                ))}
              </div>
              <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-1000",
                    decisionTimer > 20
                      ? "bg-green-500"
                      : decisionTimer > 10
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  )}
                  style={{ width: `${timerProgress * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* 일시정지 안내 */}
          {isTimerPaused && (
            <div className="px-4 pb-2">
              <div className="text-[10px] text-yellow-400/80 font-bold text-center animate-pulse">
                ⏸ 일시정지 중 — 터치하여 재개
              </div>
            </div>
          )}
        </div>
      )}

      {/* 축약 헤더 - 총 자산 + AI 대결 + 종료 */}
      <div className="px-4 py-2.5 bg-[#191919]/95 border-b border-gray-800/50">
        {/* 1행: 총 자산 + 종료 */}
        <div className="flex items-center justify-between">
          <button
            onClick={onProfitClick}
            className="flex items-center gap-2 active:opacity-70 transition-opacity"
          >
            <div>
              <div className="text-[10px] text-gray-500 mb-0.5">{LABELS.header.totalAsset}</div>
              <div className="text-base font-black text-white leading-none">
                {totalValue.toLocaleString()}원
              </div>
            </div>
            <div
              className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded leading-none",
                profitRate >= 0 ? "text-red-500 bg-red-500/10" : "text-blue-500 bg-blue-500/10"
              )}
            >
              {profitRate >= 0 ? "+" : ""}
              {profitRate}%
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>

          <button
            onClick={onExitClick}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors text-xs font-bold"
          >
            <span>{LABELS.actions.exit}</span>
            <span className="text-[10px]">✕</span>
          </button>
        </div>

        {/* 2행: AI vs 나 대결 배너 — 원금 대비 수익률만 비교 */}
        <div className="mt-2 bg-gray-800/60 rounded-xl border border-gray-700/40 overflow-hidden">
          {/* 수익률 비교 바 */}
          <div className="flex items-center px-3 py-2">
            {/* 나 */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                <span className="text-xs">👤</span>
              </div>
              <div className="min-w-0">
                <div className="text-[9px] text-gray-500 font-bold leading-none mb-0.5">나</div>
                <div className={cn(
                  "text-sm font-extrabold tabular-nums leading-none",
                  profitRate >= 0 ? "text-red-400" : "text-blue-400"
                )}>
                  {profitRate >= 0 ? "+" : ""}{profitRate}%
                </div>
              </div>
            </div>

            {/* VS 아이콘 + 승패 */}
            <div className="shrink-0 flex flex-col items-center mx-2">
              <Swords className="w-3.5 h-3.5 text-yellow-500/70" />
              <span className={cn(
                "text-[8px] font-black mt-0.5",
                userWinning ? "text-blue-400" : "text-purple-400"
              )}>
                {userWinning ? "승" : "패"}
              </span>
            </div>

            {/* AI */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <div className="text-[9px] text-gray-500 font-bold leading-none mb-0.5">
                  🤖 {aiName}
                </div>
                <div className={cn(
                  "text-sm font-extrabold tabular-nums leading-none",
                  aiProfitRate >= 0 ? "text-red-400" : "text-blue-400"
                )}>
                  {aiProfitRate >= 0 ? "+" : ""}{aiProfitRate.toFixed(1)}%
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
              </div>
            </div>
          </div>

          {/* AI 보유 종목 미리보기 */}
          {aiTopStocks.length > 0 && (
            <div className="px-3 py-1.5 bg-gray-900/50 border-t border-gray-700/30 flex items-center gap-1.5">
              <Bot className="w-3 h-3 text-purple-400/60 shrink-0" />
              <span className="text-[9px] text-gray-500 shrink-0">AI 보유:</span>
              <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
                {aiTopStocks.slice(0, 3).map((name, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-bold text-purple-300/80 bg-purple-500/10 px-1.5 py-0.5 rounded truncate shrink-0"
                  >
                    {name}
                  </span>
                ))}
                {aiTopStocks.length > 3 && (
                  <span className="text-[9px] text-gray-500 shrink-0">
                    +{aiTopStocks.length - 3}
                  </span>
                )}
              </div>
              {daysUntilReport > 0 && (
                <span className="text-[8px] text-gray-600 font-bold shrink-0 tabular-nums">
                  분석 {daysUntilReport}일 후
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3행: 전체 진행도 바 */}
        <div className="mt-2">
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-500"
              style={{
                width: `${totalDays > 0 ? Math.min((currentDay / totalDays) * 100, 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
