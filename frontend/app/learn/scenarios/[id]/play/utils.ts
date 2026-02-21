import type { ScenarioEvent, StockInfo } from "@/data/legendary-scenarios"
import playContent from "@/data/scenario-play-content.json"

const { game: G } = playContent

export interface TurnData {
  turn: number
  event: ScenarioEvent
  startPrice: number
  endPrice: number
  change: number
  chartPoints: number[]
}

export type ActionType = "buy" | "sell" | "hold"

export interface TradeRecord {
  turn: number
  action: ActionType
  quantity: number
  price: number
  eventTitle: string
  ratioLabel?: string
}

export interface GameState {
  cash: number
  holdings: number
  avgPrice: number
  totalInitial: number
  stockName: string
  stockCode: string
}

export function getInitialState(stock: StockInfo): GameState {
  const holdings = G.defaultHoldings
  const avgPrice = stock.initialPrice
  const holdingValue = holdings * avgPrice
  const extraCash = Math.round(avgPrice * 50)
  const totalCash = holdingValue + extraCash
  const totalInitial = totalCash

  return {
    cash: extraCash,
    holdings,
    avgPrice,
    totalInitial,
    stockName: stock.name,
    stockCode: stock.code,
  }
}

function interpolate(start: number, end: number, count: number, vol: number): number[] {
  const pts: number[] = [start]
  const diff = end - start
  for (let i = 1; i < count - 1; i++) {
    const t = i / (count - 1)
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    const base = start + diff * eased
    const noise = base * vol * (Math.random() * 2 - 1)
    pts.push(Math.round(base + noise))
  }
  pts.push(end)
  return pts
}

export function buildTurns(events: ScenarioEvent[], initialPrice: number): TurnData[] {
  const evts = events.slice(0, 8)
  let price = initialPrice
  return evts.map((evt, idx) => {
    const pct = parseFloat(evt.priceChange.replace("%", "").replace("+", ""))
    const startPrice = price
    const endPrice = Math.round(price * (1 + pct / 100))
    const vol = Math.abs(pct) > 3 ? 0.006 : 0.004
    const chartPoints = interpolate(startPrice, endPrice, G.chartPointsPerTurn, vol)
    price = endPrice
    return { turn: idx + 1, event: evt, startPrice, endPrice, change: pct, chartPoints }
  })
}

export function getChartPoints(turns: TurnData[], upTo: number): number[] {
  const pts: number[] = []
  for (let i = 0; i <= upTo && i < turns.length; i++) {
    pts.push(...(i === 0 ? turns[i].chartPoints : turns[i].chartPoints.slice(1)))
  }
  return pts
}

export function portfolioValue(cash: number, holdings: number, price: number) {
  return cash + holdings * price
}

export function calcRate(current: number, initial: number) {
  return initial === 0 ? 0 : ((current - initial) / initial) * 100
}

export function idealAction(turns: TurnData[], idx: number, hasHoldings: boolean): ActionType {
  const next = turns.slice(idx + 1)
  if (next.length === 0) return hasHoldings ? "sell" : "hold"
  const nextChange = next[0].change
  const futureSum = next.reduce((s, t) => s + t.change, 0)
  if (nextChange < -2 || futureSum < -4) return hasHoldings ? "sell" : "hold"
  if (nextChange > 2 || futureSum > 4) return "buy"
  if (hasHoldings && futureSum < -1.5) return "sell"
  return "hold"
}

export function feedbackLevel(action: ActionType, ideal: ActionType): "correct" | "good" | "bad" {
  if (action === ideal) return "correct"
  if ((ideal === "sell" && action === "buy") || (ideal === "buy" && action === "sell")) return "bad"
  return "good"
}

export function getMarketHint(turns: TurnData[], idx: number, hasHoldings: boolean) {
  const { hints } = playContent
  const ideal = idealAction(turns, idx, hasHoldings)
  const seed = idx + (turns[idx]?.change ?? 0)
  const pick = (arr: string[]) => arr[Math.abs(Math.round(seed * 10)) % arr.length]

  let hint: string, ratioGuide: string
  if (ideal === "buy") {
    hint = pick(hints.buySignals)
    ratioGuide = hints.ratioGuide.moderate
  } else if (ideal === "sell") {
    hint = pick(hints.sellSignals)
    ratioGuide = hasHoldings ? hints.ratioGuide.aggressive : hints.ratioGuide.conservative
  } else {
    hint = pick(hints.holdSignals)
    ratioGuide = hints.ratioGuide.conservative
  }
  return { hint, ratioGuide, signal: ideal }
}

export function getGrade(rate: number): string {
  for (const [key, cfg] of Object.entries(playContent.grades)) {
    if (rate >= cfg.minRate) return key
  }
  return "D"
}
