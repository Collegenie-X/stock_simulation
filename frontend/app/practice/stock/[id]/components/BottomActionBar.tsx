"use client"

import { Pause, Play, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { LABELS, DAY_PHASES, DECISIONS_PER_DAY } from "../config"

interface BottomActionBarProps {
  decisionTimer: number
  totalDecisions: number
  remainingDecisions: number
  isTimerPaused: boolean
  currentPhaseInDay: number
  currentDayPhase: string
  currentDay: number
  isWaitingForDecision: boolean
  onTogglePause: () => void
  onSkip: () => void
}

export const BottomActionBar = ({
  decisionTimer,
  totalDecisions,
  remainingDecisions,
  isTimerPaused,
  currentPhaseInDay,
  currentDayPhase,
  currentDay,
  isWaitingForDecision,
  onTogglePause,
  onSkip,
}: BottomActionBarProps) => {
  const timerProgress = decisionTimer / 30
  const isUrgent = decisionTimer <= 10
  const isCaution = decisionTimer <= 20

  if (!isWaitingForDecision) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#191919] border-t border-gray-800/80">

      {/* ── 타이머 프로그레스 바 ── */}
      <div className="relative h-1.5 bg-gray-800 overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 transition-all duration-1000 rounded-r-full",
            isUrgent
              ? "bg-red-500"
              : isCaution
              ? "bg-yellow-500"
              : "bg-green-500"
          )}
          style={{ width: `${timerProgress * 100}%` }}
        />
      </div>

      {/* ── 타이머 info 행 ── */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* 왼쪽: 페이즈 + 일시정지 버튼 */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePause}
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-full transition-all active:scale-95",
              isTimerPaused
                ? "bg-green-500/25 border border-green-500/40"
                : "bg-gray-800 border border-gray-700"
            )}
          >
            {isTimerPaused ? (
              <Play className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Pause className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {/* 페이즈 도트 */}
          <div className="flex items-center gap-1">
            {DAY_PHASES.map((phase, idx) => (
              <div
                key={phase}
                className={cn(
                  "rounded-full transition-all",
                  idx < currentPhaseInDay
                    ? "w-1.5 h-1.5 bg-blue-500"
                    : idx === currentPhaseInDay
                    ? "w-2 h-2 bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]"
                    : "w-1.5 h-1.5 bg-gray-700"
                )}
              />
            ))}
          </div>

          <span className="text-[11px] font-bold text-blue-400">
            {currentDayPhase} {currentDay}{LABELS.header.dayLabel}
          </span>
        </div>

        {/* 오른쪽: 카운트다운 + 남은 횟수 */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-600 font-medium tabular-nums">
            {totalDecisions}번째 · 남은 {remainingDecisions}회
          </span>
          <div className={cn(
            "flex items-center gap-1",
            isTimerPaused ? "opacity-50" : ""
          )}>
            <span className="text-[10px] text-gray-500">⏱</span>
            <span className={cn(
              "text-xl font-black tabular-nums leading-none",
              isTimerPaused
                ? "text-gray-500"
                : isUrgent
                ? "text-red-400 animate-pulse"
                : isCaution
                ? "text-yellow-400"
                : "text-green-400"
            )}>
              {decisionTimer}
            </span>
            <span className="text-[9px] text-gray-600 font-bold">초</span>
          </div>
        </div>
      </div>

      {/* ── 일시정지 알림 ── */}
      {isTimerPaused && (
        <div className="mx-4 mb-1.5 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-[10px] font-bold text-yellow-400/90 text-center">
            ⏸ 일시정지 중 — 터치하여 재개
          </p>
        </div>
      )}

      {/* ── 다음 시간으로 버튼 ── */}
      <div className="px-4 pb-4 pt-1">
        <button
          onClick={onSkip}
          className={cn(
            "w-full py-3.5 rounded-2xl font-bold text-[15px] transition-all active:scale-[0.98]",
            "flex items-center justify-center gap-2",
            "bg-gray-800 border border-gray-700/80 text-gray-200",
            "hover:bg-gray-700 hover:border-gray-600 hover:text-white",
            "shadow-sm"
          )}
        >
          {LABELS.actions.skip}
          <ChevronRight className="w-4.5 h-4.5 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
