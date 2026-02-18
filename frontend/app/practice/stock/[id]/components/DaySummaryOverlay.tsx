"use client"

import { cn } from "@/lib/utils"
import { LABELS } from "../config"

interface DaySummaryOverlayProps {
  isVisible: boolean
  currentDay: number
  currentDayName: string
  totalValue: number
  profitRate: number
}

export const DaySummaryOverlay = ({
  isVisible,
  currentDay,
  currentDayName,
  totalValue,
  profitRate,
}: DaySummaryOverlayProps) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="text-center animate-in fade-in duration-500 px-8">
        <div className="text-5xl mb-4">🌅</div>
        <div className="text-xl font-bold text-white mb-2">
          {currentDay}{LABELS.daySummary.dayEnd}
        </div>
        <div className="text-sm text-gray-400 mb-4">{currentDayName}</div>
        <div className="bg-gray-800/60 rounded-2xl p-4 inline-block">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs text-gray-400">{LABELS.daySummary.totalAsset}</div>
              <div className="text-lg font-bold text-white">{totalValue.toLocaleString()}원</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">{LABELS.daySummary.profitRate}</div>
              <div className={cn("text-lg font-bold", profitRate >= 0 ? "text-red-500" : "text-blue-500")}>
                {profitRate >= 0 ? "+" : ""}
                {profitRate}%
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500 animate-pulse">{LABELS.daySummary.movingToNext}</div>
      </div>
    </div>
  )
}
