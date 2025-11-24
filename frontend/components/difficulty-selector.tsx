"use client"

import { Shield, TrendingUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * 게임 난이도 선택 컴포넌트
 */
export function DifficultySelector({
  selectedDifficulty,
  onSelect,
  className = "",
}: {
  selectedDifficulty: "easy" | "medium" | "hard"
  onSelect: (difficulty: "easy" | "medium" | "hard") => void
  className?: string
}) {
  const difficulties = [
    {
      id: "easy" as const,
      name: "초보자",
      icon: Shield,
      color: "green",
      description: "변동성 낮음, 힌트 3개 제공",
      features: ["📊 안정형 종목 중심", "💡 힌트 3개 제공", "🛡️ 손실 보험 1개"],
    },
    {
      id: "medium" as const,
      name: "중급자",
      icon: TrendingUp,
      color: "blue",
      description: "균형잡힌 변동성, 힌트 2개",
      features: ["📈 다양한 종목 혼합", "💡 힌트 2개 제공", "⚖️ 균형잡힌 난이도"],
    },
    {
      id: "hard" as const,
      name: "고수",
      icon: Zap,
      color: "red",
      description: "고변동성, 힌트 1개",
      features: ["🔥 고변동 종목 중심", "💡 힌트 1개 제공", "🏆 보상 2배"],
    },
  ]

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-sm font-bold text-gray-300 mb-4">🎯 게임 난이도 선택</div>
      {difficulties.map((diff) => {
        const Icon = diff.icon
        const isSelected = selectedDifficulty === diff.id
        
        return (
          <button
            key={diff.id}
            onClick={() => onSelect(diff.id)}
            className={cn(
              "w-full text-left p-4 rounded-2xl border-2 transition-all",
              isSelected
                ? diff.color === "green"
                  ? "bg-green-500/10 border-green-500"
                  : diff.color === "blue"
                    ? "bg-blue-500/10 border-blue-500"
                    : "bg-red-500/10 border-red-500"
                : "bg-gray-800/50 border-gray-700 hover:border-gray-600",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  isSelected
                    ? diff.color === "green"
                      ? "bg-green-500/20"
                      : diff.color === "blue"
                        ? "bg-blue-500/20"
                        : "bg-red-500/20"
                    : "bg-gray-700/50",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isSelected
                      ? diff.color === "green"
                        ? "text-green-500"
                        : diff.color === "blue"
                          ? "text-blue-500"
                          : "text-red-500"
                      : "text-gray-400",
                  )}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("font-bold", isSelected ? "text-white" : "text-gray-300")}>{diff.name}</span>
                  {isSelected && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">선택됨</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mb-2">{diff.description}</div>
                <div className="space-y-1">
                  {diff.features.map((feature, idx) => (
                    <div key={idx} className="text-xs text-gray-500">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

