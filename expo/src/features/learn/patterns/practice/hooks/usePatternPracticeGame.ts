/**
 * 패턴 연습 게임 상태/로직 (웹 practice/page.tsx 의 PatternPracticePage 로직을 그대로 옮김)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CHART_PATTERNS, type ChartPattern } from "@/data/chart-patterns"
import {
  getScenarioForRound,
  getBasicScenarioForRound,
  calculateRoundScore,
  calculateBasicRoundScore,
  getTurnFeedback,
  TOTAL_ROUNDS,
  TURNS_PER_ROUND,
  BASIC_TURNS_PER_ROUND,
  CANDLES_PER_TURN,
  INITIAL_REVEAL,
  INITIAL_CASH,
  DECISION_TIMERS,
  BASIC_DECISION_TIMERS,
  BASIC_STRATEGIES,
  type PatternScenario,
  type TradeLog,
  type TurnFeedback,
  type BasicStrategy,
} from "@/data/pattern-practice"
import type { GamePhase, RoundData, TurnHistoryEntry } from "../types"

export function usePatternPracticeGame(id: string | undefined) {
  const [pattern, setPattern] = useState<ChartPattern | null>(null)
  const [basicStrategy, setBasicStrategy] = useState<BasicStrategy | null>(null)
  const [gamePhase, setGamePhase] = useState<GamePhase>("intro")
  const [currentRound, setCurrentRound] = useState(0)
  const [currentTurn, setCurrentTurn] = useState(0)
  const [roundResults, setRoundResults] = useState<RoundData[]>([])
  const [totalScore, setTotalScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [chartOpen, setChartOpen] = useState(true)

  const [scenario, setScenario] = useState<PatternScenario | null>(null)
  const [visibleCount, setVisibleCount] = useState(0)
  const [trades, setTrades] = useState<TradeLog[]>([])
  const [cashRemaining, setCashRemaining] = useState(INITIAL_CASH)
  const [sharesHeld, setSharesHeld] = useState(0)
  const [avgCostBasis, setAvgCostBasis] = useState(0)
  const [startingShares, setStartingShares] = useState(0)
  const [timer, setTimer] = useState(12)
  const [countdownVal, setCountdownVal] = useState(3)
  const [feedback, setFeedback] = useState<TurnFeedback | null>(null)
  const [turnHistory, setTurnHistory] = useState<TurnHistoryEntry[]>([])
  const [pendingAction, setPendingAction] = useState<"buy" | "sell" | null>(null)
  const [timerExpired, setTimerExpired] = useState(false)

  const revealRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const feedbackTurnRef = useRef(-1)
  const decidedThisTurnRef = useRef(false)

  // 기본 전략 여부 및 턴 수 결정
  const isBasicStrategy = basicStrategy !== null
  const turnsPerRound = isBasicStrategy ? BASIC_TURNS_PER_ROUND : TURNS_PER_ROUND
  const decisionTimers = isBasicStrategy ? BASIC_DECISION_TIMERS : DECISION_TIMERS

  const clearTimers = useCallback(() => {
    if (revealRef.current) clearTimeout(revealRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [])

  useEffect(() => {
    const foundBasic = BASIC_STRATEGIES.find((s) => s.id === id)
    if (foundBasic) {
      setBasicStrategy(foundBasic)
    } else {
      setPattern(CHART_PATTERNS.find((p) => p.id === id) ?? null)
    }
  }, [id])

  useEffect(
    () => () => {
      if (revealRef.current) clearTimeout(revealRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    },
    []
  )

  const totalCandles = scenario?.candles.length ?? 0
  const currentPrice = scenario && visibleCount > 0 ? scenario.candles[visibleCount - 1].close : 0
  const targetVisible = INITIAL_REVEAL + (currentTurn + 1) * CANDLES_PER_TURN
  const totalRounds = isBasicStrategy ? basicStrategy!.scenarios.length : TOTAL_ROUNDS

  // 총 포트폴리오 가치 및 손익
  const totalValue = cashRemaining + sharesHeld * currentPrice
  const pnl = totalValue - INITIAL_CASH

  const buyIndices = useMemo(
    () => trades.filter((t) => t.action === "buy").map((t) => Math.min(INITIAL_REVEAL + (t.turn + 1) * CANDLES_PER_TURN - 1, totalCandles - 1)),
    [trades, totalCandles]
  )
  const sellIndices = useMemo(
    () => trades.filter((t) => t.action === "sell").map((t) => Math.min(INITIAL_REVEAL + (t.turn + 1) * CANDLES_PER_TURN - 1, totalCandles - 1)),
    [trades, totalCandles]
  )

  // ── Handle decision ─────────────────────────────────────
  const handleDecision = useCallback(
    (action: "buy" | "sell" | "skip", pct = 0, isTimeout = false) => {
      if (decidedThisTurnRef.current) return
      decidedThisTurnRef.current = true
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setTimerExpired(false)
      if (!scenario) return
      const price = currentPrice

      let tradeShares = 0
      let tradeAmount = 0
      let newSharesHeld = sharesHeld
      let newCash = cashRemaining
      let newAvgCost = avgCostBasis
      let realizedProfit: number | undefined

      if (action === "buy" && pct > 0) {
        tradeShares = Math.floor((cashRemaining * pct) / price)
        if (tradeShares <= 0) {
          decidedThisTurnRef.current = false
          return
        }
        tradeAmount = tradeShares * price
        newCash = cashRemaining - tradeAmount
        // 평균 매수가 업데이트
        newAvgCost = sharesHeld > 0 ? (avgCostBasis * sharesHeld + price * tradeShares) / (sharesHeld + tradeShares) : price
        newSharesHeld = sharesHeld + tradeShares
        const log: TradeLog = { action: "buy", price, turn: currentTurn, shares: tradeShares, amount: tradeAmount, pct }
        setTrades((prev) => [...prev, log])
        setCashRemaining(newCash)
        setSharesHeld(newSharesHeld)
        setAvgCostBasis(newAvgCost)
      } else if (action === "sell" && pct > 0) {
        tradeShares = Math.max(1, Math.floor(sharesHeld * pct))
        if (tradeShares <= 0 || sharesHeld <= 0) {
          decidedThisTurnRef.current = false
          return
        }
        tradeAmount = tradeShares * price
        realizedProfit = (price - avgCostBasis) * tradeShares
        newCash = cashRemaining + tradeAmount
        newSharesHeld = sharesHeld - tradeShares
        newAvgCost = newSharesHeld <= 0 ? 0 : avgCostBasis // 매도해도 평균 단가 유지
        const log: TradeLog = { action: "sell", price, turn: currentTurn, shares: tradeShares, amount: tradeAmount, pct }
        setTrades((prev) => [...prev, log])
        setCashRemaining(newCash)
        setSharesHeld(newSharesHeld)
        setAvgCostBasis(newAvgCost)
      }

      // in-game 기록 추가
      const entry: TurnHistoryEntry = {
        turn: currentTurn,
        action: isTimeout ? "timeout" : action,
        price,
        shares: tradeShares,
        amount: tradeAmount,
        sharesHeld: newSharesHeld,
        profit: action === "sell" ? realizedProfit : undefined,
      }
      setTurnHistory((prev) => [...prev, entry])

      const fb = getTurnFeedback({
        action,
        candleIndex: visibleCount - 1,
        scenario,
        sharesHeld: sharesHeld, // 거래 전 보유 수량으로 판단
        isTimeout,
      })
      setPendingAction(null)
      setFeedback(fb)
      feedbackTurnRef.current = currentTurn
      setGamePhase("feedback")
    },
    [currentPrice, currentTurn, scenario, visibleCount, sharesHeld, cashRemaining, avgCostBasis]
  )

  // ── End round ───────────────────────────────────────────
  const endRound = useCallback(() => {
    if (!scenario) return
    const finalPrice = scenario.candles[totalCandles - 1].close
    const score = isBasicStrategy
      ? calculateBasicRoundScore(trades, cashRemaining, sharesHeld, finalPrice, scenario, startingShares)
      : calculateRoundScore(trades, cashRemaining, sharesHeld, finalPrice, scenario, startingShares)
    const data: RoundData = { score, trades, finalCash: cashRemaining, finalShares: sharesHeld, finalAvgCost: avgCostBasis, startingShares, scenario }
    setRoundResults((prev) => [...prev, data])
    setTotalScore((prev) => prev + score.total)
    setStreak((prev) => (score.total >= 8 ? prev + 1 : 0))
    setVisibleCount(totalCandles)
    setGamePhase("round-result")
  }, [scenario, totalCandles, trades, cashRemaining, sharesHeld, startingShares, avgCostBasis, isBasicStrategy])

  // 최신 콜백을 effect 에서 참조 (웹의 eslint-disable exhaustive-deps 와 동일한 동작)
  const handleDecisionRef = useRef(handleDecision)
  const endRoundRef = useRef(endRound)
  useEffect(() => {
    handleDecisionRef.current = handleDecision
    endRoundRef.current = endRound
  })

  // ── Reveal candles ─────────────────────────────────────
  useEffect(() => {
    if (gamePhase !== "revealing" || !scenario) return
    const target = Math.min(targetVisible, totalCandles)
    if (visibleCount >= target) {
      const secs = decisionTimers[currentRound] ?? 15
      setTimer(secs)
      setGamePhase("deciding")
      return
    }
    revealRef.current = setTimeout(() => setVisibleCount((v) => v + 1), 200)
    return () => {
      if (revealRef.current) clearTimeout(revealRef.current)
    }
  }, [gamePhase, visibleCount, targetVisible, totalCandles, scenario, currentRound, decisionTimers])

  // ── Decision timer ──────────────────────────────────────
  useEffect(() => {
    if (gamePhase !== "deciding") return
    if (timer <= 0) {
      if (currentTurn >= turnsPerRound - 1) {
        setTimerExpired(true)
        return
      }
      handleDecisionRef.current("skip", 0, true)
      return
    }
    timerRef.current = setInterval(() => setTimer((v) => v - 1), 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, timer])

  // ── Feedback auto-dismiss ───────────────────────────────
  useEffect(() => {
    if (gamePhase !== "feedback") return
    const capturedTurn = feedbackTurnRef.current
    const t = setTimeout(() => {
      setPendingAction(null)
      if (capturedTurn >= turnsPerRound - 1) {
        setGamePhase("closing")
      } else {
        decidedThisTurnRef.current = false
        setCurrentTurn(capturedTurn + 1)
        setGamePhase("revealing")
      }
    }, 2500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase])

  // ── Closing: reveal remaining ───────────────────────────
  useEffect(() => {
    if (gamePhase !== "closing" || !scenario) return
    if (visibleCount >= totalCandles) {
      endRoundRef.current()
      return
    }
    const t = setTimeout(() => setVisibleCount((v) => v + 1), 120)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, visibleCount, totalCandles])

  // ── Start round ─────────────────────────────────────────
  const startRound = useCallback(
    (round: number) => {
      const s = isBasicStrategy ? getBasicScenarioForRound(basicStrategy!.id, round) : getScenarioForRound(pattern?.id ?? "", round)
      if (!s) return

      const initialPrice = s.candles[INITIAL_REVEAL - 1]?.close ?? s.candles[0].close
      const initShares = Math.floor((INITIAL_CASH * 0.5) / initialPrice)
      const initCash = INITIAL_CASH - initShares * initialPrice

      setScenario(s)
      setVisibleCount(INITIAL_REVEAL)
      setTrades([])
      setCashRemaining(initCash)
      setSharesHeld(initShares)
      setAvgCostBasis(initialPrice)
      setStartingShares(initShares)
      setCurrentTurn(0)
      setFeedback(null)
      setTurnHistory([])
      setTimer(decisionTimers[round] ?? 15)
      setTimerExpired(false)
      setChartOpen(true)
      setPendingAction(null)
      feedbackTurnRef.current = -1
      decidedThisTurnRef.current = false
      setGamePhase("countdown")
      setCountdownVal(3)
      let c = 3
      if (countdownRef.current) clearInterval(countdownRef.current)
      const iv = setInterval(() => {
        c--
        if (c <= 0) {
          clearInterval(iv)
          countdownRef.current = null
          setGamePhase("revealing")
        } else setCountdownVal(c)
      }, 600)
      countdownRef.current = iv
    },
    [pattern, basicStrategy, isBasicStrategy, decisionTimers]
  )

  const startGame = () => {
    setCurrentRound(0)
    startRound(0)
  }

  const handleNextRound = () => {
    const n = currentRound + 1
    if (n >= totalRounds) setGamePhase("final-result")
    else {
      setCurrentRound(n)
      startRound(n)
    }
  }
  const handleRetry = () => {
    setCurrentRound(0)
    setRoundResults([])
    setTotalScore(0)
    setStreak(0)
    setGamePhase("intro")
  }

  return {
    pattern,
    basicStrategy,
    isBasicStrategy,
    turnsPerRound,
    decisionTimers,
    totalRounds,
    gamePhase,
    currentRound,
    currentTurn,
    roundResults,
    totalScore,
    streak,
    showExitDialog,
    setShowExitDialog,
    chartOpen,
    setChartOpen,
    scenario,
    visibleCount,
    totalCandles,
    currentPrice,
    cashRemaining,
    sharesHeld,
    avgCostBasis,
    totalValue,
    pnl,
    timer,
    countdownVal,
    feedback,
    turnHistory,
    pendingAction,
    setPendingAction,
    timerExpired,
    buyIndices,
    sellIndices,
    clearTimers,
    handleDecision,
    startGame,
    handleNextRound,
    handleRetry,
  }
}

export type PatternPracticeGame = ReturnType<typeof usePatternPracticeGame>
