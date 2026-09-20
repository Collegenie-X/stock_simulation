import { formatNumber } from "@/lib/format"
import { localStore, storage } from "@/lib/storage"

export interface ExecuteTradeArgs {
  scenarioId: string
  session: any
  stock: any
  selectedStockId: string
  type: "buy" | "sell"
  orderType: "market" | "conditional"
  tradingMode: "price" | "percent"
  quantity: number
  currentPrice: number
  currentTurn: number
  takeProfit: number | null
  stopLoss: number | null
}

export type ExecuteTradeResult = { ok: true } | { ok: false; message: string }

/**
 * 거래 실행 (웹 trade/page.tsx 의 handleAction 로직)
 * - 세션/거래 기록 저장, 리스트 화면 토스트용 lastTradeToast 기록까지 수행
 * - 실패 시 사용자에게 보여줄 메시지를 반환
 */
export function executeTrade({
  scenarioId,
  session,
  stock,
  selectedStockId,
  type,
  orderType,
  tradingMode,
  quantity,
  currentPrice,
  currentTurn,
  takeProfit,
  stopLoss,
}: ExecuteTradeArgs): ExecuteTradeResult {
  const isBuy = type === "buy"

  const percentToPrice = (pct: number) => Math.round(currentPrice * (1 + pct / 100))

  // 수량 검증
  if (quantity < 1) {
    console.error("수량이 0입니다!")
    return { ok: false, message: "구매할 수량을 입력해주세요." }
  }

  const newSession = { ...session }
  const newHoldings = { ...(newSession.holdings || {}) }
  const newAvgPrices = { ...(newSession.averagePrices || {}) }
  let newCash = newSession.cash || 0

  if (orderType === "market") {
    if (isBuy) {
      // 구매 로직
      const cost = quantity * currentPrice

      if (cost > newCash) {
        return { ok: false, message: `잔액이 부족합니다. 필요: ${formatNumber(cost)}원, 보유: ${formatNumber(newCash)}원` }
      }

      const oldQty = newHoldings[selectedStockId] || 0
      const oldAvg = newAvgPrices[selectedStockId] || 0
      const newAvg = oldQty > 0 ? (oldQty * oldAvg + cost) / (oldQty + quantity) : currentPrice

      newCash -= cost
      newHoldings[selectedStockId] = oldQty + quantity
      newAvgPrices[selectedStockId] = newAvg

      const tradeRecordBuy = {
        id: `${Date.now()}-buy-${selectedStockId}`,
        stockId: selectedStockId,
        stockName: stock.name,
        action: "buy" as const,
        price: currentPrice,
        quantity,
        totalAmount: quantity * currentPrice,
        date: stock.turns[currentTurn]?.date || new Date().toISOString().split("T")[0],
        turn: currentTurn,
        day: session.currentDay || 1,
      }
      storage.addTradeRecord(scenarioId, tradeRecordBuy)
      newSession.feedback = { text: `${stock.name} ${quantity}주 구매 완료!`, type: "success" }
    } else {
      // 판매 로직
      const oldQty = newHoldings[selectedStockId] || 0

      if (quantity > oldQty) {
        return { ok: false, message: `보유 수량이 부족합니다. 보유: ${oldQty}주` }
      }

      const avgBuyPrice = newAvgPrices[selectedStockId] || currentPrice
      const revenue = quantity * currentPrice
      const tradeProfit = (currentPrice - avgBuyPrice) * quantity
      const tradeProfitRate = avgBuyPrice > 0 ? ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100 : 0

      newCash += revenue
      newHoldings[selectedStockId] = oldQty - quantity

      // 보유량이 0이 되면 평균 가격도 초기화
      if (newHoldings[selectedStockId] === 0) {
        delete newHoldings[selectedStockId]
        delete newAvgPrices[selectedStockId]
      }

      const tradeRecordSell = {
        id: `${Date.now()}-sell-${selectedStockId}`,
        stockId: selectedStockId,
        stockName: stock.name,
        action: "sell" as const,
        price: currentPrice,
        quantity,
        totalAmount: revenue,
        avgBuyPrice,
        profit: Math.round(tradeProfit),
        profitRate: Math.round(tradeProfitRate * 10) / 10,
        date: stock.turns[currentTurn]?.date || new Date().toISOString().split("T")[0],
        turn: currentTurn,
        day: session.currentDay || 1,
      }
      storage.addTradeRecord(scenarioId, tradeRecordSell)
      newSession.feedback = { text: `${stock.name} ${quantity}주 판매 완료!`, type: "success" }
    }
  } else {
    // Conditional Order
    const newPendingOrders = [...(newSession.pendingOrders || [])]
    if (takeProfit !== null) {
      const targetPrice = tradingMode === "price" ? takeProfit : percentToPrice(takeProfit)

      newPendingOrders.push({
        stockId: selectedStockId,
        type,
        targetPrice: targetPrice,
        condition: isBuy ? "le" : "ge", // Take profit logic
        quantity,
      })
    }
    if (stopLoss !== null) {
      const targetPrice = tradingMode === "price" ? stopLoss : percentToPrice(stopLoss)

      newPendingOrders.push({
        stockId: selectedStockId,
        type,
        targetPrice: targetPrice,
        condition: isBuy ? "ge" : "le", // Stop loss logic
        quantity,
      })
    }
    newSession.pendingOrders = newPendingOrders
    newSession.feedback = { text: "예약 주문이 설정되었습니다", type: "success" }
  }

  // 세션 업데이트 (웹과 동일한 순서/값)
  newSession.cash = newCash
  newSession.holdings = newHoldings
  newSession.averagePrices = newAvgPrices
  newSession.currentTurn = session.currentTurn
  newSession.pendingOrders = session.pendingOrders || []
  newSession.weeklyHistory = session.weeklyHistory || []
  newSession.lastWeekValue = session.lastWeekValue || 0
  newSession.selectedStockId = selectedStockId

  // 저장
  storage.setGameSession(scenarioId, newSession)

  // 저장 확인 (동기적으로 즉시 확인)
  const savedCheck: any = storage.getGameSession(scenarioId)
  const savedData = savedCheck?.data || savedCheck

  // 구매 시에만 holdings가 있어야 함, 판매 시에는 holdings가 비어있을 수 있음
  const holdingsValid = isBuy ? Object.keys(savedData?.holdings || {}).length > 0 : true

  if (!savedCheck) {
    console.error("❌ 저장 실패!")
    return { ok: false, message: "저장에 실패했습니다. 다시 시도해주세요." }
  }

  if (isBuy && !holdingsValid) {
    console.error("❌ 구매 후 holdings가 비어있습니다!", savedData)
    return { ok: false, message: "구매가 제대로 저장되지 않았습니다. 다시 시도해주세요." }
  }

  // 거래 결과 저장 (리스트 화면에서 토스트로 표시) — 웹: sessionStorage
  if (orderType === "market") {
    const avgBuyPrice = (session.averagePrices || {})[selectedStockId] || currentPrice
    const profit = !isBuy ? (currentPrice - avgBuyPrice) * quantity : undefined
    const profitRate = !isBuy && avgBuyPrice > 0 ? ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100 : undefined

    const tradeToast = {
      isBuy,
      stockName: stock.name,
      quantity,
      profit,
      profitRate,
      totalAmount: quantity * currentPrice,
    }
    localStore.setItem("lastTradeToast", JSON.stringify(tradeToast))
  }

  return { ok: true }
}
