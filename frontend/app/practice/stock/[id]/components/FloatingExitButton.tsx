"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingExitButtonProps {
  onClick: () => void
}

export const FloatingExitButton = ({ onClick }: FloatingExitButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed top-4 right-4 z-50",
        "flex items-center gap-1.5 px-3 py-2 rounded-xl",
        "bg-gray-800/90 hover:bg-gray-700 backdrop-blur-sm",
        "border border-gray-700/50 hover:border-gray-600",
        "text-gray-400 hover:text-white",
        "transition-all duration-200",
        "text-xs font-bold",
        "shadow-lg hover:shadow-xl",
        "active:scale-95"
      )}
    >
      <span>종료</span>
      <X className="w-3.5 h-3.5" />
    </button>
  )
}
