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
  calcTheoreticalMax,
  type TurnData,
  type ActionType,
  type TradeRecord,
} from "./utils"
import personalityData from "@/data/scenario-personality-result.json"
import {
  ArrowLeft, TrendingUp, TrendingDown,
  RotateCcw, Bot, Sparkles, Lightbulb,
  Package, Trophy, Flame,
  User, Star, Waves,
} from "lucide-react"
import { TradeHistoryCard, type TradeAccountingItem } from "./components/TradeHistoryCard"
import { GameActionBar, RatioModal } from "@/components/game-play-ui"

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
  const [showExitConfirm, setShowExitConfirm] = useState(false)

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
    setScore((s) => Math.max(0, s + (FB.timeout as typeof FB.correct).points))

    setTrades((t) => [
      ...t,
      { turn: (turns[turn]?.turn ?? turn + 1), action: "hold" as ActionType, quantity: 0, price: turns[turn]?.endPrice ?? 0, eventTitle: turns[turn]?.event.title ?? "",
        sentiment: turns[turn]?.event.sentiment ?? "neutral", ratio: 0, decisionTimeSec: GAME.turnTimerSec },
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

      const elapsed = Math.round((Date.now() - turnStartTime) / 1000)
      setTrades((t) => [...t, {
        turn: td.turn, action, quantity: qty, price: p, eventTitle: td.event.title, ratioLabel,
        sentiment: td.event.sentiment, ratio: ratio, decisionTimeSec: elapsed,
      }])
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
        avgPrice={avgPrice}
        trades={trades} aiResults={aiResults} initTotal={totalInitial}
        chartPts={getChartPoints(turns, turns.length - 1)}
        turns={turns}
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

      {/* 비율 선택 모달 - 공통 컴포넌트 */}
      <RatioModal
        mode={showRatio}
        price={price}
        cash={cash}
        holdings={holdings}
        avgPrice={avgPrice}
        stockName={stock.name}
        hint={hint?.ratioGuide}
        onSelect={(ratio, label) => doTrade(showRatio!, ratio, label)}
        onClose={() => setShowRatio(null)}
      />

      {/* Exit Confirm Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowExitConfirm(false)} />
          <div className="relative bg-[#1e1e1e] rounded-2xl p-6 mx-8 w-full max-w-sm border border-gray-700/50">
            <h3 className="text-lg font-black text-white mb-2">게임을 종료할까요?</h3>
            <p className="text-sm text-gray-400 mb-5">현재 진행 중인 내용은 저장되지 않습니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-bold text-sm hover:bg-gray-600 active:scale-95">
                계속하기
              </button>
              <button onClick={() => router.back()}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 active:scale-95">
                종료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-800/60 hover:bg-gray-700/60 active:scale-95">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] text-gray-400 font-bold">종료</span>
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

      {/* Holdings Card */}
      <div className="mx-4 my-1 bg-[#151520] rounded-2xl px-4 py-3 border border-white/5">
        {/* Row 1: 보유 주식 수 + 주식 평가금액 + 손익 */}
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <p className="text-5xl font-black text-white leading-none">{holdings}</p>
              <span className="text-xl text-indigo-300 font-bold">주</span>
              {avgPrice > 0 && (
                <span className="text-[9px] text-gray-600 ml-1">평균 {formatNumber(Math.round(avgPrice))}원</span>
              )}
            </div>
          </div>
          <div className="text-right">
            {holdings > 0 ? (
              <>
                <p className="text-[9px] text-gray-500">주식 평가금액</p>
                <p className="text-sm font-bold text-white">{formatNumber(Math.round(holdings * price))}원</p>
                <p className={cn("text-xs font-bold", holdPnL >= 0 ? "text-red-400" : "text-blue-400")}>
                  {holdPnL >= 0 ? "+" : ""}{formatNumber(Math.round(holdPnL))}원
                  <span className="ml-1">({holdPnLRate >= 0 ? "+" : ""}{holdPnLRate.toFixed(1)}%)</span>
                </p>
              </>
            ) : (
              <p className="text-[10px] text-gray-600">보유 주식 없음</p>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="my-2.5 border-t border-white/10" />

        {/* Row 2: 총 자산 (크고 컬러) | 세로 구분선 | 원화 */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[9px] text-gray-500 mb-0.5">총 자산</p>
            <p className={cn("text-xl font-black", rate >= 0 ? "text-red-400" : "text-blue-400")}>
              {formatNumber(Math.round(total))}원
            </p>
            <p className={cn("text-xs font-bold", rate >= 0 ? "text-red-400/70" : "text-blue-400/70")}>
              {rate >= 0 ? "+" : ""}{rate.toFixed(2)}%
              <span className="text-gray-600 ml-1">
                ({rate >= 0 ? "+" : ""}{formatNumber(Math.round(total - totalInitial))}원)
              </span>
            </p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-right">
            <p className="text-[9px] text-gray-500 mb-0.5">원화</p>
            <p className="text-base font-bold text-gray-200">{formatNumber(Math.round(cash))}원</p>
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

      {/* 타이머 + 액션 버튼 - 공통 컴포넌트 (시나리오: 30초) */}
      <GameActionBar
        timer={timer}
        timerSec={GAME.turnTimerSec}
        shakeTimer={shakeTimer}
        hasFeedback={!!feedback}
        canBuy={maxBuy > 0}
        canSell={holdings > 0}
        onBuy={() => setShowRatio("buy")}
        onSell={() => setShowRatio("sell")}
        onHold={() => doTrade("hold")}
        labels={{ buy: UI.actionLabels.buy as string, sell: UI.actionLabels.sell as string, hold: UI.actionLabels.hold as string }}
      />
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

const BADGE_ACTION_COLOR: Record<ActionType, string> = {
  buy: "#ef4444",
  sell: "#3b82f6",
  hold: "#4b5563",
}

function LiveChart({ points, animProg, isUp, height = 200, turnSize = 20, trades }: {
  points: number[]; animProg: number; isUp: boolean; height?: number; turnSize?: number
  trades?: TradeRecord[]
}) {
  if (points.length < 2) return <div style={{ height }} className="bg-[#111118] rounded-2xl" />
  const visCount = Math.max(2, Math.ceil(points.length * animProg))
  const visible = points.slice(0, visCount)
  const min = Math.min(...points) * 0.996
  const max = Math.max(...points) * 1.004
  const range = max - min || 1
  const W = 400
  const PX = 6
  // 거래 뱃지 표시 시 하단 여백 확보
  const PY = 16
  const BADGE_H = trades && trades.length > 0 ? 22 : 0
  const chartH = height - PY * 2 - BADGE_H
  const toX = (i: number) => PX + (i / Math.max(points.length - 1, 1)) * (W - PX * 2)
  const toY = (p: number) => PY + chartH - ((p - min) / range) * chartH
  const pathD = visible.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(p)}`).join(" ")
  const lx = toX(visible.length - 1)
  const ly = toY(visible[visible.length - 1])
  const areaD = `${pathD} L${lx},${PY + chartH} L${PX},${PY + chartH} Z`
  const stroke = isUp ? "#ef4444" : "#3b82f6"
  const startPrice = points[0]
  const startY = toY(startPrice)

  // 각 거래 뱃지의 x 위치: 각 턴 끝 지점
  const tradeBadges = (trades ?? []).map((trade, i) => {
    const ptIdx = Math.min((i + 1) * turnSize, points.length - 1)
    const bx = toX(ptIdx)
    const by = PY + chartH + BADGE_H / 2 + 2 // 차트 하단 뱃지 영역 중앙
    const color = BADGE_ACTION_COLOR[trade.action]
    return { bx, by, color, num: i + 1, action: trade.action }
  })

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

        {/* 턴 구분선 + 뱃지 연결선 */}
        {tradeBadges.map(({ bx, by, color, num }) => (
          <g key={num}>
            <line x1={bx} x2={bx} y1={PY} y2={by - 10}
              stroke={color} strokeOpacity="0.25" strokeDasharray="2 3" />
          </g>
        ))}

        <line x1={PX} x2={W - PX} y1={startY} y2={startY}
          stroke="#888" strokeOpacity="0.15" strokeDasharray="3 3" />

        <path d={areaD} fill="url(#cg)" />
        <path d={pathD} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* 차트 끝점 pulse */}
        <circle cx={lx} cy={ly} r="4" fill={stroke} />
        <circle cx={lx} cy={ly} r="10" fill={stroke} fillOpacity="0.1">
          <animate attributeName="r" values="7;13;7" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values="0.15;0;0.15" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* 현재가 라벨 */}
        <rect x={lx - 38} y={ly - 20} width="76" height="16" rx="4" fill={stroke} fillOpacity="0.9" />
        <text x={lx} y={ly - 9} textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">
          {formatNumber(Math.round(visible[visible.length - 1]))}
        </text>

        {priceLabels.map((pl, i) => (
          <text key={i} x={W - PX - 2} y={pl.y + 3} textAnchor="end" fontSize="7" fill="#555">{pl.label}</text>
        ))}

        <text x={PX + 2} y={startY - 4} textAnchor="start" fontSize="7" fill="#666">시작</text>

        {/* 거래 번호 뱃지 */}
        {tradeBadges.map(({ bx, by, color, num, action }) => (
          <g key={num}>
            {/* 차트 라인 위 점 */}
            <circle cx={bx} cy={toY(points[Math.min((num - 1) * turnSize + (turnSize - 1), points.length - 1)])}
              r="3" fill={color} stroke="#111118" strokeWidth="1.5" />
            {/* 하단 번호 원 */}
            <circle cx={bx} cy={by} r="9" fill={color} fillOpacity="0.9" />
            <circle cx={bx} cy={by} r="9" fill="none" stroke="#111118" strokeWidth="1" />
            <text x={bx} y={by + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">
              {num}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function ResultView({ scenario, total, rate, cash, holdings, price, avgPrice, trades, aiResults, initTotal, chartPts, turns, score, bestCombo, onReplay, onBack }: {
  scenario: LegendaryScenario; total: number; rate: number; cash: number
  holdings: number; price: number; avgPrice: number; trades: TradeRecord[]
  aiResults: (AIStrategy & { returnNum: number })[]; initTotal: number; chartPts: number[]
  turns: TurnData[]
  score: number; bestCombo: number
  onReplay: () => void; onBack: () => void
}) {
  const grade = getGrade(rate)
  const gi = GRADES[grade as keyof typeof GRADES] ?? GRADES.D
  const beaten = aiResults.filter((a) => rate > a.returnNum).length
  const stock = scenario.stock
  const finalHoldingValue = holdings * price
  const holdingPnL = holdings > 0 && avgPrice > 0 ? (price - avgPrice) * holdings : 0
  const holdingPnLRate = avgPrice > 0 && holdings > 0 ? ((price - avgPrice) / avgPrice) * 100 : 0

  const profitMsg = personalityData.profitMessages.find((m) => rate >= m.minRate) ?? personalityData.profitMessages[personalityData.profitMessages.length - 1]

  // AI 최고/평균 수익률 계산
  const bestAIReturn = aiResults.length > 0 ? Math.max(...aiResults.map((a) => a.returnNum)) : 0
  const avgAIReturn = aiResults.length > 0 ? aiResults.reduce((s, a) => s + a.returnNum, 0) / aiResults.length : 0

  // 수익 보너스 점수 (AI 대비 성과 반영)
  const profitBonus = useMemo(() => {
    if (rate > bestAIReturn + 3) return Math.round(400 + (rate - bestAIReturn) * 20)
    if (rate > bestAIReturn) return Math.round(250 + (rate - bestAIReturn) * 15)
    if (rate > avgAIReturn) return Math.round(100 + (rate - avgAIReturn) * 10)
    if (rate > 0) return Math.round(rate * 5)
    return Math.round(Math.max(-150, rate * 10))
  }, [rate, bestAIReturn, avgAIReturn])
  const totalScore = Math.max(0, score + profitBonus)

  // 이론적 최대 수익 계산
  const theoreticalMax = useMemo(() => calcTheoreticalMax(turns, initTotal), [turns, initTotal])

  // 턴별 실현 손익 계산 (매수 평균가 추적)
  const tradeAccounting = useMemo(() => {
    let runAvg = 0
    let runQty = 0
    return trades.map((t) => {
      let pnl = 0
      let pnlRate = 0
      const amount = t.price * t.quantity
      if (t.action === "buy") {
        const newQty = runQty + t.quantity
        runAvg = runQty > 0 ? (runAvg * runQty + t.price * t.quantity) / newQty : t.price
        runQty = newQty
      } else if (t.action === "sell" && t.quantity > 0) {
        pnl = (t.price - runAvg) * t.quantity
        pnlRate = runAvg > 0 ? ((t.price - runAvg) / runAvg) * 100 : 0
        runQty = Math.max(0, runQty - t.quantity)
        if (runQty === 0) runAvg = 0
      }
      return { ...t, amount, pnl, pnlRate }
    })
  }, [trades])

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-28">
      {/* 상단 결과 헤더 - 다크 테마 통일 */}
      <div className="px-5 pt-10 pb-6 bg-[#1a1a1a] border-b border-white/5">
        <p className="text-xs text-gray-500 mb-3">{stock.name} ({stock.code}) · {scenario.title}</p>

        {/* Profit message */}
        <div className="flex items-center gap-3 mb-4 bg-[#252525] rounded-xl px-4 py-3 border border-white/5">
          <span className="text-2xl">{profitMsg.emoji}</span>
          <div>
            <p className="text-sm font-bold text-white">{profitMsg.title}</p>
            <p className="text-[10px] text-gray-400">{profitMsg.message}</p>
          </div>
        </div>

        {/* 총 자산 */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[10px] text-gray-500 mb-1">시작 {formatNumber(initTotal)}원 →</p>
            <p className="text-3xl font-black text-white">{formatNumber(Math.round(total))}원</p>
            <p className={cn("text-lg font-bold mt-1", rate >= 0 ? "text-red-400" : "text-blue-400")}>
              {rate >= 0 ? "+" : ""}{rate.toFixed(2)}%
              <span className="text-xs text-gray-500 ml-1.5">({rate >= 0 ? "+" : ""}{formatNumber(Math.round(total - initTotal))}원)</span>
            </p>
          </div>
          <div className="text-right">
            <div className={cn(
              "text-4xl font-black",
              gi.label === 'S' ? "text-yellow-400" :
              gi.label === 'A' ? "text-green-400" :
              gi.label === 'B' ? "text-cyan-400" :
              gi.label === 'C' ? "text-gray-400" : "text-gray-500"
            )}>{gi.label}</div>
            <p className="text-[10px] text-gray-500">{gi.title}</p>
          </div>
        </div>

        {/* 점수 카드 */}
        <div className="bg-[#252525] rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <p className="text-xs font-bold text-gray-400">최종 점수</p>
            </div>
            <p className="text-2xl font-black text-white">{totalScore}<span className="text-xs text-gray-500 ml-0.5">점</span></p>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5">
            <div>
              <p className="text-[9px] text-gray-500">판단 점수</p>
              <p className="text-sm font-bold text-white">{score}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500">수익 보너스</p>
              <p className={cn("text-sm font-bold", profitBonus >= 0 ? "text-red-400" : "text-blue-400")}>
                {profitBonus >= 0 ? "+" : ""}{profitBonus}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500">최고 콤보</p>
              <p className="text-sm font-bold text-white flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-orange-400" />{bestCombo}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500">AI 격파</p>
              <p className="text-sm font-bold text-white">{beaten}/{aiResults.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 보유 현황 */}
      <div className="px-5 py-4 bg-[#151515]">
        {holdings > 0 ? (
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 mb-3">
            <p className="text-[10px] text-gray-500 font-bold mb-3">📦 보유 주식 현황</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <p className="text-[9px] text-gray-500">최종 주식 수</p>
                <p className="text-lg font-black text-white">{holdings}<span className="text-xs text-gray-500 ml-0.5">주</span></p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500">최종 주식가</p>
                <p className="text-sm font-bold text-white">{formatNumber(Math.round(price))}원</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500">주식 수익률</p>
                <p className={cn("text-sm font-bold", holdingPnLRate >= 0 ? "text-red-400" : "text-blue-400")}>
                  {holdingPnLRate >= 0 ? "+" : ""}{holdingPnLRate.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-white/5">
              <p className="text-[9px] text-gray-500">
                주식 평가금액
                <span className={cn("ml-1 font-bold", holdingPnL >= 0 ? "text-red-400" : "text-blue-400")}>
                  ({holdingPnL >= 0 ? "+" : ""}{formatNumber(Math.round(holdingPnL))}원 손익)
                </span>
              </p>
              <p className="text-lg font-black text-white">
                {formatNumber(Math.round(finalHoldingValue))}원
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 mb-3 text-center">
            <p className="text-xs text-gray-500">📦 보유 주식 없음 · 전부 매도 완료</p>
          </div>
        )}

        {/* 남은 원화 */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
          <p className="text-[10px] text-gray-500 font-bold mb-2">💰 남은 원화</p>
          <p className="text-2xl font-black text-white">{formatNumber(Math.round(cash))}원</p>
        </div>
      </div>

      <div className="px-4 py-2 pt-4">
        <LiveChart points={chartPts} animProg={1} isUp={rate >= 0} height={200} trades={trades} />
      </div>

      {/* 턴 히스토리 - 게임 형식 */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Waves className="w-4 h-4 text-white" />
            </div>
            {trades.length}턴 파도 분석
          </h3>
          <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-2.5 py-1">
            <span className="text-[9px] text-gray-500">탭하여 AI 갭 비교</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {tradeAccounting.map((t, i) => {
            const nextTurnChange = turns[i + 1]?.change
            return (
              <TradeHistoryCard
                key={i}
                mode="scenario"
                trade={t as TradeAccountingItem}
                index={i}
                turnEmoji={(UI.turnEmoji as string[])[i] ?? "🔢"}
                nextTurnChange={nextTurnChange}
                aiResults={aiResults}
                turns={turns}
                initTotal={initTotal}
                userRate={rate}
                currentPrice={turns[i]?.endPrice}
              />
            )
          })}
        </div>
      </div>

      {/* AI 투자자 비교 - 게임 형식 */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            AI 대결 결과
          </h3>
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs",
            beaten >= aiResults.length ? "bg-green-500/20 text-green-400" :
            beaten > 0 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
          )}>
            <Trophy className="w-3.5 h-3.5" />
            {beaten}/{aiResults.length} 격파
          </div>
        </div>

        {/* 나의 수익률 카드 */}
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-4 border border-cyan-500/30 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-cyan-300 font-semibold">나의 최종 수익률</p>
                <p className={cn(
                  "text-2xl font-black",
                  rate >= 0 ? "text-red-400" : "text-blue-400"
                )}>
                  {rate >= 0 ? "+" : ""}{rate.toFixed(2)}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-gray-400">최고 AI 대비</p>
              <p className={cn(
                "text-lg font-black",
                rate >= bestAIReturn ? "text-green-400" : "text-orange-400"
              )}>
                {rate >= bestAIReturn ? "+" : ""}{(rate - bestAIReturn).toFixed(1)}%p
              </p>
            </div>
          </div>
        </div>

        {/* AI 리스트 */}
        <div className="space-y-2">
          {aiResults.map((ai, i) => {
            const win = rate > ai.returnNum
            const gap = rate - ai.returnNum
            return (
              <div key={i} className={cn(
                "rounded-xl p-3 border flex items-center gap-3 transition-all",
                win 
                  ? "bg-green-500/8 border-green-500/20" 
                  : "bg-[#1a1a1a] border-gray-800/30"
              )}>
                <div className="relative">
                  <span className="text-2xl">{ai.emoji}</span>
                  {win && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-[8px]">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white">{ai.name}</p>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded",
                      win ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-500"
                    )}>
                      {win ? "🎉 승리" : "패배"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">{ai.type}</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-bold",
                    ai.returnNum >= 0 ? "text-red-400" : "text-blue-400"
                  )}>
                    {ai.returnRate}
                  </p>
                  <p className={cn(
                    "text-[10px] font-bold",
                    gap >= 0 ? "text-green-400" : "text-orange-400"
                  )}>
                    갭 {gap >= 0 ? "+" : ""}{gap.toFixed(1)}%p
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 파도 읽기 달성도 */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            파도 읽기 달성도
          </h3>
          {theoreticalMax.maxRate > 0 && (
            <div className={cn(
              "px-3 py-1.5 rounded-full font-bold text-sm",
              rate / theoreticalMax.maxRate >= 0.7 ? "bg-green-500/20 text-green-400" :
              rate / theoreticalMax.maxRate >= 0.4 ? "bg-yellow-500/20 text-yellow-400" : 
              "bg-red-500/20 text-red-400"
            )}>
              {Math.max(0, (rate / theoreticalMax.maxRate * 100)).toFixed(0)}%
            </div>
          )}
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-gray-800/30">
          {/* 달성도 게이지 */}
          {theoreticalMax.maxRate > 0 && (
            <div className="mb-4">
              <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 relative",
                    rate / theoreticalMax.maxRate >= 0.7 ? "bg-gradient-to-r from-green-600 to-green-400" :
                    rate / theoreticalMax.maxRate >= 0.4 ? "bg-gradient-to-r from-yellow-600 to-yellow-400" : 
                    "bg-gradient-to-r from-red-600 to-red-400"
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, (rate / theoreticalMax.maxRate) * 100))}%` }}
                />
                {/* 마일스톤 마커 */}
                <div className="absolute top-0 left-[40%] w-0.5 h-full bg-white/20" />
                <div className="absolute top-0 left-[70%] w-0.5 h-full bg-white/20" />
              </div>
              <div className="flex justify-between mt-1 text-[8px] text-gray-600">
                <span>0%</span>
                <span>40%</span>
                <span>70%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* 비교 카드 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-3 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-cyan-400" />
                <p className="text-[10px] text-cyan-300 font-bold">내 결과</p>
              </div>
              <p className={cn("text-2xl font-black", rate >= 0 ? "text-red-400" : "text-blue-400")}>
                {rate >= 0 ? "+" : ""}{rate.toFixed(1)}%
              </p>
              <p className="text-[10px] text-gray-500">
                {rate >= 0 ? "+" : ""}{formatNumber(Math.round(total - initTotal))}원
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-3 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <p className="text-[10px] text-yellow-300 font-bold">완벽 전략</p>
              </div>
              <p className="text-2xl font-black text-yellow-400">
                +{theoreticalMax.maxRate.toFixed(1)}%
              </p>
              <p className="text-[10px] text-gray-500">
                +{formatNumber(theoreticalMax.maxValue - initTotal)}원
              </p>
            </div>
          </div>

          {/* 갭 분석 */}
          <div className="bg-[#252525] rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-gray-500 mb-1">최대 수익과의 갭</p>
                <p className="text-lg font-black text-orange-400">
                  -{(theoreticalMax.maxRate - rate).toFixed(1)}%p
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-500 mb-1">놓친 수익</p>
                <p className="text-lg font-black text-gray-400">
                  -{formatNumber(theoreticalMax.maxValue - Math.round(total))}원
                </p>
              </div>
            </div>
          </div>

          {/* 파도 전환점 */}
          <div className="bg-cyan-500/8 border border-cyan-500/20 rounded-xl p-3">
            <p className="text-[10px] font-bold text-cyan-300 mb-2 flex items-center gap-1">
              <Waves className="w-3 h-3" /> 파도 전환점 분석
            </p>
            <div className="flex items-center justify-between text-[10px]">
              <div>
                <p className="text-gray-500">최저점</p>
                <p className="text-white font-bold">T{theoreticalMax.lowestTurn} · {formatNumber(theoreticalMax.lowestPrice)}원</p>
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
              <div className="text-right">
                <p className="text-gray-500">최고점</p>
                <p className="text-white font-bold">T{theoreticalMax.highestTurn} · {formatNumber(theoreticalMax.highestPrice)}원</p>
              </div>
            </div>
          </div>
        </div>
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
