"use client"

import { X, Clock, Eye, Target, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import aiCompetitorsData from "@/data/ai-competitors.json"

/**
 * 특수 아이템 상점 모달
 * README의 특수 아이템 시스템 구현
 */
export function ItemsShopModal({
  isOpen,
  onClose,
  userPoints,
  onPurchase,
}: {
  isOpen: boolean
  onClose: () => void
  userPoints: number
  onPurchase: (itemId: string, cost: number) => void
}) {
  if (!isOpen) return null

  const items = aiCompetitorsData.items

  const getItemIcon = (emoji: string) => {
    switch (emoji) {
      case "⏰":
        return Clock
      case "🔮":
        return Eye
      case "🎯":
        return Target
      case "🛡️":
        return Shield
      case "🔥":
        return Zap
      default:
        return Target
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="bg-[#1E1E1E] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-800 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-white">🎁 아이템 상점</h2>
              <p className="text-sm text-gray-400 mt-1">게임에 도움이 되는 특수 아이템</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* 보유 포인트 */}
        <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">보유 포인트</span>
            <span className="text-2xl font-bold text-yellow-500">{userPoints.toLocaleString()}P</span>
          </div>
        </div>

        {/* 아이템 목록 */}
        <div className="p-6 space-y-3">
          {items.map((item) => {
            const Icon = getItemIcon(item.emoji)
            const canAfford = userPoints >= item.cost
            
            return (
              <div
                key={item.id}
                className={cn(
                  "p-4 rounded-2xl border transition-all",
                  canAfford
                    ? "bg-gray-800/50 border-gray-700 hover:border-blue-500/50 hover:bg-gray-800"
                    : "bg-gray-900/50 border-gray-800 opacity-60",
                )}
              >
                <div className="flex items-start gap-4">
                  {/* 아이콘 */}
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0",
                    canAfford ? "bg-blue-500/10" : "bg-gray-800/50"
                  )}>
                    <Icon className={cn("w-6 h-6", canAfford ? "text-blue-400" : "text-gray-600")} />
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{item.name}</span>
                        <span className="text-xl">{item.emoji}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-yellow-500">{item.cost}P</div>
                        <div className="text-xs text-gray-500">{item.uses}회</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                    
                    {/* 구매 버튼 */}
                    {canAfford ? (
                      <Button
                        onClick={() => {
                          onPurchase(item.id, item.cost)
                        }}
                        size="sm"
                        className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold"
                      >
                        구매하기
                      </Button>
                    ) : (
                      <div className="text-xs text-red-400 text-center py-2">
                        포인트 부족 ({(item.cost - userPoints).toLocaleString()}P 필요)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 하단 정보 */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/50">
          <div className="text-xs text-gray-400 text-center">
            💡 포인트는 거래 성공 시 자동으로 적립됩니다
            <br />
            광고 시청으로 무료 포인트를 획득할 수 있습니다
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 보유 아이템 표시 컴포넌트
 */
export function OwnedItemsBadge({ itemCount }: { itemCount: number }) {
  if (itemCount === 0) return null

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full">
      <span className="text-sm">🎁</span>
      <span className="text-sm font-bold text-purple-400">{itemCount}개</span>
    </div>
  )
}

