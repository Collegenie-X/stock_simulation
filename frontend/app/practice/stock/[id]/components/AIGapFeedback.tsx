"use client"

import { useState } from "react"
import { Eye, EyeOff, TrendingUp, TrendingDown, Waves } from "lucide-react"
import { cn } from "@/lib/utils"
import { LABELS } from "../config"
import type { AIGapFeedbackProps } from "../types"

// ── AI 갭 피드백 배너 (매수/매도 직후 화면 하단에 표시) ──
export const AIGapFeedback = ({
  isVisible,
  userProfitRate,
  bestAIProfitRate,
  similarAIProfitRate,
  bestAIName,
  similarAIName,
  waveAccuracy,
  onHide,
}: AIGapFeedbackProps) => {
  const [collapsed, setCollapsed] = useState(false)

  if (!isVisible) return null

  const gapToBest = Number((userProfitRate - bestAIProfitRate).toFixed(1))
  const gapToSimilar = Number((userProfitRate - similarAIProfitRate).toFixed(1))

  if (collapsed) {
    return (
      <div className="fixed bottom-24 right-4 z-30">
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-full text-[10px] font-bold text-gray-300 shadow-lg active:scale-95 transition-transform"
        >
          <Eye className="w-3 h-3 text-cyan-400" />
          {LABELS.aiGapFeedback.showLabel}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-30 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/60 rounded-2xl p-3 shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold text-white">{LABELS.aiGapFeedback.title}</span>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="flex items-center gap-1 text-[9px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            <EyeOff className="w-3 h-3" />
            {LABELS.aiGapFeedback.hideLabel}
          </button>
        </div>

        {/* 갭 수치 */}
        <div className="grid grid-cols-3 gap-2">
          {/* 나 */}
          <div className="bg-blue-500/10 rounded-xl p-2 text-center border border-blue-500/20">
            <div className="text-[8px] text-gray-500 mb-0.5">나</div>
            <div className={cn(
              "text-sm font-extrabold",
              userProfitRate >= 0 ? "text-red-400" : "text-blue-400"
            )}>
              {userProfitRate >= 0 ? "+" : ""}{userProfitRate.toFixed(1)}%
            </div>
          </div>

          {/* 유사 AI 갭 */}
          <div className="bg-purple-500/10 rounded-xl p-2 text-center border border-purple-500/20">
            <div className="text-[8px] text-gray-500 mb-0.5 truncate">{LABELS.aiGapFeedback.similarAIGap}</div>
            <div className={cn(
              "text-sm font-extrabold",
              gapToSimilar >= 0 ? "text-green-400" : "text-orange-400"
            )}>
              {gapToSimilar >= 0 ? "+" : ""}{gapToSimilar}%p
            </div>
          </div>

          {/* 최고 AI 갭 */}
          <div className="bg-yellow-500/10 rounded-xl p-2 text-center border border-yellow-500/20">
            <div className="text-[8px] text-gray-500 mb-0.5 truncate">{LABELS.aiGapFeedback.bestAIGap}</div>
            <div className={cn(
              "text-sm font-extrabold",
              gapToBest >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {gapToBest >= 0 ? "+" : ""}{gapToBest}%p
            </div>
          </div>
        </div>

        {/* 파도 읽기 정확도 */}
        {waveAccuracy > 0 && (
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[9px] text-gray-500 shrink-0">{LABELS.aiGapFeedback.waveAccuracy}</span>
            <div className="flex-1 bg-gray-700 rounded-full h-1">
              <div
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  waveAccuracy >= 70 ? "bg-green-400" : waveAccuracy >= 50 ? "bg-yellow-400" : "bg-red-400"
                )}
                style={{ width: `${waveAccuracy}%` }}
              />
            </div>
            <span className={cn(
              "text-[9px] font-bold shrink-0",
              waveAccuracy >= 70 ? "text-green-400" : waveAccuracy >= 50 ? "text-yellow-400" : "text-red-400"
            )}>
              {waveAccuracy}%
            </span>
          </div>
        )}

        {/* 따라하기 팁 */}
        <div className="mt-2 text-[9px] text-gray-500 text-center">
          {gapToBest < -5
            ? `💡 ${bestAIName}의 매매 패턴을 따라해 보세요`
            : gapToBest >= 0
            ? "🎉 최고 AI를 앞서고 있습니다!"
            : `📈 ${Math.abs(gapToBest).toFixed(1)}%p 차이 — 조금만 더!`}
        </div>
      </div>
    </div>
  )
}
