"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
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
  RotateCcw, Bot, Sparkles, AlertTriangle, Lightbulb,
  Package,
} from "lucide-react"

const { ui: UI, feedback: FB, grades: GRADES } = playContent

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
  const [feedback, setFeedback] = useState<"correct" | "good" | "bad" | null>(null)
  const [animProg, setAnimProg] = useState(0)

  useEffect(() => {
    if (init) {
      setCash(init.cash)
      setHoldings(init.holdings)
      setAvgPrice(init.avgPrice)
    }
  }, [init])

  const td = turns[turn] as TurnData | undefined
  const price = td?.endPrice ?? 0
  const totalInitial = init?.totalInitial ?? 0
  const total = portfolioValue(cash, holdings, price)
  const rate = calcRate(total, totalInitial)
  const maxBuy = price > 0 ? Math.floor(cash / price) : 0
  const holdPnL = holdings > 0 ? (price - avgPrice) * holdings : 0
  const holdPnLRate = avgPrice > 0 ? ((price - avgPrice) / avgPrice) * 100 : 0
  const holdingValue = holdings * price

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

  const doTrade = useCallback(
    (action: ActionType, ratio: number = 0, ratioLabel?: string) => {
      if (!td) return
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

      setTimeout(() => {
        setFeedback(null)
        if (turn >= turns.length - 1) setGameOver(true)
        else setTurn((t) => t + 1)
      }, 1200)
    },
    [td, turns, turn, holdings, avgPrice, maxBuy],
  )

  const reset = useCallback(() => {
    if (!init) return
    setTurn(0); setCash(init.cash); setHoldings(init.holdings); setAvgPrice(init.avgPrice)
    setTrades([]); setGameOver(false); setFeedback(null); setShowRatio(null)
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
        onReplay={reset} onBack={() => router.push(`/learn/scenarios/${scenario.id}`)} />
    )
  }

  const sent = playContent.sentiment[td.event.sentiment as keyof typeof playContent.sentiment]
    ?? playContent.sentiment.neutral
  const isUp = td.change >= 0
  const fbData = feedback ? FB[feedback] : null
  const stock = scenario.stock

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col relative">
      {/* 피드백 오버레이 */}
      {feedback && fbData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-150">
          <div className="absolute inset-0 bg-black/60" />
          <div className={cn("relative text-center px-8 py-8", feedback === "correct" && "animate-bounce")}>
            {feedback === "correct" && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(16)].map((_, i) => (
                  <span key={i} className="absolute text-yellow-400 animate-ping"
                    style={{ left: `${10 + Math.random() * 80}%`, top: `${5 + Math.random() * 90}%`,
                      animationDelay: `${i * 60}ms`, animationDuration: "1s", fontSize: `${12 + Math.random() * 16}px` }}>✦</span>
                ))}
              </div>
            )}
            <div className="text-5xl mb-3">{fbData.emoji}</div>
            <h2 className={cn("text-xl font-black mb-1",
              feedback === "correct" ? "text-yellow-400" : feedback === "good" ? "text-green-400" : "text-orange-400")}>
              {fbData.titles[Math.floor(Math.random() * fbData.titles.length)]}
            </h2>
            <p className="text-xs text-gray-300 max-w-[240px] mx-auto">
              {fbData.messages[Math.floor(Math.random() * fbData.messages.length)]}
            </p>
          </div>
        </div>
      )}

      {/* 비중 선택 모달 */}
      {showRatio && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRatio(null)} />
          <div className="relative w-full max-w-md bg-[#1e1e1e] rounded-t-3xl p-5 pb-8 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
            <h3 className={cn("text-base font-bold mb-1", showRatio === "buy" ? "text-red-400" : "text-blue-400")}>
              {stock.name} {showRatio === "buy" ? "매수" : "매도"} 비중
            </h3>
            <p className="text-[10px] text-gray-500 mb-4">
              {showRatio === "buy"
                ? `현금: ${cash.toLocaleString()}원 · 매수 가능: ${maxBuy}주`
                : `보유: ${holdings}주 · 평가: ${holdingValue.toLocaleString()}원`}
            </p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(UI.ratioValues as number[]).map((r, i) => {
                const qty = showRatio === "buy"
                  ? Math.max(1, Math.floor(maxBuy * r))
                  : Math.max(1, Math.ceil(holdings * r))
                const amount = qty * price
                return (
                  <button key={i} onClick={() => doTrade(showRatio, r, (UI.ratioLabels as string[])[i])}
                    disabled={qty === 0}
                    className={cn("py-3 rounded-xl border text-center transition-all active:scale-95 disabled:opacity-20",
                      showRatio === "buy" ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20" : "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20")}>
                    <span className={cn("text-sm font-bold", showRatio === "buy" ? "text-red-400" : "text-blue-400")}>
                      {(UI.ratioLabels as string[])[i]}
                    </span>
                    <p className="text-[10px] text-gray-500 mt-0.5">{qty}주</p>
                    <p className="text-[9px] text-gray-600">{(amount / 10000).toFixed(0)}만원</p>
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

      {/* 헤더 - 종목명 + 코드 */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="text-center">
          <p className="text-xs font-bold text-white">{stock.name}</p>
          <p className="text-[9px] text-gray-600">{stock.code} · {stock.sector}</p>
        </div>
        <span className="text-xs text-gray-600 font-bold">{td.turn}/{turns.length}</span>
      </div>

      {/* 턴 진행 바 */}
      <div className="px-4 pb-1.5 flex gap-0.5">
        {turns.map((_, i) => (
          <div key={i} className={cn("flex-1 h-1.5 rounded-full transition-all duration-300",
            i < turn ? "bg-green-500" : i === turn ? "bg-yellow-500" : "bg-gray-800")} />
        ))}
      </div>

      {/* ★ 보유 주식 수량 강조 영역 ★ */}
      <div className="mx-4 mb-1.5 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-2xl p-3 border border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[9px] text-indigo-400/70 font-medium">보유 수량</p>
              <p className="text-2xl font-black text-white tracking-tight">
                {holdings}<span className="text-sm text-indigo-300 ml-0.5">주</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-gray-600">평단가 {avgPrice > 0 ? avgPrice.toLocaleString() : "-"}원</p>
            {holdings > 0 && (
              <p className={cn("text-xs font-bold", holdPnL >= 0 ? "text-red-400" : "text-blue-400")}>
                {holdPnL >= 0 ? "+" : ""}{holdPnL.toLocaleString()}원
                <span className="text-[10px] opacity-70 ml-0.5">({holdPnLRate >= 0 ? "+" : ""}{holdPnLRate.toFixed(1)}%)</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 총자산 / 수익률 */}
      <div className="px-4 py-2 border-b border-gray-800/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] text-gray-600">총 자산</p>
            <p className="text-2xl font-black tracking-tight">{total.toLocaleString()}<span className="text-sm text-gray-500">원</span></p>
          </div>
          <div className={cn("px-3 py-1.5 rounded-xl", rate >= 0 ? "bg-red-500/10" : "bg-blue-500/10")}>
            <p className={cn("text-xl font-black", rate >= 0 ? "text-red-400" : "text-blue-400")}>
              {rate >= 0 ? "+" : ""}{rate.toFixed(2)}%
            </p>
          </div>
        </div>
        <p className="text-[10px] text-gray-600 mt-0.5">현금 {cash.toLocaleString()}원</p>
      </div>

      {/* 차트 */}
      <div className="px-3 pt-1.5">
        <LiveChart points={chartPts} animProg={animProg} isUp={isUp} height={120} />
        <div className="flex items-end justify-between mt-1 px-1">
          <p className="text-xl font-black">{price.toLocaleString()}<span className="text-xs text-gray-500">원</span></p>
          <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold",
            isUp ? "bg-red-500/15 text-red-400" : "bg-blue-500/15 text-blue-400")}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isUp ? "+" : ""}{td.change.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 이벤트 + 힌트 */}
      <div className="flex-1 px-4 pt-2 pb-2 space-y-2 overflow-y-auto">
        <div className={cn("rounded-2xl p-3.5 border relative overflow-hidden", sent.bg, sent.border)}>
          <div className="absolute top-1 right-2 text-4xl opacity-[0.05] pointer-events-none select-none">{sent.icon}</div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">{(UI.turnEmoji as string[])[turn] ?? "🔢"}</span>
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", sent.bg, sent.color)}>{sent.label}</span>
          </div>
          <h3 className="text-[14px] font-black text-white mb-1">{td.event.title}</h3>
          <p className="text-[12px] text-gray-300 leading-[1.7]">{td.event.description}</p>
        </div>

        {hint && (
          <div className="flex gap-2">
            <div className="flex-1 bg-[#151515] rounded-xl p-2.5 border border-gray-800/30">
              <div className="flex items-center gap-1 mb-1">
                <Lightbulb className="w-3 h-3 text-yellow-500" />
                <span className="text-[9px] font-bold text-yellow-500/80">시장 신호</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">{hint.hint}</p>
            </div>
            <div className="flex-1 bg-[#151515] rounded-xl p-2.5 border border-gray-800/30">
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3 h-3 text-cyan-500" />
                <span className="text-[9px] font-bold text-cyan-500/80">비중 가이드</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">{hint.ratioGuide}</p>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="px-4 pt-2 pb-5 border-t border-gray-800/40 bg-[#0d0d0d]">
        <div className="flex gap-2">
          <button onClick={() => setShowRatio("buy")} disabled={maxBuy === 0 || !!feedback}
            className="flex-1 h-14 bg-red-500 hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-2xl font-bold text-[15px] text-white transition-all active:scale-95">
            {UI.actionLabels.buy}
          </button>
          <button onClick={() => setShowRatio("sell")} disabled={holdings === 0 || !!feedback}
            className="flex-1 h-14 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-2xl font-bold text-[15px] text-white transition-all active:scale-95">
            {UI.actionLabels.sell}
          </button>
          <button onClick={() => doTrade("hold")} disabled={!!feedback}
            className="flex-1 h-14 bg-[#333] hover:bg-[#444] disabled:bg-gray-800 disabled:text-gray-600 rounded-2xl font-bold text-[15px] text-white transition-all active:scale-95">
            {UI.actionLabels.hold}
          </button>
        </div>
      </div>
    </div>
  )
}

function LiveChart({ points, animProg, isUp, height = 120 }: {
  points: number[]; animProg: number; isUp: boolean; height?: number
}) {
  if (points.length < 2) return <div style={{ height }} className="bg-[#141414] rounded-2xl" />
  const visCount = Math.max(2, Math.ceil(points.length * animProg))
  const visible = points.slice(0, visCount)
  const min = Math.min(...points) * 0.997
  const max = Math.max(...points) * 1.003
  const range = max - min || 1
  const W = 400, P = 4
  const toX = (i: number) => P + (i / (points.length - 1)) * (W - P * 2)
  const toY = (p: number) => P + (height - P * 2) - ((p - min) / range) * (height - P * 2)
  const pathD = visible.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(p)}`).join(" ")
  const lx = toX(visible.length - 1)
  const ly = toY(visible[visible.length - 1])
  const areaD = `${pathD} L${lx},${height - P} L${P},${height - P} Z`
  const stroke = isUp ? "#ef4444" : "#3b82f6"

  return (
    <div className="bg-[#141414] rounded-2xl p-2 relative">
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((r) => (
          <line key={r} x1={P} x2={W - P} y1={height * r} y2={height * r}
            stroke="#ffffff" strokeOpacity="0.025" strokeDasharray="4 4" />
        ))}
        <path d={areaD} fill="url(#cg)" />
        <path d={pathD} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={lx} cy={ly} r="3.5" fill={stroke} />
        <circle cx={lx} cy={ly} r="9" fill={stroke} fillOpacity="0.12">
          <animate attributeName="r" values="6;11;6" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values="0.15;0;0.15" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <rect x={lx - 36} y={ly - 18} width="72" height="14" rx="3" fill={stroke} fillOpacity="0.85" />
        <text x={lx} y={ly - 8.5} textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="white">
          {visible[visible.length - 1].toLocaleString()}원
        </text>
      </svg>
    </div>
  )
}

function ResultView({ scenario, total, rate, cash, holdings, price, trades, aiResults, initTotal, chartPts, onReplay, onBack }: {
  scenario: LegendaryScenario; total: number; rate: number; cash: number
  holdings: number; price: number; trades: TradeRecord[]
  aiResults: (AIStrategy & { returnNum: number })[]; initTotal: number; chartPts: number[]
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
              <p className="text-3xl font-black">{total.toLocaleString()}원</p>
              <p className={cn("text-lg font-black mt-1", rate >= 0 ? "text-green-200" : "text-red-200")}>
                {rate >= 0 ? "+" : ""}{rate.toFixed(2)}%
                <span className="text-sm opacity-70 ml-1.5">({rate >= 0 ? "+" : ""}{(total - initTotal).toLocaleString()}원)</span>
              </p>
            </div>
            <div className="text-center">
              <div className={cn("text-5xl font-black", gi.color)}>{gi.label}</div>
              <p className="text-[10px] opacity-70">{gi.title}</p>
            </div>
          </div>

          {/* 최종 보유 수량 강조 */}
          <div className="bg-white/15 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 opacity-80" />
                <div>
                  <p className="text-[9px] opacity-60">최종 보유</p>
                  <p className="text-xl font-black">{holdings}<span className="text-xs opacity-70 ml-0.5">주</span></p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] opacity-60">평가금액</p>
                <p className="text-sm font-bold">{finalHoldingValue.toLocaleString()}원</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] opacity-60">잔여 현금</p>
                <p className="text-sm font-bold">{cash.toLocaleString()}원</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {[
              { l: "AI 승리", v: `${beaten}/${aiResults.length}` },
              { l: "거래", v: `${trades.filter((t) => t.action !== "hold").length}회` },
              { l: "관망", v: `${trades.filter((t) => t.action === "hold").length}회` },
            ].map((s) => (
              <div key={s.l} className="bg-white/15 rounded-lg px-3 py-1.5 flex-1 text-center">
                <p className="text-[9px] opacity-60">{s.l}</p>
                <p className="text-sm font-bold">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <LiveChart points={chartPts} animProg={1} isUp={rate >= 0} height={120} />
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
                {t.quantity > 0 && <p className="text-[9px] text-gray-600">{t.price.toLocaleString()}원 × {t.quantity}주</p>}
              </div>
              <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg",
                t.action === "buy" ? "bg-red-500/15 text-red-400" :
                t.action === "sell" ? "bg-blue-500/15 text-blue-400" : "bg-gray-700/30 text-gray-400")}>
                {t.action === "buy" ? `매수 ${t.ratioLabel ?? ""}` :
                 t.action === "sell" ? `매도 ${t.ratioLabel ?? ""}` : "관망"}
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
                  win ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-500")}>{win ? "승리" : "패배"}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 space-y-2 mb-4">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-yellow-400 mb-0.5">핵심 교훈</p>
          <p className="text-xs text-gray-300 leading-relaxed">{scenario.keyLesson}</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent z-20">
        <div className="max-w-md mx-auto flex gap-3">
          <button onClick={onBack}
            className="flex-1 h-12 bg-[#252525] border border-white/10 rounded-xl font-bold text-sm text-white hover:bg-[#333] active:scale-95 flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />{UI.resultLabels.backToDetail}
          </button>
          <button onClick={onReplay}
            className={cn("flex-[2] h-12 rounded-xl font-bold text-sm text-white bg-gradient-to-r hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5",
              scenario.gradientFrom, scenario.gradientTo)}>
            <RotateCcw className="w-4 h-4" />{UI.resultLabels.replay}
          </button>
        </div>
      </div>
    </div>
  )
}
