"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { storage } from "@/lib/storage"
import scenariosData from "@/data/game-scenarios.json"
import scenarios100DaysData from "@/data/stock-100days-data.json"
import { cn } from "@/lib/utils"

export default function PendingOrdersPage() {
  const params = useParams()
  const router = useRouter()
  const scenarioId = params.id as string
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [scenario, setScenario] = useState<any>(null)

  useEffect(() => {
    // 100일 데이터 포함하여 시나리오 검색
    const allScenarios = [...scenariosData.scenarios, scenarios100DaysData]
    const foundScenario = allScenarios.find((s) => s.id === scenarioId)
    setScenario(foundScenario)

    const savedSession = storage.getGameSession(scenarioId)
    if (savedSession && savedSession.pendingOrders) {
      setPendingOrders(savedSession.pendingOrders)
    }
  }, [scenarioId])

  const handleCancelOrder = (index: number) => {
    const newOrders = [...pendingOrders]
    newOrders.splice(index, 1)
    setPendingOrders(newOrders)

    // Update storage
    const savedSession = storage.getGameSession(scenarioId)
    if (savedSession) {
      savedSession.pendingOrders = newOrders
      storage.setGameSession(scenarioId, savedSession)
    }
  }

  const getStockName = (stockId: string) => {
    return scenario?.stocks.find((s: any) => s.id === stockId)?.name || stockId
  }

  return (
    <div className="min-h-screen bg-[#191919] text-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 bg-[#191919] z-10 border-b border-gray-800">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-6 h-6 text-gray-300" />
        </button>
        <h1 className="text-lg font-bold">대기 중인 주문</h1>
      </div>

      <div className="flex-1 p-5">
        {pendingOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>대기 중인 주문이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((order, idx) => (
              <div key={idx} className="bg-gray-800/30 rounded-2xl p-5 border border-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">{getStockName(order.stockId)}</div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-bold px-1.5 py-0.5 rounded",
                          order.type === "buy" ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500",
                        )}
                      >
                        {order.type === "buy" ? "구매" : "판매"}
                      </span>
                      <span className="text-lg font-bold text-white">
                        {typeof order.targetPrice === "number" && order.targetPrice < 100
                          ? `${order.targetPrice > 0 ? "+" : ""}${order.targetPrice}% 도달 시`
                          : `${order.targetPrice.toLocaleString()}원 도달 시`}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {order.condition === "ge" ? "이상" : "이하"} 조건 • {order.quantity}주
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCancelOrder(idx)}
                  className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm transition-colors"
                >
                  주문 취소하기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
