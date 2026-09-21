import { STOCK_HISTORY, type StockHistoryEvent, type StockHistoryPoint } from "@/data/stock-history"

// 게임 시작 전 3개월 주가 + 이벤트 (종목별 JSON: src/data/stock-history/<id>.json)

const cache = new Map<string, StockHistoryPoint[]>()

/**
 * 게임 시작 전 3개월 일별 주가. 마지막 값이 게임 시작가와 같도록 맞춰서 돌려준다.
 * (AI/로봇 종목처럼 시작가가 실행 때 정해지는 종목은 비율로 맞춤)
 */
export function getStockHistory(stockId: string, initialPrice: number): StockHistoryPoint[] {
  const file = STOCK_HISTORY[stockId]
  if (!file || !initialPrice) return []

  const key = `${stockId}:${initialPrice}`
  const cached = cache.get(key)
  if (cached) return cached

  const scale = initialPrice / file.basePrice
  const history = scale === 1 ? file.history : file.history.map((h) => ({ date: h.date, price: Math.round(h.price * scale) }))
  cache.set(key, history)
  return history
}

interface StockLike {
  id: string
  initialPrice: number
  turns?: { price: number }[]
}

const preGameCache = new Map<string, StockHistoryPoint[]>()

/**
 * 차트 앞에 붙일 "게임 전" 구간. 첫 턴 가격이 시작가와 같으면
 * JSON 의 마지막 날(=시작가)과 겹치므로 그 하루는 뺀다.
 */
export function getPreGameHistory(stock: StockLike): StockHistoryPoint[] {
  const history = getStockHistory(stock.id, stock.initialPrice)
  if (stock.turns?.[0]?.price !== stock.initialPrice) return history

  const key = `${stock.id}:${stock.initialPrice}`
  let trimmed = preGameCache.get(key)
  if (!trimmed) {
    trimmed = history.slice(0, -1)
    preGameCache.set(key, trimmed)
  }
  return trimmed
}

/** 첫 턴의 "어제 종가" — 게임을 시작하자마자 등락률이 보이도록 */
export function getPreGameClose(stock: StockLike): number {
  const history = getPreGameHistory(stock)
  return history[history.length - 1]?.price || stock.initialPrice || 0
}

/** 게임 시작 전 3개월 동안 있었던 뉴스 (오래된 순) */
export function getStockHistoryEvents(stockId: string): StockHistoryEvent[] {
  return STOCK_HISTORY[stockId]?.events ?? []
}

/** 3개월 흐름 요약 (예: "꾸준히 오름", +19.4%) */
export function getStockHistorySummary(stockId: string) {
  const file = STOCK_HISTORY[stockId]
  if (!file) return null
  return { patternLabel: file.patternLabel, changeRate: file.changeRate }
}
