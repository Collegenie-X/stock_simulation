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

// ── 갭 분석 데이터 ─────────────────────────────────────────
export interface GapRecord {
  day: number
  userRate: number
  bestAIRate: number
  similarAIRate: number
  gapToBest: number
  gapToSimilar: number
  waveAccuracy: number  // 파도 흐름 정확도 (0~100)
}

export interface WaveAnalysis {
  trend: "상승" | "하락" | "횡보"
  strength: number  // 0~100
  accuracy: number  // 사용자의 파도 읽기 정확도
  comment: string
}

export interface AIAction {
  type: "buy" | "sell" | "hold"
  stockId: string
  stockName: string
  quantity: number
  price: number
  reason: string
}

// 사용자의 하루 결정 기록 (종목별)
export interface UserDayDecision {
  stockId: string
  stockName: string
  action: "buy" | "sell" | "skip"
  quantity: number
  price: number
  turn: number
  day: number
}

// 종목별 3자 비교 결과
export interface StockCompareResult {
  stockId: string
  stockName: string
  price: number
  userAction: "buy" | "sell" | "skip"
  userQty: number
  similarAction: "buy" | "sell" | "hold"
  similarQty: number
  similarReason: string
  bestAction: "buy" | "sell" | "hold"
  bestQty: number
  bestReason: string
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

  // ── 최고 AI (ultra_aggressive) 상태 ─────────────────────
  const [bestAICash, setBestAICash] = useState(initialCash)
  const [bestAIHoldings, setBestAIHoldings] = useState<Record<string, number>>({})
  const [bestAIAvgPrices, setBestAIAvgPrices] = useState<Record<string, number>>({})
  const [bestAITrades, setBestAITrades] = useState(0)

  // ── 갭 기록 ─────────────────────────────────────────────
  const [gapHistory, setGapHistory] = useState<GapRecord[]>([])

  const getMatchedAI = useCallback((style: InvestStyle) => {
    const comp = aiCompetitorsData.competitors.find(
      c => c.strategy.type === style
    ) || aiCompetitorsData.competitors[2]
    return comp
  }, [])

  /**
   * 단일 AI 스타일로 하루 거래 시뮬레이션 (내부 공통 함수)
   */
  const runSingleAIDay = useCallback((
    stocks: Array<{ id: string; name: string; turns: Array<{ price: number }> }>,
    currentTurn: number,
    style: InvestStyle,
    cash: number,
    holdings: Record<string, number>,
    avgPrices: Record<string, number>,
  ) => {
    const params = STRATEGY_PARAMS[style]
    const actions: AIAction[] = []
    let c = cash
    const h = { ...holdings }
    const ap = { ...avgPrices }

    for (const stock of stocks) {
      const price = stock.turns[currentTurn]?.price
      const prevPrice = currentTurn > 0 ? stock.turns[currentTurn - 1]?.price : price
      if (!price || !prevPrice) continue

      const changeRate = ((price - prevPrice) / prevPrice) * 100
      const held = h[stock.id] || 0
      const avg = ap[stock.id] || 0
      const profitPct = avg > 0 ? ((price - avg) / avg) * 100 : 0

      if (held > 0) {
        if (profitPct >= params.takeProfit) {
          const sellQty = Math.max(1, Math.ceil(held * 0.5))
          c += sellQty * price
          h[stock.id] = held - sellQty
          if (h[stock.id] <= 0) { delete h[stock.id]; delete ap[stock.id] }
          actions.push({ type: "sell", stockId: stock.id, stockName: stock.name, quantity: sellQty, price, reason: pickRandom(SELL_REASONS[style]) })
          continue
        }
        if (profitPct <= params.stopLoss) {
          c += held * price
          delete h[stock.id]; delete ap[stock.id]
          actions.push({ type: "sell", stockId: stock.id, stockName: stock.name, quantity: held, price, reason: pickRandom(SELL_REASONS[style]) })
          continue
        }
      }

      const totalVal = c + Object.entries(h).reduce((s, [sid, qty]) => {
        const p = stocks.find(st => st.id === sid)?.turns[currentTurn]?.price || 0
        return s + p * qty
      }, 0)
      const positionVal = held * price
      const positionRatio = totalVal > 0 ? positionVal / totalVal : 0
      const cashRatio = totalVal > 0 ? c / totalVal : 1

      const shouldBuy =
        cashRatio > params.minCashRatio &&
        positionRatio < params.maxPositionRatio &&
        changeRate > -2 &&
        Math.random() < params.investmentRatio * 0.4

      if (shouldBuy && price > 0) {
        const budgetForThis = c * params.investmentRatio * (0.2 + Math.random() * 0.3)
        const qty = Math.max(1, Math.floor(budgetForThis / price))
        if (qty * price <= c) {
          const oldQty = h[stock.id] || 0
          const oldAvg = ap[stock.id] || 0
          const newAvg = oldQty > 0 ? (oldQty * oldAvg + qty * price) / (oldQty + qty) : price
          c -= qty * price
          h[stock.id] = oldQty + qty
          ap[stock.id] = newAvg
          actions.push({ type: "buy", stockId: stock.id, stockName: stock.name, quantity: qty, price, reason: pickRandom(BUY_REASONS[style]) })
        }
      }
    }

    if (actions.length === 0) {
      actions.push({ type: "hold", stockId: "", stockName: "", quantity: 0, price: 0, reason: pickRandom(HOLD_REASONS[style]) })
    }

    return { cash: c, holdings: h, avgPrices: ap, actions }
  }, [])

