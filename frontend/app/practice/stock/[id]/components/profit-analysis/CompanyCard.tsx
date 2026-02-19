"use client"

import { cn } from "@/lib/utils"

export interface CompanyProfile {
  stockId: string
  name: string
  ticker: string
  sector: string
  subSector: string
  exchange: string
  emoji: string
  description: string
  businessModel: string
  investmentThesis: string
  initialInvestmentNote: string
  keyStrengths: string[]
  riskFactors: string[]
  targetPrice: number
  riskLevel: "낮음" | "중간" | "높음"
  analystRating: string
  dividendYield: number
  per: string
  pbr: string
}

interface CompanyCardProps {
  profile: CompanyProfile
  currentPrice?: number
  myQty?: number
  myAvgPrice?: number
  totalProfit?: number
  totalProfitRate?: number
  isExpanded?: boolean
  onToggle?: () => void
}

const RISK_COLORS = {
  낮음: "text-emerald-400 bg-emerald-500/10",
  중간: "text-yellow-400 bg-yellow-500/10",
  높음: "text-red-400 bg-red-500/10",
}

const RATING_COLORS: Record<string, string> = {
  매수: "text-red-400 bg-red-500/10",
  중립: "text-yellow-400 bg-yellow-500/10",
  보유: "text-blue-400 bg-blue-500/10",
  매도: "text-gray-400 bg-gray-500/10",
}

export const CompanyCard = ({
  profile,
  currentPrice,
  myQty = 0,
  myAvgPrice = 0,
  totalProfit = 0,
  totalProfitRate = 0,
  isExpanded = false,
  onToggle,
}: CompanyCardProps) => {
  const hasPosition = myQty > 0
  const isProfit = totalProfit >= 0

  return (
    <div
      className="bg-[#252525] rounded-2xl overflow-hidden mb-3 mx-5"
      onClick={onToggle}
    >
      {/* 헤더 행 */}
      <div className="p-4 flex items-center gap-3">
        {/* 이모지 아이콘 */}
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">
          {profile.emoji}
        </div>

        {/* 기업 기본 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{profile.name}</span>
            <span className="text-xs text-gray-500">{profile.ticker}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-gray-500">{profile.subSector}</span>
            <span className="text-gray-700">·</span>
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                RISK_COLORS[profile.riskLevel],
              )}
            >
              {profile.riskLevel}
            </span>
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                RATING_COLORS[profile.analystRating] ?? "text-gray-400 bg-gray-500/10",
              )}
            >
              {profile.analystRating}
            </span>
          </div>
        </div>

        {/* 보유 시 수익 정보 */}
        {hasPosition ? (
          <div className="text-right flex-shrink-0">
            <p
              className={cn(
                "text-sm font-bold",
                isProfit ? "text-red-400" : "text-blue-400",
              )}
            >
              {isProfit ? "+" : ""}{totalProfit.toLocaleString()}원
            </p>
            <p
              className={cn(
                "text-xs",
                isProfit ? "text-red-400/70" : "text-blue-400/70",
              )}
            >
              {isProfit ? "+" : ""}{totalProfitRate.toFixed(1)}%
            </p>
          </div>
        ) : (
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-500">목표가</p>
            <p className="text-sm font-semibold text-gray-300">
              {profile.targetPrice.toLocaleString()}원
            </p>
          </div>
        )}
      </div>

      {/* 초기 투자 메모 */}
      <div className="px-4 pb-3 border-t border-gray-700/50 pt-3">
        <p className="text-xs text-gray-500 mb-1">📌 초기 투자 근거</p>
        <p className="text-xs text-gray-300 leading-relaxed">{profile.initialInvestmentNote}</p>
      </div>

      {/* 확장 시 상세 정보 */}
      {isExpanded && (
        <div className="border-t border-gray-700/50 p-4 space-y-4">
          {/* 투자 핵심 논거 */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1.5">💡 투자 테마</p>
            <p className="text-xs text-gray-300 leading-relaxed">{profile.investmentThesis}</p>
          </div>

          {/* 사업 모델 */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1.5">🏢 사업 모델</p>
            <p className="text-xs text-gray-300 leading-relaxed">{profile.businessModel}</p>
          </div>

          {/* 투자 지표 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800/60 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">PER</p>
              <p className="text-sm font-bold text-white">{profile.per}</p>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">PBR</p>
              <p className="text-sm font-bold text-white">{profile.pbr}</p>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">배당률</p>
              <p className="text-sm font-bold text-white">
                {profile.dividendYield > 0 ? `${profile.dividendYield}%` : "-"}
              </p>
            </div>
          </div>

          {/* 강점 & 리스크 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-emerald-400 mb-1.5">✅ 강점</p>
              <ul className="space-y-1">
                {profile.keyStrengths.map((s, i) => (
                  <li key={i} className="text-xs text-gray-400 flex gap-1">
                    <span className="text-emerald-500 flex-shrink-0">·</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-400 mb-1.5">⚠️ 리스크</p>
              <ul className="space-y-1">
                {profile.riskFactors.map((r, i) => (
                  <li key={i} className="text-xs text-gray-400 flex gap-1">
                    <span className="text-red-500 flex-shrink-0">·</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 보유 정보 */}
          {hasPosition && (
            <div className="bg-gray-800/60 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-400 mb-2">📊 내 보유 현황</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-500">보유 수량</p>
                  <p className="text-sm font-bold text-white">{myQty}주</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">평균 단가</p>
                  <p className="text-sm font-bold text-white">{myAvgPrice.toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">현재가</p>
                  <p className="text-sm font-bold text-white">
                    {currentPrice ? currentPrice.toLocaleString() : "-"}원
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
