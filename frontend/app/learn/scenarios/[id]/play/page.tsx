"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LEGENDARY_SCENARIOS,
  type LegendaryScenario,
  type AIStrategy,
} from "@/data/legendary-scenarios"
import playContent from "@/data/scenario-play-content.json"
import {
  buildTurnData,
  getAllChartPoints,
  calcPortfolioValue,
  calcProfitRate,
  getIdealAction,
  getFeedbackLevel,
  getGrade,
  type TurnData,
  type ActionType,
  type TradeRecord,
} from "./utils"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Trophy,
  RotateCcw,
  Bot,
  Sparkles,
} from "lucide-react"

const { game: GAME, ui: UI, feedback: FEEDBACK, grades: GRADES } = playContent
const INITIAL_CASH = GAME.initialCash

// ═══════════════════════════════════════════════
// 메인 페이지
// ═══════════════════════════════════════════════
export default function ScenarioPlayPage() {
  const params = useParams()
  const router = useRouter()

  const scenario = useMemo(
    () => LEGENDARY_SCENARIOS.find((s) => s.id === params.id) ?? null,
    [params.id],
  )
  const turns = useMemo(
    () => (scenario ? buildTurnData(scenario.events) : []),
    [scenario],
  )

  const [phase, setPhase] = useState(0)
  const [cash, setCash] = useState(INITIAL_CASH)
  const [holdings, setHoldings] = useState(0)
  const [avgPrice, setAvgPrice] = useState(0)
  const [trades, setTrades] = useState<TradeRecord[]>([])
  const [gameOver, setGameOver] = useState(false)

  // 애니메이션 상태
  const [showFeedback, setShowFeedback] = useState<"correct" | "good" | "bad" | null>(null)
  const [chartAnimating, setChartAnimating] = useState(false)
  const [animProgress, setAnimProgress] = useState(0)

  const turn = turns[phase] as TurnData | undefined
  const currentPrice = turn?.endPrice ?? 0
  const totalValue = calcPortfolioValue(cash, holdings, currentPrice)
  const profitRate = calcProfitRate(totalValue, INITIAL_CASH)
  const maxBuy = currentPrice > 0 ? Math.floor(cash / currentPrice) : 0

  const chartPoints = useMemo(
    () => (turns.length > 0 ? getAllChartPoints(turns, phase) : []),
    [turns, phase],
  )

  const aiResults = useMemo(() => {
    if (!scenario) return []
    return scenario.aiStrategies.map((ai) => ({
      ...ai,
      returnNum: parseFloat(ai.returnRate.replace("%", "").replace("+", "")),
    }))
  }, [scenario])

  // 차트 진입 애니메이션
  useEffect(() => {
    setChartAnimating(true)
    setAnimProgress(0)
    const start = performance.now()
    const duration = 800
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setAnimProgress(p)
      if (p < 1) requestAnimationFrame(tick)
      else setChartAnimating(false)
    }
    requestAnimationFrame(tick)
  }, [phase])

  const handleAction = useCallback(
    (action: ActionType) => {
      if (!turn) return
      const price = turn.endPrice

      if (action === "buy") {
        const qty = Math.max(1, Math.floor(maxBuy * 0.5))
        if (qty === 0) return
        const cost = qty * price
        const newTotal = holdings + qty
        const newAvg = holdings > 0
          ? (avgPrice * holdings + price * qty) / newTotal
          : price
        setCash((c) => c - cost)
        setHoldings(newTotal)
        setAvgPrice(newAvg)
        setTrades((t) => [...t, { phase, action, quantity: qty, price, eventTitle: turn.event.title }])
      } else if (action === "sell") {
        if (holdings <= 0) return
        setCash((c) => c + holdings * price)
        setTrades((t) => [...t, { phase, action, quantity: holdings, price, eventTitle: turn.event.title }])
        setHoldings(0)
        setAvgPrice(0)
      } else {
        setTrades((t) => [...t, { phase, action, quantity: 0, price, eventTitle: turn.event.title }])
      }

      const ideal = getIdealAction(turns, phase, holdings > 0)
      const level = getFeedbackLevel(action, ideal)
      setShowFeedback(level)

      setTimeout(() => {
        setShowFeedback(null)
        if (phase >= turns.length - 1) {
          setGameOver(true)
        } else {
          setPhase((p) => p + 1)
        }
      }, 1400)
    },
    [turn, maxBuy, holdings, avgPrice, phase, turns],
  )

  const resetGame = useCallback(() => {
    setPhase(0)
    setCash(INITIAL_CASH)
    setHoldings(0)
    setAvgPrice(0)
    setTrades([])
    setGameOver(false)
    setShowFeedback(null)
  }, [])

  if (!scenario || turns.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="animate-pulse text-4xl">🎮</div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <ResultView
        scenario={scenario}
        totalValue={totalValue}
        profitRate={profitRate}
        cash={cash}
        holdings={holdings}
        currentPrice={turns[turns.length - 1].endPrice}
        trades={trades}
        aiResults={aiResults}
        chartPoints={getAllChartPoints(turns, turns.length - 1)}
        onReplay={resetGame}
        onBack={() => router.push(`/learn/scenarios/${scenario.id}`)}
      />
    )
  }

  const sentCfg = playContent.sentiment[turn.event.sentiment as keyof typeof playContent.sentiment]
    ?? playContent.sentiment.neutral
  const isUp = turn.change >= 0
  const feedbackData = showFeedback ? FEEDBACK[showFeedback] : null

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col relative overflow-hidden">
      {/* ── 피드백 오버레이 ── */}
      {showFeedback && feedbackData && (
        <div className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          "animate-in fade-in duration-200",
        )}>
          <div className="absolute inset-0 bg-black/70" />
          <div className={cn(
            "relative text-center px-8 py-10",
            showFeedback === "correct" && "animate-bounce",
          )}>
            {showFeedback === "correct" && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <span
                    key={i}
                    className="absolute text-yellow-400 animate-ping"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${10 + Math.random() * 80}%`,
                      animationDelay: `${i * 80}ms`,
                      animationDuration: "1s",
                      fontSize: `${14 + Math.random() * 12}px`,
                    }}
                  >
                    ✦
                  </span>
                ))}
              </div>
            )}
            <div className="text-6xl mb-4">{feedbackData.emoji}</div>
            <h2 className={cn(
              "text-2xl font-black mb-2",
              showFeedback === "correct" ? "text-yellow-400" :
              showFeedback === "good" ? "text-green-400" : "text-orange-400",
            )}>
              {feedbackData.titles[Math.floor(Math.random() * feedbackData.titles.length)]}
            </h2>
            <p className="text-sm text-gray-300 max-w-[260px] mx-auto">
              {feedbackData.messages[Math.floor(Math.random() * feedbackData.messages.length)]}
            </p>
          </div>
        </div>
      )}

      {/* ── 상단 헤더 ── */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 font-medium">
            {scenario.emoji} {scenario.title}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {turns.map((_, i) => (
            <div key={i} className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all",
              i < phase ? "bg-green-500/20 border-green-500/40 text-green-400" :
              i === phase ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400 animate-pulse" :
              "bg-gray-800 border-gray-700 text-gray-600",
            )}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* ── 포트폴리오 바 ── */}
      <div className="px-4 py-2 flex items-center gap-3 border-b border-gray-800/50">
        <div className="flex-1">
          <p className="text-[9px] text-gray-600">{UI.portfolioLabels.totalAsset}</p>
          <p className="text-sm font-bold">{totalValue.toLocaleString()}<span className="text-[10px] text-gray-500">원</span></p>
        </div>
        <div className={cn(
          "px-2.5 py-1 rounded-lg",
          profitRate >= 0 ? "bg-red-500/10" : "bg-blue-500/10",
        )}>
          <p className={cn("text-xs font-bold", profitRate >= 0 ? "text-red-400" : "text-blue-400")}>
            {profitRate >= 0 ? "+" : ""}{profitRate.toFixed(1)}%
          </p>
        </div>
        {holdings > 0 && (
          <div className="text-right">
            <p className="text-[9px] text-gray-600">{UI.portfolioLabels.holdings}</p>
            <p className="text-xs text-gray-300">{holdings}주</p>
          </div>
        )}
      </div>

      {/* ── 차트 영역 (핵심) ── */}
      <div className="px-3 pt-3 pb-1">
        <LiveChart
          points={chartPoints}
          animProgress={animProgress}
          isUp={isUp}
          height={180}
        />
        <div className="flex items-end justify-between mt-2 px-1">
          <div>
            <p className="text-2xl font-black tracking-tight">
              {currentPrice.toLocaleString()}<span className="text-sm text-gray-500">원</span>
            </p>
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold",
            isUp ? "bg-red-500/15 text-red-400" : "bg-blue-500/15 text-blue-400",
          )}>
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isUp ? "+" : ""}{turn.change.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* ── 이벤트 카드 ── */}
      <div className="flex-1 px-4 pt-2 pb-2">
        <div className={cn(
          "rounded-2xl p-4 border relative overflow-hidden",
          sentCfg.bg, sentCfg.border,
        )}>
          <div className="absolute top-0 right-0 w-16 h-16 opacity-10 text-5xl pointer-events-none select-none">
            {sentCfg.icon}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{UI.phaseEmoji[phase]}</span>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                {UI.phaseLabels[phase]}
              </span>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", sentCfg.bg, sentCfg.color)}>
                {sentCfg.label}
              </span>
            </div>
            <h3 className="text-lg font-black text-white mb-1">
              {turn.event.title}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {turn.event.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── 하단 매매 버튼 (항상 고정) ── */}
      <div className="px-4 pt-2 pb-6 border-t border-gray-800/50 bg-[#0d0d0d]">
        <div className="flex gap-2.5">
          <button
            onClick={() => handleAction("buy")}
            disabled={maxBuy === 0 || !!showFeedback}
            className="flex-1 h-14 bg-red-500 hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-2xl font-bold text-base text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            {UI.actionLabels.buy}
          </button>
          <button
            onClick={() => handleAction("sell")}
            disabled={holdings === 0 || !!showFeedback}
            className="flex-1 h-14 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-2xl font-bold text-base text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            {UI.actionLabels.sell}
          </button>
          <button
            onClick={() => handleAction("hold")}
            disabled={!!showFeedback}
            className="flex-1 h-14 bg-[#333] hover:bg-[#444] disabled:bg-gray-800 disabled:text-gray-600 rounded-2xl font-bold text-base text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            {UI.actionLabels.hold}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// 라이브 차트
// ═══════════════════════════════════════════════
function LiveChart({
  points,
  animProgress,
  isUp,
  height = 160,
}: {
  points: number[]
  animProgress: number
  isUp: boolean
  height?: number
}) {
  if (points.length < 2) return <div style={{ height }} className="bg-gray-900/30 rounded-xl" />

  const visibleCount = Math.max(2, Math.ceil(points.length * animProgress))
  const visible = points.slice(0, visibleCount)

  const min = Math.min(...points) * 0.985
  const max = Math.max(...points) * 1.015
  const range = max - min || 1
  const w = 400
  const pad = 4

  const toX = (i: number) => pad + (i / (points.length - 1)) * (w - pad * 2)
  const toY = (p: number) => pad + (height - pad * 2) - ((p - min) / range) * (height - pad * 2)

  const pathD = visible.map((p, i) => {
    const x = toX(i)
    const y = toY(p)
    return i === 0 ? `M${x},${y}` : `L${x},${y}`
  }).join(" ")

  const lastX = toX(visible.length - 1)
  const lastY = toY(visible[visible.length - 1])
  const firstY = toY(visible[0])

  const areaD = `${pathD} L${lastX},${height - pad} L${pad},${height - pad} Z`

  const strokeColor = isUp ? "#ef4444" : "#3b82f6"
  const gradId = `lg-${isUp ? "up" : "down"}`

  return (
    <div className="bg-[#141414] rounded-2xl p-2 relative">
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 가격 그리드 라인 */}
        {[0.25, 0.5, 0.75].map((r) => (
          <line key={r} x1={pad} x2={w - pad} y1={height * r} y2={height * r}
            stroke="#ffffff" strokeOpacity="0.03" strokeDasharray="4 4" />
        ))}

        <path d={areaD} fill={`url(#${gradId})`} />
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* 현재 포인트 */}
        <circle cx={lastX} cy={lastY} r="5" fill={strokeColor} />
        <circle cx={lastX} cy={lastY} r="10" fill={strokeColor} fillOpacity="0.2">
          <animate attributeName="r" values="8;14;8" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* 현재가 라벨 */}
        <rect x={lastX - 42} y={lastY - 22} width="84" height="18" rx="4"
          fill={strokeColor} fillOpacity="0.9" />
        <text x={lastX} y={lastY - 10} textAnchor="middle" fontSize="10"
          fontWeight="bold" fill="white">
          {visible[visible.length - 1].toLocaleString()}원
        </text>
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════
// 결과 화면
// ═══════════════════════════════════════════════
function ResultView({
  scenario,
  totalValue,
  profitRate,
  cash,
  holdings,
  currentPrice,
  trades,
  aiResults,
  chartPoints,
  onReplay,
  onBack,
}: {
  scenario: LegendaryScenario
  totalValue: number
  profitRate: number
  cash: number
  holdings: number
  currentPrice: number
  trades: TradeRecord[]
  aiResults: (AIStrategy & { returnNum: number })[]
  chartPoints: number[]
  onReplay: () => void
  onBack: () => void
}) {
  const grade = getGrade(profitRate)
  const gradeInfo = GRADES[grade as keyof typeof GRADES] ?? GRADES.D
  const beatenCount = aiResults.filter((ai) => profitRate > ai.returnNum).length

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-28">
      {/* 결과 헤더 */}
      <div className={cn(
        "px-5 pt-10 pb-7 bg-gradient-to-br relative overflow-hidden",
        scenario.gradientFrom, scenario.gradientTo,
      )}>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-black/20 rounded-full blur-2xl" />

        <div className="relative z-10">
          <p className="text-xs opacity-80 mb-3">{scenario.emoji} {scenario.title} 결과</p>

          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-3xl font-black">{totalValue.toLocaleString()}원</p>
              <p className={cn("text-sm font-bold mt-1", profitRate >= 0 ? "text-green-200" : "text-red-200")}>
                {profitRate >= 0 ? "+" : ""}{profitRate.toFixed(1)}%
                <span className="opacity-70 ml-1">
                  ({profitRate >= 0 ? "+" : ""}{(totalValue - INITIAL_CASH).toLocaleString()}원)
                </span>
              </p>
            </div>
            <div className="text-center">
              <div className={cn("text-5xl font-black", gradeInfo.color)}>{gradeInfo.label}</div>
              <p className="text-[10px] opacity-70 mt-0.5">{gradeInfo.title}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {[
              { label: "AI 승리", value: `${beatenCount}/${aiResults.length}` },
              { label: "거래", value: `${trades.filter((t) => t.action !== "hold").length}회` },
              { label: "관망", value: `${trades.filter((t) => t.action === "hold").length}회` },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-lg px-3 py-1.5 flex-1 text-center">
                <p className="text-[9px] opacity-60">{s.label}</p>
                <p className="text-sm font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 전체 차트 */}
      <div className="px-4 py-4">
        <LiveChart points={chartPoints} animProgress={1} isUp={profitRate >= 0} height={140} />
      </div>

      {/* 턴별 내 선택 리뷰 */}
      <div className="px-4 mb-4">
        <h3 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          턴별 선택 리뷰
        </h3>
        <div className="space-y-2">
          {trades.map((t, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-xl p-3 flex items-center gap-3 border border-gray-800/40">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                t.action === "buy" ? "bg-red-500/20 text-red-400" :
                t.action === "sell" ? "bg-blue-500/20 text-blue-400" :
                "bg-gray-700/50 text-gray-400",
              )}>
                {UI.phaseEmoji[i]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{t.eventTitle}</p>
                <p className="text-[10px] text-gray-500">{UI.phaseLabels[i]}</p>
              </div>
              <div className={cn(
                "text-xs font-bold px-2 py-1 rounded-lg",
                t.action === "buy" ? "bg-red-500/15 text-red-400" :
                t.action === "sell" ? "bg-blue-500/15 text-blue-400" :
                "bg-gray-700/30 text-gray-400",
              )}>
                {t.action === "buy" ? `매수 ${t.quantity}주` :
                 t.action === "sell" ? `매도 ${t.quantity}주` : "관망"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI 비교 */}
      <div className="px-4 mb-4">
        <h3 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-purple-400" />
          AI 투자자 비교
        </h3>
        <div className="space-y-2">
          {aiResults.map((ai, i) => {
            const iWin = profitRate > ai.returnNum
            return (
              <div key={i} className={cn(
                "rounded-xl p-3 border flex items-center gap-3",
                iWin ? "bg-green-500/5 border-green-500/15" : "bg-[#1a1a1a] border-gray-800/40",
              )}>
                <div className="text-xl">{ai.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{ai.name}</p>
                  <p className="text-[10px] text-gray-500">{ai.type} · {ai.result}</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-bold",
                    ai.returnNum >= 0 ? "text-red-400" : "text-blue-400",
                  )}>
                    {ai.returnRate}
                  </p>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded",
                    iWin ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-500",
                  )}>
                    {iWin ? "승리" : "패배"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 교훈 */}
      <div className="px-4 space-y-2 mb-4">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-yellow-400 mb-0.5">핵심 교훈</p>
          <p className="text-xs text-gray-300 leading-relaxed">{scenario.keyLesson}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-blue-400 mb-0.5">생존 팁</p>
          <p className="text-xs text-gray-300 leading-relaxed">{scenario.survivalTip}</p>
        </div>
      </div>

      {/* 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent z-20">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 h-12 bg-[#252525] border border-white/10 rounded-xl font-bold text-sm text-white hover:bg-[#333] transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            {UI.resultLabels.backToDetail}
          </button>
          <button
            onClick={onReplay}
            className={cn(
              "flex-[2] h-12 rounded-xl font-bold text-sm text-white bg-gradient-to-r hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-1.5",
              scenario.gradientFrom, scenario.gradientTo,
            )}
          >
            <RotateCcw className="w-4 h-4" />
            {UI.resultLabels.replay}
          </button>
        </div>
      </div>
    </div>
  )
}
