"use client"

import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import { Timer, ArrowLeft, ShoppingCart, BadgeDollarSign, Eye } from "lucide-react"

/**
 * 공통 게임 플레이 UI
 * - 시나리오 플레이 (/learn/scenarios/[id]/play) 와
 *   패턴 연습 (/learn/patterns/[id]/practice) 에서 공유
 * - timerSec prop으로 시간 제한 구분 (시나리오: 30초, 패턴: 15초)
 */

export const RATIO_OPTIONS = [
  { ratio: 0.25, label: "조금", sub: "25%" },
  { ratio: 0.50, label: "반반", sub: "50%" },
  { ratio: 0.75, label: "많이", sub: "75%" },
  { ratio: 1.00, label: "전부", sub: "100%" },
]

interface GameActionBarProps {
  /** 현재 남은 시간(초) */
  timer: number
  /** 총 제한 시간(초) — 시나리오: 30, 패턴: 15 */
  timerSec: number
  /** 타이머 숫자 흔들림 여부 */
  shakeTimer?: boolean
  /** 피드백 표시 중 여부 (버튼 비활성) */
  hasFeedback: boolean
  /** 매수 가능 여부 */
  canBuy: boolean
  /** 매도 가능 여부 */
  canSell: boolean
  /** 매수 버튼 클릭 */
  onBuy: () => void
  /** 매도 버튼 클릭 */
  onSell: () => void
  /** 관망 버튼 클릭 */
  onHold: () => void
  /** 버튼 레이블 */
  labels?: { buy?: string; sell?: string; hold?: string }
}

export function GameActionBar({
  timer,
  timerSec,
  shakeTimer = false,
  hasFeedback,
  canBuy,
  canSell,
  onBuy,
  onSell,
  onHold,
  labels,
}: GameActionBarProps) {
  const timerPct = (timer / timerSec) * 100
  const timerColor =
    timer <= 5 ? "bg-red-500" :
    timer <= Math.floor(timerSec * 0.4) ? "bg-yellow-500" :
    "bg-green-500"
  const timerTextColor =
    timer <= 5 ? "text-red-400" :
    timer <= Math.floor(timerSec * 0.4) ? "text-yellow-400" :
    "text-green-400"

  return (
    <div className="w-full bg-[#0d0d0d] border-t border-gray-800/40">
      <div className="max-w-md mx-auto px-4 pt-2 pb-5">
        {/* 타이머 바 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-1000 ease-linear", timerColor)}
              style={{ width: `${timerPct}%` }}
            />
          </div>
          <div className={cn("flex items-center gap-0.5 min-w-[44px]", shakeTimer && "animate-pulse")}>
            <Timer className={cn("w-4 h-4", timerTextColor)} />
            <span className={cn("text-sm font-black tabular-nums", timerTextColor)}>{timer}초</span>
          </div>
        </div>

        {/* 액션 버튼 3개 */}
        <div className="flex gap-2">
          <button
            onClick={onBuy}
            disabled={!canBuy || hasFeedback}
            className="flex-1 h-14 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-red-500/20 flex flex-col items-center justify-center gap-0.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{labels?.buy ?? "살래"}</span>
          </button>
          <button
            onClick={onSell}
            disabled={!canSell || hasFeedback}
            className="flex-1 h-14 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-blue-500/20 flex flex-col items-center justify-center gap-0.5"
          >
            <BadgeDollarSign className="w-4 h-4" />
            <span>{labels?.sell ?? "팔래"}</span>
          </button>
          <button
            onClick={onHold}
            disabled={hasFeedback}
            className="flex-1 h-14 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
          >
            <Eye className="w-4 h-4" />
            <span>{labels?.hold ?? "기다릴게"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

interface RatioModalProps {
  /** 'buy' | 'sell' | null */
  mode: "buy" | "sell" | null
  /** 현재 주가 */
  price: number
  /** 보유 현금 */
  cash: number
  /** 보유 주식 수 */
  holdings: number
  /** 평균 매수가 (매도 시 손익 계산용) */
  avgPrice?: number
  /** 종목명 */
  stockName?: string
  /** 힌트 텍스트 */
  hint?: string
  /** 비율 선택 시 콜백 */
  onSelect: (ratio: number, label: string) => void
  /** 닫기 */
  onClose: () => void
}

export function RatioModal({
  mode,
  price,
  cash,
  holdings,
  avgPrice = 0,
  stockName = "",
  hint,
  onSelect,
  onClose,
}: RatioModalProps) {
  if (!mode) return null

  const isBuy = mode === "buy"
  const maxBuy = price > 0 ? Math.floor(cash / price) : 0

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1e1e1e] rounded-t-3xl p-5 pb-8 animate-in slide-in-from-bottom duration-200">
        {/* 핸들 */}
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />

        {/* 헤더 */}
        <h3 className={cn("text-base font-bold mb-1", isBuy ? "text-red-400" : "text-blue-400")}>
          {stockName} {isBuy ? "얼마나 살까?" : "얼마나 팔까?"}
        </h3>
        <p className="text-[10px] text-gray-500 mb-4">
          {isBuy
            ? `현금: ${formatNumber(cash)}원 · 살 수 있는 주식: ${maxBuy}주`
            : `갖고 있는 주식: ${holdings}주`}
        </p>

        {/* 비율 버튼 4개 */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {RATIO_OPTIONS.map(({ ratio, label, sub }) => {
            const qty = isBuy
              ? Math.max(1, Math.floor(maxBuy * ratio))
              : Math.max(1, Math.ceil(holdings * ratio))
            const profit = !isBuy && avgPrice > 0 ? (price - avgPrice) * qty : null
            const disabled = isBuy ? qty === 0 : holdings === 0

            return (
              <button
                key={ratio}
                onClick={() => onSelect(ratio, label)}
                disabled={disabled}
                className={cn(
                  "py-3 rounded-xl border text-center transition-all active:scale-95 disabled:opacity-20",
                  isBuy
                    ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                    : "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
                )}
              >
                <span className={cn("text-sm font-bold block", isBuy ? "text-red-400" : "text-blue-400")}>
                  {label}
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">{qty}주</p>
                {profit !== null ? (
                  <p className={cn("text-[9px] font-bold mt-0.5", profit >= 0 ? "text-green-400" : "text-red-400")}>
                    {profit >= 0 ? "+" : ""}{formatNumber(Math.round(profit))}원
                  </p>
                ) : (
                  <p className="text-[9px] text-gray-600">{sub}</p>
                )}
              </button>
            )
          })}
        </div>

        {/* 힌트 */}
        {hint && (
          <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-lg p-2.5">
            <p className="text-[10px] text-yellow-500/80 leading-relaxed">💡 {hint}</p>
          </div>
        )}

        {/* 뒤로 */}
        <button
          onClick={onClose}
          className="mt-3 w-full flex items-center justify-center gap-1 h-9 rounded-xl text-gray-500 text-xs font-bold hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> 다시 선택
        </button>
      </div>
    </div>
  )
}
