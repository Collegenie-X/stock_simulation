"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import { ChevronDown, TrendingUp, TrendingDown, Waves, Zap, Minus } from "lucide-react"

// ─── 공통 타입 ────────────────────────────────────────────────

/**
 * 시나리오 플레이 (/learn/scenarios/[id]/play) 에서 사용하는 거래 항목
 */
export interface TradeAccountingItem {
  turn: number
  action: "buy" | "sell" | "hold"
  quantity: number
  price: number
  eventTitle: string
  amount: number
  pnl: number
  pnlRate: number
  sentiment?: string
}

/**
 * 패턴 연습 (/learn/patterns/[id]/practice) 에서 사용하는 거래 항목
 * TradeLog 기반으로 TradeAccountingItem 형태로 변환 가능
 */
export interface PatternTradeItem {
  turn: number
  action: "buy" | "sell" | "skip" | "timeout"
  shares: number
  price: number
  amount: number
  /** 해당 턴 손익 (TurnEval.turnPnl) */
  turnPnl?: number
  /** 점수 (TurnEval.score) */
  score?: number
  /** 판정 문구 (TurnEval.verdict) */
  verdict?: string
}

/**
 * 공통 AI 결과 타입
 */
export interface AIResult {
  name: string
  emoji: string
  type: string
  returnRate: string
  returnNum: number
  actions?: string[]
  result?: string
}

export interface TurnData {
  turn: number
  endPrice: number
  change: number
}

// ─── AI 액션 파서 ─────────────────────────────────────────────

function classifyAction(text: string): { type: "buy" | "sell" | "hold"; percent: number } | null {
  const pct = text.match(/(\d+)%/)
  const percent = pct ? parseInt(pct[1]) : 0

  if (text.includes('매수') || text.includes('추가') || text.includes('재매수') || text.includes('진입')) {
    return { type: "buy", percent }
  }
  if (text.includes('매도') || text.includes('익절') || text.includes('손절') ||
      text.includes('차익실현') || text.includes('청산') || text.includes('실현')) {
    return { type: "sell", percent }
  }
  if (text.includes('관망') || text.includes('홀딩') || text.includes('유지') ||
      text.includes('보유') || text.includes('신중') || text.includes('버티기') ||
      text.includes('풀 홀딩') || text.includes('대기') || text.includes('손실')) {
    return { type: "hold", percent: 0 }
  }
  return null
}

/** actions 배열에서 해당 턴(1-based)의 행동을 파싱.
 *  구체적인 턴 지정(단일/범위)이 전체(전체/전 구간)보다 우선합니다. */
export function parseAITurnAction(actions: string[] = [], turnIndex: number): {
  type: "buy" | "sell" | "hold"
  percent: number
  label: string
} {
  const turnNum = turnIndex + 1
  let fallback: { type: "buy" | "sell" | "hold"; percent: number } | null = null

  for (const action of actions) {
    const rangeMatch = action.match(/(\d+)~(\d+)턴/)
    const singleMatch = action.match(/(\d+)턴/)
    const isWholeGame = action.startsWith('전체') || action.startsWith('전 구간')

    let matches = false
    if (rangeMatch) {
      const from = parseInt(rangeMatch[1])
      const to = parseInt(rangeMatch[2])
      matches = turnNum >= from && turnNum <= to
    } else if (singleMatch) {
      matches = parseInt(singleMatch[1]) === turnNum
    } else if (isWholeGame) {
      // 전체 항목은 구체적 매칭이 없을 때 fallback으로만 사용
      if (!fallback) fallback = classifyAction(action)
      continue
    }

    if (!matches) continue

    const classified = classifyAction(action)
    if (classified) {
      const { type, percent } = classified
      const label = type === "buy"
        ? (percent ? `살래 ${percent}%` : "살래")
        : type === "sell"
        ? (percent ? `팔래 ${percent}%` : "팔래")
        : "기다릴게"
      return { type, percent, label }
    }
  }

  // 구체적 매칭 없으면 전체 항목 fallback 사용
  if (fallback) {
    const { type, percent } = fallback
    const label = type === "buy"
      ? (percent ? `살래 ${percent}%` : "살래")
      : type === "sell"
      ? (percent ? `팔래 ${percent}%` : "팔래")
      : "기다릴게"
    return { type, percent, label }
  }

  return { type: "hold", percent: 0, label: "기다릴게" }
}

