"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import { loadScenario } from "@/lib/scenario/loader"
import {
  initGame,
  makeDecision,
  advanceTurn,
  snapshotTurn,
  type GameState,
  type TurnSnapshot,
} from "@/lib/scenario/engine"
import type { GameScenario, ScenarioStock } from "@/data/game-scenarios/types"

const STORAGE_KEY = (id: string) => `scenarioGame_${id}`

export default function ScenarioPlayPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const scenarioId = params.id

  const [scenario, setScenario] = useState<GameScenario | null>(null)
  const [state, setState] = useState<GameState | null>(null)
  const [snapshot, setSnapshot] = useState<TurnSnapshot | null>(null)
  const [selectedStockId, setSelectedStockId] = useState<string>("")
  const [feedback, setFeedback] = useState<string[]>([])
  const decisionStartTimeRef = useRef<number>(Date.now())

  // 시나리오 로드
  useEffect(() => {
    try {
      const sc = loadScenario(scenarioId)
      setScenario(sc)
      setSelectedStockId(sc.stocks[0].id)

      // localStorage에서 진행 중 게임 복구 시도
      const saved = typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY(scenarioId))
        : null
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // 간단 검증
          if (parsed.scenarioId === scenarioId && !parsed.isFinished) {
            setState(parsed)
            decisionStartTimeRef.current = Date.now()
            return
          }
        } catch {
          // 무시하고 새 게임
        }
      }

      // 새 게임
      const newState = initGame(sc)
      setState(newState)
      decisionStartTimeRef.current = Date.now()
    } catch (e) {
      console.error("Failed to load scenario:", e)
    }
  }, [scenarioId])

  // 스냅샷 갱신
  useEffect(() => {
    if (scenario && state) {
      setSnapshot(snapshotTurn(scenario, state))
    }
  }, [scenario, state])

  // 자동 저장
  useEffect(() => {
    if (state && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY(scenarioId), JSON.stringify(state))
    }
  }, [state, scenarioId])

  if (!scenario || !state || !snapshot) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-sm text-gray-500">시나리오 로딩 중…</div>
      </div>
    )
  }

  // 게임 종료 화면
  if (state.isFinished && state.result) {
    return <FinishedScreen scenario={scenario} state={state} onRestart={() => {
      localStorage.removeItem(STORAGE_KEY(scenarioId))
      const fresh = initGame(scenario)
      setState(fresh)
    }} onHome={() => router.push("/scenario")} />
  }

  const selectedStock = scenario.stocks.find((s) => s.id === selectedStockId)!
  const selectedPrice = snapshot.prices[selectedStockId]
  const held = state.holdings[selectedStockId] || 0
  const avgPrice = state.averagePrices[selectedStockId] || 0

  const handleAction = (action: "buy" | "sell" | "hold", qty: number = 1) => {
    if (!scenario || !state) return
    const decisionTimeMs = Date.now() - decisionStartTimeRef.current

    const result = makeDecision(scenario, state, {
      stockId: action === "hold" ? null : selectedStockId,
      action,
      quantity: qty,
      decisionTimeMs,
    })

    if (!result.success) {
      setFeedback([`❌ ${result.error}`])
      setTimeout(() => setFeedback([]), 2500)
      return
    }

    // 점수 피드백
    if (result.scoreDelta !== undefined && result.scoreReasons) {
      setFeedback([
        `${result.scoreDelta >= 0 ? "+" : ""}${result.scoreDelta} 감각`,
        ...result.scoreReasons,
      ])
      setTimeout(() => setFeedback([]), 3000)
    }

    // 다음 턴
    advanceTurn(scenario, state)
    setState({ ...state })
    decisionStartTimeRef.current = Date.now()
  }

  const profitRate = ((state.totalAssetKrw - state.initialCapital) / state.initialCapital) * 100

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.push("/scenario")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="text-[10px] text-gray-500">
              {snapshot.day}일차 · {Math.ceil(snapshot.day / 5)}주차 · {snapshot.weekday}요일 · {snapshot.time}
            </div>
            <div className="text-sm font-bold flex items-center gap-2">
              {scenario.title}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                Act {snapshot.act}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500">총자산</div>
            <div className="text-sm font-bold">
              {state.totalAssetKrw.toLocaleString()}원
            </div>
            <div className={`text-[10px] ${profitRate >= 0 ? "text-red-400" : "text-blue-400"}`}>
              {profitRate >= 0 ? "+" : ""}{profitRate.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* 진행률 + 환율 + 감각 */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex-1 bg-gray-800/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
              style={{ width: `${(snapshot.turn / scenario.totalTurns) * 100}%` }}
            />
          </div>
          <span className="text-gray-500">
            {snapshot.turn}/{scenario.totalTurns}
          </span>
          <span className="text-gray-400">${snapshot.fxRate}</span>
          <span className="text-purple-400 font-bold">감각 {state.senseScore}</span>
        </div>
      </div>

      {/* 종목 선택 (탭) */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {scenario.stocks.map((s) => {
            const p = snapshot.prices[s.id]
            const isSel = s.id === selectedStockId
            const myHold = state.holdings[s.id] || 0
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStockId(s.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl border text-left transition-colors ${
                  isSel
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-800 bg-gray-900"
                }`}
              >
                <div className="text-[10px] text-gray-500 flex items-center gap-1">
                  {s.market === "KR" ? "🇰🇷" : "🇺🇸"} {s.character}
                </div>
                <div className="text-xs font-bold whitespace-nowrap">{s.name}</div>
                <div className="text-[11px] text-gray-300">
                  {s.currency === "KRW"
                    ? `${p.native.toLocaleString()}원`
                    : `$${p.native.toFixed(2)}`}
                </div>
                {myHold > 0 && (
                  <div className="text-[10px] text-yellow-400 mt-0.5">
                    보유 {myHold}주
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 선택 종목 차트 (간단) */}
      <SelectedStockPanel
        scenario={scenario}
        stock={selectedStock}
        snapshot={snapshot}
        held={held}
        avgPrice={avgPrice}
      />

      {/* 뉴스 패널 */}
      <NewsPanel snapshot={snapshot} />

      {/* 피드백 */}
      {feedback.length > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 bg-black/90 border border-purple-500/50 rounded-2xl px-5 py-3 shadow-2xl max-w-xs">
          {feedback.map((line, i) => (
            <div
              key={i}
              className={`${i === 0 ? "font-bold text-purple-300 text-base" : "text-xs text-gray-400"}`}
            >
              {line}
            </div>
          ))}
        </div>
      )}

      {/* 액션 바 */}
      <div className="fixed bottom-0 inset-x-0 bg-black border-t border-gray-800 px-4 py-3 z-20">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAction("sell", held > 0 ? held : 0)}
            disabled={held <= 0}
            className="bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-40 text-blue-400 font-bold py-3 rounded-xl text-sm transition-colors"
          >
            매도 (보유 {held})
          </button>
          <button
            onClick={() => handleAction("hold")}
            className="bg-gray-700/40 hover:bg-gray-700/60 text-gray-300 font-bold py-3 rounded-xl text-sm transition-colors"
          >
            관망
          </button>
          <button
            onClick={() => handleAction("buy", suggestBuyQty(state.cash, selectedPrice.krw))}
            disabled={state.cash < selectedPrice.krw}
            className="bg-red-500/20 hover:bg-red-500/30 disabled:opacity-40 text-red-400 font-bold py-3 rounded-xl text-sm transition-colors"
          >
            매수
          </button>
        </div>
        <div className="max-w-md mx-auto text-[10px] text-gray-500 text-center mt-1.5">
          현금 {state.cash.toLocaleString()}원
        </div>
      </div>
    </div>
  )
}

// 매수 수량 추천 — 현재 cash의 20%로 진입
function suggestBuyQty(cash: number, priceKrw: number): number {
  if (priceKrw <= 0) return 0
  const budget = cash * 0.2
  return Math.max(1, Math.floor(budget / priceKrw))
}

// ============================================================
// 선택 종목 패널 — 간단 차트 + 정보
// ============================================================
function SelectedStockPanel({
  scenario,
  stock,
  snapshot,
  held,
  avgPrice,
}: {
  scenario: GameScenario
  stock: ScenarioStock
  snapshot: TurnSnapshot
  held: number
  avgPrice: number
}) {
  const series = scenario.priceSeries[stock.id]
  const upToNow = useMemo(
    () => series.slice(0, snapshot.turn),
    [series, snapshot.turn],
  )
  const min = Math.min(...upToNow)
  const max = Math.max(...upToNow)
  const range = max - min || 1
  const w = 320
  const h = 100
  const points = upToNow
    .map((p, i) => {
      const x = (i / Math.max(upToNow.length - 1, 1)) * w
      const y = h - ((p - min) / range) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  const last = upToNow[upToNow.length - 1]
  const prev = upToNow[upToNow.length - 2] ?? last
  const change = ((last - prev) / prev) * 100
  const isUp = change >= 0

  const myPnL = held > 0 && avgPrice > 0
    ? ((last - avgPrice) / avgPrice) * 100
    : 0

  return (
    <div className="px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="text-xs text-gray-500">
              {stock.market === "KR" ? "🇰🇷 KOSPI" : "🇺🇸 NASDAQ"} · {stock.character}
            </div>
            <div className="text-lg font-bold">{stock.name}</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">
              {stock.currency === "KRW"
                ? `${last.toLocaleString()}원`
                : `$${last.toFixed(2)}`}
            </div>
            <div className={`text-xs flex items-center gap-1 justify-end ${isUp ? "text-red-400" : "text-blue-400"}`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isUp ? "+" : ""}{change.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* 미니 차트 */}
        <div className="mt-3">
          <svg width={w} height={h} className="w-full h-24" viewBox={`0 0 ${w} ${h}`}>
            <polyline
              points={points}
              fill="none"
              stroke={isUp ? "#f87171" : "#60a5fa"}
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* 보유 정보 */}
        {held > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-800 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] text-gray-500">보유</div>
              <div className="text-xs font-bold">{held}주</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500">평단</div>
              <div className="text-xs font-bold">
                {stock.currency === "KRW"
                  ? `${Math.round(avgPrice).toLocaleString()}원`
                  : `$${avgPrice.toFixed(2)}`}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500">평가손익</div>
              <div className={`text-xs font-bold ${myPnL >= 0 ? "text-red-400" : "text-blue-400"}`}>
                {myPnL >= 0 ? "+" : ""}{myPnL.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// 뉴스 패널
// ============================================================
function NewsPanel({ snapshot }: { snapshot: TurnSnapshot }) {
  return (
    <div className="px-4 mt-3 space-y-2">
      {snapshot.news.length === 0 ? (
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl px-4 py-3 text-center text-xs text-gray-500">
          ⚪ 별다른 소식 없음 — 거래량 평이
        </div>
      ) : (
        snapshot.news.map((n, i) => (
          <div
            key={i}
            className={`rounded-xl px-4 py-3 border ${
              n.level === "major"
                ? "bg-red-500/10 border-red-500/40"
                : n.level === "minor"
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-gray-900/40 border-gray-800/50"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="text-sm font-bold flex-1">{n.headline}</div>
              {n.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400 whitespace-nowrap">
                  {n.badge}
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-400">{n.body}</div>
            {n.source && (
              <div className="text-[10px] text-gray-600 mt-1">{n.source}</div>
            )}
          </div>
        ))
      )}

      {/* 사전 신호 (있을 때) */}
      {snapshot.preSignals.length > 0 && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-2">
          <div className="text-[10px] text-purple-300 font-bold mb-1">
            🔮 사전 신호 감지
          </div>
          {snapshot.preSignals.map((s, i) => (
            <div key={i} className="text-[11px] text-gray-300">
              {s.description} (D-{s.turnsAhead})
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// 종료 화면
// ============================================================
function FinishedScreen({
  scenario,
  state,
  onRestart,
  onHome,
}: {
  scenario: GameScenario
  state: GameState
  onRestart: () => void
  onHome: () => void
}) {
  const r = state.result!
  const stars = { S: 5, A: 4, B: 3, C: 2, D: 1, F: 0 }[r.grade] || 0

  return (
    <div className="min-h-screen bg-black text-white p-5 flex items-center">
      <div className="max-w-md mx-auto w-full">
        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/40 rounded-3xl p-6 text-center">
          <div className="text-7xl font-black bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent mb-2">
            {r.grade}
          </div>
          <div className="text-2xl mb-4">
            {"⭐".repeat(stars)}
            {"☆".repeat(5 - stars)}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-black/40 rounded-xl p-3">
              <div className="text-[10px] text-gray-500">수익률</div>
              <div className={`text-xl font-bold ${r.profitRate >= 0 ? "text-red-400" : "text-blue-400"}`}>
                {r.profitRate >= 0 ? "+" : ""}{(r.profitRate * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                {r.finalAssetKrw.toLocaleString()}원
              </div>
            </div>
            <div className="bg-black/40 rounded-xl p-3">
              <div className="text-[10px] text-gray-500">감각 점수</div>
              <div className="text-xl font-bold text-purple-400">
                {r.senseScore}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">결정 {state.decisions.length}회</div>
            </div>
          </div>

          {r.badges.length > 0 && (
            <div className="bg-black/40 rounded-xl p-3 mb-4">
              <div className="text-[10px] text-gray-500 mb-2">획득 배지</div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {r.badges.map((b) => (
                  <span
                    key={b}
                    className="text-[11px] px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400 mb-1">
            실전 모델: {scenario.title}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={onRestart}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl"
          >
            한 판 더
          </button>
          <button
            onClick={onHome}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl"
          >
            시나리오 목록
          </button>
        </div>
      </div>
    </div>
  )
}
