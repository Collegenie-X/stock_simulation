"use client"

import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import type { TradeRecord } from "../../types"
import type { CompanyProfile } from "./CompanyCard"

interface TradeDetailCardProps {
  trade: TradeRecord & { investmentNote?: string }
  profile?: CompanyProfile
}

export const TradeDetailCard = ({ trade, profile }: TradeDetailCardProps) => {
  const isBuy = trade.action === "buy"
  const hasProfit = !isBuy && trade.profit !== undefined
  // 매도 수익 판단 (수익이면 빨강, 손실이면 파랑)
  const isProfit = (trade.profit ?? 0) >= 0

  return (
    <div className="bg-[#252525] rounded-2xl p-4 mb-2">
      {/* 상단 행: 기업 + 액션 + 금액 */}
      <div className="flex items-center gap-3 mb-3">
        {/* 기업 이모지 */}
        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-lg flex-shrink-0">
          {profile?.emoji ?? "📈"}
        </div>

        {/* 기업명 + 섹터 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{trade.stockName}</span>
            {profile && (
              <span className="text-xs text-gray-500">{profile.subSector}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* 매수/매도 배지: 한국 주식 컨벤션 - 매수=빨강, 매도=파랑 */}
            <span
              className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-full",
                isBuy
                  ? "bg-red-500/20 text-red-400"
                  : "bg-blue-500/20 text-blue-400",
              )}
            >
              {isBuy ? "매수" : "매도"}
            </span>
            <span className="text-xs text-gray-500">
              {trade.quantity}주 × {formatNumber(trade.price)}원
            </span>
          </div>
        </div>

        {/* 거래 금액 & 수익 표시 */}
        <div className="text-right flex-shrink-0">
          {isBuy ? (
            /* 매수: 지출 금액을 중립 회색으로 표시 (- 기호만) */
            <p className="text-sm font-bold text-gray-300">
              -{formatNumber(trade.totalAmount)}원
            </p>
          ) : (
            /* 매도: 수령 금액(회색) + 수익/손실(색상) */
            <>
              <p className="text-sm font-bold text-gray-300">
                +{formatNumber(trade.totalAmount)}원
              </p>
              {hasProfit && (
                <p
                  className={cn(
                    "text-xs font-semibold mt-0.5",
                    isProfit ? "text-red-400" : "text-blue-400",
                  )}
                >
                  {isProfit ? "+" : "-"}
                  {formatNumber(Math.abs(trade.profit!))}원
                  {trade.profitRate !== undefined && (
                    <span className="ml-1 opacity-80">
                      ({isProfit ? "+" : ""}{trade.profitRate.toFixed(1)}%)
                    </span>
                  )}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* 구분선 + 메모 */}
      <div className="border-t border-gray-700/50 pt-3">
        {(trade.investmentNote || profile?.investmentThesis) && (
          <p className="text-xs text-gray-500 leading-relaxed">
            📋 {trade.investmentNote ?? profile?.investmentThesis}
          </p>
        )}

        {/* 기업 투자 지표 요약 */}
        {profile && (
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">목표가</span>
              <span className="text-xs font-semibold text-gray-400">
                {formatNumber(profile.targetPrice)}원
              </span>
            </div>
            <span className="text-gray-700">·</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">PER</span>
              <span className="text-xs font-semibold text-gray-400">{profile.per}</span>
            </div>
            {profile.dividendYield > 0 && (
              <>
                <span className="text-gray-700">·</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">배당</span>
                  <span className="text-xs font-semibold text-gray-400">{profile.dividendYield}%</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
