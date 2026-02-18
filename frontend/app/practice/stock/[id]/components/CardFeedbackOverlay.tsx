"use client"

import { cn } from "@/lib/utils"
import type { CardFeedbackData } from "../types"

interface CardFeedbackOverlayProps {
  isVisible: boolean
  data: CardFeedbackData | null
}

export const CardFeedbackOverlay = ({ isVisible, data }: CardFeedbackOverlayProps) => {
  if (!isVisible || !data) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="text-center animate-in zoom-in duration-300">
        <div className="text-8xl mb-4 animate-bounce">{data.emoji}</div>
        <div className="text-2xl font-bold text-white mb-2">{data.message}</div>
        {data.priceChange && (
          <div
            className={cn(
              "text-lg font-bold",
              data.type === "buy"
                ? "text-red-400"
                : data.type === "sell"
                ? "text-blue-400"
                : "text-gray-400"
            )}
          >
            {data.priceChange}
          </div>
        )}
      </div>
    </div>
  )
}
