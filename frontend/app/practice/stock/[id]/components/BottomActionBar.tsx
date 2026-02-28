"use client"

import { useEffect, useState } from "react"
import { Pause, Play, ChevronRight, FileText, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import { LABELS, DAY_PHASES } from "../config"

export interface LastTradeToast {
  isBuy: boolean
  stockName: string
  quantity: number
  profit?: number
  profitRate?: number
  totalAmount: number
}

interface BottomActionBarProps {
  decisionTimer: number
  totalDecisions: number
  remainingDecisions: number
  isTimerPaused: boolean
  currentPhaseInDay: number
  currentDayPhase: string
  currentDay: number
  isWaitingForDecision: boolean
  lastTrade?: LastTradeToast | null
  showDebugButtons?: boolean
  onTogglePause: () => void
  onSkip: () => void
  onPreviewMiniReport?: () => void
  onPreviewFinalReport?: () => void
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
  lastTrade,
  showDebugButtons = false,
  onTogglePause,
  onSkip,
  onPreviewMiniReport,
  onPreviewFinalReport,
}: BottomActionBarProps) => {
  const timerProgress = decisionTimer / 30
  const isUrgent = decisionTimer <= 10
  const isCaution = decisionTimer <= 20

  // 거래 토스트 표시 상태 (3초 후 자동 사라짐)
  const [visibleTrade, setVisibleTrade] = useState<LastTradeToast | null>(null)

  useEffect(() => {
    if (!lastTrade) return
    setVisibleTrade(lastTrade)
    const t = setTimeout(() => setVisibleTrade(null), 3000)
    return () => clearTimeout(t)
  }, [lastTrade])

  if (!isWaitingForDecision) return null

  const hasProfit = visibleTrade && visibleTrade.profit !== undefined
  const isProfit = hasProfit && (visibleTrade.profit ?? 0) >= 0

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 bg-[#191919] border-t border-gray-800/80"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {/* ── 타이머 프로그레스 바 ── */}
      <div className="relative h-1.5 bg-gray-800 overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 transition-all duration-1000 rounded-r-full",
            isUrgent ? "bg-red-500" : isCaution ? "bg-yellow-500" : "bg-green-500"
          )}
          style={{ width: `${timerProgress * 100}%` }}
        />
      </div>

      {/* ── 타이머 info 행 ── */}
      <div className="flex items-center justify-between px-4 py-1.5">
        {/* 왼쪽: 일시정지 + 페이즈 도트 + 일차 */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePause}
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full transition-all active:scale-95",
              isTimerPaused
                ? "bg-green-500/25 border border-green-500/40"
                : "bg-gray-800 border border-gray-700"
            )}
          >
            {isTimerPaused ? (
              <Play className="w-3 h-3 text-green-400" />
            ) : (
              <Pause className="w-3 h-3 text-gray-400" />
            )}
          </button>

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

          <span className="text-[10px] font-bold text-blue-400">
            {currentDayPhase} {currentDay}{LABELS.header.dayLabel}
          </span>
        </div>

        {/* 오른쪽: 남은 횟수 + 카운트다운 */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-600 font-medium tabular-nums">
            {totalDecisions}번째 · 남은 {remainingDecisions}회
          </span>
          <div className={cn("flex items-center gap-0.5", isTimerPaused ? "opacity-50" : "")}>
            <span className={cn(
              "text-lg font-black tabular-nums leading-none",
              isTimerPaused ? "text-gray-500"
                : isUrgent ? "text-red-400 animate-pulse"
                : isCaution ? "text-yellow-400"
                : "text-green-400"
            )}>
              {decisionTimer}
            </span>
            <span className="text-[8px] text-gray-600 font-bold">초</span>
          </div>
        </div>
      </div>

      {/* ── 일시정지 알림 ── */}
      {isTimerPaused && (
        <div className="mx-4 mb-1 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-[9px] font-bold text-yellow-400/90 text-center">⏸ 일시정지 중</p>
        </div>
      )}

      {/* ── 거래 확인 토스트 (주식 리스트에서 표시) ── */}
      {visibleTrade && (
        <div className="mx-4 mb-1.5 animate-in slide-in-from-bottom-2 duration-200">
          <div className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl border",
            visibleTrade.isBuy
              ? "bg-red-500/10 border-red-500/25"
              : "bg-blue-500/10 border-blue-500/25"
          )}>
            {/* 아이콘 */}
            <span className="text-base shrink-0">{visibleTrade.isBuy ? "📈" : "💰"}</span>

            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "text-[9px] font-black px-1.5 py-px rounded-full",
                  visibleTrade.isBuy ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                )}>
                  {visibleTrade.isBuy ? "매수" : "매도"}
                </span>
                <span className="text-xs font-bold text-white truncate">{visibleTrade.stockName}</span>
                <span className={cn(
                  "text-xs font-bold shrink-0",
                  visibleTrade.isBuy ? "text-red-400" : "text-blue-400"
                )}>
                  {visibleTrade.isBuy ? "+" : "-"}{visibleTrade.quantity}주
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-500">
                  {formatNumber(visibleTrade.totalAmount)}원
                </span>
                {!visibleTrade.isBuy && hasProfit && (
                  <span className={cn(
                    "text-[10px] font-bold",
                    isProfit ? "text-red-400" : "text-blue-400"
                  )}>
                    {isProfit ? "+" : ""}{formatNumber(Math.round(visibleTrade.profit!))}원
                    {visibleTrade.profitRate !== undefined &&
                      ` (${isProfit ? "+" : ""}${visibleTrade.profitRate.toFixed(1)}%)`}
                  </span>
                )}
              </div>
            </div>

            <span className="text-green-400 text-xs shrink-0">✓</span>
          </div>
        </div>
      )}

      {/* ── 버튼 영역 ── */}
      <div className="px-4 pb-1 pt-0.5 space-y-1.5">
        {/* 디버그 버튼 (DEBUG_BUTTONS = true 일 때만) */}
        {showDebugButtons && (
          <div className="flex gap-2">
            {onPreviewMiniReport && (
              <button
                onClick={onPreviewMiniReport}
                className="flex-1 py-2 rounded-xl font-bold text-[11px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/25"
              >
                <FileText className="w-3.5 h-3.5" />
                {currentDay}일차 리포트
              </button>
            )}
            {onPreviewFinalReport && (
              <button
                onClick={onPreviewFinalReport}
                className="flex-1 py-2 rounded-xl font-bold text-[11px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25"
              >
                <Trophy className="w-3.5 h-3.5" />
                최종 보고서
              </button>
            )}
          </div>
        )}

        {/* 다음 시간으로 */}
        <button
          onClick={onSkip}
          className={cn(
            "w-full py-2.5 rounded-xl font-bold text-[12px] transition-all active:scale-[0.98]",
            "flex items-center justify-center gap-1.5",
            "bg-gray-800/80 border border-gray-700/60 text-gray-400",
            "hover:bg-gray-700/80 hover:text-gray-300",
          )}
        >
          {LABELS.actions.skip}
          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
    </div>
  )
}
