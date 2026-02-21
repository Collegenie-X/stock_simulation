"use client"

import { useMemo, useState } from "react"
import {
  TrendingUp, TrendingDown, BarChart3, Wallet, Percent,
  ArrowUpRight, ArrowDownRight, Minus, ChevronRight,
  ChevronDown, ChevronUp, Swords, Bot, User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import { LABELS } from "../config"
import type { AIAction, InvestStyle } from "./hooks/useAICompetitor"

// ── Props ─────────────────────────────────────────────────
export interface DaySummaryOverlayProps {
  isVisible: boolean
  currentDay: number
  currentDayName: string
  // 유저 데이터
  totalValue: number
  initialValue: number
  profitRate: number
  totalDecisions: number
  holdingsCount: number
  // AI 대결 데이터
  aiName: string
  aiEmoji: string
  aiStyle: InvestStyle
  aiDescription: string
  aiMotto: string
  aiTotalValue: number
  aiProfitRate: number
  aiTodayActions: AIAction[]
  aiHoldingsCount: number
  aiTotalTrades: number
  // 이벤트
  onContinue: () => void
}

// ── 스타일 라벨 ────────────────────────────────────────────
const STYLE_LABELS: Record<InvestStyle, { label: string; color: string; bg: string }> = {
  conservative: { label: "안정형", color: "text-blue-400", bg: "bg-blue-500/20" },
  stable: { label: "신중형", color: "text-cyan-400", bg: "bg-cyan-500/20" },
  balanced: { label: "균형형", color: "text-green-400", bg: "bg-green-500/20" },
  aggressive: { label: "공격형", color: "text-orange-400", bg: "bg-orange-500/20" },
  ultra_aggressive: { label: "초공격형", color: "text-red-400", bg: "bg-red-500/20" },
}

// ── 분석 코멘트 생성 ───────────────────────────────────────
function generateBattleComment(
  userRate: number,
  aiRate: number,
  aiName: string,
  aiStyle: InvestStyle,
): string {
  const diff = userRate - aiRate
  if (diff > 3) return `${aiName}을(를) 크게 앞서고 있습니다! 현재 전략을 유지하세요.`
  if (diff > 0) return `${aiName}보다 소폭 앞서고 있습니다. 방심은 금물!`
  if (diff === 0) return `${aiName}와(과) 동률입니다. 다음 결정이 중요합니다!`
  if (diff > -3) return `${aiName}에게 근소하게 뒤지고 있습니다. 역전 기회를 노리세요!`
  return `${aiName}에게 많이 뒤지고 있습니다. 전략 수정이 필요할 수 있습니다.`
}

function generateTip(aiStyle: InvestStyle, userRate: number): string {
  if (aiStyle === "conservative") {
    return userRate < 0
      ? "AI처럼 보수적으로 손실을 최소화해 보세요."
      : "AI보다 더 공격적으로 수익을 노려보세요."
  }
  if (aiStyle === "aggressive" || aiStyle === "ultra_aggressive") {
    return userRate < 0
      ? "AI의 공격적 전략은 변동성이 큽니다. 리스크 관리가 핵심!"
      : "좋은 흐름! 이익 실현 타이밍도 놓치지 마세요."
  }
  return "균형 잡힌 접근이 장기적으로 유리합니다."
}

// ── 컴포넌트 ───────────────────────────────────────────────
export const DaySummaryOverlay = ({
  isVisible,
  currentDay,
  currentDayName,
  totalValue,
  initialValue,
  profitRate,
  totalDecisions,
  holdingsCount,
  aiName,
  aiEmoji,
  aiStyle,
  aiDescription,
  aiMotto,
  aiTotalValue,
  aiProfitRate,
  aiTodayActions,
  aiHoldingsCount,
  aiTotalTrades,
  onContinue,
}: DaySummaryOverlayProps) => {
  const [showAIDetail, setShowAIDetail] = useState(false)

  if (!isVisible) return null

  const profitAmount = totalValue - initialValue
  const aiProfitAmount = aiTotalValue - initialValue
  const isProfit = profitRate >= 0
  const isAiProfit = aiProfitRate >= 0
  const userWinning = profitRate >= aiProfitRate
  const diff = Math.abs(profitRate - aiProfitRate).toFixed(1)
  const styleInfo = STYLE_LABELS[aiStyle]

  const battleComment = generateBattleComment(profitRate, aiProfitRate, aiName, aiStyle)
  const tip = generateTip(aiStyle, profitRate)

  const buyActions = aiTodayActions.filter(a => a.type === "buy")
  const sellActions = aiTodayActions.filter(a => a.type === "sell")
  const holdActions = aiTodayActions.filter(a => a.type === "hold")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-500 scrollbar-hide">

        {/* ── 헤더 ── */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 mb-3 shadow-lg shadow-orange-500/30">
            <span className="text-2xl">🌅</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {currentDay}{LABELS.daySummary.dayEnd}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">{currentDayName}</p>
        </div>

        {/* ── VS 대결 카드 ── */}
        <div className="relative bg-gradient-to-b from-gray-800/80 to-gray-900/80 rounded-3xl border border-gray-700/50 overflow-hidden mb-3">
          {/* VS 뱃지 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40 border-2 border-gray-900">
              <Swords className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-gray-700/50">
            {/* 나 (왼쪽) */}
            <div className={cn(
              "p-4 relative",
              userWinning && "bg-gradient-to-br from-yellow-500/5 to-transparent"
            )}>
              {userWinning && (
                <div className="absolute top-2 left-2 text-[10px] font-extrabold text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded-full">
                  WIN
                </div>
              )}
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2 border-2 border-blue-500/40">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-xs font-bold text-blue-400 mb-0.5">나</div>
                <div className={cn(
                  "text-2xl font-extrabold",
                  isProfit ? "text-red-400" : "text-blue-400"
                )}>
                  {isProfit ? "+" : ""}{profitRate}%
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {formatNumber(totalValue)}원
                </div>
                <div className={cn(
                  "text-[10px] font-semibold mt-0.5",
                  isProfit ? "text-red-400/70" : "text-blue-400/70"
                )}>
                  {isProfit ? "+" : ""}{formatNumber(profitAmount)}원
                </div>
              </div>

              {/* 나의 요약 스탯 */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">보유 종목</span>
                  <span className="text-gray-300 font-bold">{holdingsCount}개</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">총 거래</span>
                  <span className="text-gray-300 font-bold">{totalDecisions}회</span>
                </div>
              </div>
            </div>

            {/* AI (오른쪽) */}
            <div className={cn(
              "p-4 relative",
              !userWinning && "bg-gradient-to-bl from-purple-500/5 to-transparent"
            )}>
              {!userWinning && profitRate !== aiProfitRate && (
                <div className="absolute top-2 right-2 text-[10px] font-extrabold text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded-full">
                  WIN
                </div>
              )}
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2 border-2 border-purple-500/40">
                  <span className="text-xl">{aiEmoji}</span>
                </div>
                <div className="text-xs font-bold text-purple-400 mb-0.5">{aiName}</div>
                <div className={cn(
                  "text-2xl font-extrabold",
                  isAiProfit ? "text-red-400" : "text-blue-400"
                )}>
                  {isAiProfit ? "+" : ""}{aiProfitRate.toFixed(1)}%
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {formatNumber(aiTotalValue)}원
                </div>
                <div className={cn(
                  "text-[10px] font-semibold mt-0.5",
                  isAiProfit ? "text-red-400/70" : "text-blue-400/70"
                )}>
                  {isAiProfit ? "+" : ""}{formatNumber(aiProfitAmount)}원
                </div>
              </div>

              {/* AI 요약 스탯 */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">보유 종목</span>
                  <span className="text-gray-300 font-bold">{aiHoldingsCount}개</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">총 거래</span>
                  <span className="text-gray-300 font-bold">{aiTotalTrades}회</span>
                </div>
              </div>
            </div>
          </div>

          {/* 차이 바 */}
          <div className="px-4 py-2.5 bg-gray-900/60 border-t border-gray-700/40">
            <div className="flex items-center justify-center gap-2 text-xs">
              {userWinning ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">+{diff}%p 앞서는 중</span>
                </>
              ) : profitRate === aiProfitRate ? (
                <>
                  <Minus className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-400 font-bold">동률</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-purple-400 font-bold">-{diff}%p 뒤처지는 중</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── AI 전략 & 오늘의 행동 ── */}
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 mb-3 overflow-hidden">
          {/* AI 전략 헤더 */}
          <button
            onClick={() => setShowAIDetail(!showAIDetail)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-700/20 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Bot className="w-4 h-4 text-purple-400" />
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{aiName}의 투자 전략</span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", styleInfo.color, styleInfo.bg)}>
                    {styleInfo.label}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">"{aiMotto}"</p>
              </div>
            </div>
            {showAIDetail
              ? <ChevronUp className="w-4 h-4 text-gray-500" />
              : <ChevronDown className="w-4 h-4 text-gray-500" />
            }
          </button>

          {/* AI 상세 (토글) */}
          {showAIDetail && (
            <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
              {/* 전략 설명 */}
              <div className="bg-gray-900/50 rounded-xl p-3">
                <div className="text-[11px] text-gray-500 mb-1">투자 원칙</div>
                <p className="text-xs text-gray-300">{aiDescription}</p>
              </div>

              {/* 오늘의 행동 */}
              <div>
                <div className="text-[11px] text-gray-500 mb-2">오늘의 거래 내역</div>
                <div className="space-y-1.5">
                  {buyActions.map((a, i) => (
                    <div key={`buy-${i}`} className="flex items-center gap-2 bg-red-500/10 rounded-lg px-3 py-2">
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded">매수</span>
                      <span className="text-[11px] text-gray-300 font-medium flex-1 truncate">{a.stockName}</span>
                      <span className="text-[10px] text-gray-400">{a.quantity}주</span>
                    </div>
                  ))}
                  {sellActions.map((a, i) => (
                    <div key={`sell-${i}`} className="flex items-center gap-2 bg-blue-500/10 rounded-lg px-3 py-2">
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">매도</span>
                      <span className="text-[11px] text-gray-300 font-medium flex-1 truncate">{a.stockName}</span>
                      <span className="text-[10px] text-gray-400">{a.quantity}주</span>
                    </div>
                  ))}
                  {holdActions.length > 0 && buyActions.length === 0 && sellActions.length === 0 && (
                    <div className="flex items-center gap-2 bg-gray-700/30 rounded-lg px-3 py-2">
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-600/30 px-1.5 py-0.5 rounded">관망</span>
                      <span className="text-[11px] text-gray-400">{holdActions[0].reason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 매매 근거 */}
              {(buyActions.length > 0 || sellActions.length > 0) && (
                <div>
                  <div className="text-[11px] text-gray-500 mb-1.5">AI 판단 근거</div>
                  <div className="space-y-1">
                    {[...buyActions, ...sellActions].slice(0, 3).map((a, i) => (
                      <div key={`reason-${i}`} className="flex items-start gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                        <p className="text-[11px] text-gray-400">{a.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 분석 코멘트 ── */}
        <div className="bg-gray-800/40 rounded-2xl p-4 border border-gray-700/30 mb-4">
          <div className="text-xs font-bold text-gray-400 mb-2.5">{LABELS.daySummary.analysisTitle}</div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-yellow-400 mt-2 shrink-0" />
              <p className="text-[12px] text-gray-300 leading-relaxed">{battleComment}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-purple-400 mt-2 shrink-0" />
              <p className="text-[12px] text-gray-300 leading-relaxed">{tip}</p>
            </div>
          </div>
        </div>

        {/* ── 다음 날 버튼 ── */}
        <button
          onClick={onContinue}
          className="w-full py-4 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-2xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
        >
          분석 확인 완료 - 다음 날 시작
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
