"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import {
  LEGENDARY_SCENARIOS,
  type LegendaryScenario,
  type AIStrategy,
} from "@/data/legendary-scenarios"
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
  getGrade,
  type TurnData,
  type ActionType,
  type TradeRecord,
} from "./utils"
import {
  ArrowLeft, TrendingUp, TrendingDown,
  RotateCcw, Bot, Sparkles, Lightbulb,
  Package, Trophy, Flame, Timer,
} from "lucide-react"

const { ui: UI, feedback: FB, grades: GRADES, game: GAME } = playContent

type FeedbackKey = "correct" | "good" | "bad" | "timeout"

export default function ScenarioPlayPage() {
  const params = useParams()
  const router = useRouter()

  const scenario = useMemo(
    () => LEGENDARY_SCENARIOS.find((s) => s.id === params.id) ?? null,
    [params.id],
  )
  const turns = useMemo(
    () => (scenario ? buildTurns(scenario.events, scenario.stock.initialPrice) : []),
    [scenario],
  )
  const init = useMemo(
    () => (scenario ? getInitialState(scenario.stock) : null),
    [scenario],
  )

  const [turn, setTurn] = useState(0)
  const [cash, setCash] = useState(0)
  const [holdings, setHoldings] = useState(0)
  const [avgPrice, setAvgPrice] = useState(0)
  const [trades, setTrades] = useState<TradeRecord[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [showRatio, setShowRatio] = useState<"buy" | "sell" | null>(null)
  const [feedback, setFeedback] = useState<FeedbackKey | null>(null)
  const [animProg, setAnimProg] = useState(1) // 초기값 1로 설정 (hydration 일치)

  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [timer, setTimer] = useState(GAME.turnTimerSec)
  const [timerActive, setTimerActive] = useState(false)
  const [turnStartTime, setTurnStartTime] = useState(0)
  const [scorePopup, setScorePopup] = useState<{ points: number; label: string } | null>(null)
  const [shakeTimer, setShakeTimer] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const handleTimeoutRef = useRef<() => void>(() => {})

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

    setTrades((t) => [
      ...t,
      { turn: (turns[turn]?.turn ?? turn + 1), action: "hold" as ActionType, quantity: 0, price: turns[turn]?.endPrice ?? 0, eventTitle: turns[turn]?.event.title ?? "" },
    ])

    setTimeout(() => {
      setFeedback(null)
      if (turn >= turns.length - 1) setGameOver(true)
      else setTurn((t) => t + 1)
    }, 1500)
  }, [turn, turns])

  useEffect(() => {
    handleTimeoutRef.current = handleTimeout
  }, [handleTimeout])

  useEffect(() => {
    if (!timerActive) return
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleTimeoutRef.current()
          return 0
        }
        if (prev <= 6) setShakeTimer(true)
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerActive])

  useEffect(() => {
    if (shakeTimer) {
      const t = setTimeout(() => setShakeTimer(false), 300)
      return () => clearTimeout(t)
    }
  }, [shakeTimer])

  const startTurnTimer = useCallback(() => {
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

  const chartPts = useMemo(
    () => (turns.length > 0 ? getChartPoints(turns, turn) : []),
    [turns, turn],
  )
  const hint = useMemo(
    () => (td ? getMarketHint(turns, turn, holdings > 0) : null),
    [turns, turn, holdings, td],
  )
  const aiResults = useMemo(() => {
    if (!scenario) return []
    return scenario.aiStrategies.map((ai) => ({
      ...ai,
      returnNum: parseFloat(ai.returnRate.replace("%", "").replace("+", "")),
    }))
  }, [scenario])

  useEffect(() => {
    // 클라이언트에서만 애니메이션 실행
    if (typeof window === 'undefined') return
    
    setAnimProg(0)
    const start = performance.now()
    const dur = 700
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setAnimProg(p)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
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

      setTrades((t) => [...t, { turn: td.turn, action, quantity: qty, price: p, eventTitle: td.event.title, ratioLabel }])
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
      setTimeout(() => setScorePopup(null), 1200)

      setTimeout(() => {
        setFeedback(null)
        if (turn >= turns.length - 1) setGameOver(true)
        else setTurn((t) => t + 1)
      }, 1400)
    },
    [td, turns, turn, holdings, avgPrice, maxBuy, combo, calcTimeBonus],
  )

  const reset = useCallback(() => {
    if (!init) return
    setTurn(0); setCash(init.cash); setHoldings(init.holdings); setAvgPrice(init.avgPrice)
    setTrades([]); setGameOver(false); setFeedback(null); setShowRatio(null)
    setScore(0); setCombo(0); setBestCombo(0); setTimer(GAME.turnTimerSec)
  }, [init])

  if (!scenario || turns.length === 0 || !td || !init) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="animate-pulse text-4xl">🎮</div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <ResultView scenario={scenario} total={total} rate={rate} cash={cash}
        holdings={holdings} price={turns[turns.length - 1].endPrice}
        trades={trades} aiResults={aiResults} initTotal={totalInitial}
        chartPts={getChartPoints(turns, turns.length - 1)}
        score={score} bestCombo={bestCombo}
        onReplay={reset} onBack={() => router.push(`/learn/scenarios/${scenario.id}`)} />
    )
  }

  const sent = playContent.sentiment[td.event.sentiment as keyof typeof playContent.sentiment]
    ?? playContent.sentiment.neutral
  const isUp = td.change >= 0
  const fbData = feedback ? (FB[feedback] as typeof FB.correct) : null
  const stock = scenario.stock

  const timerPct = (timer / GAME.turnTimerSec) * 100
  const timerColor = timer <= 5 ? "bg-red-500" : timer <= 12 ? "bg-yellow-500" : "bg-green-500"
  const timerTextColor = timer <= 5 ? "text-red-400" : timer <= 12 ? "text-yellow-400" : "text-green-400"

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col relative">
      {/* Feedback Overlay */}
      {feedback && fbData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-150">
          <div className="absolute inset-0 bg-black/60" />
          <div className={cn("relative text-center px-8 py-8",
            feedback === "correct" && "animate-bounce")}>
            {feedback === "correct" && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <span key={i} className="absolute text-yellow-400 animate-ping"
                    style={{ left: `${10 + Math.random() * 80}%`, top: `${5 + Math.random() * 90}%`,
                      animationDelay: `${i * 50}ms`, animationDuration: "1s", fontSize: `${14 + Math.random() * 18}px` }}>✦</span>
                ))}
              </div>
            )}
            <div className="text-6xl mb-3">{fbData.emoji}</div>
            <h2 className={cn("text-2xl font-black mb-1",
              feedback === "correct" ? "text-yellow-400" :
              feedback === "good" ? "text-green-400" :
              feedback === "timeout" ? "text-orange-400" : "text-red-400")}>
              {fbData.titles[Math.floor(Math.random() * fbData.titles.length)]}
            </h2>
            <p className="text-sm text-gray-300 max-w-[260px] mx-auto">
              {fbData.messages[Math.floor(Math.random() * fbData.messages.length)]}
            </p>
            {scorePopup && (
              <div className="mt-3 animate-in slide-in-from-bottom duration-200">
                <span className="text-yellow-400 text-lg font-black">+{scorePopup.points}점</span>
                <p className="text-[11px] text-gray-400 mt-0.5">{scorePopup.label}</p>
                {combo > 1 && (
                  <p className="text-orange-400 text-xs font-bold mt-1">🔥 {combo}콤보!</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ratio Selection Modal */}
      {showRatio && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRatio(null)} />
          <div className="relative w-full max-w-md bg-[#1e1e1e] rounded-t-3xl p-5 pb-8 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
            <h3 className={cn("text-base font-bold mb-1",
              showRatio === "buy" ? "text-red-400" : "text-blue-400")}>
              {stock.name} {showRatio === "buy" ? "얼마나 살까?" : "얼마나 팔까?"}
            </h3>
            <p className="text-[10px] text-gray-500 mb-4">
              {showRatio === "buy"
                ? `현금: ${formatNumber(cash)}원 · 살 수 있는 주식: ${maxBuy}주`
                : `갖고 있는 주식: ${holdings}주`}
            </p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(UI.ratioValues as number[]).map((r, i) => {
                const qty = showRatio === "buy"
                  ? Math.max(1, Math.floor(maxBuy * r))
                  : Math.max(1, Math.ceil(holdings * r))
                const descs = UI.ratioDescriptions as string[]
                return (
                  <button key={i} onClick={() => doTrade(showRatio, r, (UI.ratioLabels as string[])[i])}
                    disabled={qty === 0}
                    className={cn("py-3 rounded-xl border text-center transition-all active:scale-95 disabled:opacity-20",
                      showRatio === "buy"
                        ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                        : "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20")}>
                    <span className={cn("text-sm font-bold",
                      showRatio === "buy" ? "text-red-400" : "text-blue-400")}>
                      {(UI.ratioLabels as string[])[i]}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{qty}주</p>
                    <p className="text-[9px] text-gray-600">{descs[i]}</p>
                  </button>
                )
              })}
            </div>
            {hint && (
              <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-lg p-2.5">
                <p className="text-[10px] text-yellow-500/80 leading-relaxed">💡 {hint.ratioGuide}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="text-center">
            <p className="text-xs font-bold text-white">{stock.name}</p>
            <p className="text-[9px] text-gray-600">{stock.code} · {stock.sector}</p>
          </div>
          <div className="flex items-center gap-2">
            {combo > 0 && (
              <div className="flex items-center gap-0.5 bg-orange-500/15 px-2 py-0.5 rounded-full">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] font-black text-orange-400">{combo}</span>
              </div>
            )}
            <div className="flex items-center gap-0.5 bg-yellow-500/15 px-2 py-0.5 rounded-full">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span className="text-[10px] font-black text-yellow-400">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Turn Progress */}
      <div className="px-4 pb-1 flex gap-0.5">
        {turns.map((_, i) => (
          <div key={i} className={cn("flex-1 h-1.5 rounded-full transition-all duration-300",
            i < turn ? "bg-green-500" : i === turn ? "bg-yellow-500 animate-pulse" : "bg-gray-800")} />
        ))}
      </div>

      {/* Holdings - BIG */}
      <div className="mx-4 my-1 bg-[#151520] rounded-2xl px-4 py-3 border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-indigo-400" />
            <div>
              <p className="text-4xl font-black tracking-tight text-white">{holdings}<span className="text-lg text-indigo-300 ml-1">주</span></p>
              <p className="text-[10px] text-gray-600 mt-0.5">산 가격 {avgPrice > 0 ? formatNumber(Math.round(avgPrice)) : "-"}원</p>
            </div>
          </div>
          <div className="text-right">
            {holdings > 0 && (
              <p className={cn("text-lg font-black", holdPnL >= 0 ? "text-red-400" : "text-blue-400")}>
                {holdPnL >= 0 ? "+" : ""}{formatNumber(Math.round(holdPnL))}<span className="text-xs">원</span>
              </p>
            )}
            <p className={cn("text-xs font-bold", holdPnLRate >= 0 ? "text-red-400/70" : "text-blue-400/70")}>
              {holdings > 0 ? `${holdPnLRate >= 0 ? "+" : ""}${holdPnLRate.toFixed(1)}%` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-white">{formatNumber(Math.round(total))}</span>
            <span className="text-[9px] text-gray-500">총 자산</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-gray-400">{formatNumber(Math.round(cash))}</span>
            <span className="text-[9px] text-gray-500">현금</span>
          </div>
          <div className={cn("px-2 py-0.5 rounded-lg text-xs font-black",
            rate >= 0 ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400")}>
            {rate >= 0 ? "+" : ""}{rate.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-3">
        <LiveChart points={chartPts} animProg={animProg} isUp={isUp} height={200} />
        <div className="flex items-end justify-between mt-1.5 px-1">
          <p className="text-2xl font-black">{formatNumber(Math.round(price))}<span className="text-sm text-gray-500">원</span></p>
          <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold",
            isUp ? "bg-red-500/15 text-red-400" : "bg-blue-500/15 text-blue-400")}>
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isUp ? "+" : ""}{td.change.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Event */}
      <div className="flex-1 px-4 pt-2 pb-2 space-y-2 overflow-y-auto">
        <div className={cn("rounded-2xl p-3 border relative overflow-hidden", sent.bg, sent.border)}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{(UI.turnEmoji as string[])[turn] ?? "🔢"}</span>
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", sent.bg, sent.color)}>{sent.label}</span>
            <h3 className="text-[13px] font-black text-white flex-1">{td.event.title}</h3>
          </div>
          <EventBullets description={td.event.description} />
        </div>

        {hint && (
          <div className="bg-[#151515] rounded-xl p-2.5 border border-gray-800/30">
            <div className="flex items-center gap-1 mb-1">
              <Lightbulb className="w-3 h-3 text-yellow-500" />
              <span className="text-[9px] font-bold text-yellow-500/80">💡 힌트</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">{hint.hint}</p>
          </div>
        )}
      </div>

      {/* BOTTOM: Timer + Action Buttons */}
      <div className="px-4 pt-2 pb-5 border-t border-gray-800/40 bg-[#0d0d0d]">
        {/* Timer Bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-1000 ease-linear", timerColor)}
              style={{ width: `${timerPct}%` }}
            />
          </div>
          <div className={cn("flex items-center gap-0.5 min-w-[44px]",
            shakeTimer && "animate-pulse")}>
            <Timer className={cn("w-4 h-4", timerTextColor)} />
            <span className={cn("text-sm font-black tabular-nums", timerTextColor)}>{timer}초</span>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button onClick={() => setShowRatio("buy")} disabled={maxBuy === 0 || !!feedback}
            className="flex-1 h-13 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-red-500/20">
            {UI.actionLabels.buy}
          </button>
          <button onClick={() => setShowRatio("sell")} disabled={holdings === 0 || !!feedback}
            className="flex-1 h-13 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-blue-500/20">
            {UI.actionLabels.sell}
          </button>
          <button onClick={() => doTrade("hold")} disabled={!!feedback}
            className="flex-1 h-13 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 rounded-2xl font-bold text-sm text-white transition-all active:scale-95">
            {UI.actionLabels.hold}
          </button>
        </div>
      </div>
    </div>
  )
}

function EventBullets({ description }: { description: string }) {
  const bullets = description
    .split(/(?<=[.!?])\s+|(?<=다\.)\s*|(?<=요\.)\s*|(?<=요!)\s*|(?<=다!)\s*/)
    .map(s => s.trim())
    .filter(s => s.length > 0)

  if (bullets.length <= 1) {
    return <p className="text-[11px] text-gray-300 leading-relaxed">{description}</p>
  }

  return (
    <ul className="space-y-1">
      {bullets.map((b, i) => (
        <li key={i} className="flex items-start gap-1.5">
          <span className="text-[8px] text-gray-500 mt-1 shrink-0">●</span>
          <span className="text-[11px] text-gray-300 leading-snug">{b}</span>
        </li>
      ))}
    </ul>
  )
}

function LiveChart({ points, animProg, isUp, height = 200, turnSize = 20 }: {
  points: number[]; animProg: number; isUp: boolean; height?: number; turnSize?: number
}) {
  if (points.length < 2) return <div style={{ height }} className="bg-[#111118] rounded-2xl" />
  const visCount = Math.max(2, Math.ceil(points.length * animProg))
  const visible = points.slice(0, visCount)
  const min = Math.min(...points) * 0.996
  const max = Math.max(...points) * 1.004
  const range = max - min || 1
  const W = 400
  const PX = 6
  const PY = 16
  const chartH = height - PY * 2
  const toX = (i: number) => PX + (i / Math.max(points.length - 1, 1)) * (W - PX * 2)
  const toY = (p: number) => PY + chartH - ((p - min) / range) * chartH
  const pathD = visible.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(p)}`).join(" ")
  const lx = toX(visible.length - 1)
  const ly = toY(visible[visible.length - 1])
  const areaD = `${pathD} L${lx},${height - PY} L${PX},${height - PY} Z`
  const stroke = isUp ? "#ef4444" : "#3b82f6"
  const startPrice = points[0]
  const startY = toY(startPrice)

  const turnBoundaries: number[] = []
  for (let t = 1; t <= 8; t++) {
    const idx = t * turnSize
    if (idx < points.length) turnBoundaries.push(idx)
  }

  const priceLabels = [min, min + range * 0.5, max].map(p => ({
    y: toY(p),
    label: formatNumber(Math.round(p))
  }))

  return (
    <div className="bg-[#111118] rounded-2xl p-2 relative border border-white/5">
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.2, 0.4, 0.6, 0.8].map((r) => (
          <line key={r} x1={PX} x2={W - PX} y1={PY + chartH * r} y2={PY + chartH * r}
            stroke="#ffffff" strokeOpacity="0.03" strokeDasharray="4 4" />
        ))}

        {turnBoundaries.map((idx) => (
          <line key={idx} x1={toX(idx)} x2={toX(idx)} y1={PY} y2={height - PY}
            stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="2 3" />
        ))}

        <line x1={PX} x2={W - PX} y1={startY} y2={startY}
          stroke="#888" strokeOpacity="0.15" strokeDasharray="3 3" />

        <path d={areaD} fill="url(#cg)" />
        <path d={pathD} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        <circle cx={lx} cy={ly} r="4" fill={stroke} />
        <circle cx={lx} cy={ly} r="10" fill={stroke} fillOpacity="0.1">
          <animate attributeName="r" values="7;13;7" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values="0.15;0;0.15" dur="1.5s" repeatCount="indefinite" />
        </circle>

        <rect x={lx - 38} y={ly - 20} width="76" height="16" rx="4" fill={stroke} fillOpacity="0.9" />
        <text x={lx} y={ly - 9} textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">
          {formatNumber(Math.round(visible[visible.length - 1]))}
        </text>

        {priceLabels.map((pl, i) => (
          <text key={i} x={W - PX - 2} y={pl.y + 3} textAnchor="end" fontSize="7" fill="#555">{pl.label}</text>
        ))}

        <text x={PX + 2} y={startY - 4} textAnchor="start" fontSize="7" fill="#666">시작</text>
      </svg>
    </div>
  )
}

function ResultView({ scenario, total, rate, cash, holdings, price, trades, aiResults, initTotal, chartPts, score, bestCombo, onReplay, onBack }: {
  scenario: LegendaryScenario; total: number; rate: number; cash: number
  holdings: number; price: number; trades: TradeRecord[]
  aiResults: (AIStrategy & { returnNum: number })[]; initTotal: number; chartPts: number[]
  score: number; bestCombo: number
  onReplay: () => void; onBack: () => void
}) {
  const grade = getGrade(rate)
  const gi = GRADES[grade as keyof typeof GRADES] ?? GRADES.D
  const beaten = aiResults.filter((a) => rate > a.returnNum).length
  const stock = scenario.stock
  const finalHoldingValue = holdings * price

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-28">
      <div className={cn("px-5 pt-10 pb-6 bg-gradient-to-br relative overflow-hidden", scenario.gradientFrom, scenario.gradientTo)}>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <p className="text-xs opacity-80 mb-1">{stock.name} ({stock.code}) · {scenario.title}</p>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-3xl font-black">{formatNumber(Math.round(total))}원</p>
              <p className={cn("text-lg font-black mt-1", rate >= 0 ? "text-green-200" : "text-red-200")}>
                {rate >= 0 ? "+" : ""}{rate.toFixed(2)}%
                <span className="text-sm opacity-70 ml-1.5">({rate >= 0 ? "+" : ""}{formatNumber(Math.round(total - initTotal))}원)</span>
              </p>
            </div>
            <div className="text-center">
              <div className={cn("text-5xl font-black", gi.color)}>{gi.label}</div>
              <p className="text-[10px] opacity-70">{gi.title}</p>
            </div>
          </div>

          <div className="bg-white/15 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <div>
                  <p className="text-[9px] opacity-60">점수</p>
                  <p className="text-xl font-black">{score}<span className="text-xs opacity-70 ml-0.5">점</span></p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[9px] opacity-60">최고 콤보</p>
                <p className="text-sm font-bold flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 text-orange-300" />{bestCombo}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] opacity-60">AI 승리</p>
                <p className="text-sm font-bold">{beaten}/{aiResults.length}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] opacity-60">거래</p>
                <p className="text-sm font-bold">{trades.filter((t) => t.action !== "hold").length}회</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 opacity-80" />
                <div>
                  <p className="text-[9px] opacity-60">최종 주식</p>
                  <p className="text-lg font-black">{holdings}<span className="text-xs opacity-70 ml-0.5">주</span></p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] opacity-60">지금 가치</p>
                <p className="text-sm font-bold">{formatNumber(Math.round(finalHoldingValue))}원</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] opacity-60">남은 현금</p>
                <p className="text-sm font-bold">{formatNumber(Math.round(cash))}원</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <LiveChart points={chartPts} animProg={1} isUp={rate >= 0} height={180} />
      </div>

      <div className="px-4 mb-4">
        <h3 className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />{trades.length}턴 선택 리뷰
        </h3>
        <div className="space-y-1.5">
          {trades.map((t, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-xl px-3 py-2.5 flex items-center gap-2.5 border border-gray-800/30">
              <span className="text-sm">{(UI.turnEmoji as string[])[i] ?? "🔢"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white truncate">{t.eventTitle}</p>
                {t.quantity > 0 && <p className="text-[9px] text-gray-600">{formatNumber(Math.round(t.price))}원 × {t.quantity}주</p>}
              </div>
              <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg",
                t.action === "buy" ? "bg-red-500/15 text-red-400" :
                t.action === "sell" ? "bg-blue-500/15 text-blue-400" : "bg-gray-700/30 text-gray-400")}>
                {t.action === "buy" ? `🛒 ${t.ratioLabel ?? ""}` :
                 t.action === "sell" ? `💸 ${t.ratioLabel ?? ""}` : "⏸️ 기다림"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-4">
        <h3 className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-purple-400" />AI 투자자 비교
        </h3>
        {aiResults.map((ai, i) => {
          const win = rate > ai.returnNum
          return (
            <div key={i} className={cn("rounded-xl p-3 border flex items-center gap-3 mb-1.5",
              win ? "bg-green-500/5 border-green-500/15" : "bg-[#1a1a1a] border-gray-800/30")}>
              <span className="text-xl">{ai.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold">{ai.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{ai.result}</p>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-bold", ai.returnNum >= 0 ? "text-red-400" : "text-blue-400")}>{ai.returnRate}</p>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                  win ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-500")}>{win ? "🎉 승리" : "패배"}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 space-y-2 mb-4">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-yellow-400 mb-0.5">💡 핵심 교훈</p>
          <p className="text-xs text-gray-300 leading-relaxed">{scenario.keyLesson}</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent z-20">
        <div className="max-w-md mx-auto flex gap-3">
          <button onClick={onBack}
            className="flex-1 h-12 bg-[#252525] border border-white/10 rounded-xl font-bold text-sm text-white hover:bg-[#333] active:scale-95 flex items-center justify-center gap-1.5">
            {UI.resultLabels.backToDetail}
          </button>
          <button onClick={onReplay}
            className={cn("flex-[2] h-12 rounded-xl font-bold text-sm text-white bg-gradient-to-r hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5",
              scenario.gradientFrom, scenario.gradientTo)}>
            {UI.resultLabels.replay}
          </button>
        </div>
      </div>
    </div>
  )
}
