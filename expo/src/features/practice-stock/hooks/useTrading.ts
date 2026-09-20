import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, type Href } from "expo-router"
import { formatNumber } from "@/lib/format"
import { storage } from "@/lib/storage"
import { CHARACTER_REACTIONS } from "../utils/stockDataUtils"
import type { ViewMode } from "../types"
import type { DayProgressionState } from "./useDayProgression"
import type { GameSessionState } from "./useGameSession"
import type { GameScenario } from "./useScenario"

interface UseTradingArgs {
  scenarioId: string
  scenario: GameScenario | null
  session: GameSessionState
  progression: DayProgressionState
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}

/**
 * 거래 로직 — 즉시 매수/매도/건너뛰기, 거래 페이지 이동, 예약(조건) 주문 체결
 * (웹 page.tsx 의 handleAction / handleDecision / pendingOrders effect / addConditionalOrder 와 동일)
 */
export function useTrading({ scenarioId, scenario, session, progression, viewMode, setViewMode }: UseTradingArgs) {
  const router = useRouter()
  const {
    currentTurn,
    holdings,
    setHoldings,
    averagePrices,
    setAveragePrices,
    cash,
    setCash,
    pendingOrders,
    setPendingOrders,
    weeklyHistory,
    lastWeekValue,
    selectedStockId,
    isPlaying,
    setFeedback,
    setPauseAutoSave,
  } = session
  const {
    isWaitingForDecision,
    setIsWaitingForDecision,
    setShowCardFeedback,
    setCardFeedbackData,
    setTotalDecisions,
    setDailyUserDecisions,
    advanceToNext,
  } = progression

  const [quantity, setQuantity] = useState(1)
  const [orderType, setOrderType] = useState<"market" | "conditional">("market")
  const [inputValue, setInputValue] = useState<string>("")

  useEffect(() => {
    setQuantity(1)
    setInputValue("") // Reset input value
    setOrderType("market") // Reset order type
  }, [selectedStockId, viewMode]) // Reset quantity when changing stock or view mode

  // 거래 페이지로 이동
  const handleAction = useMemo(
    () =>
      (action: "buy" | "sell", qty: number = quantity, stockId: string = selectedStockId) => {
        // 자동 저장 일시 중지
        setPauseAutoSave(true)

        // 현재 상태 저장
        const sessionData = {
          currentTurn,
          holdings,
          averagePrices,
          cash,
          pendingOrders,
          weeklyHistory,
          lastWeekValue,
          selectedStockId: stockId,
          isPlaying, // 재생 상태도 저장
        }

        storage.setGameSession(scenarioId, sessionData as any)

        router.push(`/practice/stock/${scenarioId}/trade?type=${action}` as Href)
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentTurn,
      holdings,
      averagePrices,
      cash,
      pendingOrders,
      weeklyHistory,
      lastWeekValue,
      selectedStockId,
      isPlaying,
      scenarioId,
      router,
    ],
  )

  // 예약 주문 체결 확인 (턴이 바뀔 때마다)
  useEffect(() => {
    if (pendingOrders.length > 0 && currentTurn > 0 && scenario) {
      const newPendingOrders = [...pendingOrders]
      const executedIndices: number[] = []

      newPendingOrders.forEach((order, index) => {
        const stock = scenario.stocks.find((s) => s.id === order.stockId)
        if (!stock) return

        const currentPrice = stock.turns[currentTurn]?.price
        if (!currentPrice) return

        let executed = false
        let shouldExecute = false

        if (order.type === "sell") {
          // 판매 조건 확인
          if (order.condition === "ge" && currentPrice >= order.targetPrice) {
            shouldExecute = true
          } else if (order.condition === "le" && currentPrice <= order.targetPrice) {
            shouldExecute = true
          }

          if (shouldExecute) {
            // 판매 실행
            const currentHoldings = holdings[order.stockId] || 0
            if (currentHoldings >= order.quantity) {
              const revenue = order.quantity * currentPrice
              setCash((prev) => prev + revenue)
              setHoldings((prev) => {
                const newHoldings = { ...prev }
                newHoldings[order.stockId] = (newHoldings[order.stockId] || 0) - order.quantity
                if (newHoldings[order.stockId] === 0) {
                  delete newHoldings[order.stockId]
                }
                return newHoldings
              })
              setAveragePrices((prev) => {
                const newAvgPrices = { ...prev }
                if (holdings[order.stockId] - order.quantity === 0) {
                  delete newAvgPrices[order.stockId]
                }
                return newAvgPrices
              })
              setFeedback({ text: `${stock.name} ${order.quantity}주 판매 완료`, type: "success" })
              executed = true
            }
          }
        } else if (order.type === "buy") {
          // 구매 조건 확인
          if (order.condition === "le" && currentPrice <= order.targetPrice) {
            shouldExecute = true
          } else if (order.condition === "ge" && currentPrice >= order.targetPrice) {
            shouldExecute = true
          }

          if (shouldExecute) {
            // 구매 실행
            const cost = order.quantity * currentPrice
            if (cash >= cost) {
              const oldQty = holdings[order.stockId] || 0
              const oldAvg = averagePrices[order.stockId] || 0
              const newAvg = oldQty > 0 ? (oldQty * oldAvg + cost) / (oldQty + order.quantity) : currentPrice

              setCash((prev) => prev - cost)
              setHoldings((prev) => ({
                ...prev,
                [order.stockId]: (prev[order.stockId] || 0) + order.quantity,
              }))
              setAveragePrices((prev) => ({
                ...prev,
                [order.stockId]: newAvg,
              }))
              setFeedback({ text: `${stock.name} ${order.quantity}주 구매 완료`, type: "success" })
              executed = true
            }
          }
        }

        if (executed) {
          executedIndices.push(index)
        }
      })

      if (executedIndices.length > 0) {
        // 실행된 주문 제거
        const remainingOrders = newPendingOrders.filter((_, i) => !executedIndices.includes(i))
        setPendingOrders(remainingOrders)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurn, pendingOrders, scenario, cash, holdings, averagePrices])

  // 자유 거래 핸들러 (매수/매도/건너뛰기)
  const handleDecision = useCallback(
    (action: "buy" | "sell" | "skip", qty: number = 1, targetStockId?: string) => {
      const stockId = targetStockId || selectedStockId
      const stock = scenario?.stocks.find((s) => s.id === stockId)
      if (!stock) return

      const price = stock.turns[currentTurn]?.price || stock.initialPrice

      // 하루 결정 기록 (종목별 AI 비교용)
      if (action !== "skip") {
        setDailyUserDecisions((prev) => {
          // 같은 종목 같은 액션이 이미 있으면 수량 누적, 아니면 추가
          const existing = prev.findIndex((d) => d.stockId === stockId && d.action === action)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + qty }
            return updated
          }
          return [
            ...prev,
            {
              stockId,
              stockName: stock.name,
              action,
              quantity: qty,
              price,
              turn: currentTurn,
              day: 0, // currentDay는 closure 문제로 별도 처리
            },
          ]
        })
      } else {
        // skip(관망)도 기록 (아직 해당 종목 결정이 없을 때만)
        setDailyUserDecisions((prev) => {
          if (prev.some((d) => d.stockId === stockId)) return prev
          return [
            ...prev,
            {
              stockId,
              stockName: stock.name,
              action: "skip",
              quantity: 0,
              price,
              turn: currentTurn,
              day: 0,
            },
          ]
        })
      }

      if (action === "buy") {
        const cost = qty * price
        if (cash >= cost) {
          const oldQty = holdings[stockId] || 0
          const oldAvg = averagePrices[stockId] || 0
          const newAvg = oldQty > 0 ? (oldQty * oldAvg + cost) / (oldQty + qty) : price

          setCash((prev) => prev - cost)
          setHoldings((prev) => ({ ...prev, [stockId]: (prev[stockId] || 0) + qty }))
          setAveragePrices((prev) => ({ ...prev, [stockId]: newAvg }))

          setFeedback({
            text: `${stock.name} ${qty}주 매수 (${formatNumber(cost)}원)`,
            type: "success",
          })
        }
      } else if (action === "sell") {
        const currentQty = holdings[stockId] || 0
        const sellQty = Math.min(qty, currentQty)
        if (sellQty > 0) {
          const revenue = sellQty * price
          const avgPrice = averagePrices[stockId] || price
          const profit = (price - avgPrice) * sellQty

          setCash((prev) => prev + revenue)
          setHoldings((prev) => {
            const newH = { ...prev, [stockId]: (prev[stockId] || 0) - sellQty }
            if (newH[stockId] <= 0) delete newH[stockId]
            return newH
          })
          if ((holdings[stockId] || 0) - sellQty <= 0) {
            setAveragePrices((prev) => {
              const newA = { ...prev }
              delete newA[stockId]
              return newA
            })
          }

          setFeedback({
            text: `${stock.name} ${sellQty}주 매도 (${profit >= 0 ? "+" : ""}${formatNumber(profit)}원)`,
            type: profit >= 0 ? "success" : "neutral",
          })
        }
      } else if (action === "skip") {
        // 건너뛰기 (다음 시간으로)
        setIsWaitingForDecision(false)
        const reactions = CHARACTER_REACTIONS.skip
        const emoji = reactions[Math.floor(Math.random() * reactions.length)]
        setShowCardFeedback(true)
        setCardFeedbackData({
          type: "skip",
          emoji,
          message: "다음 시간으로",
        })
        setTotalDecisions((d) => d + 1)
        setTimeout(() => advanceToNext(), 1000)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenario, currentTurn, cash, holdings, averagePrices, selectedStockId, isWaitingForDecision, advanceToNext],
  )

  // Add conditional order logic
  const addConditionalOrder = (type: "buy" | "sell", targetPrice: number, condition: "ge" | "le") => {
    setPendingOrders((prev) => [
      ...prev,
      {
        stockId: selectedStockId,
        type,
        targetPrice,
        condition,
        quantity: quantity, // Use current quantity
      },
    ])
    setFeedback({ text: "예약 주문이 설정되었습니다", type: "success" })
    setViewMode("detail") // Go back to detail view after setting order
  }

  return {
    quantity,
    setQuantity,
    orderType,
    setOrderType,
    inputValue,
    setInputValue,
    handleAction,
    handleDecision,
    addConditionalOrder,
  }
}