  /**
   * 파도 흐름 분석: 사용자의 매매 타이밍과 가격 흐름 비교
   */
  const analyzeWavePattern = useCallback((
    userActions: AIAction[],
    bestActions: AIAction[],
    stocks: Array<{ id: string; name: string; turns: Array<{ price: number }> }>,
    currentTurn: number,
  ): WaveAnalysis => {
    // 가격 변동 방향 분석
    const priceChanges = stocks.slice(0, 5).map(s => {
      const cur = s.turns[currentTurn]?.price || 0
      const prev = currentTurn > 0 ? s.turns[currentTurn - 1]?.price || cur : cur
      return (cur - prev) / Math.max(prev, 1) * 100
    })
    const avgChange = priceChanges.reduce((a, b) => a + b, 0) / Math.max(priceChanges.length, 1)

    const trend: WaveAnalysis["trend"] = avgChange > 1 ? "상승" : avgChange < -1 ? "하락" : "횡보"
    const strength = Math.min(100, Math.abs(avgChange) * 10)

    // 사용자 매매 타이밍 정확도 (상승장에서 매수, 하락장에서 매도했는지)
    const userBuys = userActions.filter(a => a.type === "buy").length
    const userSells = userActions.filter(a => a.type === "sell").length
    let accuracy = 50

    if (trend === "상승" && userBuys > userSells) accuracy = 70 + Math.min(30, userBuys * 10)
    else if (trend === "하락" && userSells > userBuys) accuracy = 70 + Math.min(30, userSells * 10)
    else if (trend === "횡보") accuracy = 55
    else accuracy = Math.max(20, 50 - Math.abs(userBuys - userSells) * 10)

    const bestBuys = bestActions.filter(a => a.type === "buy").length
    const gapFromBest = Math.abs(userBuys - bestBuys)
    accuracy = Math.max(10, Math.min(100, accuracy - gapFromBest * 5))

    const comments: Record<WaveAnalysis["trend"], string[]> = {
      상승: [
        "상승 파도가 왔습니다. 매수 타이밍을 잘 잡으셨나요?",
        "파도가 올라가는 구간입니다. 올라타는 연습을 해보세요.",
      ],
      하락: [
        "하락 파도입니다. 손절 타이밍이 중요한 구간이에요.",
        "파도가 내려가는 구간입니다. 현금 비중을 높이는 연습을 해보세요.",
      ],
      횡보: [
        "횡보 구간입니다. 다음 파도를 기다리는 인내가 필요합니다.",
        "파도가 잠잠합니다. 진입 타이밍을 신중히 고르세요.",
      ],
    }

    return {
      trend,
      strength: Math.round(strength),
      accuracy: Math.round(accuracy),
      comment: pickRandom(comments[trend]),
    }
  }, [])

