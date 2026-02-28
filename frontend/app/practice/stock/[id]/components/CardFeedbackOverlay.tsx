"use client"

import { cn } from "@/lib/utils"
import type { CardFeedbackData } from "../types"

interface CardFeedbackOverlayProps {
  isVisible: boolean
  data: CardFeedbackData | null
}

export const CardFeedbackOverlay = ({ isVisible, data }: CardFeedbackOverlayProps) => {
  if (!isVisible || !data) return null

  const accentColor =
    data.type === "buy"
      ? "text-red-400 border-red-500/30 bg-red-500/10"
      : data.type === "sell"
      ? "text-blue-400 border-blue-500/30 bg-blue-500/10"
      : "text-gray-300 border-gray-600/40 bg-gray-800/80"

  return (
    <div className="fixed top-4 left-4 right-4 z-50 pointer-events-none animate-in slide-in-from-top-3 duration-200">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg",
        accentColor
      )}>
        <span className="text-2xl shrink-0 leading-none">{data.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white">{data.message}</div>
          {data.priceChange && (
            <div className={cn(
              "text-xs font-bold mt-0.5",
              data.type === "buy" ? "text-red-400" : data.type === "sell" ? "text-blue-400" : "text-gray-400"
            )}>
              {data.priceChange}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
