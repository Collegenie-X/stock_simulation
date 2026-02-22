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
  sentiment?: string
  ratio?: number
  decisionTimeSec?: number
}

export interface GameState {
  cash: number
  holdings: number
  avgPrice: number
  totalInitial: number
  stockName: string
  stockCode: string
}

export interface PersonalityResult {
  type: string
  scores: Record<string, number>
  traits: Record<string, number>
  patterns: Record<string, number>
}

export function getInitialState(stock: StockInfo): GameState {
  const initialCash = G.defaultCash

  return {
    cash: initialCash,
    holdings: G.defaultHoldings,
    avgPrice: G.defaultHoldings > 0 ? stock.initialPrice : 0,
    totalInitial: initialCash + G.defaultHoldings * stock.initialPrice,
    stockName: stock.name,
    stockCode: stock.code,
  }
}

export function analyzePersonality(trades: TradeRecord[]): PersonalityResult {
  const scores: Record<string, number> = {
    challenger: 0,
    analyst: 0,
    conservative: 0,
    emotional: 0,
    systematic: 0,
  }
  const patterns: Record<string, number> = {
    buyOnDip: 0,
    buyOnRally: 0,
    sellOnPeak: 0,
    panicSell: 0,
    holdSteady: 0,
  }

  for (const trade of trades) {
    const isNeg = trade.sentiment === "negative" || trade.sentiment === "shock"
    const isPos = trade.sentiment === "positive"
    const r = trade.ratio ?? 0.5
    const sec = trade.decisionTimeSec ?? 15

    if (trade.action === "buy") {
      if (isNeg) {
        patterns.buyOnDip++
        scores.challenger += 3
        scores.analyst += 2
      } else if (isPos) {
        patterns.buyOnRally++
        scores.emotional += 2
        scores.challenger += 1
      } else {
        scores.analyst += 1
        scores.systematic += 1
      }
      if (r >= 0.75) scores.challenger += 2
      else if (r <= 0.25) scores.conservative += 2
    } else if (trade.action === "sell") {
      if (isPos) {
        patterns.sellOnPeak++
        scores.analyst += 3
        scores.systematic += 2
      } else if (isNeg) {
        patterns.panicSell++
        scores.emotional += 3
        scores.conservative += 1
      } else {
        scores.systematic += 1
      }
    } else {
      patterns.holdSteady++
      scores.systematic += 2
      scores.conservative += 2
    }

    if (sec <= 8) {
      scores.challenger += 1
      scores.emotional += 1
    } else if (sec >= 18) {
      scores.analyst += 1
      scores.systematic += 1
    }
  }

  const activeTrades = trades.filter((t) => t.action !== "hold").length
  if (activeTrades >= 6) {
    scores.challenger += 2
    scores.emotional += 1
  } else if (activeTrades <= 2) {
    scores.systematic += 2
    scores.conservative += 1
  }

  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
  const maxS = Math.max(...Object.values(scores), 1)
  const norm = (v: number) => Math.round(Math.min(100, Math.max(10, (v / maxS) * 100)))

  const traits: Record<string, number> = {
    riskTaking: norm(scores.challenger * 1.5 + scores.emotional * 0.5),
    timing: norm(scores.analyst * 1.5 + scores.challenger * 0.5),
    patience: norm(scores.systematic * 1.5 + scores.conservative * 0.5),
    rationality: norm(scores.analyst * 1.5 + scores.systematic * 0.5),
    emotionControl: norm(scores.systematic * 1.2 + scores.analyst * 0.8),
  }

  return { type: dominant, scores, traits, patterns }
}

// SSR/클라이언트 hydration 불일치 방지를 위해 시드 기반 결정론적 노이즈 사용
function seededNoise(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1 // -1 ~ 1
}

function interpolate(start: number, end: number, count: number, vol: number): number[] {
  const pts: number[] = [start]
  const diff = end - start
  for (let i = 1; i < count - 1; i++) {
    const t = i / (count - 1)
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    const base = start + diff * eased
    const noise = base * vol * seededNoise(start + end * 0.01 + i)
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

export interface TheoreticalMaxResult {
  maxValue: number
  maxRate: number
  singleTradeValue: number
  singleTradeRate: number
  lowestPrice: number
  lowestTurn: number
  highestPrice: number
  highestTurn: number
  strategy: Array<{ turn: number; action: "buy" | "sell"; price: number; qty: number }>
}

/** 그리디 알고리즘으로 이론적 최대 수익 계산 */
export function calcTheoreticalMax(turns: TurnData[], initCash: number): TheoreticalMaxResult {
  const prices = turns.map((t) => t.endPrice)

  // 단순 저점 → 고점 (1회 매매)
  let lowestPrice = prices[0]
  let lowestTurn = 1
  let highestPrice = prices[prices.length - 1]
  let highestTurn = turns.length

  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < lowestPrice) {
      lowestPrice = prices[i]
      lowestTurn = i + 1
    }
  }
  // 최저점 이후 최고가
  let postLowHigh = prices[lowestTurn - 1]
  for (let i = lowestTurn - 1; i < prices.length; i++) {
    if (prices[i] > postLowHigh) {
      postLowHigh = prices[i]
      highestPrice = prices[i]
      highestTurn = i + 1
    }
  }

  const singleQty = Math.floor(initCash / lowestPrice)
  const singleCost = singleQty * lowestPrice
  const singleRemain = initCash - singleCost
  const singleValue = singleQty * highestPrice + singleRemain
  const singleTradeRate = ((singleValue - initCash) / initCash) * 100

  // 그리디: 다음 턴보다 오르면 매수, 내리면(또는 마지막) 매도
  let cash = initCash
  let holdings = 0
  let avgP = 0
  const strategy: TheoreticalMaxResult["strategy"] = []

  for (let i = 0; i < prices.length; i++) {
    const price = prices[i]
    const nextPrice = i < prices.length - 1 ? prices[i + 1] : -1

    if (holdings === 0 && nextPrice > price) {
      const qty = Math.floor(cash / price)
      if (qty > 0) {
        cash -= qty * price
        holdings = qty
        avgP = price
        strategy.push({ turn: i + 1, action: "buy", price, qty })
      }
    } else if (holdings > 0 && (nextPrice < price || i === prices.length - 1)) {
      cash += holdings * price
      strategy.push({ turn: i + 1, action: "sell", price, qty: holdings })
      holdings = 0
      avgP = 0
    }
  }

  const maxValue = cash + holdings * prices[prices.length - 1]
  const maxRate = ((maxValue - initCash) / initCash) * 100

  return {
    maxValue: Math.round(maxValue),
    maxRate,
    singleTradeValue: Math.round(singleValue),
    singleTradeRate,
    lowestPrice,
    lowestTurn,
    highestPrice,
    highestTurn,
    strategy,
  }
}