// ─── 공통 Props ───────────────────────────────────────────────

interface TradeHistoryCardBaseProps {
  index: number
  /** 턴 이모지 (없으면 T{n} 표시) */
  turnEmoji?: string
  /** 다음 턴 주가 변동률 */
  nextTurnChange?: number
  /** AI 비교 데이터 (없으면 AI 섹션 숨김) */
  aiResults?: AIResult[]
  /** 전체 턴 데이터 */
  turns?: TurnData[]
  /** 시작 총 자산 (AI 손익 계산용) */
  initTotal?: number
  /** 나의 최종 수익률 (AI 갭 계산용) */
  userRate?: number
  /** 현재 턴 주가 */
  currentPrice?: number
  /** 점수 표시 여부 (패턴 연습 전용) */
  showScore?: boolean
}

// 시나리오 플레이용
interface ScenarioTradeProps extends TradeHistoryCardBaseProps {
  mode: "scenario"
  trade: TradeAccountingItem
}

// 패턴 연습용
interface PatternTradeProps extends TradeHistoryCardBaseProps {
  mode: "pattern"
  trade: PatternTradeItem
}

type TradeHistoryCardProps = ScenarioTradeProps | PatternTradeProps

// ─── 메인 컴포넌트 ────────────────────────────────────────────

