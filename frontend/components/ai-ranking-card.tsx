"use client"

import { useState, useEffect } from "react"
import { Trophy, TrendingUp, ChevronRight, Zap, Shield, X } from "lucide-react"
import { cn } from "@/lib/utils"
import aiCompetitorsData from "@/data/ai-competitors.json"
import { Button } from "@/components/ui/button"

/**
 * AI 경쟁자 실시간 순위 카드 컴포넌트
 * README의 실시간 AI 대결 기능 구현
 */
export function AIRankingCard({
  userProfit,
  userName = "당신",
  isVisible = true,
  className = "",
  compact = false,
  onShowDetail,
}: {
  userProfit: number
  userName?: string
  isVisible?: boolean
  className?: string
  compact?: boolean
  onShowDetail?: () => void
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

  // Compact 모드 - 간단한 요약만 표시
  if (compact) {
    const topCompetitor = rankings[0]
    const userCompetitor = rankings.find((c) => c.id === "user")
    
    return (
      <div 
        className={cn("bg-[#1E1E1E] rounded-2xl p-4 border border-gray-800 cursor-pointer hover:bg-[#252525] transition-all", className)}
        onClick={onShowDetail}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-0.5">실시간 순위</div>
              <div className="text-lg font-bold text-white">
                {userRank}위
                {userRank === 1 && <span className="text-yellow-500 ml-2">🏆</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-0.5">내 수익률</div>
              <div className={cn("text-base font-bold", userProfit >= 0 ? "text-red-500" : "text-blue-500")}>
                {userProfit >= 0 ? "+" : ""}{userProfit.toFixed(1)}%
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
        </div>
        
        {userRank > 1 && topCompetitor && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="text-xs text-gray-400">
              1위 {topCompetitor.name}과(와) {(topCompetitor.profitRate - userProfit).toFixed(1)}%p 차이
            </div>
          </div>
        )}
      </div>
    )
  }

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
 * AI 랭킹 상세 다이얼로그
 * 전체 순위와 통계를 보여주는 모달
 */
export function AIRankingDetailModal({
  isOpen,
  onClose,
  userProfit,
  userName = "당신",
}: {
  isOpen: boolean
  onClose: () => void
  userProfit: number
  userName?: string
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[#1E1E1E] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-800 animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">
        {/* 헤더 */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gradient-to-b from-gray-800/50 to-transparent">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <h2 className="text-xl font-bold text-white">실시간 순위</h2>
              <p className="text-xs text-gray-400">1초마다 갱신</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 순위 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {rankings.map((competitor, index) => {
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
                      ? "bg-blue-500/10 border-2 border-blue-500/50"
                      : "bg-gray-800/50 border border-gray-700/50",
                    isTop3 && "shadow-lg",
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* 순위 */}
                    <div
                      className={cn(
                        "text-sm font-bold shrink-0 min-w-[50px]",
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
        </div>

        {/* 하단 정보 */}
        <div className="p-4 border-t border-gray-800 bg-gray-800/30">
          <div className="text-xs text-gray-400 text-center">
            {userRank === 1 && "🎉 현재 1위를 유지하고 있습니다!"}
            {userRank === 2 && `💪 1위와 ${(rankings[0].profitRate - userProfit).toFixed(1)}%p 차이입니다!`}
            {userRank >= 3 && `📈 ${userRank}위! ${rankings[0].name}을(를) 추격 중입니다.`}
          </div>
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

