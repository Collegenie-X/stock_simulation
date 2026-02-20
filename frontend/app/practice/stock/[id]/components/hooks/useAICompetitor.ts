"use client"

import { useState, useCallback, useMemo } from "react"
import aiCompetitorsData from "@/data/ai-competitors.json"

// ── 투자 성향 분류 ─────────────────────────────────────────
export type InvestStyle = "conservative" | "stable" | "balanced" | "aggressive" | "ultra_aggressive"

export interface AICompetitorState {
  id: string
  name: string
  emoji: string
  style: InvestStyle
  description: string
  motto: string
  cash: number
  holdings: Record<string, number>
  avgPrices: Record<string, number>
  totalValue: number
  profitRate: number
  todayActions: AIAction[]
  totalTrades: number
}

export interface AIAction {
  type: "buy" | "sell" | "hold"
  stockId: string
  stockName: string
  quantity: number
  price: number
  reason: string
}

interface StrategyParams {
  investmentRatio: number
  stopLoss: number
  takeProfit: number
  maxPositionRatio: number
  minCashRatio: number
}

const STRATEGY_PARAMS: Record<InvestStyle, StrategyParams> = {
  conservative: {
    investmentRatio: 0.3,
    stopLoss: -3,
    takeProfit: 8,
    maxPositionRatio: 0.15,
    minCashRatio: 0.5,
  },
  stable: {
    investmentRatio: 0.5,
    stopLoss: -5,
    takeProfit: 10,
    maxPositionRatio: 0.2,
    minCashRatio: 0.35,
  },
  balanced: {
    investmentRatio: 0.6,
    stopLoss: -7,
    takeProfit: 12,
    maxPositionRatio: 0.25,
    minCashRatio: 0.25,
  },
  aggressive: {
    investmentRatio: 0.7,
    stopLoss: -8,
    takeProfit: 15,
    maxPositionRatio: 0.35,
    minCashRatio: 0.15,
  },
  ultra_aggressive: {
    investmentRatio: 0.9,
    stopLoss: -10,
    takeProfit: 20,
    maxPositionRatio: 0.5,
    minCashRatio: 0.05,
  },
}

const BUY_REASONS: Record<InvestStyle, string[]> = {
  conservative: [
    "저변동성 종목 분할 매수",
    "배당 수익 기대 매수",
    "안정적 실적 기반 매수",
  ],
  stable: [
    "지지선 확인 후 분할 매수",
    "이동평균선 상향 돌파 매수",
    "거래량 증가 확인 매수",
  ],
  balanced: [
    "기술적/기본적 분석 복합 매수",
    "적정 밸류에이션 구간 진입",
    "업종 순환 매수 타이밍",
  ],
  aggressive: [
    "모멘텀 상승 초기 공격 매수",
    "3파 상승 패턴 감지 매수",
    "변동성 돌파 전략 매수",
  ],
  ultra_aggressive: [
    "급등 초기 풀 포지션 진입",
    "단기 과매도 반등 베팅",
    "고변동성 종목 집중 매수",
  ],
}

const SELL_REASONS: Record<InvestStyle, string[]> = {
  conservative: [
    "목표가 달성 익절",
    "손실 제한선 도달 손절",
    "리스크 축소 일부 매도",
  ],
  stable: [
    "분할 익절 실행",
    "저항선 부근 일부 매도",
    "포트폴리오 리밸런싱",
  ],
  balanced: [
    "기술적 과매수 신호 매도",
    "목표 수익률 달성 매도",
    "리스크 분산 매도",
  ],
  aggressive: [
    "급등 후 차익 실현",
    "모멘텀 둔화 감지 매도",
    "손절선 하회 즉시 매도",
  ],
  ultra_aggressive: [
    "단기 급등 후 전량 매도",
    "손절 기준 초과 손절",
    "자금 회수 후 신규 진입 준비",
  ],
}

