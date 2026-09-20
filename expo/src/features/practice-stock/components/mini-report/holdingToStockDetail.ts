import type { MiniReportHoldingItem, StockDetailData, TradeRecord } from "@/features/practice-stock/types"

// holdingItem → StockDetailData 변환 (3일차 보고서용)
export function holdingToStockDetail(
  item: MiniReportHoldingItem,
  trades: TradeRecord[],
  aiSimilarProfitRate: number,
  aiBestProfitRate: number,
): StockDetailData {
  const stockTrades = trades.filter(t => t.stockId === item.stockId || t.stockName === item.stockName)
  const sellTrades = stockTrades.filter(t => t.action === "sell")
  const realizedProfit = sellTrades.reduce((s, t) => s + (t.profit ?? 0), 0)
  const totalProfit = realizedProfit + item.profitAmount
  const totalCost = stockTrades.filter(t => t.action === "buy").reduce((s, t) => s + t.totalAmount, 0)
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : item.profitRate

  // 거래 기반 간이 가격 히스토리 생성
  const priceHistory = stockTrades
    .filter(t => t.turn !== undefined)
    .sort((a, b) => (a.turn ?? 0) - (b.turn ?? 0))
    .map(t => ({ turn: t.turn ?? 0, price: t.price, date: t.date ?? "" }))

  // 현재가 포인트 추가
  if (priceHistory.length === 0 || priceHistory[priceHistory.length - 1].price !== item.currentPrice) {
    priceHistory.push({ turn: (priceHistory[priceHistory.length - 1]?.turn ?? 0) + 3, price: item.currentPrice, date: "현재" })
  }

  return {
    stockId: item.stockId,
    stockName: item.stockName,
    category: "",
    myTotalProfit: totalProfit,
    myTotalProfitRate: Number(totalProfitRate.toFixed(1)),
    myTrades: stockTrades.map(t => ({
      id: t.id,
      stockId: t.stockId,
      stockName: t.stockName,
      action: t.action,
      price: t.price,
      quantity: t.quantity,
      totalAmount: t.totalAmount,
      avgBuyPrice: t.avgBuyPrice,
      profit: t.profit,
      profitRate: t.profitRate,
      date: t.date,
      turn: t.turn,
      day: t.day,
    })),
    currentHolding: item.quantity,
    avgBuyPrice: item.avgPrice,
    currentPrice: item.currentPrice,
    unrealizedProfit: item.profitAmount,
    unrealizedProfitRate: item.profitRate,
    priceHistory,
    // 3일차에서는 AI 거래 상세 없음 — 빈 배열
    aiSimilarTrades: [],
    aiSimilarProfit: 0,
    aiSimilarProfitRate,
    aiBestTrades: [],
    aiBestProfit: 0,
    aiBestProfitRate,
    waveComment: "",
  }
}
