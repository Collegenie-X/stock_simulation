"use client"

import { useState, useEffect } from "react"
import { Trophy, TrendingUp, ChevronRight, Zap, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import aiCompetitorsData from "@/data/ai-competitors.json"

/**
 * AI 경쟁자 실시간 순위 카드 컴포넌트
 * README의 실시간 AI 대결 기능 구현
 */
export function AIRankingCard({
  userProfit,
  userName = "당신",
  isVisible = true,
  className = "",
}: {
  userProfit: number
  userName?: string
  isVisible?: boolean
  className?: string
}) {
  const [rankings, setRankings] = useState<any[]>([])
  const [userRank, setUserRank] = useState(0)

  useEffect(() => {
    // AI와 사용자를 합쳐서 순위 계산
    const competitors = aiCompetitorsData.competitors.map((ai) => ({
      ...ai,
      isAI: true,
      profitRate: ai.stats.profitRate,
    }))

    const user = {
      id: "user",
      name: userName,
      emoji: "👤",
      nickname: "Player",
      profitRate: userProfit,
      isAI: false,
    }

    const allCompetitors = [...competitors, user].sort((a, b) => b.profitRate - a.profitRate)

    setRankings(allCompetitors)
    setUserRank(allCompetitors.findIndex((c) => c.id === "user") + 1)
  }, [userProfit, userName])

  if (!isVisible) return null

  return (
    <div className={cn("bg-[#1E1E1E] rounded-3xl p-5 border border-gray-800", className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-white">실시간 순위</h3>
        </div>
        <div className="text-xs text-gray-400">1초마다 갱신</div>
      </div>

      {/* 순위 목록 */}
      <div className="space-y-2">
        {rankings.slice(0, 6).map((competitor, index) => {
          const isUser = !competitor.isAI
          const rank = index + 1
          const isTop3 = rank <= 3
          const isProfit = competitor.profitRate >= 0

          // 순위 이모지
          const getRankEmoji = (rank: number) => {
            if (rank === 1) return "🥇"
            if (rank === 2) return "🥈"
            if (rank === 3) return "🥉"
            return `${rank}위`
          }

          // AI 전략 아이콘
          const getStrategyIcon = (ai: any) => {
            if (!ai.isAI) return null
            if (ai.strategy.type === "conservative") return <Shield className="w-4 h-4 text-blue-400" />
            if (ai.strategy.type === "aggressive") return <Zap className="w-4 h-4 text-yellow-500" />
            if (ai.strategy.type === "ultra_aggressive") return <Zap className="w-4 h-4 text-red-500" />
            return <TrendingUp className="w-4 h-4 text-green-500" />
          }

          return (
            <div
              key={competitor.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-2xl transition-all",
                isUser
                  ? "bg-blue-500/10 border-2 border-blue-500/50 animate-pulse"
                  : "bg-gray-800/50 border border-gray-700/50",
                isTop3 && "shadow-lg",
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* 순위 */}
                <div
                  className={cn(
                    "text-sm font-bold shrink-0",
                    isUser ? "text-blue-400" : isTop3 ? "text-yellow-500" : "text-gray-400",
                  )}
                >
                  {getRankEmoji(rank)}
                </div>

                {/* 아바타 */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0",
                    isUser ? "bg-blue-500/20" : "bg-gray-700/50",
                  )}
                >
                  {competitor.emoji}
                </div>

                {/* 이름 & 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("font-bold text-sm truncate", isUser ? "text-blue-400" : "text-gray-200")}
                    >
                      {competitor.name}
                    </span>
                    {competitor.isAI && getStrategyIcon(competitor)}
                  </div>
                  {competitor.isAI && (
                    <div className="text-xs text-gray-500 truncate">{competitor.strategy?.description}</div>
                  )}
                  {isUser && userRank === 1 && (
                    <div className="text-xs text-yellow-500 font-bold">🏆 1위 유지 중!</div>
                  )}
                </div>

                {/* 수익률 */}
                <div className="text-right shrink-0">
                  <div
                    className={cn(
                      "text-base font-bold",
                      isProfit ? "text-red-500" : "text-blue-500",
                      isUser && "text-lg",
                    )}
                  >
                    {isProfit ? "+" : ""}
                    {competitor.profitRate.toFixed(1)}%
                  </div>
                  {isUser && userRank > 1 && (
                    <div className="text-xs text-gray-400">
                      {(rankings[userRank - 2].profitRate - userProfit).toFixed(1)}%p 차이
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 하단 정보 */}
      <div className="mt-4 p-3 bg-gray-800/30 rounded-xl">
        <div className="text-xs text-gray-400 text-center">
          {userRank === 1 && "🎉 현재 1위를 유지하고 있습니다!"}
          {userRank === 2 && `💪 1위와 ${(rankings[0].profitRate - userProfit).toFixed(1)}%p 차이입니다!`}
          {userRank >= 3 && `📈 ${userRank}위! ${rankings[0].name}을(를) 추격 중입니다.`}
        </div>
      </div>
    </div>
  )
}

/**
 * AI 알림 팝업 컴포넌트
 * AI가 매수/매도할 때 표시되는 실시간 알림
 */
export function AINotification({
  aiName,
  action,
  stockName,
  price,
  isVisible,
  onClose,
}: {
  aiName: string
  action: "buy" | "sell"
  stockName: string
  price: number
  isVisible: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-24 right-4 z-[150] animate-in slide-in-from-right duration-300">
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md border border-purple-500/50 rounded-2xl p-4 min-w-[280px] shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🤖</div>
          <div className="flex-1">
            <div className="font-bold text-white mb-1">AI 움직임 감지!</div>
            <div className="text-sm text-gray-300">
              <span className="font-bold text-purple-400">{aiName}</span>가{" "}
              <span className={cn("font-bold", action === "buy" ? "text-red-500" : "text-blue-500")}>
                {action === "buy" ? "매수" : "매도"}
              </span>
              했습니다
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {stockName} @ {price.toLocaleString()}원
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