const HOLD_REASONS: Record<InvestStyle, string[]> = {
  conservative: ["매수 조건 미충족, 관망 유지"],
  stable: ["추세 확인 중, 인내심 유지"],
  balanced: ["시그널 혼재, 관망 중"],
  aggressive: ["진입 타이밍 대기 중"],
  ultra_aggressive: ["기회 포착 대기"],
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 사용자 투자 성향을 분석하여 InvestStyle 반환
 */
function classifyUserStyle(
  userHoldings: Record<string, number>,
  userCash: number,
  initialCash: number,
  totalDecisions: number,
): InvestStyle {
  const holdingsCount = Object.keys(userHoldings).filter(k => userHoldings[k] > 0).length
  const totalHoldingsQty = Object.values(userHoldings).reduce((s, v) => s + Math.max(0, v), 0)
  const cashRatio = userCash / Math.max(initialCash, 1)

  if (cashRatio > 0.7 || holdingsCount === 0) return "conservative"
  if (cashRatio > 0.5) return "stable"
  if (cashRatio > 0.3) return "balanced"
  if (cashRatio > 0.1) return "aggressive"
  return "ultra_aggressive"
}

export function useAICompetitor(initialCash: number) {
  const [aiCash, setAiCash] = useState(initialCash)
  const [aiHoldings, setAiHoldings] = useState<Record<string, number>>({})
  const [aiAvgPrices, setAiAvgPrices] = useState<Record<string, number>>({})
  const [todayActions, setTodayActions] = useState<AIAction[]>([])
  const [totalTrades, setTotalTrades] = useState(0)
  const [matchedStyle, setMatchedStyle] = useState<InvestStyle>("balanced")

  const getMatchedAI = useCallback((style: InvestStyle) => {
    const comp = aiCompetitorsData.competitors.find(
      c => c.strategy.type === style
    ) || aiCompetitorsData.competitors[2]
    return comp
  }, [])

  /**
   * 하루 종료 시 AI의 투자 결정 시뮬레이션
   */
  const simulateDayTrades = useCallback((
    stocks: Array<{ id: string; name: string; turns: Array<{ price: number }> }>,
    currentTurn: number,
    userHoldings: Record<string, number>,
    userCash: number,
  ) => {
    const style = classifyUserStyle(userHoldings, userCash, initialCash, 0)
    setMatchedStyle(style)
    const params = STRATEGY_PARAMS[style]
    const actions: AIAction[] = []
    let cash = aiCash
    const holdings = { ...aiHoldings }
    const avgPrices = { ...aiAvgPrices }

    for (const stock of stocks) {
      const price = stock.turns[currentTurn]?.price
      const prevPrice = currentTurn > 0 ? stock.turns[currentTurn - 1]?.price : price
      if (!price || !prevPrice) continue

      const changeRate = ((price - prevPrice) / prevPrice) * 100
      const held = holdings[stock.id] || 0
      const avg = avgPrices[stock.id] || 0
      const profitPct = avg > 0 ? ((price - avg) / avg) * 100 : 0

      // 매도 판단
      if (held > 0) {
        if (profitPct >= params.takeProfit) {
          const sellQty = Math.max(1, Math.ceil(held * 0.5))
          cash += sellQty * price
          holdings[stock.id] = held - sellQty
          if (holdings[stock.id] <= 0) {
            delete holdings[stock.id]
            delete avgPrices[stock.id]
          }
          actions.push({
            type: "sell",
            stockId: stock.id,
            stockName: stock.name,
            quantity: sellQty,
            price,
            reason: pickRandom(SELL_REASONS[style]),
          })
          continue
        }
        if (profitPct <= params.stopLoss) {
          cash += held * price
          delete holdings[stock.id]
          delete avgPrices[stock.id]
          actions.push({
            type: "sell",
            stockId: stock.id,
            stockName: stock.name,
            quantity: held,
            price,
            reason: pickRandom(SELL_REASONS[style]),
          })
          continue
        }
      }

      // 매수 판단 (확률 + 조건)
      const totalVal = cash + Object.entries(holdings).reduce((s, [sid, qty]) => {
        const p = stocks.find(st => st.id === sid)?.turns[currentTurn]?.price || 0
        return s + p * qty
      }, 0)
      const positionVal = held * price
      const positionRatio = totalVal > 0 ? positionVal / totalVal : 0
      const cashRatio = totalVal > 0 ? cash / totalVal : 1

      const shouldBuy =
        cashRatio > params.minCashRatio &&
        positionRatio < params.maxPositionRatio &&
        changeRate > -2 &&
        Math.random() < params.investmentRatio * 0.4

      if (shouldBuy && price > 0) {
        const budgetForThis = cash * params.investmentRatio * (0.2 + Math.random() * 0.3)
        const qty = Math.max(1, Math.floor(budgetForThis / price))
        if (qty * price <= cash) {
          const oldQty = holdings[stock.id] || 0
          const oldAvg = avgPrices[stock.id] || 0
          const newAvg = oldQty > 0 ? (oldQty * oldAvg + qty * price) / (oldQty + qty) : price
          cash -= qty * price
          holdings[stock.id] = oldQty + qty
          avgPrices[stock.id] = newAvg
          actions.push({
            type: "buy",
            stockId: stock.id,
            stockName: stock.name,
            quantity: qty,
            price,
            reason: pickRandom(BUY_REASONS[style]),
          })
        }
      }
    }

    if (actions.length === 0) {
      actions.push({
        type: "hold",
        stockId: "",
        stockName: "",
        quantity: 0,
        price: 0,
        reason: pickRandom(HOLD_REASONS[style]),
      })
    }

    setAiCash(cash)
    setAiHoldings(holdings)
    setAiAvgPrices(avgPrices)
    setTodayActions(actions)
    setTotalTrades(prev => prev + actions.filter(a => a.type !== "hold").length)

    return { cash, holdings, avgPrices, actions, style }
  }, [aiCash, aiHoldings, aiAvgPrices, initialCash])

  /**
   * AI 총자산 계산
   */
  const calcTotalValue = useCallback((
    stocks: Array<{ id: string; turns: Array<{ price: number }> }>,
    currentTurn: number,
  ) => {
    const stockValue = Object.entries(aiHoldings).reduce((sum, [sid, qty]) => {
      const stock = stocks.find(s => s.id === sid)
      const price = stock?.turns[currentTurn]?.price || 0
      return sum + price * qty
    }, 0)
    return Math.round(aiCash + stockValue)
  }, [aiCash, aiHoldings])

  const aiCompetitor = useMemo((): Omit<AICompetitorState, "totalValue" | "profitRate"> => {
    const comp = getMatchedAI(matchedStyle)
    return {
      id: comp.id,
      name: comp.name,
      emoji: comp.emoji,
      style: matchedStyle,
      description: comp.strategy.description,
      motto: comp.personality.motto,
      cash: aiCash,
      holdings: aiHoldings,
      avgPrices: aiAvgPrices,
      todayActions,
      totalTrades,
    }
  }, [matchedStyle, aiCash, aiHoldings, aiAvgPrices, todayActions, totalTrades, getMatchedAI])

  const resetAI = useCallback(() => {
    setAiCash(initialCash)
    setAiHoldings({})
    setAiAvgPrices({})
    setTodayActions([])
    setTotalTrades(0)
    setMatchedStyle("balanced")
  }, [initialCash])

  return {
    aiCompetitor,
    simulateDayTrades,
    calcTotalValue,
    resetAI,
    matchedStyle,
  }
}