  /**
   * 사용자가 선택한 종목에 대해서만 AI 결정 시뮬레이션
   * — 같은 종목, 다른 선택 → 수익률 차이 비교
   */
  const simulateSameStockDecisions = useCallback((
    userDecisions: UserDayDecision[],
    stocks: Array<{ id: string; name: string; turns: Array<{ price: number }> }>,
    style: InvestStyle,
    cash: number,
    holdings: Record<string, number>,
    avgPrices: Record<string, number>,
  ): { cash: number; holdings: Record<string, number>; avgPrices: Record<string, number>; compareResults: StockCompareResult[] } => {
    const params = STRATEGY_PARAMS[style]
    let c = cash
    const h = { ...holdings }
    const ap = { ...avgPrices }
    const compareResults: StockCompareResult[] = []

    for (const decision of userDecisions) {
      const stock = stocks.find(s => s.id === decision.stockId)
      if (!stock) continue
      const price = decision.price
      if (!price) continue

      const held = h[decision.stockId] || 0
      const avg = ap[decision.stockId] || 0
      const profitPct = avg > 0 ? ((price - avg) / avg) * 100 : 0

      const totalVal = c + Object.entries(h).reduce((s, [sid, qty]) => {
        const p = stocks.find(st => st.id === sid)?.turns[decision.turn]?.price || 0
        return s + p * qty
      }, 0)
      const positionRatio = totalVal > 0 ? (held * price) / totalVal : 0
      const cashRatio = totalVal > 0 ? c / totalVal : 1

      let aiAction: "buy" | "sell" | "hold" = "hold"
      let aiQty = 0
      let aiReason = pickRandom(HOLD_REASONS[style])

      // 매도 조건 우선 체크
      if (held > 0 && profitPct >= params.takeProfit) {
        aiAction = "sell"
        aiQty = Math.max(1, Math.ceil(held * 0.5))
        aiReason = pickRandom(SELL_REASONS[style])
        c += aiQty * price
        h[decision.stockId] = held - aiQty
        if (h[decision.stockId] <= 0) { delete h[decision.stockId]; delete ap[decision.stockId] }
      } else if (held > 0 && profitPct <= params.stopLoss) {
        aiAction = "sell"
        aiQty = held
        aiReason = pickRandom(SELL_REASONS[style])
        c += held * price
        delete h[decision.stockId]; delete ap[decision.stockId]
      } else if (
        cashRatio > params.minCashRatio &&
        positionRatio < params.maxPositionRatio &&
        Math.random() < params.investmentRatio * 0.6
      ) {
        // 매수 결정
        const budget = c * params.investmentRatio * (0.25 + Math.random() * 0.25)
        const qty = Math.max(1, Math.floor(budget / price))
        if (qty * price <= c) {
          aiAction = "buy"
          aiQty = qty
          aiReason = pickRandom(BUY_REASONS[style])
          const oldQty = h[decision.stockId] || 0
          const oldAvg = ap[decision.stockId] || 0
          const newAvg = oldQty > 0 ? (oldQty * oldAvg + qty * price) / (oldQty + qty) : price
          c -= qty * price
          h[decision.stockId] = oldQty + qty
          ap[decision.stockId] = newAvg
        }
      }

      compareResults.push({
        stockId: decision.stockId,
        stockName: decision.stockName,
        price,
        userAction: decision.action,
        userQty: decision.quantity,
        similarAction: aiAction,
        similarQty: aiQty,
        similarReason: aiReason,
        bestAction: "hold",
        bestQty: 0,
        bestReason: "",
      })
    }

    return { cash: c, holdings: h, avgPrices: ap, compareResults }
  }, [])