export function TradeHistoryCard(props: TradeHistoryCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { index, turnEmoji, nextTurnChange, aiResults = [], turns = [], initTotal = 0, userRate = 0, currentPrice, showScore = false } = props

  // 공통 필드 추출
  const action: "buy" | "sell" | "hold" = props.mode === "scenario"
    ? props.trade.action
    : (props.trade.action === "buy" || props.trade.action === "sell") ? props.trade.action : "hold"

  const quantity = props.mode === "scenario"
    ? props.trade.quantity
    : props.trade.shares

  const price = props.trade.price
  const amount = props.trade.amount

  const pnl = props.mode === "scenario"
    ? props.trade.pnl
    : (props.trade.turnPnl ?? 0)

  const eventTitle = props.mode === "scenario"
    ? props.trade.eventTitle
    : undefined

  const score = props.mode === "pattern" ? props.trade.score : undefined
  const verdict = props.mode === "pattern" ? props.trade.verdict : undefined

  const isHold = action === "hold"
  const isBuy = action === "buy"
  const isSell = action === "sell"

  // AI 비교 데이터
  const similarAI = aiResults.find((ai) =>
    ai.type.includes("안정") || ai.type.includes("균형")
  ) || aiResults[0]
  const bestAI = aiResults.length > 0
    ? aiResults.reduce((best, ai) => ai.returnNum > best.returnNum ? ai : best, aiResults[0])
    : null

  // 판단 평가
  const myTurnReturn = nextTurnChange ?? 0
  const isGoodDecision = (isBuy && myTurnReturn > 0) || (isSell && myTurnReturn < 0) || (isHold && Math.abs(myTurnReturn) < 1)

  const getDecisionScore = () => {
    if (isHold) return { label: "관망", color: "text-gray-400" }
    if (isGoodDecision) return { label: "적중!", color: "text-green-400" }
    return { label: "아쉬움", color: "text-orange-400" }
  }

  const decision = getDecisionScore()

  // 점수 바 색상 (패턴 연습)
  const scoreBarColor = score !== undefined
    ? score >= 2.0 ? "bg-green-500" : score >= 1.0 ? "bg-yellow-500" : "bg-red-500"
    : "bg-gray-700"

  const hasAI = aiResults.length > 0 && initTotal > 0

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-200",
      isOpen
        ? "bg-[#1a1a1a] border-cyan-500/30"
        : "bg-[#1a1a1a] border-gray-800/30 hover:border-gray-700/50"
    )}>
      {/* ── 메인 행 ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
      >
        {/* 턴 이모지 or 번호 */}
        <span className="text-base shrink-0">
          {turnEmoji ?? `T${index + 1}`}
        </span>

        {/* 액션 배지 */}
        <div className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0",
          isBuy ? "bg-red-500/15 text-red-400" :
          isSell ? "bg-blue-500/15 text-blue-400" :
          "bg-gray-700/30 text-gray-400"
        )}>
          {isBuy ? "살래" : isSell ? "팔래" : "기다릴게"}
        </div>

        {/* 수량 */}
        {!isHold && quantity > 0 ? (
          <span className="text-sm font-bold text-white shrink-0">{quantity}주</span>
        ) : (
          <span className="text-xs text-gray-600 shrink-0">—</span>
        )}

        {/* 다음 턴 변동률 */}
        {nextTurnChange !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0",
            nextTurnChange > 0 ? "bg-red-500/15 text-red-400" :
            nextTurnChange < 0 ? "bg-blue-500/15 text-blue-400" :
            "bg-gray-700/20 text-gray-500"
          )}>
            {nextTurnChange > 0 ? <TrendingUp className="w-2.5 h-2.5" /> :
             nextTurnChange < 0 ? <TrendingDown className="w-2.5 h-2.5" /> :
             <Minus className="w-2.5 h-2.5" />}
            {nextTurnChange > 0 ? "+" : ""}{nextTurnChange.toFixed(1)}%
          </div>
        )}

        {/* 판단 결과 */}
        {nextTurnChange !== undefined && (
          <span className={cn("text-[10px] font-bold shrink-0", decision.color)}>
            {decision.label}
          </span>
        )}

        {/* 패턴 연습: 점수 */}
        {showScore && score !== undefined && (
          <span className={cn(
            "text-[10px] font-black tabular-nums shrink-0",
            score >= 2.0 ? "text-green-400" : score >= 1.0 ? "text-yellow-400" : "text-red-400"
          )}>
            {score.toFixed(1)}<span className="text-gray-600 text-[9px]">/2.5</span>
          </span>
        )}

        {/* 매도 실현 손익 - 우측 정렬 */}
        <div className="flex-1 flex justify-end items-center">
          {isSell && pnl !== 0 && (
            <span className={cn(
              "text-xs font-bold",
              pnl >= 0 ? "text-red-400" : "text-blue-400"
            )}>
              {pnl >= 0 ? "+" : ""}{formatNumber(Math.round(pnl))}원
            </span>
          )}
        </div>

        {/* 펼치기 아이콘 */}
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-gray-600 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* 패턴 연습: 점수 바 (항상 표시) */}
      {showScore && score !== undefined && (
        <div className="px-3 pb-1.5">
          <div className="h-1 bg-[#252525] rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", scoreBarColor)}
              style={{ width: `${(score / 2.5) * 100}%` }}
            />
          </div>
          {verdict && (
            <p className="text-[9px] text-gray-600 mt-0.5 leading-tight">{verdict}</p>
          )}
        </div>
      )}

      {/* ── 펼쳐진 상세 영역 ── */}
      {isOpen && (
        <div className="px-3 pb-3 border-t border-white/5 space-y-3">
          {/* 이벤트 설명 (시나리오 전용) */}
          {eventTitle && (
            <div className="mt-3 bg-[#252525] rounded-xl p-2.5">
              <p className="text-[10px] text-gray-400 leading-relaxed">{eventTitle}</p>
            </div>
          )}

          {/* 거래 상세 */}
          {!isHold && quantity > 0 && (
            <div className="bg-[#252525] rounded-xl p-3 mt-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[9px] text-gray-500">{isBuy ? "매수가" : "매도가"}</p>
                  <p className="text-sm font-bold text-white">{formatNumber(Math.round(price))}원</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500">수량</p>
                  <p className="text-sm font-bold text-white">{quantity}주</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500">총 금액</p>
                  <p className="text-sm font-bold text-white">{formatNumber(Math.round(amount))}원</p>
                </div>
              </div>
            </div>
          )}

          {/* AI 갭 비교 섹션 */}
          {hasAI && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                <Waves className="w-3 h-3 text-cyan-400" /> AI와 비교 <span className="text-gray-600">(동일 조건)</span>
              </p>

              {[
                bestAI ? { ai: bestAI, borderCls: "border-yellow-500/20", bgCls: "bg-yellow-500/8", dividerCls: "border-yellow-500/10", nameCls: "text-yellow-300" } : null,
                similarAI && similarAI !== bestAI ? { ai: similarAI, borderCls: "border-cyan-500/20", bgCls: "bg-cyan-500/8", dividerCls: "border-cyan-500/10", nameCls: "text-cyan-300" } : null,
              ].filter(Boolean).map((item) => {
                if (!item) return null
                const { ai, borderCls, bgCls, dividerCls, nameCls } = item
                const aiProfit = Math.round(initTotal * ai.returnNum / 100)
                const gap = Math.round(initTotal * userRate / 100) - aiProfit
                const turnAction = parseAITurnAction(ai.actions, index)
                const turnPrice = currentPrice ?? turns[index]?.endPrice ?? 0
                const qty = turnAction.percent > 0 && turnPrice > 0
                  ? Math.floor((initTotal * turnAction.percent / 100) / turnPrice)
                  : 0

                return (
                  <div key={ai.name} className={cn("border rounded-xl px-3 py-2.5", bgCls, borderCls)}>
                    {/* 행 1: 이름 + 행동 + 수익률 */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-base shrink-0">{ai.emoji}</span>
                      <span className={cn("text-[10px] font-bold shrink-0", nameCls)}>{ai.name}</span>

                      {/* 행동 배지 */}
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0",
                        turnAction.type === "buy"  ? "bg-red-500/15 text-red-400" :
                        turnAction.type === "sell" ? "bg-blue-500/15 text-blue-400" :
                        "bg-gray-700/30 text-gray-400"
                      )}>
                        {turnAction.type !== "hold" && qty > 0
                          ? `${turnAction.type === "buy" ? "살래" : "팔래"} ${qty}주`
                          : turnAction.label}
                      </span>

                      {/* 퍼센트 */}
                      {turnAction.percent > 0 && (
                        <span className="text-[9px] text-gray-600 shrink-0">({turnAction.percent}%)</span>
                      )}

                      <div className="flex-1" />

                      {/* 최종 수익률 + 손익금액 */}
                      <span className={cn(
                        "text-xs font-bold shrink-0",
                        ai.returnNum >= 0 ? "text-red-400" : "text-blue-400"
                      )}>
                        {ai.returnRate}
                      </span>
                      <span className="text-[9px] text-gray-500 shrink-0">
                        ({aiProfit >= 0 ? "+" : ""}{formatNumber(aiProfit)}원)
                      </span>
                    </div>

                    {/* 행 2: 나와의 차이 */}
                    <div className={cn("mt-1.5 pt-1.5 border-t flex items-center justify-between", dividerCls)}>
                      <span className="text-[9px] text-gray-500">나와의 차이</span>
                      <span className={cn(
                        "text-[10px] font-bold",
                        gap >= 0 ? "text-green-400" : "text-orange-400"
                      )}>
                        {gap >= 0 ? "+" : ""}{formatNumber(gap)}원&nbsp;
                        ({gap >= 0 ? "+" : ""}{(userRate - ai.returnNum).toFixed(1)}%p)
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 파도 읽기 피드백 (nextTurnChange 있을 때만) */}
          {nextTurnChange !== undefined && (
            <div className={cn(
              "rounded-xl p-2.5 flex items-start gap-2",
              isGoodDecision
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-orange-500/10 border border-orange-500/20"
            )}>
              <Zap className={cn(
                "w-3.5 h-3.5 mt-0.5 shrink-0",
                isGoodDecision ? "text-green-400" : "text-orange-400"
              )} />
              <div>
                <p className={cn(
                  "text-[10px] font-bold mb-0.5",
                  isGoodDecision ? "text-green-300" : "text-orange-300"
                )}>
                  {isGoodDecision ? "🎯 좋은 판단!" : "💡 개선 포인트"}
                </p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {isGoodDecision
                    ? `다음 턴 ${nextTurnChange > 0 ? "상승" : "하락"} 파도를 잘 읽었어요!`
                    : `다음 턴 ${nextTurnChange > 0 ? "상승" : "하락"}이 있었어요. 파도 전환점을 더 주의깊게 살펴보세요.`
                  }
                </p>
              </div>
            </div>
          )}

          {/* 패턴 연습: verdict 상세 (nextTurnChange 없을 때) */}
          {verdict && nextTurnChange === undefined && (
            <div className="bg-[#252525] rounded-xl p-2.5">
              <p className="text-[10px] text-gray-400 leading-relaxed">{verdict}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
