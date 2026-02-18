"use client"

import { ResponsiveContainer, AreaChart, Area } from "recharts"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LABELS } from "../config"
import type { WeeklyReportModalProps } from "../types"

export const WeeklyReportModal = ({
  isOpen,
  onClose,
  weekNumber,
  weeklyReturn,
  totalReturn,
  chartData,
}: WeeklyReportModalProps) => {
  if (!isOpen) return null

  const isProfit = weeklyReturn >= 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="bg-[#1E1E1E] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">{LABELS.weeklyReport.title}</h2>
              <p className="text-gray-400 text-sm">
                {weekNumber}{LABELS.weeklyReport.weekLabel}
              </p>
            </div>
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
                isProfit ? "bg-red-500/20" : "bg-blue-500/20",
              )}
            >
              {isProfit ? "🔥" : "💧"}
            </div>
          </div>

          {/* 수익률 카드 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-2xl p-4">
              <p className="text-gray-400 text-xs mb-1">{LABELS.weeklyReport.weeklyReturn}</p>
              <p className={cn("text-xl font-bold", isProfit ? "text-red-500" : "text-blue-500")}>
                {isProfit ? "+" : ""}
                {weeklyReturn}%
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-4">
              <p className="text-gray-400 text-xs mb-1">{LABELS.weeklyReport.totalReturn}</p>
              <p className={cn("text-xl font-bold", totalReturn >= 0 ? "text-red-500" : "text-blue-500")}>
                {totalReturn >= 0 ? "+" : ""}
                {totalReturn}%
              </p>
            </div>
          </div>

          {/* 자산 흐름도 */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-300 mb-3">{LABELS.weeklyReport.chartTitle}</h3>
            <div className="h-48 bg-gray-800/30 rounded-2xl p-2 border border-gray-800/50">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isProfit ? "#ef4444" : "#3b82f6"} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={isProfit ? "#ef4444" : "#3b82f6"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={isProfit ? "#ef4444" : "#3b82f6"}
                    strokeWidth={3}
                    fill="url(#reportGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg"
          >
            {LABELS.actions.nextWeek}
          </Button>
        </div>
      </div>
    </div>
  )
}