  /**
   * 하루 종료 시 AI의 투자 결정 시뮬레이션 (유사 AI + 최고 AI 동시 시뮬레이션)
   * 사용자가 선택한 종목에 대해서만 결정 (같은 종목, 다른 선택)
   */
  const simulateDayTrades = useCallback((
    stocks: Array<{ id: string; name: string; turns: Array<{ price: number }> }>,
    currentTurn: number,
    userHoldings: Record<string, number>,
    userCash: number,
    currentDay?: number,
    userProfitRate?: number,
    userDayDecisions?: UserDayDecision[],
  ) => {
    const style = classifyUserStyle(userHoldings, userCash, initialCash, 0)
    setMatchedStyle(style)

    let similarResult: ReturnType<typeof runSingleAIDay>
    let bestResult: ReturnType<typeof runSingleAIDay>
    let stockCompareResults: StockCompareResult[] = []

    if (userDayDecisions && userDayDecisions.length > 0) {
      // ── 사용자 선택 종목 기반 시뮬레이션 ──
      const similarSame = simulateSameStockDecisions(userDayDecisions, stocks, style, aiCash, aiHoldings, aiAvgPrices)
      const bestSame = simulateSameStockDecisions(userDayDecisions, stocks, "ultra_aggressive", bestAICash, bestAIHoldings, bestAIAvgPrices)

      // compareResults에 bestAction 병합
      stockCompareResults = similarSame.compareResults.map((sr, i) => ({
        ...sr,
        bestAction: bestSame.compareResults[i]?.similarAction ?? "hold",
        bestQty: bestSame.compareResults[i]?.similarQty ?? 0,
        bestReason: bestSame.compareResults[i]?.similarReason ?? "",
      }))

      setAiCash(similarSame.cash)
      setAiHoldings(similarSame.holdings)
      setAiAvgPrices(similarSame.avgPrices)
      setTodayActions(stockCompareResults.map(r => ({
        type: r.similarAction,
        stockId: r.stockId,
        stockName: r.stockName,
        quantity: r.similarQty,
        price: r.price,
        reason: r.similarReason,
      })))
      setTotalTrades(prev => prev + stockCompareResults.filter(r => r.similarAction !== "hold").length)

      setBestAICash(bestSame.cash)
      setBestAIHoldings(bestSame.holdings)
      setBestAIAvgPrices(bestSame.avgPrices)
      setBestAITrades(prev => prev + stockCompareResults.filter(r => r.bestAction !== "hold").length)

      similarResult = { cash: similarSame.cash, holdings: similarSame.holdings, avgPrices: similarSame.avgPrices, actions: [] }
      bestResult = { cash: bestSame.cash, holdings: bestSame.holdings, avgPrices: bestSame.avgPrices, actions: [] }
    } else {
      // ── 기존 전체 종목 시뮬레이션 (fallback) ──
      similarResult = runSingleAIDay(stocks, currentTurn, style, aiCash, aiHoldings, aiAvgPrices)
      setAiCash(similarResult.cash)
      setAiHoldings(similarResult.holdings)
      setAiAvgPrices(similarResult.avgPrices)
      setTodayActions(similarResult.actions)
      setTotalTrades(prev => prev + similarResult.actions.filter(a => a.type !== "hold").length)

      bestResult = runSingleAIDay(stocks, currentTurn, "ultra_aggressive", bestAICash, bestAIHoldings, bestAIAvgPrices)
      setBestAICash(bestResult.cash)
      setBestAIHoldings(bestResult.holdings)
      setBestAIAvgPrices(bestResult.avgPrices)
      setBestAITrades(prev => prev + bestResult.actions.filter(a => a.type !== "hold").length)
    }

    // 갭 기록
    const similarStockVal = Object.entries(similarResult.holdings).reduce((s, [sid, qty]) => {
      const p = stocks.find(st => st.id === sid)?.turns[currentTurn]?.price || 0
      return s + p * qty
    }, 0)
    const bestStockVal = Object.entries(bestResult.holdings).reduce((s, [sid, qty]) => {
      const p = stocks.find(st => st.id === sid)?.turns[currentTurn]?.price || 0
      return s + p * qty
    }, 0)
    const similarTotalVal = Math.round(similarResult.cash + similarStockVal)
    const bestTotalVal = Math.round(bestResult.cash + bestStockVal)
    const similarRate = Number(((similarTotalVal - initialCash) / initialCash * 100).toFixed(1))
    const bestRate = Number(((bestTotalVal - initialCash) / initialCash * 100).toFixed(1))
    const uRate = userProfitRate ?? Number(((userCash - initialCash) / initialCash * 100).toFixed(1))

    const waveAnalysis = analyzeWavePattern(
      similarResult.actions.length > 0 ? similarResult.actions : (stockCompareResults.map(r => ({ type: r.similarAction, stockId: r.stockId, stockName: r.stockName, quantity: r.similarQty, price: r.price, reason: r.similarReason }))),
      bestResult.actions.length > 0 ? bestResult.actions : (stockCompareResults.map(r => ({ type: r.bestAction, stockId: r.stockId, stockName: r.stockName, quantity: r.bestQty, price: r.price, reason: r.bestReason }))),
      stocks,
      currentTurn,
    )

    const record: GapRecord = {
      day: currentDay ?? 0,
      userRate: uRate,
      bestAIRate: bestRate,
      similarAIRate: similarRate,
      gapToBest: Number((uRate - bestRate).toFixed(1)),
      gapToSimilar: Number((uRate - similarRate).toFixed(1)),
      waveAccuracy: waveAnalysis.accuracy,
    }
    setGapHistory(prev => [...prev, record])

    return {
      cash: similarResult.cash,
      holdings: similarResult.holdings,
      avgPrices: similarResult.avgPrices,
      actions: similarResult.actions,
      style,
      waveAnalysis,
      gapRecord: record,
      bestRate,
      similarRate,
      stockCompareResults,
    }
  }, [aiCash, aiHoldings, aiAvgPrices, bestAICash, bestAIHoldings, bestAIAvgPrices, initialCash, runSingleAIDay, simulateSameStockDecisions, analyzeWavePattern])

