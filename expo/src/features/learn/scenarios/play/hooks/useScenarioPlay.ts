/**
 * 시나리오 플레이 게임 상태 훅 — 웹 play/page.tsx 의 상태/로직을 그대로 옮긴 것
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { LEGENDARY_SCENARIOS } from "@/data/legendary-scenarios"
import playContent from "@/data/scenario-play-content.json"
import {
  buildTurns,
  getChartPoints,
  getInitialState,
  portfolioValue,
  calcRate,
  idealAction,
  feedbackLevel,
  getMarketHint,
  type TurnData,
  type ActionType,
  type TradeRecord,
} from "../utils"

const { feedback: FB, game: GAME } = playContent

export type FeedbackKey = "correct" | "good" | "bad" | "timeout"

export function useScenarioPlay(scenarioId: string | undefined) {
  const scenario = useMemo(() => LEGENDARY_SCENARIOS.find((s) => s.id === scenarioId) ?? null, [scenarioId])
  const turns = useMemo(() => (scenario ? buildTurns(scenario.events, scenario.stock.initialPrice) : []), [scenario])
  const init = useMemo(() => (scenario ? getInitialState(scenario.stock) : null), [scenario])

  const [turn, setTurn] = useState(0)
  const [cash, setCash] = useState(0)
  const [holdings, setHoldings] = useState(0)
  const [avgPrice, setAvgPrice] = useState(0)
  const [trades, setTrades] = useState<TradeRecord[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [showRatio, setShowRatio] = useState<"buy" | "sell" | null>(null)
  const [feedback, setFeedback] = useState<FeedbackKey | null>(null)
  const [animProg, setAnimProg] = useState(1)

  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [timer, setTimer] = useState(GAME.turnTimerSec)
  const [timerActive, setTimerActive] = useState(false)
  const [turnStartTime, setTurnStartTime] = useState(0)
  const [scorePopup, setScorePopup] = useState<{ points: number; label: string } | null>(null)
  const [shakeTimer, setShakeTimer] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const handleTimeoutRef = useRef<() => void>(() => {})
  const timerValRef = useRef<number>(GAME.turnTimerSec)
  const pendingRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timerRef.current) clearInterval(timerRef.current)
      pendingRef.current.forEach(clearTimeout)
    }
  }, [])

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      if (mountedRef.current) fn()
    }, ms)
    pendingRef.current.push(id)
  }, [])

  useEffect(() => {
    if (init) {
      setCash(init.cash)
      setHoldings(init.holdings)
      setAvgPrice(init.avgPrice)
    }
  }, [init])

  const handleTimeout = useCallback(() => {
    setTimerActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    setFeedback("timeout")
    setCombo(0)
    setScore((s) => Math.max(0, s + (FB.timeout as typeof FB.correct).points))

    setTrades((t) => [
      ...t,
      {
        turn: turns[turn]?.turn ?? turn + 1,
        action: "hold" as ActionType,
        quantity: 0,
        price: turns[turn]?.endPrice ?? 0,
        eventTitle: turns[turn]?.event.title ?? "",
        sentiment: turns[turn]?.event.sentiment ?? "neutral",
        ratio: 0,
        decisionTimeSec: GAME.turnTimerSec,
      },
    ])

    later(() => {
      setFeedback(null)
      if (turn >= turns.length - 1) setGameOver(true)
      else setTurn((t) => t + 1)
    }, 1500)
  }, [turn, turns, later])

  useEffect(() => {
    handleTimeoutRef.current = handleTimeout
  }, [handleTimeout])

  useEffect(() => {
    if (!timerActive) return
    // 웹은 setTimer updater 안에서 처리하지만, StrictMode 이중 호출을 피하려고 ref 로 현재 값을 추적
    timerRef.current = setInterval(() => {
      const prev = timerValRef.current
      if (prev <= 1) {
        clearInterval(timerRef.current!)
        timerValRef.current = 0
        setTimer(0)
        handleTimeoutRef.current()
        return
      }
      if (prev <= 6) setShakeTimer(true)
      timerValRef.current = prev - 1
      setTimer(prev - 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerActive])

  useEffect(() => {
    if (shakeTimer) {
      const t = setTimeout(() => setShakeTimer(false), 300)
      return () => clearTimeout(t)
    }
  }, [shakeTimer])

  const startTurnTimer = useCallback(() => {
    timerValRef.current = GAME.turnTimerSec
    setTimer(GAME.turnTimerSec)
    setTimerActive(true)
    setTurnStartTime(Date.now())
  }, [])

  useEffect(() => {
    if (turns.length > 0 && !gameOver && !feedback) {
      startTurnTimer()
    }
  }, [turn, turns.length, gameOver, feedback, startTurnTimer])

  const td = turns[turn] as TurnData | undefined
  const price = td?.endPrice ?? 0
  const totalInitial = init?.totalInitial ?? 0
  const total = portfolioValue(cash, holdings, price)
  const rate = calcRate(total, totalInitial)
  const maxBuy = price > 0 ? Math.floor(cash / price) : 0
  const holdPnL = holdings > 0 ? (price - avgPrice) * holdings : 0
  const holdPnLRate = avgPrice > 0 ? ((price - avgPrice) / avgPrice) * 100 : 0

  const chartPts = useMemo(() => (turns.length > 0 ? getChartPoints(turns, turn) : []), [turns, turn])
  const hint = useMemo(() => (td ? getMarketHint(turns, turn, holdings > 0) : null), [turns, turn, holdings, td])
  const aiResults = useMemo(() => {
    if (!scenario) return []
    return scenario.aiStrategies.map((ai) => ({
      ...ai,
      returnNum: parseFloat(ai.returnRate.replace("%", "").replace("+", "")),
    }))
  }, [scenario])

  useEffect(() => {
    setAnimProg(0)
    const start = Date.now()
    const dur = 700
    let raf = 0
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1)
      setAnimProg(p)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [turn])

  const calcTimeBonus = useCallback(() => {
    const elapsed = (Date.now() - turnStartTime) / 1000
    const tb = GAME.timeBonus as Record<string, { sec: number; points: number; label: string }>
    if (elapsed <= tb.fast.sec) return tb.fast
    if (elapsed <= tb.normal.sec) return tb.normal
    return tb.slow
  }, [turnStartTime])

  const doTrade = useCallback(
    (action: ActionType, ratio: number = 0, ratioLabel?: string) => {
      if (!td) return
      setTimerActive(false)
      if (timerRef.current) clearInterval(timerRef.current)

      const p = td.endPrice
      let qty = 0

      if (action === "buy") {
        qty = Math.max(1, Math.floor(maxBuy * ratio))
        if (qty === 0) return
        const cost = qty * p
        const newTotal = holdings + qty
        const newAvg = holdings > 0 ? (avgPrice * holdings + p * qty) / newTotal : p
        setCash((c) => c - cost)
        setHoldings(newTotal)
        setAvgPrice(newAvg)
      } else if (action === "sell") {
        qty = Math.max(1, Math.ceil(holdings * ratio))
        if (qty > holdings) qty = holdings
        setCash((c) => c + qty * p)
        setHoldings((h) => h - qty)
        if (qty >= holdings) setAvgPrice(0)
      }

      const elapsed = Math.round((Date.now() - turnStartTime) / 1000)
      setTrades((t) => [
        ...t,
        {
          turn: td.turn,
          action,
          quantity: qty,
          price: p,
          eventTitle: td.event.title,
          ratioLabel,
          sentiment: td.event.sentiment,
          ratio: ratio,
          decisionTimeSec: elapsed,
        },
      ])
      setShowRatio(null)

      const ideal = idealAction(turns, turn, holdings > 0)
      const level = feedbackLevel(action, ideal)
      setFeedback(level)

      const fbEntry = FB[level] as typeof FB.correct
      const basePoints = fbEntry.points ?? 0
      const timeBonus = calcTimeBonus()
      const newCombo = level === "correct" ? combo + 1 : level === "good" ? combo : 0
      const comboArr = GAME.comboBonus as number[]
      const comboBonus = comboArr[Math.min(newCombo, comboArr.length - 1)] ?? 0
      const turnPoints = basePoints + timeBonus.points + comboBonus

      setScore((s) => s + turnPoints)
      setCombo(newCombo)
      setBestCombo((b) => Math.max(b, newCombo))
      setScorePopup({ points: turnPoints, label: timeBonus.label })
      later(() => setScorePopup(null), 1200)

      later(() => {
        setFeedback(null)
        if (turn >= turns.length - 1) setGameOver(true)
        else setTurn((t) => t + 1)
      }, 1400)
    },
    [td, turns, turn, holdings, avgPrice, maxBuy, combo, calcTimeBonus, turnStartTime, later],
  )

  const reset = useCallback(() => {
    if (!init) return
    setTurn(0)
    setCash(init.cash)
    setHoldings(init.holdings)
    setAvgPrice(init.avgPrice)
    setTrades([])
    setGameOver(false)
    setFeedback(null)
    setShowRatio(null)
    setScore(0)
    setCombo(0)
    setBestCombo(0)
    setTimer(GAME.turnTimerSec)
  }, [init])

  return {
    scenario,
    turns,
    init,
    turn,
    td,
    cash,
    holdings,
    avgPrice,
    trades,
    gameOver,
    showRatio,
    setShowRatio,
    feedback,
    animProg,
    score,
    combo,
    bestCombo,
    timer,
    shakeTimer,
    scorePopup,
    showExitConfirm,
    setShowExitConfirm,
    price,
    totalInitial,
    total,
    rate,
    maxBuy,
    holdPnL,
    holdPnLRate,
    chartPts,
    hint,
    aiResults,
    doTrade,
    reset,
  }
}
