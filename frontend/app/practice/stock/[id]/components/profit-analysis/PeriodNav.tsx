"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { LABELS } from "../../config"
import type { ProfitPeriod } from "../../types"

interface PeriodNavProps {
  activePeriod: ProfitPeriod
  periodIndex: number
  periodLabel: string
  onChangePeriod: (period: ProfitPeriod) => void
  onPrev: () => void
  onNext: () => void
  canGoPrev: boolean
  canGoNext: boolean
}

export const PeriodNav = ({
  activePeriod,
  periodIndex,
  periodLabel,
  onChangePeriod,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: PeriodNavProps) => {
  const periods = LABELS.profitAnalysis.periods

  return (
    <div className="border-b border-gray-800">
      {/* 기간 탭 */}
      <div className="flex px-5 pt-3 gap-1">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => onChangePeriod(period as ProfitPeriod)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-semibold transition-colors",
              activePeriod === period
                ? "bg-gray-700 text-white"
                : "text-gray-500 hover:text-gray-300",
            )}
          >
            {period}
          </button>
        ))}
      </div>

      {/* 기간 네비게이터 */}
      <div className="flex items-center justify-center gap-4 py-3">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className={cn(
            "p-1 rounded-full transition-colors",
            canGoPrev ? "text-gray-300 hover:text-white" : "text-gray-700",
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-white min-w-[120px] text-center">
          {periodLabel}
        </span>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={cn(
            "p-1 rounded-full transition-colors",
            canGoNext ? "text-gray-300 hover:text-white" : "text-gray-700",
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