  /**
   * 유사 AI 총자산 계산
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

  /**
   * 최고 AI 총자산 계산
   */
  const calcBestAITotalValue = useCallback((
    stocks: Array<{ id: string; turns: Array<{ price: number }> }>,
    currentTurn: number,
  ) => {
    const stockValue = Object.entries(bestAIHoldings).reduce((sum, [sid, qty]) => {
      const stock = stocks.find(s => s.id === sid)
      const price = stock?.turns[currentTurn]?.price || 0
      return sum + price * qty
    }, 0)
    return Math.round(bestAICash + stockValue)
  }, [bestAICash, bestAIHoldings])

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

  const bestAICompetitor = useMemo(() => {
    const comp = getMatchedAI("ultra_aggressive")
    return {
      id: comp.id,
      name: comp.name,
      emoji: comp.emoji,
      style: "ultra_aggressive" as InvestStyle,
      description: comp.strategy.description,
      motto: comp.personality.motto,
      cash: bestAICash,
      holdings: bestAIHoldings,
      avgPrices: bestAIAvgPrices,
      totalTrades: bestAITrades,
    }
  }, [bestAICash, bestAIHoldings, bestAIAvgPrices, bestAITrades, getMatchedAI])

  const resetAI = useCallback(() => {
    setAiCash(initialCash)
    setAiHoldings({})
    setAiAvgPrices({})
    setTodayActions([])
    setTotalTrades(0)
    setMatchedStyle("balanced")
    setBestAICash(initialCash)
    setBestAIHoldings({})
    setBestAIAvgPrices({})
    setBestAITrades(0)
    setGapHistory([])
  }, [initialCash])

  return {
    aiCompetitor,
    bestAICompetitor,
    simulateDayTrades,
    calcTotalValue,
    calcBestAITotalValue,
    resetAI,
    matchedStyle,
    gapHistory,
  }
}
